import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Genre, Position, Project, TargetStage } from '../types'
import type { NewBeatInput } from '../api'

const GENRES: Genre[] = ['붐뱁', '트랩', 'R&B', '드릴']
const TARGETS: TargetStage[] = ['축제', '정기공연']
const RECRUITABLE: Position[] = ['랩', '보컬', '녹음'] // 비트는 글쓴이 본인이 맡아요

export default function NewBeat({ onCreate }: { onCreate: (input: NewBeatInput) => Promise<Project> }) {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState<Genre>('붐뱁')
  const [bpm, setBpm] = useState(90)
  const [description, setDescription] = useState('')
  const [targetStage, setTargetStage] = useState<TargetStage>('축제')
  const [needs, setNeeds] = useState<Partial<Record<Position, number>>>({ 랩: 1 })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function setNeed(pos: Position, value: number) {
    setNeeds((prev) => ({ ...prev, [pos]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (title.trim() === '') {
      setError('제목을 입력해 주세요.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await onCreate({ title: title.trim(), genre, bpm, description: description.trim(), targetStage, needs })
      navigate('/beats')
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록하지 못했어요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page narrow">
      <div className="page-head">
        <div>
          <h1>비트 올리기</h1>
          <p>같이 작업할 멤버를 모집해 보세요.</p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          제목
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="비트 이름" autoFocus />
        </label>

        <div className="form-row">
          <label>
            장르
            <select value={genre} onChange={(e) => setGenre(e.target.value as Genre)}>
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label>
            BPM
            <input
              type="number"
              min={40}
              max={250}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
          </label>
          <label>
            목표 무대
            <select value={targetStage} onChange={(e) => setTargetStage(e.target.value as TargetStage)}>
              {TARGETS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        </div>

        <label>
          소개
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="어떤 느낌의 곡인지, 어떤 사람을 찾는지 적어 주세요."
          />
        </label>

        <fieldset className="needs-field">
          <legend>모집 인원</legend>
          {RECRUITABLE.map((pos) => (
            <label key={pos} className="need-row">
              <span>{pos}</span>
              <input
                type="number"
                min={0}
                max={4}
                value={needs[pos] ?? 0}
                onChange={(e) => setNeed(pos, Number(e.target.value))}
              />
            </label>
          ))}
        </fieldset>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn" disabled={busy}>
          {busy ? '등록 중...' : '등록하기'}
        </button>
      </form>
    </main>
  )
}
