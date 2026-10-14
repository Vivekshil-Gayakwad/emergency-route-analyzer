import enum
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    Integer,
    String,
    Text,
    func
)
from database import Base


class RoadStatus(str, enum.Enum):
    available = 'available'
    congested = 'congested'
    blocked = 'blocked'


class UserRole(str, enum.Enum):
    public = 'public'
    admin = 'admin'


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.public, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class Node(Base):
    __tablename__ = 'nodes'
    id = Column(String(10), primary_key=True)  # e.g. 'N1'
    name = Column(String(150), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    node_type = Column(String(30), default='intersection')  # intersection, hospital, school, college, bus_stop, railway_station, fire_station


class Road(Base):
    __tablename__ = 'roads'
    id = Column(String(10), primary_key=True)  # e.g. 'R1'
    from_node = Column(String(10), nullable=False, index=True)
    to_node = Column(String(10), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    distance = Column(Float, nullable=False)  # km
    time = Column(Float, nullable=False)  # minutes base travel time
    status = Column(Enum(RoadStatus), default=RoadStatus.available)
    delay = Column(Float, default=0)
    reason = Column(String(300), default='Normal flow')
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())
    # Polyline coordinates stored as JSON text: [[lat,lng],[lat,lng],...]
    polyline = Column(Text, nullable=True)


class IncidentReport(Base):
    __tablename__ = 'incident_reports'
    id = Column(Integer, primary_key=True, autoincrement=True)
    road_id = Column(String(10), nullable=True)
    location = Column(String(300), nullable=False)
    issue_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), default='Pending')  # Pending, Verified, Resolved
    reported_by = Column(String(100), default='Public Citizen')
    user_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
