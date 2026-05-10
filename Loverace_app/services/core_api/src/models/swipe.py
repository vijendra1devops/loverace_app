import uuid

from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from src.database import Base


class Swipe(Base):
    __tablename__ = "swipes"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    to_user_id   = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    direction    = Column(String(10), nullable=False)
    source       = Column(String(10), nullable=False, default="feed")
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("from_user_id", "to_user_id", name="uq_swipe_pair"),
    )
