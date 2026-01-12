const prisma = require('../../../lib/prisma')
const { getUserFromHeader } = require('../../../lib/auth')

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: true,
        department: {
          select: {
            id: true,
            name: true
          }
        },
        hospital: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })


    return res.json({ doctors })
  }

  if (req.method === 'PATCH') {
    const user = await getUserFromHeader(req)
    if (!user || user.role !== 'DOCTOR') return res.status(403).json({ error: 'Doctor access required' })

    const { hospitalId, departmentId } = req.body

    const doctor = await prisma.doctor.findUnique({ 
      where: { userId: user.id },
      include: { hospital: true }
    })
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' })

    const updateData = {}
    if (hospitalId !== undefined) updateData.hospitalId = hospitalId
    if (departmentId !== undefined) updateData.departmentId = departmentId

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctor.id },
      data: updateData,
      include: {
        department: true,
        hospital: true
      }
    })

    // If leaving hospital, create a notification
    if (hospitalId === null && doctor.hospitalId) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          message: `You have successfully left ${doctor.hospital?.name || 'your hospital'}.`
        }
      })
    }

    return res.json({ doctor: updatedDoctor })
  }

  res.status(405).end()
}
