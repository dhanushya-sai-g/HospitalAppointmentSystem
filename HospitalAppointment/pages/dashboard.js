import { useEffect, useState } from 'react'
import Router from 'next/router'
import Layout from '../components/Layout'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      Router.push('/login')
      return
    }

    Promise.all([
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      userData.user?.role === 'DOCTOR' ? fetch('/api/time-slots', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()) : Promise.resolve({ slots: [] })
    ]).then(([userData, appointmentsData, timeSlotsData]) => {
      const user = userData.user
      // Redirect hospital admins to hospital dashboard
      if (user.role === 'HOSPITAL_ADMIN') {
        Router.push('/hospital-dashboard')
        return
      }
      setUser(user)
      setAppointments(appointmentsData.appointments || [])
      setTimeSlots(timeSlotsData.slots || [])
      setLoading(false)
    }).catch(() => {
      Router.push('/login')
    })
  }, [])

  async function createSlot() {
    if (!start || !end) {
      setMsg('Please select both start and end times')
      return
    }

    const token = localStorage.getItem('token')
    setLoading(true)
    const res = await fetch('/api/time-slots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ start, end })
    })
    const j = await res.json()
    setLoading(false)

    if (res.ok) {
      setMsg('✓ Time slot created successfully')
      setStart('')
      setEnd('')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      setMsg(j.error || 'Failed to create slot')
    }
  }

  async function updateStatus(appointmentId, status) {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/appointments', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ appointmentId, status })
    })

    if (res.ok) {
      setMsg(`✓ Appointment ${status.toLowerCase()}`)
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      setMsg('Failed to update appointment')
    }
  }

  function getTodayStatus() {
    if (!user || user.role !== 'DOCTOR') return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get today's time slots
    const todaySlots = timeSlots.filter(slot => {
      const slotDate = new Date(slot.start)
      slotDate.setHours(0, 0, 0, 0)
      return slotDate.getTime() === today.getTime()
    })

    // Get today's appointments
    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.timeSlot?.start)
      aptDate.setHours(0, 0, 0, 0)
      return aptDate.getTime() === today.getTime()
    })

    const totalSlots = todaySlots.length
    const bookedSlots = todayAppointments.length

    if (totalSlots === 0) return { status: 'no-slots', color: '#gray', text: 'No slots created' }
    if (bookedSlots === 0) return { status: 'available', color: '#28a745', text: 'All slots available' }
    if (bookedSlots < totalSlots) return { status: 'partial', color: '#007bff', text: `${totalSlots - bookedSlots} slots available` }
    return { status: 'full', color: '#dc3545', text: 'All slots booked' }
  }

  async function updateStatus(appointmentId, status) {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/appointments', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ appointmentId, status })
    })

    if (res.ok) {
      setMsg(`✓ Appointment ${status}`)
      setTimeout(() => window.location.reload(), 1500)
    } else {
      setMsg('Failed to update appointment')
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

  if (!user) {
    return (
      <Layout>
        <div className="container">
          <div className="alert alert-danger">Please log in to view your dashboard</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container">
        <h1>Your Dashboard</h1>
        <div className="alert alert-info">
          Signed in as <strong>{user.name || user.email}</strong> ({user.role})
        </div>

        {msg && (
          <div className={`alert ${msg.includes('✓') ? 'alert-success' : 'alert-danger'}`}>
            {msg}
          </div>
        )}

        {user.role === 'DOCTOR' && (
          <div className="grid-2">
            <div className="card">
              <h3>Create Time Slot</h3>
              <div className="form-group">
                <label>Start Time *</label>
                <input
                  type="datetime-local"
                  value={start}
                  onChange={e => setStart(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>End Time *</label>
                <input
                  type="datetime-local"
                  value={end}
                  onChange={e => setEnd(e.target.value)}
                />
              </div>
              <button
                onClick={createSlot}
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Slot'}
              </button>
            </div>

            <div className="card">
              <h3>ℹ️ Tips</h3>
              <ul style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>
                <li>Set clear availability windows</li>
                <li>Slots are 30-60 minutes typically</li>
                <li>Overlapping slots are prevented</li>
                <li>Patients can view and book slots</li>
              </ul>
            </div>
          </div>
        )}

        {user.role === 'DOCTOR' && (
          <div className="card" style={{ marginTop: '2rem' }}>
            <h3>Today's Appointments</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: getTodayStatus()?.color || '#gray',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                textAlign: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: getTodayStatus()?.color || '#gray' }}>
                {getTodayStatus()?.text || 'Loading...'}
              </p>
            </div>
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>●</div>
                  <div style={{ fontSize: '0.9rem' }}>Available</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>●</div>
                  <div style={{ fontSize: '0.9rem' }}>Partial</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>●</div>
                  <div style={{ fontSize: '0.9rem' }}>Full</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 style={{ marginTop: '2rem' }}>
            {user.role === 'DOCTOR' ? 'Patient Appointments' : 'Your Appointments'}
          </h2>

          {appointments.length === 0 ? (
            <div className="alert alert-info">
              {user.role === 'DOCTOR'
                ? 'No appointments scheduled yet'
                : 'No appointments booked yet. Browse hospitals to book one!'}
            </div>
          ) : (
            <div className="grid">
              {appointments.map(a => (
                <div key={a.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h4>{user.role === 'DOCTOR' ? `Patient: ${a.patient?.email}` : 'Doctor'}</h4>
                      <p className="badge badge-primary" style={{ display: 'inline-block' }}>
                        {a.status}
                      </p>
                    </div>
                  </div>

                  <div className="card-body">
                    <p><strong>Date:</strong> {new Date(a.timeSlot?.start).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {new Date(a.timeSlot?.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(a.timeSlot?.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p><strong>Reason:</strong> {a.reason}</p>
                  </div>

                  {user.role === 'DOCTOR' && a.status === 'PENDING' && (
                    <div className="card-footer">
                      <button
                        onClick={() => updateStatus(a.id, 'CONFIRMED')}
                        className="btn btn-success btn-small"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateStatus(a.id, 'REJECTED')}
                        className="btn btn-danger btn-small"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {user.role === 'PATIENT' && a.status === 'PENDING' && (
                    <div className="card-footer">
                      <button
                        onClick={() => updateStatus(a.id, 'CANCELLED')}
                        className="btn btn-danger btn-small"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
