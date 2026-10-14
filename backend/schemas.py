from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field, computed_field


class UserCreate(BaseModel):
    fullName: Optional[str] = None
    full_name: Optional[str] = None
    email: str
    password: str
    phone: Optional[str] = None
    role: Optional[str] = "public"

    def get_full_name(self) -> str:
        return self.fullName or self.full_name or "Public Citizen"


class AdminCreate(BaseModel):
    fullName: Optional[str] = None
    full_name: Optional[str] = None
    officialEmail: Optional[str] = None
    email: Optional[str] = None
    password: str
    inviteCode: Optional[str] = None
    invite_code: Optional[str] = None

    def get_full_name(self) -> str:
        return self.fullName or self.full_name or "Admin Officer"

    def get_email(self) -> str:
        return self.officialEmail or self.email or ""

    def get_invite_code(self) -> str:
        return self.inviteCode or self.invite_code or ""


class LoginRequest(BaseModel):
    email: Optional[str] = None
    officialEmail: Optional[str] = None
    password: str

    def get_email(self) -> str:
        return self.email or self.officialEmail or ""


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    phone: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class NodeResponse(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    node_type: str

    @computed_field
    @property
    def type(self) -> str:
        return self.node_type

    model_config = ConfigDict(from_attributes=True)


class RoadResponse(BaseModel):
    id: str
    from_node: str
    to_node: str
    name: str
    distance: float
    time: float
    status: str
    delay: float = 0.0
    reason: Optional[str] = "Normal flow"
    last_updated: Optional[datetime] = None
    polyline: Optional[str] = None

    @computed_field(alias="from")
    @property
    def from_alias(self) -> str:
        return self.from_node

    @computed_field(alias="to")
    @property
    def to_alias(self) -> str:
        return self.to_node

    @computed_field
    @property
    def lastUpdated(self) -> str:
        if self.last_updated:
            return self.last_updated.strftime("%I:%M %p")
        return "Now"

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class RoadUpdateRequest(BaseModel):
    status: str
    reason: Optional[str] = None


class ReportCreate(BaseModel):
    road_id: Optional[str] = None
    edgeId: Optional[str] = None
    location: Optional[str] = None
    issue_type: Optional[str] = None
    issueType: Optional[str] = None
    description: str

    def get_road_id(self) -> Optional[str]:
        return self.road_id or self.edgeId

    def get_issue_type(self) -> str:
        return self.issue_type or self.issueType or "Road blockage"


class ReportResponse(BaseModel):
    id: int
    road_id: Optional[str] = None
    location: str
    issue_type: str
    description: str
    status: str
    reported_by: str
    created_at: Optional[datetime] = None

    @computed_field
    @property
    def edgeId(self) -> Optional[str]:
        return self.road_id

    @computed_field
    @property
    def issueType(self) -> str:
        return self.issue_type

    @computed_field
    @property
    def reportedBy(self) -> str:
        return self.reported_by

    @computed_field
    @property
    def timestamp(self) -> str:
        if self.created_at:
            return self.created_at.strftime("%I:%M %p")
        return "Now"

    model_config = ConfigDict(from_attributes=True)


class VerifyReportRequest(BaseModel):
    block_road: bool = False


class ResolveReportRequest(BaseModel):
    reopen_road: bool = False


class RouteRequest(BaseModel):
    start: str
    end: str


class AlternativeRouteResponse(BaseModel):
    path: List[str]
    edges: List[RoadResponse]
    distance: float
    found: bool


class RouteResponse(BaseModel):
    path: List[str]
    edges: List[RoadResponse]
    distance: float
    found: bool
    alternative: Optional[AlternativeRouteResponse] = None


class SimulateRequest(BaseModel):
    road_id: str


class SimulateResponse(BaseModel):
    disconnected: bool
    disconnected_names: List[str]
    has_alternative: bool
    alt_distance: Optional[float] = None
    time_increase: Optional[float] = None
