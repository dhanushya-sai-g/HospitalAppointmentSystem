const prisma = require('../../../lib/prisma')
const { verifyPassword, signToken } = require('../../../lib/auth')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'invalid credentials' })
  const ok = await verifyPassword(password, user.password)
  if (!ok) return res.status(401).json({ error: 'invalid credentials' })

  await prisma.auditLog.create({ data: { userId: user.id, action: 'LOGIN' } })
  const token = signToken({ userId: user.id })
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } })
}
