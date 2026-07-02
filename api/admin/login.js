const { createToken } = require('../../lib/auth')

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { password } = req.body || {}

  if (password === process.env.ADMIN_PASSWORD) {
    const token = createToken()
    res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax; Secure`)
    return res.status(200).json({ success: true })
  }

  return res.status(401).json({ error: 'Wrong password' })
}
