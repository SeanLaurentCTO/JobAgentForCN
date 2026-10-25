from contextlib import asynccontextmanager

from fastapi import FastAPI

from .config import APP_PASSWORD, AUTH_ENABLED, SECRET_KEY
from .db import init_db
from .routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    if AUTH_ENABLED and (not APP_PASSWORD or not SECRET_KEY):
        raise RuntimeError("请在 .env 中设置 APP_PASSWORD 和 SECRET_KEY，或设置 AUTH_ENABLED=false")
    init_db()
    yield


app = FastAPI(title="JobAgent", lifespan=lifespan)
app.include_router(router)
