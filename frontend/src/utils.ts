import type { Position, Project } from './types'

// 아직 남은 모집 인원 합계
export function remainingSlots(project: Project): number {
  return Object.values(project.needs).reduce((sum, n) => sum + (n ?? 0), 0)
}

export function isRecruiting(project: Project): boolean {
  return remainingSlots(project) > 0
}

// 모집 인원이 1명 이상 남은 포지션 목록
export function openPositions(project: Project): Position[] {
  return (Object.keys(project.needs) as Position[]).filter(
    (pos) => (project.needs[pos] ?? 0) > 0,
  )
}
