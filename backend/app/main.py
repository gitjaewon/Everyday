import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .routers import auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    # SQLite 파일과 업로드 이미지를 저장할 디렉터리 준비
    os.makedirs("./data", exist_ok=True)
    os.makedirs(settings.upload_dir, exist_ok=True)

    # 모델을 임포트해야 Base.metadata에 테이블이 등록된다
    from . import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="하루결 API",
    description="교대근무자를 위한 근무 루틴 관리 서비스",
    version="0.1.0",
    lifespan=lifespan,
)

# 개발 단계에서는 모든 출처를 허용한다. 배포 시 프론트엔드 도메인으로 좁힐 것.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
