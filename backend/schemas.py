"""API로 주고받는 데이터 모양.

DB 테이블(models.py)과 따로 두는 이유:
- 클라이언트가 보내면 안 되는 값(id 등)을 막을 수 있고
- 입력값 검사(글자 수, 허용 값)를 여기서 한 번에 처리할 수 있어요.
Python은 snake_case, JavaScript는 camelCase를 쓰기 때문에
target_stage ↔ targetStage 처럼 자동으로 이름을 바꿔 주도록 설정했어요.
"""
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

Position = Literal["랩", "보컬", "비트", "녹음"]
Genre = Literal["붐뱁", "트랩", "R&B", "드릴"]
TargetStage = Literal["축제", "정기공연"]


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,  # DB 객체(Project, Member)를 그대로 변환할 수 있게
    )


# ---------- 응답 (서버 → 클라이언트) ----------
class MemberRead(CamelModel):
    name: str
    position: Position
    is_mentor: bool = False


class UserRead(CamelModel):
    id: int
    username: str


class TokenRead(CamelModel):
    """로그인·회원가입 성공 시 돌려주는 값 (출입증 + 내 정보)"""
    access_token: str
    user: UserRead


class ProjectRead(CamelModel):
    id: int
    owner_id: int | None = None
    title: str
    producer: str
    genre: Genre
    bpm: int
    description: str
    target_stage: TargetStage
    needs: dict[str, int]
    members: list[MemberRead]
    stage: int


# ---------- 요청 (클라이언트 → 서버) ----------
class SignupRequest(CamelModel):
    username: str = Field(min_length=2, max_length=20)
    password: str = Field(min_length=8, max_length=64)


class LoginRequest(CamelModel):
    username: str
    password: str


class MemberCreate(CamelModel):
    """이제 이름은 로그인한 계정에서 가져오므로 포지션만 받아요."""
    position: Position


class ProjectCreate(CamelModel):
    title: str = Field(min_length=1, max_length=50)
    genre: Genre
    bpm: int = Field(ge=40, le=250)
    description: str = Field(default="", max_length=300)
    target_stage: TargetStage
    needs: dict[Position, int]


class StageUpdate(CamelModel):
    stage: int = Field(ge=0, le=3)
