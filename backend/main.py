from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .config import APP_PASSWORD, FRONTEND_DIR, SECRET_KEY
from .db import init_db
from .routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not APP_PASSWORD or not SECRET_KEY:
        raise RuntimeError("请在 .env 中设置 APP_PASSWORD 和 SECRET_KEY")
    init_db()
    yield


app = FastAPI(title="JobAgent", lifespan=lifespan)
app.include_router(router)
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
