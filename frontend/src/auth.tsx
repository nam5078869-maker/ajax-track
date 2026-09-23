import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import * as api from './api'
import type { User } from './types'

// 로그인 상태는 여러 화면에서 필요해서, Context로 앱 전체에 공유해요.
// (props로 계속 내려보내지 않아도 useAuth()로 어디서든 꺼내 쓸 수 있어요.)

interface AuthValue {
  user: User | null
  ready: boolean // 저장된 토큰 확인이 끝났는지
  login: (username: string, password: string) => Promise<void>
  signup: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  // 새로고침했을 때: 저장된 토큰이 아직 쓸 수 있는지 서버에 물어봐요.
  useEffect(() => {
    if (!api.getToken()) {
      setReady(true)
      return
    }
    api
      .fetchMe()
      .then(setUser)
      .catch(() => api.setToken(null)) // 만료된 토큰은 버림
      .finally(() => setReady(true))
  }, [])

  async function login(username: string, password: string) {
    const res = await api.login(username, password)
    api.setToken(res.accessToken)
    setUser(res.user)
  }

  async function signup(username: string, password: string) {
    const res = await api.signup(username, password)
    api.setToken(res.accessToken)
    setUser(res.user)
  }

  function logout() {
    api.setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth는 AuthProvider 안에서만 쓸 수 있어요.')
  return ctx
}
