const prisma = require('../../../lib/prisma')

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const hospitals = await prisma.hospital.findMany({ include: { departments: true } })
  res.json({ hospitals })
}
