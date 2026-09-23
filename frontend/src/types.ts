// 앱 전체에서 쓰는 데이터 모양(타입) 정의
// C의 struct 선언과 비슷한 역할이에요.

export type Position = '랩' | '보컬' | '비트' | '녹음'
export type Genre = '붐뱁' | '트랩' | 'R&B' | '드릴'
export type TargetStage = '축제' | '정기공연'

// 트랙 진행 단계 (Project.stage는 이 배열의 인덱스)
export const STAGES = ['가사 작업', '녹음', '믹싱', '완성'] as const

export interface User {
  id: number
  username: string
}

export interface Member {
  name: string
  position: Position
  isMentor?: boolean // ?는 "있어도 되고 없어도 되는" 필드
}

// 비트 모집글 하나 = 팀 하나
export interface Project {
  id: number
  ownerId: number | null // 이 글을 올린 사용자 id
  title: string
  producer: string
  genre: Genre
  bpm: number
  description: string
  targetStage: TargetStage
  needs: Partial<Record<Position, number>> // 예: { 랩: 2, 보컬: 1 }
  members: Member[]
  stage: number // 0 ~ 3
}
