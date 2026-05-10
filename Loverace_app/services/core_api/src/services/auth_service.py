from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import settings
from src.models.bond_progress import BondProgress
from src.models.settings import UserSettings
from src.models.profile import Profile
from src.models.user import User
from src.schemas.auth import LoginRequest, RegisterRequest, TokenResponse

_pwd = CryptContext(schemes=["bcrypt_sha256", "bcrypt"], default="bcrypt_sha256", deprecated="auto")


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    @staticmethod
    def hash_password(plain: str) -> str:
        try:
            return _pwd.hash(plain)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(exc) or "Invalid password."
            ) from exc

    @staticmethod
    def verify_password(plain: str, hashed: str) -> bool:
        return _pwd.verify(plain, hashed)

    @staticmethod
    def create_token(user_id: str) -> str:
        exp = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRY_MINUTES)
        return jwt.encode(
            {"sub": user_id, "exp": exp},
            settings.JWT_SECRET,
            algorithm=settings.JWT_ALGORITHM,
        )

    # ------------------------------------------------------------------
    # Public methods
    # ------------------------------------------------------------------
    async def register(self, body: RegisterRequest) -> TokenResponse:
        result = await self.db.execute(select(User).where(User.email == body.email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

        user = User(
            email=body.email,
            password_hash=self.hash_password(body.password),
        )
        self.db.add(user)
        await self.db.flush()  # populate user.id

        self.db.add(Profile(
            user_id=user.id,
            display_name=body.display_name,
            date_of_birth=body.date_of_birth,
        ))
        self.db.add(UserSettings(user_id=user.id))
        await self.db.commit()

        return TokenResponse(access_token=self.create_token(str(user.id)), user_id=str(user.id))

    async def login(self, body: LoginRequest) -> TokenResponse:
        result = await self.db.execute(select(User).where(User.email == body.email))
        user = result.scalar_one_or_none()

        if not user or not self.verify_password(body.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        if user.status != "active":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account suspended")

        return TokenResponse(access_token=self.create_token(str(user.id)), user_id=str(user.id))
