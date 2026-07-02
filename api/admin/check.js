const { verifyToken, getCookieToken } = require('../../lib/auth')

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = getCookieToken(req)
  const payload = token ? verifyToken(token) : null

  return res.status(200).json({ isAdmin: !!payload })
}
