/*const prisma = require('../../../lib/prisma')
const { getUserFromHeader } = require('../../../lib/auth')

function isoToDate(s) {
  // s = "2025-12-23T16:40" (local time)
  const [datePart, timePart] = s.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)

  // Create a Date as LOCAL time, then convert to UTC
  const localDate = new Date(year, month - 1, day, hour, minute)

  return isNaN(localDate.getTime()) ? null : localDate
}


export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { doctorId } = req.query
    const where = doctorId ? { where: { doctorId } } : {}
    const slots = await prisma.timeSlot.findMany({
      ...where,
      include: {
        appointments: {
          select: {
            id: true
          }
        }
      }
    })

    return res.json({ slots })
  }

  if (req.method === 'POST') {
    const user = await getUserFromHeader(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    if (user.role !== 'DOCTOR') return res.status(403).json({ error: 'doctors only' })

    const { start, end } = req.body
    const startDate = isoToDate(start)
    const endDate = isoToDate(end)
    if (!startDate || !endDate) return res.status(400).json({ error: 'invalid ISO datetimes' })
    if (startDate >= endDate) return res.status(400).json({ error: 'start must be before end' })

    // get doctor's doctor record
    const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } })
    if (!doctor) return res.status(400).json({ error: 'doctor profile not found' })

    // check overlap
    const overlapping = await prisma.timeSlot.findFirst({
      where: {
        doctorId: doctor.id,
        AND: [
          { start: { lt: endDate } },
          { end: { gt: startDate } }
        ]
      }
    })
    if (overlapping) return res.status(400).json({ error: 'overlapping slot exists' })

    const slot = await prisma.timeSlot.create({ data: { doctorId: doctor.id, start: startDate, end: endDate } })
    await prisma.auditLog.create({ data: { userId: user.id, action: 'CREATE_SLOT', payload: { slotId: slot.id } } })
    res.json({ slot })
  } else {
    res.status(405).end()
  }
}*/

const prisma = require('../../../lib/prisma')
const { getUserFromHeader } = require('../../../lib/auth')

function parseDateTimeString(value) {
  if (!value) return null
  // Accept timezone-aware strings directly
  if (value.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(value)) {
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
  }

  const [datePart, timePart] = value.split('T')
  if (!datePart || !timePart) return null

  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  const date = new Date(year, month - 1, day, hour, minute)
  return isNaN(date.getTime()) ? null : date
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { doctorId } = req.query
    const where = doctorId ? { where: { doctorId } } : {}
    const slots = await prisma.timeSlot.findMany({
      ...where,
      include: {
        appointments: {
          select: {
            id: true
          }
        }
      }
    })

    const slotsFormatted = slots.map(slot => ({
      ...slot,
      start: slot.start.toISOString(),
      end: slot.end.toISOString()
    }))

    return res.json({ slots: slotsFormatted })
  }

  if (req.method === 'POST') {
    const user = await getUserFromHeader(req)
    if (!user) return res.status(401).json({ error: 'unauthenticated' })
    if (user.role !== 'DOCTOR') return res.status(403).json({ error: 'doctors only' })

    const { start, end } = req.body
    const startDate = parseDateTimeString(start)
    const endDate = parseDateTimeString(end)
    if (!startDate || !endDate) return res.status(400).json({ error: 'invalid datetime values' })
    if (startDate >= endDate) return res.status(400).json({ error: 'start must be before end' })

    const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } })
    if (!doctor) return res.status(400).json({ error: 'doctor profile not found' })

    const overlapping = await prisma.timeSlot.findFirst({
      where: {
        doctorId: doctor.id,
        AND: [
          { start: { lt: endDate } },
          { end: { gt: startDate } }
        ]
      }
    })
    if (overlapping) return res.status(400).json({ error: 'overlapping slot exists' })

    const slot = await prisma.timeSlot.create({ data: { doctorId: doctor.id, start: startDate, end: endDate } })
    await prisma.auditLog.create({ data: { userId: user.id, action: 'CREATE_SLOT', payload: { slotId: slot.id } } })

    res.json({ 
      slot: {
        ...slot,
        start: slot.start.toISOString(),
        end: slot.end.toISOString()
      }
    })
  }

  res.status(405).end()
}
