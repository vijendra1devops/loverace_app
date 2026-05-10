from pydantic import BaseModel, Field
from typing import List, Optional


class LocationUpdate(BaseModel):
    lat:        float           = Field(ge=-90, le=90)
    lng:        float           = Field(ge=-180, le=180)
    accuracy_m: Optional[int]  = None
    visibility: str             = Field(default="approximate", pattern="^(public|approximate|hidden)$")


class RadarUser(BaseModel):
    user_id:         str
    display_name:    str
    avatar_url:      Optional[str] = None
    distance_m:      float
    distance_label:  str            # e.g. "~320m away"
    gender_identity: Optional[str] = None
    age:             Optional[int] = None


class RadarResponse(BaseModel):
    users: List[RadarUser]
    count: int
