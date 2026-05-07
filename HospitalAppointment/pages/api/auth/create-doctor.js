const prisma = require('../../../lib/prisma')
const { hashPassword, getUserFromHeader } = require('../../../lib/auth')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const user = await getUserFromHeader(req)
  if (!user || user.role !== 'HOSPITAL_ADMIN') {
    return res.status(403).json({ error: 'Hospital admin access required' })
  }

  const { name, email, password, departmentId, bio } = req.body
  if (!name || !email || !password || !departmentId) {
    return res.status(400).json({ error: 'name, email, password and departmentId are required' })
  }

  if (!user.hospitalId) {
    return res.status(400).json({ error: 'Hospital admin does not have an associated hospital' })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(400).json({ error: 'email already in use' })
  }

  const department = await prisma.department.findUnique({ where: { id: departmentId } })
  if (!department || department.hospitalId !== user.hospitalId) {
    return res.status(400).json({ error: 'invalid department for this hospital' })
  }

  const hashedPassword = await hashPassword(password)
  const doctorUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'DOCTOR'
    }
  })

  const doctor = await prisma.doctor.create({
    data: {
      userId: doctorUser.id,
      hospitalId: user.hospitalId,
      departmentId,
      bio: bio || ''
    },
    include: {
      user: true,
      department: true,
      hospital: true
    }
  })

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'CREATE_DOCTOR',
      payload: JSON.stringify({ doctorId: doctor.id, email })
    }
  })

  return res.status(201).json({ doctor })
}
