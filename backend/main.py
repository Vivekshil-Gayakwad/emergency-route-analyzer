import os
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session
import networkx as nx

from auth import (
    create_access_token,
    get_current_admin,
    get_current_user,
    get_optional_current_user,
    get_password_hash,
    verify_password,
)
from database import Base, engine, get_db
import models
import schemas

load_dotenv()

# Create tables if not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Emergency Route & Network Resilience Analyzer (ERNA)",
    description="FastAPI Backend for Pune Emergency Route & Network Resilience System",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ADMIN_INVITE_CODES = [
    code.strip().upper()
    for code in os.getenv(
        "ADMIN_INVITE_CODES",
        "ADMIN-ERNA-2026,TRAFFIC-GOV-2026,POLICE-HQ-2026"
    ).split(",")
]


# ==========================================
# Graph Algorithm Utilities
# ==========================================

def find_bridges_tarjan(nodes: List[models.Node], roads: List[models.Road]) -> List[models.Road]:
    """Find bridge edges using Tarjan's Bridge Finding Algorithm."""
    active_roads = [
        r for r in roads
        if r.status != models.RoadStatus.blocked and r.status != "blocked"
    ]
    adj = {n.id: [] for n in nodes}
    road_map = {}
    for r in active_roads:
        adj.setdefault(r.from_node, []).append((r.to_node, r.id))
        adj.setdefault(r.to_node, []).append((r.from_node, r.id))
        road_map[r.id] = r

    visited = set()
    disc = {}
    low = {}
    bridge_ids = set()
    timer = [0]

    def dfs(u: str, p_edge_id: Optional[str] = None):
        visited.add(u)
        timer[0] += 1
        disc[u] = low[u] = timer[0]

        for v, edge_id in adj.get(u, []):
            if edge_id == p_edge_id:
                continue
            if v in visited:
                low[u] = min(low[u], disc[v])
            else:
                dfs(v, edge_id)
                low[u] = min(low[u], low[v])
                if low[v] > disc[u]:
                    bridge_ids.add(edge_id)

    for n in nodes:
        if n.id not in visited:
            dfs(n.id)

    return [road_map[eid] for eid in bridge_ids if eid in road_map]


def find_articulation_points_tarjan(nodes: List[models.Node], roads: List[models.Road]) -> List[str]:
    """Find articulation points using DFS algorithm."""
    active_roads = [
        r for r in roads
        if r.status != models.RoadStatus.blocked and r.status != "blocked"
    ]
    adj = {n.id: [] for n in nodes}
    for r in active_roads:
        adj.setdefault(r.from_node, []).append(r.to_node)
        adj.setdefault(r.to_node, []).append(r.from_node)

    visited = set()
    disc = {}
    low = {}
    timer = [0]
    ap = set()

    def dfs(u: str, parent: Optional[str] = None):
        visited.add(u)
        timer[0] += 1
        disc[u] = low[u] = timer[0]
        children = 0

        for v in adj.get(u, []):
            if v == parent:
                continue
            if v in visited:
                low[u] = min(low[u], disc[v])
            else:
                children += 1
                dfs(v, u)
                low[u] = min(low[u], low[v])
                if parent is None and children > 1:
                    ap.add(u)
                elif parent is not None and low[v] >= disc[u]:
                    ap.add(u)

    for n in nodes:
        if n.id not in visited:
            dfs(n.id)

    return sorted(list(ap))


