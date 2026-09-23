import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { Position, Project } from './types'
import type { NewBeatInput } from './api'
import { createProject, fetchProjects, joinProject, updateStage } from './api'
import { AuthProvider, useAuth } from './auth'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Beats from './pages/Beats'
import Teams from './pages/Teams'
import Login from './pages/Login'
import NewBeat from './pages/NewBeat'

function AppRoutes() {
  const { user, ready } = useAuth()

  // 데이터는 서버(DB)에서 받아와요. 처음엔 빈 배열로 시작.
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // useEffect(..., []) : 화면이 처음 뜰 때 딱 한 번 실행
  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch(() => setError('서버에 연결할 수 없어요. 백엔드 서버가 켜져 있는지 확인해 주세요.'))
      .finally(() => setLoading(false))
  }, [])

  // 서버가 돌려준 최신 프로젝트로 목록의 해당 항목만 교체
  function replaceProject(updated: Project) {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }

  async function applyToProject(projectId: number, position: Position) {
    replaceProject(await joinProject(projectId, position))
  }

  async function advanceStage(projectId: number, stage: number) {
    replaceProject(await updateStage(projectId, stage))
  }

  async function addProject(input: NewBeatInput) {
    const created = await createProject(input)
    setProjects((prev) => [...prev, created])
    return created
  }

  if (!ready || loading) {
    return <main className="page"><p className="empty-text">불러오는 중...</p></main>
  }
  if (error) {
    return <main className="page"><p className="empty-text error">{error}</p></main>
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/beats" element={<Beats projects={projects} onApply={applyToProject} />} />
      <Route path="/teams" element={<Teams projects={projects} onAdvance={advanceStage} />} />
      <Route path="/login" element={user ? <Navigate to="/beats" replace /> : <Login />} />
      {/* 로그인하지 않은 사람이 주소를 직접 쳐서 들어와도 로그인 화면으로 보내요 */}
      <Route
        path="/beats/new"
        element={user ? <NewBeat onCreate={addProject} /> : <Navigate to="/login" replace />}
      />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <AppRoutes />
        <footer>
          <p>© 2026 AJAX Hip-hop Club</p>
        </footer>
      </BrowserRouter>
    </AuthProvider>
  )
}
