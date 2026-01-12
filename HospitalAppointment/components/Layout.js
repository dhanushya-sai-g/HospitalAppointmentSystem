import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useTheme } from '../lib/ThemeContext'

export default function Layout({ children }) {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(j => setUser(j.user))
        .catch(() => {})
    }
  }, [router.pathname])

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
    router.push('/')
  }

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link href="/" className="nav-logo">
            Hospital Appointment System
          </Link>
          <div className="nav-links">
            {!user ? (
              <>
                <Link href="/login" className="nav-link">Login</Link>
                <Link href="/signup" className="nav-link">Sign Up</Link>
              </>
            ) : (
              <>
                {user.role === 'HOSPITAL_ADMIN' ? (
                  <>
                    <Link href="/hospital-dashboard" className="nav-link">Hospital</Link>
                  </>
                ) : (
                  <>
                    <Link href="/hospitals" className="nav-link">Hospitals</Link>
                    <Link href="/dashboard" className="nav-link">Dashboard</Link>
                  </>
                )}
                <span className="nav-user">{user.name || user.email}</span>
              </>
            )}
            <button onClick={toggleTheme} className="btn-theme-toggle">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            {user && <button onClick={logout} className="btn-logout">Logout</button>}
          </div>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>&copy; 2025 Hospital Appointment System. All rights reserved.</p>
      </footer>
    </div>
  )
}
