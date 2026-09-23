"""로그인 관련 도구 모음: 비밀번호 해시, 토큰 발급·확인."""
import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from database import get_session
from models import User

# 토큰에 서명할 비밀 키. 실제 배포할 때는 환경변수로 바꿔야 해요.
SECRET_KEY = os.getenv("AJAX_SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
TOKEN_DAYS = 7

# Authorization: Bearer <토큰> 헤더를 읽어오는 도구
security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """비밀번호를 되돌릴 수 없는 형태로 바꿔서 저장. 같은 비밀번호도 매번 다른 값이 나와요."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_token(user_id: int) -> str:
    """로그인 성공 시 발급하는 출입증. 만료 시각이 들어 있고 서버 키로 서명돼 있어요."""
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(days=TOKEN_DAYS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    session: Session = Depends(get_session),
) -> User:
    """로그인이 필요한 API에 붙이면, 토큰을 검사해서 지금 접속한 사용자를 돌려줘요."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="로그인이 필요해요.")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="로그인 정보가 만료됐어요. 다시 로그인해 주세요.")

    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="존재하지 않는 사용자예요.")
    return user
