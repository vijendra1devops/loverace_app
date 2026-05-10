from sqlalchemy import Column, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from src.database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    user_id               = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    sound_enabled         = Column(Boolean, nullable=False, default=True)
    vibrate_enabled       = Column(Boolean, nullable=False, default=True)
    reduce_motion         = Column(Boolean, nullable=False, default=False)
    show_online_status    = Column(Boolean, nullable=False, default=True)
    notifications_enabled = Column(Boolean, nullable=False, default=True)
    updated_at            = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
