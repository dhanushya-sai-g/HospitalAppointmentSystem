const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const prisma = require('./prisma')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (e) {
    return null
  }
}

async function getUserFromHeader(req) {
  const header = req.headers.authorization || ''
  const [type, token] = header.split(' ')
  if (type !== 'Bearer' || !token) return null
  const payload = verifyToken(token)
  if (!payload || !payload.userId) return null
  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  return user
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken, getUserFromHeader }
