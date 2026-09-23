import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../auth'

// NavLink는 현재 주소와 같은 링크에 자동으로 class="active"를 붙여줘요.
export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="navbar">
      <Link to="/" className="logo">AJAX TRACK</Link>
      <nav>
        <NavLink to="/beats">비트 게시판</NavLink>
        <NavLink to="/teams">팀 현황</NavLink>
        {user ? (
          <>
            <span className="username">{user.username}</span>
            <button className="link-button" onClick={logout}>로그아웃</button>
          </>
        ) : (
          <NavLink to="/login">로그인</NavLink>
        )}
      </nav>
    </header>
  )
}
