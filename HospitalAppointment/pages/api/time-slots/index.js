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

function isoToDate(s) {
  // s = "2025-12-23T16:40" (IST input)
  const [datePart, timePart] = s.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)

  // Create date in UTC but with IST values (store as-is)
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute))

  return isNaN(date.getTime()) ? null : date
}

function dateToISO(date) {
  // Convert date back to "YYYY-MM-DDTHH:mm" format (IST)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hour = String(date.getUTCHours()).padStart(2, '0')
  const minute = String(date.getUTCMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hour}:${minute}`
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

    // Convert dates back to IST string format
    const slotsFormatted = slots.map(slot => ({
      ...slot,
      start: dateToISO(slot.start),
      end: dateToISO(slot.end)
    }))

    return res.json({ slots: slotsFormatted })
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
    
    res.json({ 
      slot: {
        ...slot,
        start: dateToISO(slot.start),
        end: dateToISO(slot.end)
      }
    })
  } else {
    res.status(405).end()
  }
}
