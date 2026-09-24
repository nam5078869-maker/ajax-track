import { useState } from 'react'

interface Props {
  code: string
  onDone: () => void
}

// 복구 코드는 이 화면에서 딱 한 번만 보여줘요. 서버에는 해시만 저장됩니다.
export default function RecoveryCode({ code, onDone }: Props) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 클립보드 접근이 막힌 브라우저에서는 직접 적어두면 돼요.
    }
  }

  return (
    <div className="auth-box">
      <h2>복구 코드를 저장해 주세요</h2>
      <p className="hint">
        비밀번호를 잊었을 때 이 코드로만 다시 설정할 수 있어요.
        <b> 지금 화면을 벗어나면 다시 볼 수 없으니</b> 메모장이나 사진으로 남겨 두세요.
      </p>

      <div className="code-box">
        <span className="code">{code}</span>
        <button className="btn-outline" onClick={copy}>{copied ? '복사됨' : '복사'}</button>
      </div>

      <button className="btn" onClick={onDone}>저장했어요, 계속하기</button>
    </div>
  )
}
