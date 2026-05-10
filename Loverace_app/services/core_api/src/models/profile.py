import uuid

from sqlalchemy import Column, String, Integer, Text, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.sql import func

from src.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    user_id            = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    display_name       = Column(String(100), nullable=False)
    date_of_birth      = Column(Date, nullable=False)
    gender_identity    = Column(String(100))
    pronouns           = Column(String(100))
    sexual_orientation = Column(ARRAY(String), nullable=False, default=list)
    looking_for        = Column(ARRAY(String), nullable=False, default=list)
    bio                = Column(Text)
    photos             = Column(JSONB, nullable=False, default=list)
    interests          = Column(JSONB, nullable=False, default=list)
    height_cm          = Column(Integer)
    education          = Column(String(200))
    job_title          = Column(String(200))
    languages          = Column(ARRAY(String), nullable=False, default=list)
    smoking            = Column(String(30))
    drinking           = Column(String(30))
    privacy_settings   = Column(JSONB, nullable=False, default=dict)
    preferences        = Column(JSONB, nullable=False, default=dict)
    updated_at         = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
