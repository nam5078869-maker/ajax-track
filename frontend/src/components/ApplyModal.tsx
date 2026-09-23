import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Position, Project } from '../types'
import { openPositions } from '../utils'
import { useAuth } from '../auth'

interface Props {
  project: Project
  onClose: () => void
  onSubmit: (position: Position) => Promise<void>
}

export default function ApplyModal({ project, onClose, onSubmit }: Props) {
  const { user } = useAuth()
  const positions = openPositions(project)
  const [position, setPosition] = useState<Position>(positions[0])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault() // 폼 제출 시 페이지가 새로고침되는 기본 동작 막기
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(position)
    } catch (err) {
      // 서버가 거절한 경우 (자리 마감, 이미 참여 중 등)
      setError(err instanceof Error ? err.message : '신청에 실패했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    // 바깥 어두운 영역을 누르면 닫히고, 안쪽 상자를 누를 때는 닫히지 않게 함
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>참여 신청</h2>
        <p className="meta">{project.title} · {project.producer}</p>

        <form onSubmit={handleSubmit}>
          {/* 이름은 로그인한 계정에서 자동으로 가져와요 */}
          <p className="as-user">{user?.username} 님으로 신청합니다.</p>

          <label>
            포지션
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as Position)}
            >
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos} (남은 자리 {project.needs[pos]})
                </option>
              ))}
            </select>
          </label>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? '신청 중...' : '신청하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
