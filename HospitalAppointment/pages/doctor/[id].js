import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'

export default function Doctor() {
  const router = useRouter()
  const { id } = router.query
  const [slots, setSlots] = useState([])
  const [doctor, setDoctor] = useState(null)
  const [reason, setReason] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      fetch('/api/time-slots?doctorId=' + id).then(r => r.json()),
      fetch('/api/doctors').then(r => r.json())
    ]).then(([slotsData, doctorsData]) => {
      setSlots(slotsData.slots || [])
      setDoctor(doctorsData.doctors?.find(d => d.id === id))
      setLoading(false)
    })
  }, [id])

  async function book(slotId) {
    if (!reason.trim()) {
      alert('⚠️ Please provide a reason for your appointment')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      alert('⚠️ Please log in to book an appointment')
      return
    }

    setLoading(true)
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ timeSlotId: slotId, reason })
    })
    const j = await res.json()
    setLoading(false)

    if (res.ok) {
      setMsg('✓ Appointment booked successfully!')
      setReason('')
      setSelectedSlot(null)
      setTimeout(() => router.push('/dashboard'), 2000)
    } else {
      setMsg(j.error || 'Failed to book appointment')
    }
  }

  if (loading && !doctor) {
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

  if (!doctor) {
    return (
      <Layout>
        <div className="container">
          <div className="alert alert-danger">Doctor not found</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container">
        <div className="grid-2">
          <div>
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {doctor?.user?.avatarUrl ? (
                    <img
                      src={doctor.user.avatarUrl}
                      alt="Doctor avatar"
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--primary)'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'var(--secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'var(--text-light)',
                        border: '2px solid var(--border)'
                      }}
                    >
                      {doctor?.user?.name?.charAt(0)?.toUpperCase() || 'D'}
                    </div>
                  )}
                  <div>
                    <h3 style={{ margin: 0 }}>Dr. {doctor?.user?.name || 'Doctor'}</h3>
                    <p style={{ margin: '0.25rem 0', color: 'var(--text-light)' }}>
                      {doctor?.department?.name ?? 'Not assigned'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <p><strong>Email:</strong> {doctor?.user?.email}</p>
                <p><strong>Bio:</strong> {doctor?.bio || 'No bio available'}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <h3>Book an Appointment</h3>

              {msg && (
                <div className={`alert ${msg.includes('✓') ? 'alert-success' : 'alert-danger'}`}>
                  {msg}
                </div>
              )}

              <div className="form-group">
                <label>Reason for Visit *</label>
                <textarea
                  placeholder="Describe your symptoms or reason for visiting..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows="4"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <h4 style={{ marginTop: '1.5rem' }}>Available Time Slots</h4>
              {slots.length === 0 ? (
                <div className="alert alert-info">No available slots at this time</div>
              ) : (
                <div style={{ marginTop: '1rem' }}>
                  {slots.map(s => {
                    const isBooked = s.appointments && s.appointments.length > 0

                    return (
                      <div
                        key={s.id}
                        className={`card ${selectedSlot === s.id ? 'card-selected' : ''}`}
                        onClick={() => {
                          if (!isBooked) setSelectedSlot(s.id)
                        }}
                        style={{
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                          border:
                            selectedSlot === s.id
                              ? '2px solid var(--primary)'
                              : isBooked
                              ? '2px solid #dc3545'
                              : '2px solid #28a745',
                          backgroundColor: isBooked ? '#fdecea' : '#eafaf1',
                          marginBottom: '0.5rem',
                          opacity: isBooked ? 0.7 : 1
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p><strong>{new Date(s.start).toLocaleDateString()}</strong></p>
                            <p>
                              {new Date(s.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                              {new Date(s.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          {isBooked ? (
                            <span className="badge badge-danger">Booked</span>
                          ) : selectedSlot === s.id ? (
                            <span className="badge badge-primary">Selected</span>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>

              )}

              {selectedSlot && (
                <button
                  onClick={() => book(selectedSlot)}
                  className="btn btn-success btn-block"
                  style={{ marginTop: '1.5rem' }}
                  disabled={loading || !reason.trim()}
                >
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
