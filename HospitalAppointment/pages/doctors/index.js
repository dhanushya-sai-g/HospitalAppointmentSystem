import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'

export default function Doctors() {
  const router = useRouter()
  const { departmentId } = router.query
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/doctors')
      .then(r => r.json())
      .then(j => {
        setDoctors(j.doctors || [])
        setLoading(false)
      })
  }, [])

  const filtered = departmentId
    ? doctors.filter(d => d.departmentId === departmentId)
    : doctors

  if (loading) {
    return (
      <Layout>
        <div className="container">
          <h1>Doctors</h1>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner"></div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container">
        <h1>Find a Doctor</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} available
        </p>

        <div className="grid">
          {filtered.map(d => (
            <div key={d.id} className="card">
              <div className="card-header">Dr. {d.user?.name || 'Doctor'}</div>
              <div className="card-body">
                <p><strong>Email:</strong> {d.user?.email}</p>
                <p><strong>Bio:</strong> {d.bio || 'No bio available'}</p>
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#999' }}>
                  Click to view availability and book an appointment
                </p>
              </div>
              <div className="card-footer">
                <Link href={`/doctor/${d.id}`} className="btn btn-primary">
                  View & Book
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="alert alert-info">
            No doctors found in this department.
          </div>
        )}
      </div>
    </Layout>
  )
}