def compute_dijkstra_route(
    nodes: List[models.Node],
    roads: List[models.Road],
    start: str,
    end: str
) -> dict:
    active_roads = [
        r for r in roads
        if r.status != models.RoadStatus.blocked and r.status != "blocked"
    ]

    G = nx.Graph()
    for n in nodes:
        G.add_node(n.id)

    road_lookup = {}
    for r in active_roads:
        cost = float(r.time + (r.delay or 0))
        pair = tuple(sorted([r.from_node, r.to_node]))
        if pair not in road_lookup or cost < road_lookup[pair]["cost"]:
            road_lookup[pair] = {"cost": cost, "road": r}

    for (u, v), info in road_lookup.items():
        G.add_edge(u, v, weight=info["cost"], road=info["road"])

    if not G.has_node(start) or not G.has_node(end):
        return {
            "path": [],
            "edges": [],
            "distance": 0.0,
            "found": False,
            "alternative": None
        }

    try:
        path = nx.dijkstra_path(G, start, end, weight="weight")
        path_length = nx.dijkstra_path_length(G, start, end, weight="weight")

        edges_used = []
        for i in range(len(path) - 1):
            pair = tuple(sorted([path[i], path[i + 1]]))
            edges_used.append(road_lookup[pair]["road"])

        # Alternative route calculation: penalize primary edges by 3x
        G_alt = nx.Graph()
        for n in nodes:
            G_alt.add_node(n.id)

        primary_pairs = set(
            tuple(sorted([path[i], path[i + 1]]))
            for i in range(len(path) - 1)
        )

        for (u, v), info in road_lookup.items():
            multiplier = 3.0 if (u, v) in primary_pairs else 1.0
            G_alt.add_edge(u, v, weight=info["cost"] * multiplier, road=info["road"])

        alt_route = None
        try:
            alt_path = nx.dijkstra_path(G_alt, start, end, weight="weight")
            if alt_path != path:
                alt_edges = []
                alt_actual_time = 0.0
                for i in range(len(alt_path) - 1):
                    pair = tuple(sorted([alt_path[i], alt_path[i + 1]]))
                    road_obj = road_lookup[pair]["road"]
                    alt_edges.append(road_obj)
                    alt_actual_time += float(road_obj.time + (road_obj.delay or 0))

                alt_route = {
                    "path": alt_path,
                    "edges": alt_edges,
                    "distance": round(alt_actual_time, 1),
                    "found": True
                }
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            alt_route = None

        return {
            "path": path,
            "edges": edges_used,
            "distance": round(path_length, 1),
            "found": True,
            "alternative": alt_route
        }
    except (nx.NetworkXNoPath, nx.NodeNotFound):
        return {
            "path": [],
            "edges": [],
            "distance": 0.0,
            "found": False,
            "alternative": None
        }


# ==========================================
# Auth Router (/api/auth)
# ==========================================
auth_router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@auth_router.post("/signup", response_model=schemas.TokenResponse)
def signup(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email") or payload.get("officialEmail")
    password = payload.get("password")
    full_name = payload.get("fullName") or payload.get("full_name") or "User"
    phone = payload.get("phone")
    role_str = payload.get("role") or ("admin" if "officialEmail" in payload or "inviteCode" in payload else "public")
    invite_code = (payload.get("inviteCode") or payload.get("invite_code") or "").strip().upper()

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )

    # Check invite code if role is admin
    if role_str == "admin":
        if not invite_code or invite_code not in ADMIN_INVITE_CODES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid Admin Invitation Code! Authorized code: ADMIN-ERNA-2026"
            )
        assigned_role = models.UserRole.admin
    else:
        assigned_role = models.UserRole.public

    existing_user = db.query(models.User).filter(models.User.email == email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    new_user = models.User(
        full_name=full_name,
        email=email.lower(),
        hashed_password=get_password_hash(password),
        phone=phone,
        role=assigned_role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.email, "role": new_user.role.value})
    return schemas.TokenResponse(
        access_token=token,
        token_type="bearer",
        user=schemas.UserResponse(
            id=new_user.id,
            full_name=new_user.full_name,
            email=new_user.email,
            role=new_user.role.value,
            phone=new_user.phone
        )
    )


@auth_router.post("/login", response_model=schemas.TokenResponse)
def login(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email") or payload.get("officialEmail")
    password = payload.get("password")

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )

    user = db.query(models.User).filter(models.User.email == email.lower()).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({"sub": user.email, "role": user.role.value})
    return schemas.TokenResponse(
        access_token=token,
        token_type="bearer",
        user=schemas.UserResponse(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            role=user.role.value,
            phone=user.phone
        )
    )


@auth_router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return schemas.UserResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        role=current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role),
        phone=current_user.phone
    )


# ==========================================
# Core API Router (/api)
# ==========================================
api_router = APIRouter(prefix="/api")


