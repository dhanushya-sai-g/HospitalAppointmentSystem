import Link from 'next/link'
import Layout from '../components/Layout'

export default function Home() {
  return (
    <Layout>
      <div className="container">
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Hospital Appointment System</h1>
          <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '2rem' }}>
            Schedule your appointments with doctors at your preferred hospitals
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Sign Up
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Log In
            </Link>
          </div>

          <div className="grid">
            <div className="card">
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>For Patients</div>
              <p>
                Browse hospitals and departments, view available doctors,
                and book appointments at your convenience.
              </p>
              <Link href="/hospitals" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Browse Hospitals
              </Link>
            </div>

            <div className="card">
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>For Doctors</div>
              <p>
                Manage your profile, create and manage time slots,
                and view patient appointments.
              </p>
              <Link href="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Doctor Login
              </Link>
            </div>

            <div className="card">
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>Features</div>
              <ul style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>
                <li>Easy appointment booking</li>
                <li>Real-time availability</li>
                <li>Secure authentication</li>
                <li>Appointment history</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
