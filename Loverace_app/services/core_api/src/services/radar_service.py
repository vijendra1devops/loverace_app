from datetime import date

import asyncpg

# Distance buckets for fuzzy display (privacy-first)
_BUCKETS = [100, 250, 500, 1_000, 2_000, 5_000]


def _fuzzy_label(d: float) -> str:
    for b in _BUCKETS:
        if d <= b:
            return f"~{b}m away"
    return "~5km+ away"


def _calc_age(dob: date | None) -> int | None:
    if not dob:
        return None
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


class RadarService:
    def __init__(self, pool: asyncpg.Pool, current_user_id: str) -> None:
        self.pool = pool
        self.current_user_id = current_user_id

    async def get_nearby(self, lat: float, lng: float, radius_m: float) -> list[dict]:
        """Return nearby users within radius_m metres using PostGIS ST_DWithin."""
        rows = await self.pool.fetch(
            """
            SELECT
                u.id::text                                                          AS user_id,
                p.display_name,
                p.photos,
                p.date_of_birth,
                p.gender_identity,
                ST_Distance(
                    l.geom::geography,
                    ST_MakePoint($2, $1)::geography
                )                                                                   AS distance_m
            FROM   locations l
            JOIN   users    u ON u.id = l.user_id
            JOIN   profiles p ON p.user_id = l.user_id
            WHERE  l.visibility != 'hidden'
              AND  u.status = 'active'
              AND  u.id::text != $3
              AND  ST_DWithin(
                       l.geom::geography,
                       ST_MakePoint($2, $1)::geography,
                       $4
                   )
            ORDER  BY distance_m ASC
            LIMIT  50
            """,
            lat, lng, self.current_user_id, radius_m,
        )

        results = []
        for row in rows:
            photos: list = row["photos"] or []
            avatar_url = photos[0].get("url") if photos else None
            results.append({
                "user_id":         row["user_id"],
                "display_name":    row["display_name"],
                "avatar_url":      avatar_url,
                "distance_m":      round(row["distance_m"], 1),
                "distance_label":  _fuzzy_label(row["distance_m"]),
                "gender_identity": row["gender_identity"],
                "age":             _calc_age(row["date_of_birth"]),
            })
        return results
