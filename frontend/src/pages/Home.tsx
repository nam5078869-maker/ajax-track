import { Link } from 'react-router-dom'

const steps = [
  { title: '비트 공유', text: '작업하고 싶은 비트를 올리고 모집글을 작성해요.' },
  { title: '팀 구성', text: '마음에 드는 비트에 참여 신청을 보내요.' },
  { title: '녹음', text: '멘토 스튜디오에서 녹음을 진행해요.' },
  { title: '무대', text: '완성한 트랙으로 축제와 정기공연 무대에 올라요.' },
]

export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>너의 첫 트랙, 여기서 시작해</h1>
        <p>비트를 공유하고, 같이 작업할 멤버를 찾고, 무대에 올릴 곡을 완성하세요.</p>
        <Link to="/beats" className="btn">비트 보러 가기</Link>
      </section>

      <section className="steps">
        <h2>진행 방식</h2>
        <div className="step-list">
          {steps.map((step, i) => (
            <div className="step" key={step.title}>
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
