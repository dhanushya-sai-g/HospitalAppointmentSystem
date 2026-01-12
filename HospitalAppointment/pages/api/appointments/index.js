const prisma = require('../../../lib/prisma')
const { getUserFromHeader } = require('../../../lib/auth')

export default async function handler(req, res) {
  const user = await getUserFromHeader(req)
  if (!user) return res.status(401).json({ error: 'unauthenticated' })

  if (req.method === 'GET') {
    if (user.role === 'PATIENT') {
      const appts = await prisma.appointment.findMany({ where: { patientId: user.id }, include: { timeSlot: true } })
      return res.json({ appointments: appts })
    }
    if (user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } })
      const appts = await prisma.appointment.findMany({ where: { doctorId: doctor.id }, include: { timeSlot: true, patient: true } })
      return res.json({ appointments: appts })
    }
    if (user.role === 'HOSPITAL_ADMIN') {
      // Hospital admin can see all appointments for their hospital's doctors
      const doctor = await prisma.doctor.findFirst({ where: { hospitalId: user.hospitalId } })
      if (!doctor) return res.json({ appointments: [] })
      const appts = await prisma.appointment.findMany({ 
        where: { 
          doctor: { hospitalId: user.hospitalId }
        }, 
        include: { timeSlot: true, patient: true, doctor: true } 
      })
      return res.json({ appointments: appts })
    }
    return res.status(403).json({ error: 'forbidden' })
  }

  if (req.method === 'POST') {
    if (user.role !== 'PATIENT') return res.status(403).json({ error: 'patients only' })
    const { timeSlotId, reason } = req.body
    if (!timeSlotId || !reason) return res.status(400).json({ error: 'timeSlotId and reason required' })

    try {
      const result = await prisma.$transaction(async (tx) => {
        const slot = await tx.timeSlot.findUnique({ where: { id: timeSlotId } })
        if (!slot) throw new Error('slot not found')
        const existing = await tx.appointment.findUnique({ where: { timeSlotId } })
        if (existing) throw new Error('slot already booked')
        const doctor = await tx.doctor.findUnique({ where: { id: slot.doctorId } })
        const appt = await tx.appointment.create({ data: {
          patientId: user.id,
          doctorId: doctor.id,
          timeSlotId,
          reason
        } })
        await tx.auditLog.create({ data: { userId: user.id, action: 'BOOK_APPOINTMENT', payload: { appointmentId: appt.id } } })
        await tx.notification.create({ data: { userId: doctor.userId, message: `New appointment requested by ${user.email}` } })
        return appt
      })
      return res.json({ appointment: result })
    } catch (e) {
      return res.status(400).json({ error: e.message })
    }
  }

  if (req.method === 'PATCH') {
    // update status (doctor action)
    const { appointmentId, status } = req.body
    if (user.role !== 'DOCTOR') return res.status(403).json({ error: 'doctors only' })
    const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } })
    const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } })
    if (!appt) return res.status(404).json({ error: 'not found' })
    if (appt.doctorId !== doctor.id) return res.status(403).json({ error: 'forbidden' })
    const updated = await prisma.appointment.update({ where: { id: appointmentId }, data: { status } })
    await prisma.notification.create({ data: { userId: appt.patientId, message: `Appointment ${status}` } })
    await prisma.auditLog.create({ data: { userId: user.id, action: 'UPDATE_APPOINTMENT', payload: { appointmentId, status } } })
    return res.json({ appointment: updated })
  }

  res.status(405).end()
}
