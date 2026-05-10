import uuid

from fastapi import HTTPException, status
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
import json

from src.models.profile import Profile
from src.schemas.profile import ProfileUpdate, ProfileResponse


class ProfileService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_profile(self, user_id: str) -> ProfileResponse:
        # Try the ORM-backed profile lookup first. This will work when running
        # against Postgres with the native types. On SQLite the Profile model
        # uses Postgres-only types (JSONB/ARRAY) which can cause the ORM to
        # fail. In that case, fall back to a raw SQL lookup against a simple
        # SQLite-compatible `profiles` table (created by the dev script).
        try:
            result = await self.db.execute(
                select(Profile).where(Profile.user_id == uuid.UUID(user_id))
            )
            profile = result.scalar_one_or_none()
        except Exception:
            profile = None

        if profile:
            return ProfileResponse(
                user_id=str(profile.user_id),
                display_name=profile.display_name,
                date_of_birth=profile.date_of_birth,
                gender_identity=profile.gender_identity,
                pronouns=profile.pronouns,
                sexual_orientation=profile.sexual_orientation or [],
                looking_for=profile.looking_for or [],
                bio=profile.bio,
                photos=profile.photos or [],
                interests=profile.interests or [],
                height_cm=profile.height_cm,
                education=profile.education,
                job_title=profile.job_title,
                languages=profile.languages or [],
                smoking=profile.smoking,
                drinking=profile.drinking,
            )

        # Fallback: raw SQL row -> build ProfileResponse
        res = await self.db.execute(
            text(
                "SELECT user_id, display_name, date_of_birth, gender_identity, pronouns, "
                "sexual_orientation, looking_for, bio, photos, interests, height_cm, "
                "education, job_title, languages, smoking, drinking "
                "FROM profiles WHERE user_id = :uid"
            ),
            {"uid": user_id},
        )
        raw = res.mappings().fetchone()
        if not raw:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

        def _parse_json_field(val):
            if val is None:
                return []
            if isinstance(val, (list, dict)):
                return val
            try:
                return json.loads(val)
            except Exception:
                return []

        return ProfileResponse(
            user_id=str(raw["user_id"]),
            display_name=raw["display_name"],
            date_of_birth=raw["date_of_birth"],
            gender_identity=raw["gender_identity"],
            pronouns=raw["pronouns"],
            sexual_orientation=_parse_json_field(raw["sexual_orientation"]),
            looking_for=_parse_json_field(raw["looking_for"]),
            bio=raw["bio"],
            photos=_parse_json_field(raw["photos"]),
            interests=_parse_json_field(raw["interests"]),
            height_cm=raw["height_cm"],
            education=raw["education"],
            job_title=raw["job_title"],
            languages=_parse_json_field(raw["languages"]),
            smoking=raw["smoking"],
            drinking=raw["drinking"],
        )

    async def update_profile(self, user_id: str, body: ProfileUpdate) -> ProfileResponse:
        # Update via ORM when possible; otherwise update the simple SQLite
        # fallback table.
        try:
            result = await self.db.execute(
                select(Profile).where(Profile.user_id == uuid.UUID(user_id))
            )
            profile = result.scalar_one_or_none()
        except Exception:
            profile = None

        if profile:
            for field, value in body.model_dump(exclude_none=True).items():
                setattr(profile, field, value)

            await self.db.commit()
            await self.db.refresh(profile)
            return await self.get_profile(user_id)

        # Fallback update: merge JSON fields into string columns
        updates = body.model_dump(exclude_none=True)
        # Convert list/dict fields to JSON text
        for k, v in list(updates.items()):
            if isinstance(v, (list, dict)):
                updates[k] = json.dumps(v)

        set_clause = ", ".join([f"{k} = :{k}" for k in updates.keys()])
        if not set_clause:
            return await self.get_profile(user_id)

        stmt = text(f"UPDATE profiles SET {set_clause} WHERE user_id = :uid")
        params = {**updates, "uid": user_id}
        await self.db.execute(stmt, params)
        await self.db.commit()
        return await self.get_profile(user_id)
