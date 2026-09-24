"""DB 연결 설정.

로컬에서는 파일 하나짜리 SQLite를 쓰고,
배포 환경에서는 DATABASE_URL 환경변수가 가리키는 PostgreSQL에 연결해요.
"""
import os
from pathlib import Path

from sqlalchemy import inspect, text
from sqlmodel import Session, SQLModel, create_engine

DB_PATH = Path(__file__).parent / "ajax_track.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

# 배포 서비스들이 주는 주소는 postgres:// 로 시작하는데,
# 파이썬에서 쓰려면 postgresql+psycopg:// 형태여야 해요.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

IS_SQLITE = DATABASE_URL.startswith("sqlite")

engine = create_engine(
    DATABASE_URL,
    # SQLite를 여러 요청에서 같이 쓰기 위한 설정 (PostgreSQL에는 필요 없음)
    connect_args={"check_same_thread": False} if IS_SQLITE else {},
    pool_pre_ping=not IS_SQLITE,  # 오래 쉰 연결이 끊겼는지 미리 확인
)


def create_db() -> None:
    """models.py에 정의한 테이블이 없으면 만든다."""
    SQLModel.metadata.create_all(engine)
    _add_missing_columns()


# 이미 데이터가 들어 있는 DB에는 create_all이 "새 컬럼"을 더해 주지 않아요.
# 그래서 없는 컬럼만 골라 직접 추가합니다. (여러 번 실행해도 안전)
NEW_COLUMNS = {
    "user": {"recovery_code_hash": "VARCHAR"},
}


def _add_missing_columns() -> None:
    inspector = inspect(engine)
    for table, columns in NEW_COLUMNS.items():
        if table not in inspector.get_table_names():
            continue
        existing = {c["name"] for c in inspector.get_columns(table)}
        for name, col_type in columns.items():
            if name in existing:
                continue
            with engine.begin() as conn:
                conn.execute(text(f'ALTER TABLE "{table}" ADD COLUMN {name} {col_type}'))


def get_session():
    """요청 하나마다 DB 세션을 열고, 끝나면 자동으로 닫는다."""
    with Session(engine) as session:
        yield session
