import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .config import settings
from .database import Base, engine
from .routers import alerts, auth, images, routines, shifts, users


def _add_routine_work_date_column() -> None:
    """routine_items.work_date는 create_all이 못 건드리는 기존 테이블에 나중에 추가된 컬럼이라
    직접 ALTER + 백필해준다 (기존 행은 일단 근무 시작일과 동일하게 채움)."""
    with engine.begin() as conn:
        columns = {row[1] for row in conn.execute(text("PRAGMA table_info(routine_items)"))}
        if "work_date" in columns:
            return
        conn.execute(text("ALTER TABLE routine_items ADD COLUMN work_date DATE"))
        conn.execute(
            text(
                "UPDATE routine_items SET work_date = ("
                "SELECT shifts.work_date FROM shifts WHERE shifts.id = routine_items.shift_id"
                ")"
            )
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    # SQLite 파일과 업로드 이미지를 저장할 디렉터리 준비
    os.makedirs("./data", exist_ok=True)
    os.makedirs(settings.upload_dir, exist_ok=True)

    # 모델을 임포트해야 Base.metadata에 테이블이 등록된다
    from . import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _add_routine_work_date_column()
    yield


app = FastAPI(
    title="하루결 API",
    description="교대근무자를 위한 근무 루틴 관리 서비스",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS_ORIGINS 환경변수로 허용 출처를 제어한다. 비워두면(개발 기본값) 전부 허용.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(images.router)
app.include_router(shifts.router)
app.include_router(alerts.router)
app.include_router(routines.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
