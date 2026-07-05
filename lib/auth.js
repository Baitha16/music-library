const crypto = require('crypto')

const SECRET = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'fallback-dev-only'

function createToken() {
  const payload = {
    role: 'admin',
    exp: Date.now() + 24 * 60 * 60 * 1000
  }
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

function verifyToken(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return null
    const [data, sig] = parts
    const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
    if (sig !== expected) return null
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString())
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

function getCookieToken(req) {
  const cookie = req.headers.cookie || ''
  const match = cookie.match(/auth_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

module.exports = { createToken, verifyToken, getCookieToken }
