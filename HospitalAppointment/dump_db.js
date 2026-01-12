const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    console.log('\n=== USERS ===')
    const users = await prisma.user.findMany()
    console.log(JSON.stringify(users, null, 2))

    console.log('\n=== HOSPITALS ===')
    const hospitals = await prisma.hospital.findMany({ include: { departments: true } })
    console.log(JSON.stringify(hospitals, null, 2))

    console.log('\n=== DEPARTMENTS ===')
    const departments = await prisma.department.findMany()
    console.log(JSON.stringify(departments, null, 2))

    console.log('\n=== DOCTORS ===')
    const doctors = await prisma.doctor.findMany({ include: { user: true } })
    console.log(JSON.stringify(doctors, null, 2))

    console.log('\n=== TIME SLOTS ===')
    const timeSlots = await prisma.timeSlot.findMany()
    console.log(JSON.stringify(timeSlots, null, 2))

    console.log('\n=== APPOINTMENTS ===')
    const appointments = await prisma.appointment.findMany({ include: { patient: true, doctor: true, timeSlot: true } })
    console.log(JSON.stringify(appointments, null, 2))

  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
