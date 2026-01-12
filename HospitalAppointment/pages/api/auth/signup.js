const prisma = require('../../../lib/prisma')
const { hashPassword, signToken } = require('../../../lib/auth')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password, name, role, hospitalId, departmentId, bio, hospitalName, hospitalAddress, departments } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(400).json({ error: 'email already in use' })

  const hashed = await hashPassword(password)

  if (role === 'HOSPITAL_ADMIN') {
    // Hospital admin registering a new hospital
    if (!hospitalName) return res.status(400).json({ error: 'hospitalName required for hospital admin' })
    if (!departments || !Array.isArray(departments) || departments.length === 0) {
      return res.status(400).json({ error: 'at least one department required' })
    }

    const hospital = await prisma.hospital.create({
      data: {
        name: hospitalName,
        address: hospitalAddress || '',
        departments: {
          create: departments.map(d => ({ name: d }))
        }
      }
    })

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        role: 'HOSPITAL_ADMIN',
        hospitalId: hospital.id
      }
    })

    await prisma.auditLog.create({
      data: { userId: user.id, action: 'SIGNUP', payload: JSON.stringify({ role, hospitalId: hospital.id }) }
    })

    const token = signToken({ userId: user.id })
    return res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name, hospitalId: hospital.id }
    })
  }

  const user = await prisma.user.create({ data: { email, password: hashed, name, role } })

  if (role === 'DOCTOR') {
    if (!hospitalId || !departmentId) {
      return res.status(400).json({ error: 'doctor must provide hospitalId and departmentId' })
    }
    const doctor = await prisma.doctor.create({ data: { userId: user.id, bio } })
    await prisma.doctorApplication.create({ data: { doctorId: doctor.id, hospitalId, departmentId } })
  }

  await prisma.auditLog.create({ data: { userId: user.id, action: 'SIGNUP', payload: JSON.stringify({ role }) } })
  const token = signToken({ userId: user.id })
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } })
}
