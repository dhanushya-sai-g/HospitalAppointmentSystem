const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

beforeAll(async () => {
  // ensure clean DB for test run when using sqlite file
})

afterAll(async () => {
  await prisma.$disconnect()
})

test('atomic booking prevents double-booking', async () => {
  // Create hospital, dept, doctor, patient, slot
  const hosp = await prisma.hospital.create({ data: { name: 'T H', address: 'Addr' } })
  const dept = await prisma.department.create({ data: { name: 'Dep', hospitalId: hosp.id } })
  const pass = await bcrypt.hash('pw', 1)
  const patient = await prisma.user.create({ data: { email: `p${Date.now()}@test`, password: pass, role: 'PATIENT' } })
  const duser = await prisma.user.create({ data: { email: `d${Date.now()}@test`, password: pass, role: 'DOCTOR' } })
  const doctor = await prisma.doctor.create({ data: { userId: duser.id, hospitalId: hosp.id, departmentId: dept.id } })

  const start = new Date(Date.now() + 1000 * 60 * 60)
  const end = new Date(start.getTime() + 1000 * 60 * 30)
  const slot = await prisma.timeSlot.create({ data: { doctorId: doctor.id, start, end } })

  // attempt two concurrent bookings
  const booking = async (patientId) => {
    try {
      return await prisma.$transaction(async (tx) => {
        const existing = await tx.appointment.findUnique({ where: { timeSlotId: slot.id } })
        if (existing) throw new Error('already booked')
        const appt = await tx.appointment.create({ data: { patientId, doctorId: doctor.id, timeSlotId: slot.id, reason: 'test' } })
        return appt
      })
    } catch (e) {
      return { error: e.message }
    }
  }

  const p2 = await prisma.user.create({ data: { email: `p2${Date.now()}@test`, password: pass, role: 'PATIENT' } })
  const results = await Promise.all([booking(patient.id), booking(p2.id)])
  const successCount = results.filter(r=>r && !r.error).length
  expect(successCount).toBe(1)
})
