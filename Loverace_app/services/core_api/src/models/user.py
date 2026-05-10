import uuid

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from src.database import Base


class User(Base):
    __tablename__ = "users"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email         = Column(String(255), unique=True, nullable=False, index=True)
    phone_hash    = Column(String(255), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    status        = Column(String(20), nullable=False, default="active")
    is_verified   = Column(Boolean, nullable=False, default=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    last_active   = Column(DateTime(timezone=True), server_default=func.now())
