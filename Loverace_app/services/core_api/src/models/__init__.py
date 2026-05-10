# Import all models so SQLAlchemy metadata is fully populated before create_all.
from src.models.user import User  # noqa: F401
from src.models.profile import Profile  # noqa: F401
from src.models.location import Location  # noqa: F401
from src.models.swipe import Swipe  # noqa: F401
from src.models.match import Match  # noqa: F401
from src.models.conversation import Conversation  # noqa: F401
from src.models.bond_progress import BondProgress  # noqa: F401
from src.models.settings import UserSettings  # noqa: F401
