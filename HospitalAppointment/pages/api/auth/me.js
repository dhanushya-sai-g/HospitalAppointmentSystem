const { getUserFromHeader } = require('../../../lib/auth')

export default async function handler(req, res) {
  const user = await getUserFromHeader(req)
  if (!user) return res.status(401).json({ error: 'unauthenticated' })

  if (req.method === 'PUT') {
    const { name, email, password, bio } = req.body
    const prisma = require('../../../lib/prisma')
    const { hashPassword } = require('../../../lib/auth')

    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (password) updateData.password = await hashPassword(password)

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    })

    if (bio !== undefined && user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } })
      if (doctor) {
        await prisma.doctor.update({
          where: { id: doctor.id },
          data: { bio }
        })
      }
    }

    // return only the fields the client needs (include hospitalId so dashboards can look up the hospital)
    const out = {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.name,
      hospitalId: updatedUser.hospitalId || null,
      createdAt: updatedUser.createdAt
    }

    return res.json({ user: out })
  }

  // return only the fields the client needs (include hospitalId so dashboards can look up the hospital)
  const out = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    hospitalId: user.hospitalId || null,
    createdAt: user.createdAt
  }

  return res.json({ user: out })
}
