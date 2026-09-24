import { useState } from 'react'

interface Props {
  title: string
  message: string
  confirmLabel: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

// 되돌릴 수 없는 작업(삭제 등) 전에 한 번 더 확인하는 창
export default function ConfirmModal({ title, message, confirmLabel, onClose, onConfirm }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setBusy(true)
    setError('')
    try {
      await onConfirm()
    } catch (err) {
      setError(err instanceof Error ? err.message : '처리하지 못했어요.')
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className="confirm-message">{message}</p>
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button className="btn-outline" onClick={onClose} disabled={busy}>취소</button>
          <button className="btn danger" onClick={handleConfirm} disabled={busy}>
            {busy ? '처리 중...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
