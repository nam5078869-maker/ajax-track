import type { Project } from '../types'
import TeamCard from '../components/TeamCard'
import { useAuth } from '../auth'

interface Props {
  projects: Project[]
  onAdvance: (projectId: number, stage: number) => Promise<void>
}

export default function Teams({ projects, onAdvance }: Props) {
  const { user } = useAuth()
  // 진행 단계가 많이 나간 팀부터 보여주기 (원본 배열은 건드리지 않도록 복사 후 정렬)
  const sorted = [...projects].sort((a, b) => b.stage - a.stage)

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <h1>팀 현황</h1>
          <p>각 팀이 어느 단계까지 왔는지 한눈에 확인하세요.</p>
        </div>
      </div>

      {projects.length === 0 && (
        <p className="empty-text">아직 만들어진 팀이 없어요. 비트 게시판에서 모집을 시작해 보세요.</p>
      )}

      <div className="team-list">
        {sorted.map((p) => (
          <TeamCard
            key={p.id}
            project={p}
            canEdit={user !== null && user.id === p.ownerId}
            onAdvance={onAdvance}
          />
        ))}
      </div>
    </main>
  )
}
