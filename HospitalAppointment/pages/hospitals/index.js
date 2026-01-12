import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '../../components/Layout'

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/hospitals')
      .then(r => r.json())
      .then(j => {
        setHospitals(j.hospitals || [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="container">
          <h1>Hospitals</h1>
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
        <h1>Find a Hospital</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Browse hospitals, departments, and doctors</p>

        <div className="grid">
          {hospitals.map(h => (
            <div key={h.id} className="card">
              <div className="card-header">{h.name}</div>
              <div className="card-body">
                <p><strong>📍 Location:</strong> {h.address || 'No address provided'}</p>
                <p><strong>🏢 Departments:</strong> {h.departments.length}</p>
                <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                  {h.departments.map(d => (
                    <li key={d.id} style={{ marginBottom: '0.5rem' }}>
                      <Link href={`/doctors?departmentId=${d.id}&hospitalId=${h.id}`}>
                        {d.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {hospitals.length === 0 && (
          <div className="alert alert-info">
            No hospitals found. Please check back later.
          </div>
        )}
      </div>
    </Layout>
  )
}
