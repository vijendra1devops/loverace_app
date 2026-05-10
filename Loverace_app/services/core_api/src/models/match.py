import uuid

from sqlalchemy import Column, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from src.database import Base


class Match(Base):
    __tablename__ = "matches"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_a_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_b_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    matched_at   = Column(DateTime(timezone=True), server_default=func.now())
    is_active    = Column(Boolean, nullable=False, default=True)
    blocked_by_a = Column(Boolean, nullable=False, default=False)
    blocked_by_b = Column(Boolean, nullable=False, default=False)

    __table_args__ = (
        UniqueConstraint("user_a_id", "user_b_id", name="uq_match_pair"),
    )
