import os
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

APP_PASSWORD = os.getenv("APP_PASSWORD", "")
SECRET_KEY = os.getenv("SECRET_KEY", "")
DB_PATH = Path(os.getenv("DB_PATH", ROOT_DIR / "data" / "jobagent.db"))
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"
AUTH_ENABLED = os.getenv("AUTH_ENABLED", "true").lower() == "true"
