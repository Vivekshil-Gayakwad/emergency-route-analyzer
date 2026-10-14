import json
import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

from database import Base, engine, SessionLocal
from models import Node, Road, IncidentReport, User, RoadStatus, UserRole
from auth import get_password_hash


def seed():
    print("Creating all tables in erna_db...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if already seeded
        existing_nodes = db.query(Node).count()
        if existing_nodes > 0:
            print(f"Database already contains {existing_nodes} nodes. Cleaning up to re-seed cleanly...")
            db.query(IncidentReport).delete()
            db.query(Road).delete()
            db.query(Node).delete()
            db.query(User).delete()
            db.commit()

        print("Seeding Nodes (Pune City)...")
        nodes_data = [
            # Intersections
            {"id": "N1", "name": "Shivajinagar", "lat": 18.5314, "lng": 73.8446, "node_type": "intersection"},
            {"id": "N2", "name": "Deccan Gymkhana", "lat": 18.5167, "lng": 73.8415, "node_type": "intersection"},
            {"id": "N3", "name": "Swargate", "lat": 18.5018, "lng": 73.8636, "node_type": "intersection"},
            {"id": "N4", "name": "Pune Station", "lat": 18.5285, "lng": 73.8743, "node_type": "intersection"},
            {"id": "N5", "name": "Hadapsar", "lat": 18.5089, "lng": 73.9260, "node_type": "intersection"},
            {"id": "N6", "name": "Kothrud", "lat": 18.5074, "lng": 73.8077, "node_type": "intersection"},
            {"id": "N7", "name": "Hinjewadi", "lat": 18.5912, "lng": 73.7390, "node_type": "intersection"},
            {"id": "N8", "name": "Aundh", "lat": 18.5590, "lng": 73.8076, "node_type": "intersection"},
            {"id": "N9", "name": "Baner", "lat": 18.5596, "lng": 73.7792, "node_type": "intersection"},
            {"id": "N10", "name": "Katraj", "lat": 18.4575, "lng": 73.8685, "node_type": "intersection"},
            {"id": "N11", "name": "Viman Nagar", "lat": 18.5679, "lng": 73.9143, "node_type": "intersection"},
            {"id": "N12", "name": "Kharadi", "lat": 18.5516, "lng": 73.9406, "node_type": "intersection"},
            {"id": "N13", "name": "Wakad", "lat": 18.5983, "lng": 73.7628, "node_type": "intersection"},
            {"id": "N14", "name": "Pimpri-Chinchwad", "lat": 18.6298, "lng": 73.7997, "node_type": "intersection"},
            {"id": "N15", "name": "Koregaon Park", "lat": 18.5362, "lng": 73.8939, "node_type": "intersection"},

            # Hospitals
            {"id": "H1", "name": "Sassoon General Hospital", "lat": 18.5205, "lng": 73.8734, "node_type": "hospital"},
            {"id": "H2", "name": "Ruby Hall Clinic", "lat": 18.5344, "lng": 73.8859, "node_type": "hospital"},
            {"id": "H3", "name": "Deenanath Mangeshkar Hospital", "lat": 18.5048, "lng": 73.8301, "node_type": "hospital"},
            {"id": "H4", "name": "Jehangir Hospital", "lat": 18.5283, "lng": 73.8763, "node_type": "hospital"},

            # Colleges
            {"id": "C1", "name": "COEP Technological University", "lat": 18.5296, "lng": 73.8503, "node_type": "college"},
            {"id": "C2", "name": "Fergusson College", "lat": 18.5242, "lng": 73.8388, "node_type": "college"},

            # Schools
            {"id": "S1", "name": "Symbiosis School", "lat": 18.5189, "lng": 73.8358, "node_type": "school"},

            # Bus Stops
            {"id": "B1", "name": "Swargate Bus Stand", "lat": 18.5008, "lng": 73.8622, "node_type": "bus_stop"},
            {"id": "B2", "name": "Pune Station Bus Stop", "lat": 18.5277, "lng": 73.8750, "node_type": "bus_stop"},

            # Railway Stations
            {"id": "RS1", "name": "Pune Junction Railway Station", "lat": 18.5285, "lng": 73.8743, "node_type": "railway_station"},
            {"id": "RS2", "name": "Shivajinagar Railway Station", "lat": 18.5318, "lng": 73.8424, "node_type": "railway_station"},

            # Fire Stations
            {"id": "FS1", "name": "Pune City Fire Station", "lat": 18.5195, "lng": 73.8563, "node_type": "fire_station"},
            {"id": "FS2", "name": "Shivajinagar Fire Brigade", "lat": 18.5320, "lng": 73.8460, "node_type": "fire_station"}
        ]

        node_map = {}
        for nd in nodes_data:
            node_obj = Node(**nd)
            db.add(node_obj)
            node_map[nd["id"]] = nd
        db.commit()
        print(f"Seeded {len(nodes_data)} Nodes.")

        print("Seeding Roads (Pune City)...")
        roads_raw = [
            ("R1", "N1", "N2", "FC Road", 1.8, 6.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R2", "N2", "N3", "JM Road", 2.2, 8.0, RoadStatus.congested, 5.0, "Heavy traffic volume"),
            ("R3", "N1", "N3", "Laxmi Road", 2.5, 9.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R4", "N1", "N4", "University Road", 1.5, 5.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R5", "N4", "N3", "MG Road", 2.0, 7.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R6", "N4", "N11", "Nagar Road", 5.0, 12.0, RoadStatus.congested, 4.0, "Airport traffic"),
            ("R7", "N3", "N5", "Solapur Road", 5.5, 15.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R8", "N2", "N6", "Paud Road", 3.0, 10.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R9", "N6", "N9", "Karve Road", 6.5, 18.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R10", "N7", "N13", "Mumbai-Pune Expressway Connector", 4.0, 8.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R11", "N8", "N1", "Aundh Road", 3.5, 10.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R12", "N9", "N8", "Baner Road", 3.0, 8.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R13", "N10", "N3", "Katraj-Sinhagad Road", 4.0, 12.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R14", "N11", "N12", "Viman Nagar Road", 3.5, 10.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R15", "N13", "N9", "Wakad-Baner Road", 3.5, 9.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R16", "N14", "N8", "PCMC Road", 5.0, 14.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R17", "N15", "N4", "North Main Road", 2.5, 8.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R18", "N4", "H1", "Sassoon Road", 0.4, 2.0, RoadStatus.available, 0.0, "Priority emergency lane open"),
            ("R19", "N15", "H2", "Boat Club Road", 1.0, 3.0, RoadStatus.available, 0.0, "Priority emergency lane open"),
            ("R20", "N2", "H3", "Erandwane Link", 1.5, 5.0, RoadStatus.available, 0.0, "Priority emergency lane open"),
            ("R21", "N4", "H4", "Jehangir Access Road", 0.3, 1.0, RoadStatus.available, 0.0, "Priority emergency lane open"),
            ("R22", "N1", "C1", "COEP Road", 0.8, 3.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R23", "N1", "C2", "Fergusson College Road Link", 0.6, 2.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R24", "N5", "N12", "Hadapsar-Kharadi Link", 6.0, 15.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R25", "N10", "N5", "Katraj-Hadapsar Bypass", 7.0, 18.0, RoadStatus.blocked, 99.0, "Road construction work"),
            ("R26", "N2", "N8", "Senapati Bapat Road", 4.0, 12.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R27", "N3", "N2", "Tilak Road", 1.5, 5.0, RoadStatus.available, 0.0, "Normal flow"),
            # Facility connector links
            ("R28", "N2", "S1", "Prabhat Road Link", 0.7, 2.0, RoadStatus.available, 0.0, "Normal flow"),
            ("R29", "N3", "B1", "Swargate Stand Road", 0.2, 1.0, RoadStatus.available, 0.0, "Transit corridor"),
            ("R30", "N4", "B2", "Station Bus Depot Road", 0.2, 1.0, RoadStatus.available, 0.0, "Transit corridor"),
            ("R31", "N4", "RS1", "Station Approach Road", 0.1, 1.0, RoadStatus.available, 0.0, "Railway access"),
            ("R32", "N1", "RS2", "Shivajinagar Station Link", 0.3, 1.0, RoadStatus.available, 0.0, "Railway access"),
            ("R33", "N1", "FS1", "Fire Brigade Link", 1.2, 4.0, RoadStatus.available, 0.0, "Emergency responder route"),
            ("R34", "N1", "FS2", "Shivajinagar Fire Access", 0.2, 1.0, RoadStatus.available, 0.0, "Emergency responder route"),
        ]

        for r_id, from_n, to_n, name, dist, tm, st, dly, rsn in roads_raw:
            fn = node_map.get(from_n)
            tn = node_map.get(to_n)
            poly = json.dumps([[fn["lat"], fn["lng"]], [tn["lat"], tn["lng"]]]) if fn and tn else None

            road_obj = Road(
                id=r_id,
                from_node=from_n,
                to_node=to_n,
                name=name,
                distance=dist,
                time=tm,
                status=st,
                delay=dly,
                reason=rsn,
                polyline=poly
            )
            db.add(road_obj)
        db.commit()
        print(f"Seeded {len(roads_raw)} Roads.")

        print("Seeding Users...")
        admin_user = User(
            full_name="Admin Officer",
            email="admin@traffic.gov",
            hashed_password=get_password_hash("adminpassword"),
            phone="+91 99887 76655",
            role=UserRole.admin
        )
        public_user = User(
            full_name="Public Citizen",
            email="citizen@erna.org",
            hashed_password=get_password_hash("password123"),
            phone="+91 98765 43210",
            role=UserRole.public
        )
        db.add(admin_user)
        db.add(public_user)
        db.commit()
        print("Seeded Default Admin and Public Users.")

        print("Seeding Sample Incident Reports...")
        sample_reports = [
            IncidentReport(
                road_id="R25",
                location="Katraj-Hadapsar Bypass (Katraj N10 ↔ Hadapsar N5)",
                issue_type="Road Construction",
                description="Underpass and flyover construction underway. Road closed for heavy excavation.",
                status="Verified",
                reported_by="Admin Officer",
                user_id=admin_user.id
            ),
            IncidentReport(
                road_id="R2",
                location="JM Road (Deccan N2 ↔ Swargate N3)",
                issue_type="Accident",
                description="Multi-vehicle collision near Sambhaji Park causing 5+ minute delay.",
                status="Pending",
                reported_by="Public Citizen",
                user_id=public_user.id
            ),
            IncidentReport(
                road_id="R6",
                location="Nagar Road (Pune Station N4 ↔ Viman Nagar N11)",
                issue_type="Traffic Congestion",
                description="Airport traffic buildup and metro construction work blocking right lane.",
                status="Pending",
                reported_by="Public Citizen",
                user_id=public_user.id
            ),
        ]
        for rep in sample_reports:
            db.add(rep)
        db.commit()
        print("Seeded 3 Sample Incident Reports.")

        print("\nAll Pune City emergency network seed data inserted successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
