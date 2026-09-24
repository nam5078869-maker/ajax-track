"""AJAX 트랙 매칭 API 서버.

실행:  uvicorn main:app --reload
문서:  http://localhost:8000/docs  (브라우저에서 API를 직접 눌러 볼 수 있어요)
"""
import os
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from auth import (
    create_recovery_code,
    create_token,
    get_current_user,
    hash_password,
    normalize_code,
    verify_password,
)
from database import create_db, engine, get_session
from models import Member, Project, User
from schemas import (
    ChangePasswordRequest,
    LoginRequest,
    MemberCreate,
    ProjectCreate,
    ProjectRead,
    ResetPasswordRequest,
    SignupRequest,
    StageUpdate,
    TokenRead,
    UserRead,
)
from seed import seed_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버가 켜질 때 한 번 실행: 테이블 만들고 예시 데이터 넣기
    create_db()
    with Session(engine) as session:
        seed_if_empty(session)
    yield


app = FastAPI(title="AJAX 트랙 매칭 API", lifespan=lifespan)

# 배포하면 프론트엔드와 백엔드의 주소가 달라져요.
# 브라우저는 기본적으로 다른 주소로의 요청을 막기 때문에, 허용할 주소를 알려줘야 해요.
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    """배포 서비스가 서버 상태를 확인할 때 쓰는 주소."""
    return {"status": "ok"}


def get_project_or_404(session: Session, project_id: int) -> Project:
    project = session.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="존재하지 않는 비트예요.")
    return project


# ---------- 회원가입 / 로그인 ----------
@app.post("/api/auth/signup", response_model=TokenRead, status_code=201)
def signup(body: SignupRequest, session: Session = Depends(get_session)):
    username = body.username.strip()
    exists = session.exec(select(User).where(User.username == username)).first()
    if exists is not None:
        raise HTTPException(status_code=409, detail="이미 사용 중인 닉네임이에요.")

    # 복구 코드는 이 순간 딱 한 번만 보여주고, DB에는 해시만 저장해요.
    recovery_code = create_recovery_code()
    user = User(
        username=username,
        password_hash=hash_password(body.password),
        recovery_code_hash=hash_password(recovery_code),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return TokenRead(
        access_token=create_token(user.id),
        user=UserRead.model_validate(user),
        recovery_code=recovery_code,
    )


@app.post("/api/auth/login", response_model=TokenRead)
def login(body: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == body.username.strip())).first()
    # 닉네임이 틀렸는지 비밀번호가 틀렸는지 알려주지 않는 게 더 안전해요.
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="닉네임 또는 비밀번호가 올바르지 않아요.")
    return TokenRead(access_token=create_token(user.id), user=UserRead.model_validate(user))


@app.post("/api/auth/reset-password", response_model=TokenRead)
def reset_password(body: ResetPasswordRequest, session: Session = Depends(get_session)):
    """닉네임 + 복구 코드로 비밀번호를 다시 정해요."""
    user = session.exec(select(User).where(User.username == body.username.strip())).first()
    code = normalize_code(body.recovery_code)

    # 닉네임이 틀렸는지 코드가 틀렸는지 구분해서 알려주지 않아요 (계정 추측 방지)
    if (
        user is None
        or user.recovery_code_hash is None
        or not verify_password(code, user.recovery_code_hash)
    ):
        raise HTTPException(status_code=401, detail="닉네임 또는 복구 코드가 올바르지 않아요.")

    # 쓴 코드는 버리고 새 코드를 발급해요 (한 번 쓰면 끝)
    new_code = create_recovery_code()
    user.password_hash = hash_password(body.new_password)
    user.recovery_code_hash = hash_password(new_code)
    session.commit()
    session.refresh(user)
    return TokenRead(
        access_token=create_token(user.id),
        user=UserRead.model_validate(user),
        recovery_code=new_code,
    )


@app.post("/api/auth/change-password", response_model=TokenRead)
def change_password(
    body: ChangePasswordRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """로그인한 상태에서 비밀번호 바꾸기."""
    if not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="현재 비밀번호가 올바르지 않아요.")

    current_user.password_hash = hash_password(body.new_password)
    session.commit()
    session.refresh(current_user)
    return TokenRead(
        access_token=create_token(current_user.id),
        user=UserRead.model_validate(current_user),
    )


