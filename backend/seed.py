"""서버가 처음 켜질 때 넣을 기본 데이터.

지금은 아무것도 넣지 않고 빈 상태로 시작해요.
나중에 예시 데이터가 필요하면 SEED 리스트에 항목을 추가하면 됩니다.
"""
from sqlmodel import Session


def seed_if_empty(session: Session) -> None:
    return  # 넣을 기본 데이터 없음
