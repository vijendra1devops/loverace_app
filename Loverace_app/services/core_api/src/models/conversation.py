import uuid

from sqlalchemy import Column, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from src.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    match_id   = Column(UUID(as_uuid=True), ForeignKey("matches.id", ondelete="CASCADE"), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