@app.get("/api/auth/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)):
    """토큰이 아직 유효한지 확인하고 내 정보를 돌려줘요. (새로고침했을 때 사용)"""
    return UserRead.model_validate(current_user)


# ---------- 조회 (로그인 없이 가능) ----------
@app.get("/api/projects", response_model=list[ProjectRead])
def list_projects(session: Session = Depends(get_session)):
    projects = session.exec(select(Project).order_by(Project.id)).all()
    return [ProjectRead.model_validate(p) for p in projects]


@app.get("/api/projects/{project_id}", response_model=ProjectRead)
def get_project(project_id: int, session: Session = Depends(get_session)):
    return ProjectRead.model_validate(get_project_or_404(session, project_id))


# ---------- 새 비트(모집글) 올리기 : 로그인 필요 ----------
@app.post("/api/projects", response_model=ProjectRead, status_code=201)
def create_project(
    body: ProjectCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    needs = {pos: n for pos, n in body.needs.items() if n > 0}
    if not needs:
        raise HTTPException(status_code=400, detail="모집할 포지션을 하나 이상 정해 주세요.")

    project = Project(
        title=body.title.strip(),
        producer=current_user.username,  # 글쓴이는 로그인한 사람으로 고정 (클라이언트를 믿지 않아요)
        genre=body.genre,
        bpm=body.bpm,
        description=body.description.strip(),
        target_stage=body.target_stage,
        needs=needs,
        owner_id=current_user.id,
    )
    # 비트를 올린 사람은 자동으로 팀의 첫 멤버(비트 담당)가 됨
    project.members = [Member(name=current_user.username, position="비트", user_id=current_user.id)]
    session.add(project)
    session.commit()
    session.refresh(project)
    return ProjectRead.model_validate(project)


# ---------- 참여 신청 : 로그인 필요 ----------
@app.post("/api/projects/{project_id}/members", response_model=ProjectRead, status_code=201)
def join_project(
    project_id: int,
    body: MemberCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    project = get_project_or_404(session, project_id)

    # 검사 1: 남은 자리가 있는지 (화면에서도 막지만, 서버에서 한 번 더 확인해야 안전해요)
    left = project.needs.get(body.position, 0)
    if left <= 0:
        raise HTTPException(status_code=400, detail=f"{body.position} 포지션은 이미 모집이 끝났어요.")

    # 검사 2: 이미 이 팀에 들어와 있는지
    if any(m.name == current_user.username for m in project.members):
        raise HTTPException(status_code=409, detail="이미 이 팀에 참여하고 있어요.")

    session.add(
        Member(
            project_id=project.id,
            user_id=current_user.id,
            name=current_user.username,
            position=body.position,
        )
    )
    # JSON 컬럼은 안의 값만 바꾸면 변경을 감지 못 해서, 새 딕셔너리로 통째로 교체
    project.needs = {**project.needs, body.position: left - 1}
    session.commit()
    session.refresh(project)
    return ProjectRead.model_validate(project)


# ---------- 진행 단계 변경 : 글쓴이 본인만 ----------
@app.patch("/api/projects/{project_id}/stage", response_model=ProjectRead)
def update_stage(
    project_id: int,
    body: StageUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    project = get_project_or_404(session, project_id)
    if project.owner_id != current_user.id:
        # 401은 "누구인지 모르겠다", 403은 "누구인지는 알지만 권한이 없다"
        raise HTTPException(status_code=403, detail="이 트랙의 글쓴이만 진행 단계를 바꿀 수 있어요.")

    project.stage = body.stage
    session.commit()
    session.refresh(project)
    return ProjectRead.model_validate(project)


# ---------- 모집글 삭제 : 글쓴이 본인만 ----------
@app.delete("/api/projects/{project_id}", status_code=204)
def delete_project(
    project_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    project = get_project_or_404(session, project_id)
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="이 트랙의 글쓴이만 삭제할 수 있어요.")

    # 멤버 기록을 먼저 지워야 해요. (member 테이블이 project를 가리키고 있어서)
    for member in list(project.members):
        session.delete(member)
    session.delete(project)
    session.commit()
    return None
