import type { Project } from '../types'
import { isRecruiting, openPositions } from '../utils'

interface Props {
  project: Project
  isMine: boolean // 내가 올린 비트인지
  onApply: (project: Project) => void
}

export default function BeatCard({ project, isMine, onApply }: Props) {
  const recruiting = isRecruiting(project)

  return (
    <article className={recruiting ? 'card' : 'card closed'}>
      <div className="card-top">
        <span className="tag">{project.genre}</span>
        <span className="bpm">{project.bpm} BPM</span>
      </div>
      <h3>{project.title}</h3>
      <p className="meta">
        프로듀서 · {project.producer}
        {isMine && <span className="mine">내 글</span>}
      </p>
      <p className="desc">{project.description}</p>

      <div className="need">
        {recruiting ? (
          <>
            <span>모집</span>
            {openPositions(project).map((pos) => (
              <span key={pos} className="pos">
                {pos} {project.needs[pos]}
              </span>
            ))}
          </>
        ) : (
          <span>모집 완료</span>
        )}
      </div>

      <button
        className="btn-outline"
        disabled={!recruiting}
        onClick={() => onApply(project)}
      >
        {recruiting ? '참여 신청' : '마감'}
      </button>
    </article>
  )
}
