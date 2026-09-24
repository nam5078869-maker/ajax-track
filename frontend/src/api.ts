import type { Genre, Position, Project, TargetStage, User } from './types'

// 서버와 통신하는 함수는 전부 이 파일에 모아 둬요.
// 화면 코드는 "어떻게" 요청하는지 몰라도 되고, 주소가 바뀌어도 여기만 고치면 돼요.

// 개발할 때는 빈 값(= vite 프록시 사용), 배포할 때는 백엔드 주소를 넣어요.
const BASE_URL = import.meta.env.VITE_API_URL ?? ''

const TOKEN_KEY = 'ajax_token'

// 로그인 토큰은 브라우저에 저장해 둬야 새로고침해도 로그인이 유지돼요.
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // 브라우저 설정으로 저장이 막혀 있어도 앱은 계속 동작하게 둬요.
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(BASE_URL + url, {
    headers: {
      'Content-Type': 'application/json',
      // 로그인했다면 "나 이 사람이에요" 라는 출입증을 같이 보냄
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })

  if (!res.ok) {
    // FastAPI는 에러를 { "detail": "메시지" } 형태로 보내줘요.
    const body = await res.json().catch(() => null)
    const message =
      typeof body?.detail === 'string' ? body.detail : '요청을 처리하지 못했어요. 입력값을 확인해 주세요.'
    throw new Error(message)
  }
  // 204(본문 없음) 응답 처리
  if (res.status === 204) return null as T
  return res.json() as Promise<T>
}

// ---------- 로그인 ----------
export interface AuthResponse {
  accessToken: string
  user: User
  recoveryCode?: string | null // 회원가입·비밀번호 재설정 때만 옵니다 (한 번만 보여줌)
}

export function signup(username: string, password: string) {
  return request<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function login(username: string, password: string) {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function resetPassword(username: string, recoveryCode: string, newPassword: string) {
  return request<AuthResponse>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ username, recoveryCode, newPassword }),
  })
}

export function fetchMe() {
  return request<User>('/api/auth/me')
}

// ---------- 비트 / 팀 ----------
export interface NewBeatInput {
  title: string
  genre: Genre
  bpm: number
  description: string
  targetStage: TargetStage
  needs: Partial<Record<Position, number>>
}

export function fetchProjects() {
  return request<Project[]>('/api/projects')
}

export function joinProject(projectId: number, position: Position) {
  return request<Project>(`/api/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify({ position }),
  })
}

export function createProject(input: NewBeatInput) {
  return request<Project>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteProject(projectId: number) {
  // 204 No Content 응답이라 본문이 없어요.
  return request<null>(`/api/projects/${projectId}`, { method: 'DELETE' })
}

export function updateStage(projectId: number, stage: number) {
  return request<Project>(`/api/projects/${projectId}/stage`, {
    method: 'PATCH',
    body: JSON.stringify({ stage }),
  })
}
