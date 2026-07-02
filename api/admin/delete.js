const { verifyToken, getCookieToken } = require('../../lib/auth')
const supabase = require('../../lib/supabase')

module.exports = async (req, res) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = getCookieToken(req)
  const payload = token ? verifyToken(token) : null
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const name = req.query.name
  if (!name) {
    return res.status(400).json({ error: 'Missing name parameter' })
  }

  try {
    const { error } = await supabase.storage.from('music-library').remove([name])

    if (error) throw error

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Delete error:', err)
    return res.status(500).json({ error: 'Failed to delete file' })
  }
}
