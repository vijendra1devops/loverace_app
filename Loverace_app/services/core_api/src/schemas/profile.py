from pydantic import BaseModel, Field
from datetime import date
from typing import Optional, List, Any


class ProfileUpdate(BaseModel):
    display_name:       Optional[str]       = Field(None, min_length=2, max_length=100)
    date_of_birth:      Optional[date]      = None
    gender_identity:    Optional[str]       = Field(None, max_length=100)
    pronouns:           Optional[str]       = Field(None, max_length=100)
    sexual_orientation: Optional[List[str]] = None
    looking_for:        Optional[List[str]] = None
    bio:                Optional[str]       = Field(None, max_length=1000)
    interests:          Optional[List[str]] = None
    height_cm:          Optional[int]       = Field(None, ge=100, le=250)
    education:          Optional[str]       = Field(None, max_length=200)
    job_title:          Optional[str]       = Field(None, max_length=200)
    languages:          Optional[List[str]] = None
    smoking:            Optional[str]       = None
    drinking:           Optional[str]       = None
    privacy_settings:   Optional[dict]      = None
    preferences:        Optional[dict]      = None


class ProfileResponse(BaseModel):
    user_id:            str
    display_name:       str
    date_of_birth:      Optional[date]    = None
    gender_identity:    Optional[str]     = None
    pronouns:           Optional[str]     = None
    sexual_orientation: List[str]         = []
    looking_for:        List[str]         = []
    bio:                Optional[str]     = None
    photos:             List[Any]         = []
    interests:          List[Any]         = []
    height_cm:          Optional[int]     = None
    education:          Optional[str]     = None
    job_title:          Optional[str]     = None
    languages:          List[str]         = []
    smoking:            Optional[str]     = None
    drinking:           Optional[str]     = None

    model_config = {"from_attributes": True}
