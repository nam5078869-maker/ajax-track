import { useState } from 'react'
import type { Project } from '../types'
import { STAGES } from '../types'
import { openPositions } from '../utils'

interface Props {
  project: Project
  canEdit: boolean // 이 트랙의 글쓴이 본인인지
  onAdvance: (projectId: number, stage: number) => Promise<void>
}

export default function TeamCard({ project, canEdit, onAdvance }: Props) {
  const finished = project.stage === STAGES.length - 1
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // 남은 모집 인원만큼 "모집 중" 빈자리 만들기  예: { 랩: 2 } → ['랩', '랩']
  const emptySlots = openPositions(project).flatMap((pos) =>
    Array(project.needs[pos] ?? 0).fill(pos),
  )

  async function handleAdvance() {
    setBusy(true)
    setError('')
    try {
      await onAdvance(project.id, project.stage + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : '변경하지 못했어요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="team">
      <div className="team-head">
        <div>
          <h3>{project.title}</h3>
          <p className="meta">
            {project.genre} · {project.bpm} BPM · 목표 무대: {project.targetStage}
          </p>
        </div>
        <span className={finished ? 'status finished' : 'status'}>
          {finished ? '완성' : `${STAGES[project.stage]} 중`}
        </span>
      </div>

      <div className="members">
        {project.members.map((m, i) => (
          <span key={`${m.name}-${i}`} className={m.isMentor ? 'member mentor' : 'member'}>
            {m.name} <small>{m.position}</small>
          </span>
        ))}
        {emptySlots.map((pos, i) => (
          <span key={`empty-${i}`} className="member empty">
            모집 중 <small>{pos}</small>
          </span>
        ))}
      </div>

      <ol className="progress">
        {STAGES.map((label, i) => {
          let cls = ''
          if (i < project.stage || finished) cls = 'done'
          else if (i === project.stage) cls = 'current'
          return <li key={label} className={cls}>{label}</li>
        })}
      </ol>

      {/* 글쓴이 본인에게만 보이는 버튼 (서버에서도 한 번 더 확인해요) */}
      {canEdit && !finished && (
        <div className="team-actions">
          {error && <span className="error">{error}</span>}
          <button className="btn-outline" onClick={handleAdvance} disabled={busy}>
            {busy ? '변경 중...' : `${STAGES[project.stage + 1]} 단계로 넘기기`}
          </button>
        </div>
      )}
    </article>
  )
}
