import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import RecoveryCode from '../components/RecoveryCode'

type Mode = 'login' | 'signup' | 'reset'

export default function Login() {
  const { login, signup, resetPassword } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [newCode, setNewCode] = useState<string | null>(null) // 발급된 복구 코드

  function switchMode(next: Mode) {
    setMode(next)
    setError('')
    setPassword('')
    setCode('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (mode !== 'login' && password.length < 8) {
      setError('비밀번호는 8자 이상으로 정해 주세요.')
      return
    }
    setBusy(true)
    setError('')
    try {
      if (mode === 'login') {
        await login(username.trim(), password)
        navigate('/beats')
      } else if (mode === 'signup') {
        const issued = await signup(username.trim(), password)
        setNewCode(issued) // 복구 코드 화면 보여주기
      } else {
        const issued = await resetPassword(username.trim(), code, password)
        setNewCode(issued)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '문제가 생겼어요.')
    } finally {
      setBusy(false)
    }
  }

  // 회원가입 / 재설정에 성공하면 복구 코드부터 보여줘요.
  if (newCode) {
    return (
      <main className="page narrow">
        <RecoveryCode code={newCode} onDone={() => navigate('/beats')} />
      </main>
    )
  }

  return (
    <main className="page narrow">
      <div className="auth-box">
        <div className="tabs">
          <button className={mode === 'login' ? 'tab selected' : 'tab'} onClick={() => switchMode('login')}>
            로그인
          </button>
          <button className={mode === 'signup' ? 'tab selected' : 'tab'} onClick={() => switchMode('signup')}>
            회원가입
          </button>
          <button className={mode === 'reset' ? 'tab selected' : 'tab'} onClick={() => switchMode('reset')}>
            비밀번호 찾기
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

          {mode === 'reset' && (
            <label>
              복구 코드
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="AJAX-XXXX-XXXX"
                autoCapitalize="characters"
              />
            </label>
          )}

          <label>
            {mode === 'reset' ? '새 비밀번호' : '비밀번호'}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'login' ? '' : '8자 이상'}
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn" disabled={busy}>
            {busy
              ? '처리 중...'
              : mode === 'login'
                ? '로그인'
                : mode === 'signup'
                  ? '가입하고 시작하기'
                  : '비밀번호 재설정'}
          </button>
        </form>

        <p className="hint">
          {mode === 'signup' && '가입하면 복구 코드가 한 번 표시돼요. 비밀번호를 잊었을 때 필요하니 꼭 저장해 주세요.'}
          {mode === 'login' && '닉네임은 비트를 올리거나 참여 신청할 때 표시되는 이름이에요.'}
          {mode === 'reset' && '가입할 때 받은 복구 코드를 입력하면 새 비밀번호를 정할 수 있어요. 재설정하면 복구 코드도 새로 발급됩니다.'}
        </p>
      </div>
    </main>
  )
}
