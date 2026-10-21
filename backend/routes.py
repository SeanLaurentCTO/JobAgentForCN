from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field

from .auth import COOKIE_NAME, check_password, make_token, require_auth
from .config import COOKIE_SECURE
from .db import insert_submission, list_submissions

router = APIRouter(prefix="/api")

STATUS_TEXT = {
    "pending": "已收到，等待处理",
    "done": "已处理",
    "failed": "处理失败",
}


class LoginRequest(BaseModel):
    password: str = Field(max_length=200)


class SubmitRequest(BaseModel):
    url: str = Field(max_length=2048)


def is_valid_url(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


@router.post("/login")
def login(payload: LoginRequest, response: Response):
    if not check_password(payload.password):
        raise HTTPException(status_code=401, detail="密码不正确")
    response.set_cookie(
        key=COOKIE_NAME,
        value=make_token(),
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=60 * 60 * 24 * 30,
    )
    return {"ok": True}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME)
    return {"ok": True}


@router.get("/me", dependencies=[Depends(require_auth)])
def me():
    return {"ok": True}


@router.post("/submit", dependencies=[Depends(require_auth)])
def submit(payload: SubmitRequest):
    url = payload.url.strip()
    if not is_valid_url(url):
        raise HTTPException(status_code=400, detail="这看起来不是链接，请重新粘贴")
    submission_id = insert_submission(url)
    return {"id": submission_id, "status": "pending", "message": "已收到，正在处理"}


@router.get("/submissions", dependencies=[Depends(require_auth)])
def submissions(limit: int = 20):
    limit = max(1, min(limit, 100))
    items = list_submissions(limit)
    for item in items:
        item["status_text"] = STATUS_TEXT.get(item["status"], item["status"])
    return {"items": items}
