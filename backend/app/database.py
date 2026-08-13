from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./data/app.db"

engine = create_engine(
    DATABASE_URL,
    # SQLite는 기본적으로 스레드 간 커넥션 공유를 막기 때문에 FastAPI에서는 해제 필요
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI 의존성 주입용 DB 세션."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
