const prisma = require('../../../lib/prisma')
const { verifyToken } = require('../../../lib/auth')

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'Invalid token' })
  const userId = payload.userId

  if (req.method === 'GET') {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    return res.json({ notifications })
  }

  if (req.method === 'PATCH') {
    const { id } = req.body
    if (!id) return res.status(400).json({ error: 'Notification ID required' })
    await prisma.notification.update({
      where: { id },
      data: { read: true }
    })
    return res.json({ success: true })
  }

  res.status(405).end()
}