from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from geoalchemy2 import Geography

from src.database import Base


class Location(Base):
    __tablename__ = "locations"

    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    geom       = Column(Geography(geometry_type="POINT", srid=4326), nullable=False)
    accuracy_m = Column(Integer)
    visibility = Column(String(15), nullable=False, default="approximate")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
