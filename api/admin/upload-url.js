const { verifyToken, getCookieToken } = require('../../lib/auth')
const supabase = require('../../lib/supabase')

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = getCookieToken(req)
  const payload = token ? verifyToken(token) : null
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { filename } = req.body || {}
  if (!filename) {
    return res.status(400).json({ error: 'Missing filename' })
  }

  const allowedExt = /\.(zip|mid|midi|txt)$/i
  if (!allowedExt.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename. Must be .zip, .mid, .midi, or .txt' })
  }

  // Sanitize — ASCII-only safe name for storage, preserve original for display
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')

  try {
    const { data, error } = await supabase.storage
      .from('music-library')
      .createSignedUploadUrl(safeName, { upsert: true })

    if (error) throw error

    return res.status(200).json({
      signedUrl: data.signedUrl,
      path: data.path,
      originalName: filename
    })
  } catch (err) {
    console.error('Upload URL error:', err)
    return res.status(500).json({ error: 'Failed to create upload URL' })
  }
}
