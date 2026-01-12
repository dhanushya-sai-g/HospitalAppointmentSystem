const prisma = require('../../../lib/prisma')
const { getUserFromHeader } = require('../../../lib/auth')

export default async function handler(req, res) {
  const user = await getUserFromHeader(req)
  if (!user) return res.status(401).json({ error: 'unauthenticated' })

  if (req.method === 'GET') {
    const { hospitalId } = req.query
    if (!hospitalId) return res.status(400).json({ error: 'hospitalId required' })
    const departments = await prisma.department.findMany({ where: { hospitalId } })
    return res.json({ departments })
  }

  if (req.method === 'POST') {
    if (user.role !== 'HOSPITAL_ADMIN') return res.status(403).json({ error: 'hospital admins only' })
    if (!user.hospitalId) return res.status(400).json({ error: 'not associated with a hospital' })

    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'name required' })

    const dept = await prisma.department.create({
      data: { name, hospitalId: user.hospitalId }
    })

    await prisma.auditLog.create({
      data: { userId: user.id, action: 'CREATE_DEPARTMENT', payload: JSON.stringify({ departmentId: dept.id, name }) }
    })

    res.json({ department: dept })
  } else {
    res.status(405).end()
  }
}
