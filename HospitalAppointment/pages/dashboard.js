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
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      Router.push('/login')
      return
    }

    // First get user data to determine role
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(userData => {
        const user = userData.user
        // Redirect hospital admins to hospital dashboard
        if (user.role === 'HOSPITAL_ADMIN') {
          Router.push('/hospital-dashboard')
          return
        }

        // Now fetch appointments and conditionally fetch time slots
        const appointmentsPromise = fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
        const timeSlotsPromise = user.role === 'DOCTOR' 
          ? fetch('/api/time-slots', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()) 
          : Promise.resolve({ slots: [] })

        Promise.all([appointmentsPromise, timeSlotsPromise]).then(([appointmentsData, timeSlotsData]) => {
          setUser(user)
          setAppointments(appointmentsData.appointments || [])
          setTimeSlots(timeSlotsData.slots || [])
          setLoading(false)
        }).catch(() => {
          Router.push('/login')
        })
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
      body: JSON.stringify({ start: new Date(start).toISOString(), end: new Date(end).toISOString() })
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

  function getCalendarDays(date) {
    const month = date.getMonth()
    const year = date.getFullYear()
    const firstOfMonth = new Date(year, month, 1)
    const lastOfMonth = new Date(year, month + 1, 0)
    const startDay = firstOfMonth.getDay()
    const daysInMonth = lastOfMonth.getDate()

    const cells = []
    // fill previous month empty cells
    for (let i = 0; i < startDay; i += 1) {
      cells.push(null)
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day))
    }

    while (cells.length % 7 !== 0) {
      cells.push(null)
    }

    const weeks = []
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7))
    }
    return weeks
  }

  function getAppointmentCountForDate(date) {
    if (!date) return 0
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    return appointments.filter(apt => {
      const aptDate = new Date(apt.timeSlot?.start)
      return aptDate >= dayStart && aptDate <= dayEnd
    }).length
  }

  function getAppointmentsForDate(date) {
    if (!date) return []
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    return appointments.filter(apt => {
      const aptDate = new Date(apt.timeSlot?.start)
      return aptDate >= dayStart && aptDate <= dayEnd
    })
  }

  function getSlotsForDate(date) {
    if (!date) return []
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    return timeSlots
      .filter(slot => {
        const slotDate = new Date(slot.start)
        return slotDate >= dayStart && slotDate <= dayEnd
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start))
  }

  function getAppointmentForSlot(slot) {
    return appointments.find(apt => apt.timeSlot?.id === slot.id)
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
        <div className="page-header">
          <div>
            <h1>Your Dashboard</h1>
            <p className="section-subtitle">Manage appointments, availability, and your schedule through a clean calendar view.</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h4>Appointments</h4>
            <p>{appointments.length}</p>
          </div>
          <div className="stat-card">
            <h4>Selected Day</h4>
            <p>{getAppointmentCountForDate(selectedDay)}</p>
          </div>
          <div className="stat-card">
            <h4>Available Slots</h4>
            <p>{timeSlots.length}</p>
          </div>
        </div>

        <div className="alert alert-info">
          Signed in as <strong>{user.name || user.email}</strong> ({user.role})
        </div>

        {msg && (
          <div className={`alert ${msg.includes('✓') ? 'alert-success' : 'alert-danger'}`}>
            {msg}
          </div>
        )}

        {user.role === 'DOCTOR' && (
          <div className="grid">
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
          </div>
        )}

        {user.role === 'DOCTOR' && (
          <div className="card" style={{ marginTop: '2rem' }}>
            <h3>Monthly Appointment Calendar</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: '#666' }}>
                <span>● <strong>{appointments.length}</strong> booked</span>
                <span>● <strong>{timeSlots.length}</strong> slots</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem', marginBottom: '1rem' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(weekday => (
                <div key={weekday} style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: '#555' }}>{weekday}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem' }}>
              {getCalendarDays(new Date()).flat().map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} style={{ minHeight: '90px', background: '#f8f9fa', borderRadius: '8px' }} />
                }
                const count = getAppointmentCountForDate(day)
                const isSelected = selectedDay && day.getTime() === selectedDay.getTime()
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    style={{
                      minHeight: '90px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #007bff' : '1px solid #e0e0e0',
                      background: isSelected ? '#e7f1ff' : '#fff',
                      padding: '0.75rem',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      <span>{day.getDate()}</span>
                      {count > 0 && <span style={{ fontSize: '0.75rem', color: '#007bff' }}>{count}</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                      {count === 0 && 'No appts'}
                      {count === 1 && '1 appointment'}
                      {count > 1 && `${count} appointments`}
                    </div>
                  </button>
                )
              })}
            </div>
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>
                {selectedDay ? selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date to view appointments'}
              </h4>
              {selectedDay ? (
                <div>
                  {getSlotsForDate(selectedDay).length === 0 ? (
                    <p style={{ color: '#666' }}>No slots available for this day.</p>
                  ) : (
                    getSlotsForDate(selectedDay).map(slot => {
                      const appointment = getAppointmentForSlot(slot)
                      return (
                        <div
                          key={slot.id}
                          style={{
                            marginBottom: '1rem',
                            padding: '0.75rem',
                            background: appointment ? '#fdecea' : '#eafaf1',
                            borderRadius: '6px',
                            border: `1px solid ${appointment ? '#dc3545' : '#28a745'}`
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <p style={{ margin: 0, fontWeight: 'bold' }}>
                                {new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p style={{ margin: '0.25rem 0', color: '#555' }}>
                                {appointment ? 'Booked slot' : 'Available slot'}
                              </p>
                            </div>
                            <span className={`badge ${appointment ? 'badge-danger' : 'badge-success'}`}>
                              {appointment ? 'Booked' : 'Available'}
                            </span>
                          </div>
                          {appointment && (
                            <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#333' }}>
                              <p style={{ margin: '0.25rem 0 0' }}><strong>Patient:</strong> {appointment.patient?.name || appointment.patient?.email}</p>
                              <p style={{ margin: '0.25rem 0 0' }}><strong>Reason:</strong> {appointment.reason}</p>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              ) : null}
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
