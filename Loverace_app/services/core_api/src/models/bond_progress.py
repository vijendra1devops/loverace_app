from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from src.database import Base


class BondProgress(Base):
    __tablename__ = "bond_progress"

    conversation_id      = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), primary_key=True)
    user_id              = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    stage                = Column(Integer, nullable=False, default=1)
    stage_xp             = Column(Integer, nullable=False, default=0)
    level                = Column(Integer, nullable=False, default=1)
    pending_confirmation = Column(Boolean, nullable=False, default=False)
    confirmed_upgrade    = Column(Boolean, nullable=False, default=False)
    last_updated         = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