# --- Nodes ---
@api_router.get("/nodes", response_model=List[schemas.NodeResponse])
def get_nodes(db: Session = Depends(get_db)):
    nodes = db.query(models.Node).all()
    return nodes


@api_router.get("/facilities", response_model=List[schemas.NodeResponse])
def get_facilities(type: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Node)
    if type:
        query = query.filter(models.Node.node_type == type)
    else:
        query = query.filter(models.Node.node_type != "intersection")
    return query.all()


# --- Roads ---
@api_router.get("/roads", response_model=List[schemas.RoadResponse])
def get_roads(db: Session = Depends(get_db)):
    roads = db.query(models.Road).all()
    return roads


@api_router.put("/roads/{road_id}", response_model=schemas.RoadResponse)
def update_road(
    road_id: str,
    update_req: schemas.RoadUpdateRequest,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    road = db.query(models.Road).filter(models.Road.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")

    status_str = update_req.status.lower()
    if status_str not in [s.value for s in models.RoadStatus]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be available, congested, or blocked.")

    road.status = models.RoadStatus(status_str)
    if status_str == "congested":
        road.delay = 5.0
    elif status_str == "blocked":
        road.delay = 99.0
    else:
        road.delay = 0.0

    if update_req.reason:
        road.reason = update_req.reason
    elif status_str == "blocked":
        road.reason = "Closed by authority"
    elif status_str == "congested":
        road.reason = "Traffic delay"
    else:
        road.reason = "Normal flow"

    db.commit()
    db.refresh(road)
    return road


# --- Routing ---
@api_router.post("/route", response_model=schemas.RouteResponse)
def find_route(req: schemas.RouteRequest, db: Session = Depends(get_db)):
    nodes = db.query(models.Node).all()
    roads = db.query(models.Road).all()
    result = compute_dijkstra_route(nodes, roads, req.start, req.end)
    return result


# --- Incident Reports ---
@api_router.get("/reports", response_model=List[schemas.ReportResponse])
def get_reports(
    current_user: Optional[models.User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    if current_user and current_user.role == models.UserRole.admin:
        return db.query(models.IncidentReport).order_by(models.IncidentReport.created_at.desc()).all()
    elif current_user:
        return db.query(models.IncidentReport).filter(
            models.IncidentReport.user_id == current_user.id
        ).order_by(models.IncidentReport.created_at.desc()).all()
    else:
        # Public anonymous access gets all reports
        return db.query(models.IncidentReport).order_by(models.IncidentReport.created_at.desc()).all()


@api_router.post("/reports", response_model=schemas.ReportResponse)
def create_report(
    payload: dict,
    current_user: Optional[models.User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    road_id = payload.get("road_id") or payload.get("edgeId")
    location = payload.get("location")
    issue_type = payload.get("issue_type") or payload.get("issueType") or "Road blockage"
    description = payload.get("description", "")

    if not location and road_id:
        target_road = db.query(models.Road).filter(models.Road.id == road_id).first()
        if target_road:
            location = f"{target_road.name} ({target_road.from_node} ↔ {target_road.to_node})"

    if not location:
        location = "Pune City Road"

    reported_by = current_user.full_name if current_user else "Public Citizen"
    user_id = current_user.id if current_user else None

    report = models.IncidentReport(
        road_id=road_id,
        location=location,
        issue_type=issue_type,
        description=description,
        status="Pending",
        reported_by=reported_by,
        user_id=user_id
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@api_router.put("/reports/{report_id}/verify", response_model=schemas.ReportResponse)
def verify_report(
    report_id: int,
    req: schemas.VerifyReportRequest,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    report = db.query(models.IncidentReport).filter(models.IncidentReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = "Verified"

    if req.block_road and report.road_id:
        road = db.query(models.Road).filter(models.Road.id == report.road_id).first()
        if road:
            road.status = models.RoadStatus.blocked
            road.delay = 99.0
            road.reason = f"Blocked following verified report: {report.issue_type}"

    db.commit()
    db.refresh(report)
    return report


@api_router.put("/reports/{report_id}/resolve", response_model=schemas.ReportResponse)
def resolve_report(
    report_id: int,
    req: schemas.ResolveReportRequest,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    report = db.query(models.IncidentReport).filter(models.IncidentReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = "Resolved"

    if req.reopen_road and report.road_id:
        road = db.query(models.Road).filter(models.Road.id == report.road_id).first()
        if road:
            road.status = models.RoadStatus.available
            road.delay = 0.0
            road.reason = "Reopened: Hazard resolved"

    db.commit()
    db.refresh(report)
    return report


# --- Network Resilience & Analysis ---
@api_router.get("/analysis/bridges", response_model=List[schemas.RoadResponse])
def get_bridges(db: Session = Depends(get_db)):
    nodes = db.query(models.Node).all()
    roads = db.query(models.Road).all()
    bridges = find_bridges_tarjan(nodes, roads)
    return bridges


@api_router.get("/analysis/articulation-points", response_model=List[str])
def get_articulation_points(db: Session = Depends(get_db)):
    nodes = db.query(models.Node).all()
    roads = db.query(models.Road).all()
    points = find_articulation_points_tarjan(nodes, roads)
    return points


@api_router.post("/analysis/simulate", response_model=schemas.SimulateResponse)
def simulate_impact(req: schemas.SimulateRequest, db: Session = Depends(get_db)):
    nodes = db.query(models.Node).all()
    all_roads = db.query(models.Road).all()

    target_road = db.query(models.Road).filter(models.Road.id == req.road_id).first()
    if not target_road:
        raise HTTPException(status_code=404, detail="Road not found")

    # Filter out blocked roads AND the road being simulated as closed
    active_roads = [
        r for r in all_roads
        if r.id != req.road_id and r.status != models.RoadStatus.blocked and r.status != "blocked"
    ]

    adj = {n.id: [] for n in nodes}
    for r in active_roads:
        adj.setdefault(r.from_node, []).append(r.to_node)
        adj.setdefault(r.to_node, []).append(r.from_node)

    # BFS from target_road.from_node
    start_n = target_road.from_node
    visited = set([start_n])
    queue = [start_n]
    while queue:
        curr = queue.pop(0)
        for nbr in adj.get(curr, []):
            if nbr not in visited:
                visited.add(nbr)
                queue.append(nbr)

    disconnected_nodes = [n for n in nodes if n.id not in visited]
    disconnected = len(disconnected_nodes) > 0
    disconnected_names = [n.name for n in disconnected_nodes]

    # Test alternative route between from_node and to_node with road blocked
    route_res = compute_dijkstra_route(
        nodes,
        active_roads,
        target_road.from_node,
        target_road.to_node
    )
    has_alt = route_res["found"]
    alt_dist = route_res["distance"] if has_alt else None
    time_inc = round(alt_dist - target_road.time, 1) if has_alt else None

    return schemas.SimulateResponse(
        disconnected=disconnected,
        disconnected_names=disconnected_names,
        has_alternative=has_alt,
        alt_distance=alt_dist,
        time_increase=time_inc
    )


@api_router.get("/analysis/connectivity")
def get_connectivity(db: Session = Depends(get_db)):
    nodes = db.query(models.Node).all()
    roads = db.query(models.Road).all()
    if not nodes:
        return {"is_connected": True, "reachable_count": 0, "total_count": 0}

    active_roads = [
        r for r in roads
        if r.status != models.RoadStatus.blocked and r.status != "blocked"
    ]
    adj = {n.id: [] for n in nodes}
    for r in active_roads:
        adj.setdefault(r.from_node, []).append(r.to_node)
        adj.setdefault(r.to_node, []).append(r.from_node)

    start_n = nodes[0].id
    visited = set([start_n])
    queue = [start_n]
    while queue:
        curr = queue.pop(0)
        for nbr in adj.get(curr, []):
            if nbr not in visited:
                visited.add(nbr)
                queue.append(nbr)

    is_conn = len(visited) == len(nodes)
    return {
        "is_connected": is_conn,
        "reachable_count": len(visited),
        "total_count": len(nodes)
    }


# Include Routers
app.include_router(auth_router)
app.include_router(api_router)


@app.get("/")
def root():
    return {
        "service": "ERNA Emergency Route & Network Resilience Analyzer API",
        "status": "online",
        "docs": "/docs",
        "city": "Pune, Maharashtra, India"
    }
