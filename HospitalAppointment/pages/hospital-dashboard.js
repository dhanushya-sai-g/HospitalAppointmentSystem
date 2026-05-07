import { useEffect, useState } from 'react'
import Router from 'next/router'
import Layout from '../components/Layout'

export default function HospitalDashboard() {
  const [user, setUser] = useState(null)
  const [hospital, setHospital] = useState(null)
  const [departments, setDepartments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [newDept, setNewDept] = useState('')
  const [doctorName, setDoctorName] = useState('')
  const [doctorEmail, setDoctorEmail] = useState('')
  const [doctorPassword, setDoctorPassword] = useState('')
  const [doctorDepartmentId, setDoctorDepartmentId] = useState('')
  const [doctorBio, setDoctorBio] = useState('')
  const [doctorMsg, setDoctorMsg] = useState('')
  const [creatingDoctor, setCreatingDoctor] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      Router.push('/login')
      return
    }

    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(async j => {
        const user = j.user
        setUser(user)

        if (user.role !== 'HOSPITAL_ADMIN') {
          Router.push('/dashboard')
          return
        }

        // Fetch hospital info
        const hospitalRes = await fetch(`/api/hospitals`)
        const hospitalsData = await hospitalRes.json()
        const hosp = hospitalsData.hospitals?.find(h => h.id === user.hospitalId)
        setHospital(hosp)

        if (hosp) {
          setDepartments(hosp.departments || [])

          // Fetch doctors under this hospital
          const doctorsRes = await fetch('/api/doctors')
          const doctorsData = await doctorsRes.json()
          const hospitalDoctors = doctorsData.doctors?.filter(d => d.hospitalId === hosp.id) || []
          setDoctors(hospitalDoctors)

          // Fetch all appointments for this hospital
          const apptRes = await fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } })
          const apptData = await apptRes.json()
          setAppointments(apptData.appointments || [])
        }

        setLoading(false)
      })
      .catch(() => {
        Router.push('/login')
      })
  }, [])

  async function addDepartment() {
    if (!newDept.trim()) {
      setMsg('Please enter a department name')
      return
    }

    const token = localStorage.getItem('token')
    setLoading(true)
    const res = await fetch('/api/departments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: newDept })
    })
    const j = await res.json()
    setLoading(false)

    if (res.ok) {
      setMsg('✓ Department added')
      setNewDept('')
      setDepartments([...departments, j.department])
    } else {
      setMsg(j.error || 'Failed to add department')
    }
  }

  async function createDoctor() {
    if (!doctorName.trim() || !doctorEmail.trim() || !doctorPassword.trim() || !doctorDepartmentId) {
      setDoctorMsg('Please provide name, email, password, and department')
      return
    }

    const token = localStorage.getItem('token')
    setCreatingDoctor(true)
    const res = await fetch('/api/auth/create-doctor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: doctorName,
        email: doctorEmail,
        password: doctorPassword,
        departmentId: doctorDepartmentId,
        bio: doctorBio
      })
    })
    const j = await res.json()
    setCreatingDoctor(false)

    if (res.ok) {
      setDoctorMsg('✓ Doctor account created successfully')
      setDoctorName('')
      setDoctorEmail('')
      setDoctorPassword('')
      setDoctorDepartmentId('')
      setDoctorBio('')
      setDoctors([...doctors, j.doctor])
    } else {
      setDoctorMsg(j.error || 'Failed to create doctor')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner"></div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!user || user.role !== 'HOSPITAL_ADMIN') {
    return (
      <Layout>
        <div className="container">
          <div className="alert alert-danger">Access denied. Hospital admins only.</div>
        </div>
      </Layout>
    )
  }

  if (!hospital) {
    return (
      <Layout>
        <div className="container">
          <div className="alert alert-danger">Hospital not found</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Hospital Dashboard</h1>
            <p className="section-subtitle">Overview of your hospital operations, active doctors, and appointment demand.</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h4>Doctors</h4>
            <p>{doctors.length}</p>
          </div>
          <div className="stat-card">
            <h4>Appointments</h4>
            <p>{appointments.length}</p>
          </div>
          <div className="stat-card">
            <h4>Departments</h4>
            <p>{departments.length}</p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>{hospital.name}</h3>
          <p><strong>Address:</strong> {hospital.address || 'No address provided'}</p>
          <p><strong>Doctors:</strong> {doctors.length}</p>
          <p><strong>Appointments:</strong> {appointments.length}</p>
        </div>

        {msg && (
          <div className={`alert ${msg.includes('✓') ? 'alert-success' : 'alert-danger'}`}>
            {msg}
          </div>
        )}

        <div className="grid-2">
          <div className="card">
            <h3>Add Department</h3>
            <div className="form-group">
              <label>Department Name *</label>
              <input
                placeholder="e.g., Cardiology"
                value={newDept}
                onChange={e => setNewDept(e.target.value)}
              />
            </div>
            <button
              onClick={addDepartment}
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Department'}
            </button>
          </div>

          <div className="card">
            <h3>Create Doctor Account</h3>
            <div className="form-group">
              <label>Doctor Name *</label>
              <input
                placeholder="Dr. John Doe"
                value={doctorName}
                onChange={e => setDoctorName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                placeholder="doctor@example.com"
                value={doctorEmail}
                onChange={e => setDoctorEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                placeholder="Initial password"
                value={doctorPassword}
                onChange={e => setDoctorPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Department *</label>
              <select
                value={doctorDepartmentId}
                onChange={e => setDoctorDepartmentId(e.target.value)}
              >
                <option value="">Select department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                placeholder="Doctor bio or specialties"
                value={doctorBio}
                onChange={e => setDoctorBio(e.target.value)}
              />
            </div>
            <button
              onClick={createDoctor}
              className="btn btn-primary btn-block"
              disabled={creatingDoctor}
            >
              {creatingDoctor ? 'Creating...' : 'Create Doctor'}
            </button>
            {doctorMsg && (
              <div className={`alert ${doctorMsg.includes('✓') ? 'alert-success' : 'alert-danger'}`} style={{ marginTop: '1rem' }}>
                {doctorMsg}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2>Doctors ({doctors.length})</h2>
          {doctors.length === 0 ? (
            <div className="alert alert-info">
              No doctors registered yet. Use the form below to create doctor accounts for your hospital.
            </div>
          ) : (
            <div className="grid">
              {doctors.map(d => (
                <div key={d.id} className="card">
                  <div className="card-header">Dr. {d.user?.name || 'Doctor'}</div>
                  <div className="card-body">
                    <p><strong>Email:</strong> {d.user?.email}</p>
                    <p><strong>Bio:</strong> {d.bio || 'No bio'}</p>
                    <p><strong>Department:</strong> {d.department?.name ?? 'Not assigned'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2>Appointments by Doctor</h2>
          {doctors.length === 0 ? (
            <div className="alert alert-info">No doctors registered yet</div>
          ) : appointments.length === 0 ? (
            <div className="alert alert-info">No appointments yet</div>
          ) : (
            doctors.map(doctor => {
              const doctorAppts = appointments.filter(a => a.doctorId === doctor.id)
              return (
                <div key={doctor.id} style={{ marginBottom: '2rem' }}>
                  <h3>Dr. {doctor.user?.name || 'Doctor'} ({doctorAppts.length} appointments)</h3>
                  {doctorAppts.length === 0 ? (
                    <p style={{ color: '#999', marginLeft: '1rem' }}>No appointments</p>
                  ) : (
                    <div className="grid">
                      {doctorAppts.map(a => (
                        <div key={a.id} className="card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div>
                              <h4>Patient: {a.patient?.name || a.patient?.email}</h4>
                              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>{a.patient?.email}</p>
                            </div>
                            <span className={`badge badge-${a.status === 'CONFIRMED' ? 'success' : a.status === 'CANCELLED' ? 'danger' : 'primary'}`}>
                              {a.status}
                            </span>
                          </div>
                          <div className="card-body">
                            <p><strong>Date:</strong> {new Date(a.timeSlot?.start).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> {new Date(a.timeSlot?.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p><strong>Reason:</strong> {a.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </Layout>
  )
}
