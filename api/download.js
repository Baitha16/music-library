const supabase = require('../lib/supabase')
const { verifyToken, getLicenseToken } = require('../lib/auth')

function checkLicense(req) {
  const token = getLicenseToken(req)
  if (!token) return null
  return verifyToken(token)
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const name = req.query.name
  if (!name) {
    return res.status(400).json({ error: 'Missing name parameter' })
  }

  const license = checkLicense(req)
  const isAdmin = (license && license.role === 'admin')
  const isStream = req.query.stream === '1'

  if (isAdmin) {
    // admin always allowed
  } else if (isStream) {
    // streaming allowed for any visitor (browser playback preview)
  } else {
    if (!license || !license.canDownload) {
      return res.status(403).json({ error: 'Download requires a Weekly, Monthly, Yearly, or Lifetime license' })
    }
  }

  try {
    const { data, error } = await supabase.storage.from('music-library').createSignedUrl(name, 300)

    if (error) throw error

    if (isStream) {
      return res.writeHead(302, { Location: data.signedUrl }).end()
    }

    return res.writeHead(302, { Location: data.signedUrl }).end()
  } catch (err) {
    console.error('Download error:', err)
    return res.status(404).json({ error: 'File not found' })
  }
}
