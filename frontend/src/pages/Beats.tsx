import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Genre, Position, Project } from '../types'
import { isRecruiting } from '../utils'
import { useAuth } from '../auth'
import BeatCard from '../components/BeatCard'
import ApplyModal from '../components/ApplyModal'
import ConfirmModal from '../components/ConfirmModal'

const GENRES: (Genre | '전체')[] = ['전체', '붐뱁', '트랩', 'R&B', '드릴']

interface Props {
  projects: Project[]
  onApply: (projectId: number, position: Position) => Promise<void>
  onDelete: (projectId: number) => Promise<void>
}

export default function Beats({ projects, onApply, onDelete }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [genre, setGenre] = useState<Genre | '전체'>('전체')
  const [applying, setApplying] = useState<Project | null>(null) // 신청 창을 띄운 비트
  const [deleting, setDeleting] = useState<Project | null>(null) // 삭제 확인 창
  const [toast, setToast] = useState('')

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(''), 2500)
  }

  const visible = projects
    .filter((p) => genre === '전체' || p.genre === genre)
    // 모집 중인 비트를 앞으로 정렬
    .sort((a, b) => Number(isRecruiting(b)) - Number(isRecruiting(a)))

  // 로그인하지 않은 사람이 신청을 누르면 로그인 화면으로 보내요.
  function handleApplyClick(project: Project) {
    if (!user) navigate('/login')
    else setApplying(project)
  }

  // 서버 요청이 실패하면 여기서 에러가 던져지고, ApplyModal이 받아서 메시지를 보여줘요.
  async function handleSubmit(position: Position) {
    if (!applying) return
    await onApply(applying.id, position)
    showToast(`'${applying.title}' 팀에 ${position}(으)로 합류했어요!`)
    setApplying(null)
  }

  async function handleDelete() {
    if (!deleting) return
    await onDelete(deleting.id)
    showToast(`'${deleting.title}' 모집글을 삭제했어요.`)
    setDeleting(null)
  }

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <h1>비트 게시판</h1>
          <p>같이 작업할 비트를 고르고 참여 신청을 보내세요.</p>
        </div>
        {user ? (
          <Link to="/beats/new" className="btn">+ 비트 올리기</Link>
        ) : (
          <Link to="/login" className="btn">로그인하고 참여하기</Link>
        )}
      </div>

      <div className="filters">
        {GENRES.map((g) => (
          <button
            key={g}
            className={g === genre ? 'chip selected' : 'chip'}
            onClick={() => setGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="empty-text">
          {projects.length === 0
            ? '아직 올라온 비트가 없어요. 첫 비트를 올려 보세요!'
            : '이 장르의 비트가 아직 없어요.'}
        </p>
      ) : (
        <div className="card-grid">
          {visible.map((p) => (
            <BeatCard
              key={p.id}
              project={p}
              isMine={user !== null && user.id === p.ownerId}
              onApply={handleApplyClick}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      {applying && (
        <ApplyModal
          project={applying}
          onClose={() => setApplying(null)}
          onSubmit={handleSubmit}
        />
      )}

      {deleting && (
        <ConfirmModal
          title="모집글을 삭제할까요?"
          message={`'${deleting.title}'의 참여 신청 기록도 함께 사라지고, 되돌릴 수 없어요.`}
          confirmLabel="삭제하기"
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </main>
  )
}
