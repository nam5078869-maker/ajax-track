import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../auth'

const LINKS = [
  { to: '/', label: '홈', end: true },
  { to: '/beats', label: '비트' },
  { to: '/teams', label: '팀 현황' },
]

// NavLink는 현재 주소와 같은 링크에 자동으로 class="active"를 붙여줘요.
// (end 옵션: '/' 는 정확히 일치할 때만 활성 표시)
export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <>
      <header className="navbar">
        <Link to="/" className="logo">AJAX TRACK</Link>

        {/* 넓은 화면용 메뉴 */}
        <nav className="nav-desktop">
          {LINKS.filter((l) => l.to !== '/').map((l) => (
            <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
          ))}
        </nav>

        <div className="nav-auth">
          {user ? (
            <>
              <span className="username">{user.username}</span>
              <button className="link-button" onClick={logout}>로그아웃</button>
            </>
          ) : (
            <NavLink to="/login" className="link-button">로그인</NavLink>
          )}
        </div>
      </header>

      {/* 좁은 화면(휴대폰)에서만 보이는 아래쪽 탭 바 */}
      <nav className="tabbar">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}>{l.label}</NavLink>
        ))}
      </nav>
    </>
  )
}
