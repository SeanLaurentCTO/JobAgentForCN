import hashlib
import hmac

from fastapi import HTTPException, Request

from .config import APP_PASSWORD, SECRET_KEY

COOKIE_NAME = "ja_session"


def make_token() -> str:
    return hmac.new(SECRET_KEY.encode(), b"jobagent-session", hashlib.sha256).hexdigest()


def check_password(password: str) -> bool:
    return hmac.compare_digest(password.encode(), APP_PASSWORD.encode())


def require_auth(request: Request) -> None:
    token = request.cookies.get(COOKIE_NAME)
    if not token or not hmac.compare_digest(token, make_token()):
        raise HTTPException(status_code=401, detail="请先登录")
