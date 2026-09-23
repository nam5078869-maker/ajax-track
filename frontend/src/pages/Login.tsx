import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Login() {
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (mode === 'signup' && password.length < 8) {
      setError('비밀번호는 8자 이상으로 정해 주세요.')
      return
    }
    setBusy(true)
    setError('')
    try {
      if (mode === 'login') await login(username.trim(), password)
      else await signup(username.trim(), password)
      navigate('/beats') // 성공하면 비트 게시판으로 이동
    } catch (err) {
      setError(err instanceof Error ? err.message : '문제가 생겼어요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page narrow">
      <div className="auth-box">
        <div className="tabs">
          <button
            className={mode === 'login' ? 'tab selected' : 'tab'}
            onClick={() => { setMode('login'); setError('') }}
          >
            로그인
          </button>
          <button
            className={mode === 'signup' ? 'tab selected' : 'tab'}
            onClick={() => { setMode('signup'); setError('') }}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            닉네임
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="동아리에서 쓰는 이름"
              autoFocus
            />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? '8자 이상' : ''}
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn" disabled={busy}>
            {busy ? '처리 중...' : mode === 'login' ? '로그인' : '가입하고 시작하기'}
          </button>
        </form>

        <p className="hint">
          닉네임은 동아리원들이 알아볼 수 있는 이름으로 정해 주세요. 비트를 올리거나 참여 신청을 할 때 이 이름으로 표시돼요.
        </p>
      </div>
    </main>
  )
}
