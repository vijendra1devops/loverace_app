from pydantic import BaseModel, Field
from typing import Optional


class SwipeRequest(BaseModel):
    to_user_id: str
    direction:  str = Field(pattern="^(like|dislike|superlike)$")
    source:     str = Field(default="feed", pattern="^(radar|feed)$")


class SwipeResponse(BaseModel):
    swipe_id:        str
    match_created:   bool
    match_id:        Optional[str] = None
    conversation_id: Optional[str] = None


class MatchResponse(BaseModel):
    match_id:        str
    other_user_id:   str
    display_name:    str
    avatar_url:      Optional[str] = None
    conversation_id: str
    matched_at:      str
