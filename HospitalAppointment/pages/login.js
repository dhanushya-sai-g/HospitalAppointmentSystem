import { useState } from 'react'
import Router from 'next/router'
import Layout from '../components/Layout'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setMsg('')
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const j = await res.json()
    setLoading(false)

    if (res.ok) {
      localStorage.setItem('token', j.token)
      Router.push('/dashboard')
    } else {
      setMsg(j.error || 'Login failed')
    }
  }

  return (
    <Layout>
      <div className="container">
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="card">
            <h1>Welcome Back</h1>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              {msg && <div className="alert alert-danger">{msg}</div>}

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#666' }}>
              Don't have an account? <a href="/signup">Sign up</a>
            </p>

            <div className="alert alert-info" style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
              <strong>Demo Credentials:</strong><br/>
              Patient: patient@example.com / password<br/>
              Doctor: doc@example.com / password
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
