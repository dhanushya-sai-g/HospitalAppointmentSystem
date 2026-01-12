const prisma = require('../../../lib/prisma')
const { verifyToken } = require('../../../lib/auth')

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'Invalid token' })
  const userId = payload.userId

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Application ID required' })

  const application = await prisma.doctorApplication.findUnique({
    where: { id },
    include: { doctor: { include: { user: true } }, hospital: true, department: true }
  })
  if (!application) return res.status(404).json({ error: 'Application not found' })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  if (req.method === 'PUT') {
    const { action } = req.body // 'approve', 'reject', 'remove'
    if (user.role !== 'HOSPITAL_ADMIN' || user.hospitalId !== application.hospitalId) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    let newStatus
    if (action === 'approve') newStatus = 'APPROVED'
    else if (action === 'reject') newStatus = 'REJECTED'
    else if (action === 'remove') newStatus = 'REMOVED'
    else return res.status(400).json({ error: 'Invalid action' })

    const updated = await prisma.doctorApplication.update({
      where: { id },
      data: { status: newStatus },
      include: { doctor: { include: { user: true } }, hospital: true, department: true }
    })

    // If approved, set doctor's hospitalId and departmentId
    if (action === 'approve') {
      await prisma.doctor.update({
        where: { id: application.doctorId },
        data: { hospitalId: application.hospitalId, departmentId: application.departmentId }
      })
    } else if (action === 'remove') {
      // Optionally set hospitalId to null
      await prisma.doctor.update({
        where: { id: application.doctorId },
        data: { hospitalId: null, departmentId: null }
      })
    }

    // Create notification
    const message = action === 'approve' ? `Your application to join ${application.hospital.name} has been approved.`
      : action === 'reject' ? `Your application to join ${application.hospital.name} has been rejected.`
      : `You have been removed from ${application.hospital.name}.`
    await prisma.notification.create({
      data: { userId: application.doctor.userId, message }
    })

    return res.json({ application: updated })
  }

  res.status(405).end()
}