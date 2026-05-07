const { getUserFromHeader } = require('../../../lib/auth')

export default async function handler(req, res) {
  const user = await getUserFromHeader(req)
  if (!user) return res.status(401).json({ error: 'unauthenticated' })

  const prisma = require('../../../lib/prisma')
  const { hashPassword } = require('../../../lib/auth')

  if (req.method === 'PUT') {
    const { name, email, password, bio, avatarUrl } = req.body

    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl
    if (password) updateData.password = await hashPassword(password)

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    })

    let doctorBio = null
    if (bio !== undefined && user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } })
      if (doctor) {
        await prisma.doctor.update({
          where: { id: doctor.id },
          data: { bio }
        })
        doctorBio = bio
      }
    } else if (user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } })
      doctorBio = doctor?.bio || null
    }

    // return only the fields the client needs (include hospitalId so dashboards can look up the hospital)
    const out = {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.name,
      avatarUrl: updatedUser.avatarUrl || null,
      bio: doctorBio,
      hospitalId: updatedUser.hospitalId || null,
      createdAt: updatedUser.createdAt
    }

    return res.json({ user: out })
  }

  if (req.method === 'DELETE') {
    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { userId: user.id } }),
      prisma.auditLog.deleteMany({ where: { userId: user.id } }),
      prisma.appointment.deleteMany({ where: { patientId: user.id } })
    ])

    if (user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } })
      if (doctor) {
        await prisma.$transaction([
          prisma.appointment.deleteMany({ where: { doctorId: doctor.id } }),
          prisma.timeSlot.deleteMany({ where: { doctorId: doctor.id } }),
          prisma.doctorApplication.deleteMany({ where: { doctorId: doctor.id } }),
          prisma.doctor.delete({ where: { id: doctor.id } })
        ])
      }
    }

    await prisma.user.delete({ where: { id: user.id } })
    return res.json({ success: true })
  }

  let doctorBio = null
  if (user.role === 'DOCTOR') {
    const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } })
    doctorBio = doctor?.bio || null
  }

  // return only the fields the client needs (include hospitalId so dashboards can look up the hospital)
  const out = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    avatarUrl: user.avatarUrl || null,
    bio: doctorBio,
    hospitalId: user.hospitalId || null,
    createdAt: user.createdAt
  }

  return res.json({ user: out })
}
