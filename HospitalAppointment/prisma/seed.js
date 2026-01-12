const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.appointment.deleteMany()
  await prisma.timeSlot.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.department.deleteMany()
  await prisma.hospital.deleteMany()
  await prisma.user.deleteMany()

  // Create hospitals
  const hosp1 = await prisma.hospital.create({
    data: { name: 'City Hospital', address: '123 Main St' }
  })
  const hosp2 = await prisma.hospital.create({
    data: { name: 'County Medical Center', address: '456 Oak Ave' }
  })

  // Create departments
  const deptCardio = await prisma.department.create({
    data: { name: 'Cardiology', hospitalId: hosp1.id }
  })
  const deptDental = await prisma.department.create({
    data: { name: 'Dentistry', hospitalId: hosp1.id }
  })
  const deptNeuro = await prisma.department.create({
    data: { name: 'Neurology', hospitalId: hosp2.id }
  })

  // Create patients
  const pass = await bcrypt.hash('password', 10)
  const patient1 = await prisma.user.create({
    data: { email: 'patient@example.com', password: pass, name: 'John Patient', role: 'PATIENT' }
  })
  const patient2 = await prisma.user.create({
    data: { email: 'jane@example.com', password: pass, name: 'Jane Doe', role: 'PATIENT' }
  })

  // Create doctors
  const doc1User = await prisma.user.create({
    data: { email: 'doc@example.com', password: pass, name: 'Dr. Alice Smith', role: 'DOCTOR' }
  })
  const doc1 = await prisma.doctor.create({
    data: {
      userId: doc1User.id,
      hospitalId: hosp1.id,
      departmentId: deptCardio.id,
      bio: 'Cardiologist with 10 years experience'
    }
  })

  const doc2User = await prisma.user.create({
    data: { email: 'dentist@example.com', password: pass, name: 'Dr. Bob Dental', role: 'DOCTOR' }
  })
  const doc2 = await prisma.doctor.create({
    data: {
      userId: doc2User.id,
      hospitalId: hosp1.id,
      departmentId: deptDental.id,
      bio: 'Experienced dentist'
    }
  })

  // Create time slots for doctors
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const slot1Start = new Date(tomorrow.setHours(10, 0, 0, 0))
  const slot1End = new Date(slot1Start.getTime() + 30 * 60 * 1000)

  await prisma.timeSlot.create({
    data: { doctorId: doc1.id, start: slot1Start, end: slot1End }
  })

  const slot2Start = new Date(tomorrow.setHours(14, 0, 0, 0))
  const slot2End = new Date(slot2Start.getTime() + 30 * 60 * 1000)
  await prisma.timeSlot.create({
    data: { doctorId: doc1.id, start: slot2Start, end: slot2End }
  })

  const slot3Start = new Date(tomorrow.setHours(11, 0, 0, 0))
  const slot3End = new Date(slot3Start.getTime() + 45 * 60 * 1000)
  await prisma.timeSlot.create({
    data: { doctorId: doc2.id, start: slot3Start, end: slot3End }
  })

  console.log('Database seeded successfully!')
  console.log('Test credentials:')
  console.log('  Patient: patient@example.com / password')
  console.log('  Doctor: doc@example.com / password')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
