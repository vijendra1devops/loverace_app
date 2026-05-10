from pydantic import BaseModel, EmailStr, Field
from datetime import date


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    display_name: str = Field(min_length=2, max_length=100)
    date_of_birth: date


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str


class TokenPayload(BaseModel):
    sub: str   # user_id
    exp: int
