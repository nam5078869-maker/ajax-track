# AJAX 트랙 매칭

동국대 힙합 동아리 AJAX의 조별음원(팀 트랙) 모집·매칭 웹 서비스.
비트를 올려 멤버를 모으고, 팀별 작업 진행 상황을 공유합니다.

## 기술 스택

- **프론트엔드**: React 19, TypeScript, React Router, Vite
- **백엔드**: FastAPI, SQLModel(SQLAlchemy), JWT 인증, bcrypt
- **DB**: SQLite(로컬) / PostgreSQL(배포)

## 주요 기능

- 회원가입 / 로그인 (JWT 토큰 기반)
- 비트 모집글 등록, 장르 필터
- 포지션별 참여 신청 (자리 마감·중복 신청 서버 검증)
- 팀별 작업 단계 관리 (글쓴이만 변경 가능)

## 로컬 실행

### 백엔드

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload        # http://localhost:8000/docs
```

### 프론트엔드

```bash
cd frontend
npm install
npm run dev                      # http://localhost:5173
```

## 환경변수

| 이름 | 위치 | 설명 |
|---|---|---|
| `DATABASE_URL` | backend | PostgreSQL 주소 (없으면 SQLite 사용) |
| `AJAX_SECRET_KEY` | backend | JWT 서명 키 (배포 시 필수) |
| `ALLOWED_ORIGINS` | backend | 접근을 허용할 프론트엔드 주소 |
| `VITE_API_URL` | frontend | 백엔드 주소 (없으면 vite 프록시 사용) |

## 폴더 구조

```
ajax-track/
├── backend/        FastAPI 서버
│   ├── main.py         API 엔드포인트
│   ├── models.py       DB 테이블
│   ├── schemas.py      입출력 데이터 검증
│   ├── auth.py         비밀번호 해시 · JWT
│   └── database.py     DB 연결
├── frontend/       React 앱
│   └── src/
│       ├── pages/      화면 단위
│       ├── components/ 재사용 컴포넌트
│       ├── api.ts      서버 통신
│       └── auth.tsx    로그인 상태 관리
└── *.html          1단계 정적 페이지 (참고용)
```
