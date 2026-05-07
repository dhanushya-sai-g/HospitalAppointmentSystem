import { useEffect, useState } from 'react'
import Router from 'next/router'
import Layout from '../components/Layout'

export default function Settings() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const [avatarDataUrl, setAvatarDataUrl] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    bio: '',
    password: '',
    confirmPassword: ''
  })
  const [isDoctor, setIsDoctor] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      Router.push('/login')
      return
    }

    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (!data.user) {
          Router.push('/login')
          return
        }

        setUser(data.user)
        setIsDoctor(data.user.role === 'DOCTOR')
        setForm({
          name: data.user.name || '',
          email: data.user.email || '',
          bio: data.user.bio || '',
          password: '',
          confirmPassword: ''
        })
        setAvatarDataUrl(data.user.avatarUrl || '')
        setLoading(false)
      })
      .catch(() => Router.push('/login'))
  }, [])

  function handleInput(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarDataUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  async function saveChanges(e) {
    e.preventDefault()
    setMessage('')

    if (form.password && form.password !== form.confirmPassword) {
      setMessage('Passwords do not match')
      return
    }

    setSaving(true)
    const token = localStorage.getItem('token')
    const payload = {
      avatarUrl: avatarDataUrl
    }

    if (isDoctor) {
      payload.bio = form.bio
    } else {
      payload.name = form.name
      payload.email = form.email
      if (form.password) {
        payload.password = form.password
      }
    }

    const res = await fetch('/api/auth/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setMessage(data.error || 'Unable to save changes')
      return
    }

    setMessage('Account settings updated successfully')
    setUser(data.user)
    setForm(prev => ({ ...prev, password: '', confirmPassword: '' }))
  }

  async function deleteAccount() {
    if (!window.confirm('Are you sure? This will permanently delete your account and cannot be undone.')) {
      return
    }

    setDeleting(true)
    const token = localStorage.getItem('token')
    const res = await fetch('/api/auth/me', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    setDeleting(false)
    if (!res.ok) {
      const data = await res.json()
      setMessage(data.error || 'Failed to delete account')
      return
    }

    localStorage.removeItem('token')
    Router.push('/login')
  }

  if (loading) {
    return (
      <Layout>
        <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Account Settings</h1>
            <p className="section-subtitle">
              View your account details and manage your profile. Doctors may only update their bio and profile picture here.
            </p>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h3>Profile</h3>
            <div className="form-group">
              <label>Account Created</label>
              <input value={new Date(user.createdAt).toLocaleString()} disabled />
            </div>

            <div className="form-group">
              <label>Role</label>
              <input value={user.role} disabled />
            </div>

            <div className="form-group">
              <label>Profile Picture</label>
              {avatarDataUrl ? (
                <img className="avatar-preview" src={avatarDataUrl} alt="Avatar preview" />
              ) : (
                <div className="avatar-preview avatar-placeholder">No picture</div>
              )}
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </div>

            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={e => handleInput('name', e.target.value)} disabled={isDoctor} />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => handleInput('email', e.target.value)} disabled={isDoctor} />
            </div>

            <div className="form-group">
              <label>{isDoctor ? 'Doctor Bio' : 'Bio'}</label>
              <textarea value={form.bio} onChange={e => handleInput('bio', e.target.value)} />
            </div>
          </div>

          <div className="card">
            <h3>Security</h3>
            {!isDoctor && (
              <>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" value={form.password} onChange={e => handleInput('password', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" value={form.confirmPassword} onChange={e => handleInput('confirmPassword', e.target.value)} />
                </div>
              </>
            )}

            <button onClick={saveChanges} className="btn btn-primary btn-block" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            {message && <div className="alert alert-info" style={{ marginTop: '1rem' }}>{message}</div>}

            <div style={{ marginTop: '2rem' }}>
              <h3>Danger Zone</h3>
              <p style={{ color: 'var(--text-light)' }}>Delete your account permanently. This will remove your profile, appointments, and related data.</p>
              <button onClick={deleteAccount} className="btn btn-danger btn-block" disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
