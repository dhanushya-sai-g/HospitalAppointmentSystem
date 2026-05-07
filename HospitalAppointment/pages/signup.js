import { useState, useEffect } from 'react'
import Router from 'next/router'
import Layout from '../components/Layout'

export default function Signup() {
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'PATIENT', hospitalId: '', departmentId: '' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [hospitals, setHospitals] = useState([])
  const [departments, setDepartments] = useState([])
  const [hospitalName, setHospitalName] = useState('')
  const [hospitalAddress, setHospitalAddress] = useState('')
  const [newDepartments, setNewDepartments] = useState([''])

  // Load hospitals on mount
  useEffect(() => {
    fetch('/api/hospitals').then(r => r.json()).then(j => setHospitals(j.hospitals || []))
  }, [])

  function handleRoleChange(e) {
    setForm({ ...form, role: e.target.value, hospitalId: '', departmentId: '' })
  }

  function handleHospitalChange(e) {
    const hId = e.target.value
    setForm({ ...form, hospitalId: hId })
    const hospital = hospitals.find(h => h.id === hId)
    setDepartments(hospital?.departments || [])
  }

  function addDepartmentField() {
    setNewDepartments([...newDepartments, ''])
  }

  function removeDepartmentField(index) {
    setNewDepartments(newDepartments.filter((_, i) => i !== index))
  }

  function updateDepartment(index, value) {
    const updated = [...newDepartments]
    updated[index] = value
    setNewDepartments(updated)
  }

  async function submit(e) {
    e.preventDefault()
    setMsg('')
    setLoading(true)

    let payload
    if (form.role === 'HOSPITAL_ADMIN') {
      if (!hospitalName.trim()) {
        setMsg('Hospital name is required')
        setLoading(false)
        return
      }
      const deptNames = newDepartments.filter(d => d.trim())
      if (deptNames.length === 0) {
        setMsg('At least one department is required')
        setLoading(false)
        return
      }
      payload = {
        email: form.email,
        password: form.password,
        name: form.name,
        role: 'HOSPITAL_ADMIN',
        hospitalName,
        hospitalAddress,
        departments: deptNames
      }
    } else if (form.role === 'DOCTOR') {
      payload = form
    } else {
      payload = { email: form.email, password: form.password, name: form.name, role: form.role }
    }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const j = await res.json()
    setLoading(false)

    if (res.ok) {
      localStorage.setItem('token', j.token)
      Router.push('/dashboard')
    } else {
      setMsg(j.error || 'Sign up failed')
    }
  }

  return (
    <Layout>
      <div className="container">
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div className="card auth-card">
            <div className="page-header">
              <div>
                <h1>Create Account</h1>
                <p className="section-subtitle">Choose your role and create your profile. Hospital admins can register hospitals and invite doctors right away.</p>
              </div>
            </div>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

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

              <div className="form-group">
                <label>I am a *</label>
                <select value={form.role} onChange={handleRoleChange} required>
                  <option value="PATIENT">Patient</option>
                  <option value="HOSPITAL_ADMIN">Hospital Administrator</option>
                </select>
              </div>

              <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                Doctor accounts are created by a hospital admin; doctors cannot sign up directly.
              </div>

              {form.role === 'HOSPITAL_ADMIN' && (
                <div className="card" style={{ background: 'rgba(235, 245, 255, 0.8)', border: '1px solid rgba(59, 130, 246, 0.18)', marginTop: '1rem' }}>
                  <h4>Register Your Hospital</h4>

                  <div className="form-group">
                    <label>Hospital Name *</label>
                    <input
                      placeholder="City Hospital"
                      value={hospitalName}
                      onChange={e => setHospitalName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <input
                      placeholder="123 Main Street"
                      value={hospitalAddress}
                      onChange={e => setHospitalAddress(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Departments *</label>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>
                      Add at least one department.
                    </p>
                    {newDepartments.map((dept, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        <input
                          placeholder={`Department ${idx + 1}`}
                          value={dept}
                          onChange={e => updateDepartment(idx, e.target.value)}
                          style={{ flex: 1 }}
                        />
                        {newDepartments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDepartmentField(idx)}
                            className="btn btn-danger btn-small"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addDepartmentField}
                      className="btn btn-secondary btn-small"
                      style={{ marginTop: '0.5rem' }}
                    >
                      + Add Department
                    </button>
                  </div>
                </div>
              )}

              {msg && <div className="alert alert-danger">{msg}</div>}

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>

            <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-light)' }}>
              Already have an account? <a href="/login">Log in</a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
