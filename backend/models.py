"""DB 테이블 정의. 클래스 하나 = 테이블 하나, 필드 하나 = 컬럼 하나."""
from datetime import datetime, timezone

from sqlmodel import JSON, Column, Field, Relationship, SQLModel


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)  # 동아리에서 쓰는 닉네임
    password_hash: str  # 비밀번호는 절대 그대로 저장하지 않고 해시로만 저장
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Project(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    producer: str
    genre: str
    bpm: int
    description: str
    target_stage: str
    # {"랩": 2, "보컬": 1} 같은 딕셔너리를 JSON 문자열로 저장
    needs: dict[str, int] = Field(default_factory=dict, sa_column=Column(JSON))
    stage: int = 0  # 0 가사 작업 / 1 녹음 / 2 믹싱 / 3 완성
    owner_id: int | None = Field(default=None, foreign_key="user.id")  # 이 글을 올린 사람

    # 이 프로젝트에 속한 멤버들 (Member.project_id로 연결됨)
    members: list["Member"] = Relationship(back_populates="project")


class Member(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    user_id: int | None = Field(default=None, foreign_key="user.id")
    name: str
    position: str
    is_mentor: bool = False

    project: Project | None = Relationship(back_populates="members")
