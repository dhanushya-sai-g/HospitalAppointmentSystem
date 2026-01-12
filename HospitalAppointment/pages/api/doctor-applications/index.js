const prisma = require('../../../lib/prisma')
const { verifyToken } = require('../../../lib/auth')

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'Invalid token' })
  const userId = payload.userId

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { hospital: true } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  if (req.method === 'GET') {
    if (user.role === 'HOSPITAL_ADMIN') {
      const applications = await prisma.doctorApplication.findMany({
        where: { hospitalId: user.hospitalId },
        include: {
          doctor: { include: { user: true } },
          department: true
        },
        orderBy: { createdAt: 'desc' }
      })
      return res.json({ applications })
    } else if (user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId }, include: { applications: { include: { hospital: true, department: true } } } })
      if (!doctor) return res.status(404).json({ error: 'Doctor not found' })
      return res.json({ applications: doctor.applications })
    } else {
      return res.status(403).json({ error: 'Forbidden' })
    }
  }

  if (req.method === 'POST') {
    if (user.role !== 'DOCTOR') return res.status(403).json({ error: 'Only doctors can apply' })
    const { hospitalId, departmentId } = req.body
    if (!hospitalId || !departmentId) return res.status(400).json({ error: 'hospitalId and departmentId required' })

    const doctor = await prisma.doctor.findUnique({ where: { userId } })
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' })

    // Check if already has pending or approved for this hospital
    const existing = await prisma.doctorApplication.findFirst({
      where: { doctorId: doctor.id, hospitalId, status: { in: ['PENDING', 'APPROVED'] } }
    })
    if (existing) return res.status(400).json({ error: 'Already applied or approved for this hospital' })

    const application = await prisma.doctorApplication.create({
      data: { doctorId: doctor.id, hospitalId, departmentId },
      include: { hospital: true, department: true }
    })

    return res.json({ application })
  }

  res.status(405).end()
}