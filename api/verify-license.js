const { getConfig, saveConfig } = require('../lib/config')
const { createLicenseToken } = require('../lib/auth')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { key } = req.body || {}
  if (!key) {
    return res.status(400).json({ error: 'Missing license key' })
  }

  try {
    const config = await getConfig()
    const licenses = config.licenses || {}
    const entry = Object.entries(licenses).find(([k, v]) => k === key)

    if (!entry) {
      return res.status(200).json({ valid: false, error: 'Invalid license key' })
    }

    const [_, data] = entry

    if (!data.active) {
      return res.status(200).json({ valid: false, error: 'License key is deactivated' })
    }

    if (data.expiresAt && Date.now() > new Date(data.expiresAt).getTime()) {
      return res.status(200).json({ valid: false, error: 'License key has expired' })
    }

    if (!data.activatedAt) {
      data.activatedAt = new Date().toISOString()
      config.licenses[key] = data
      await saveConfig(config)
    }
    const canDownload = ['weekly', 'monthly', 'yearly', 'lifetime'].includes(data.type)

    const token = createLicenseToken({ type: data.type, canDownload })

    res.setHeader('Set-Cookie', `license_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`)

    return res.status(200).json({ valid: true, type: data.type, canDownload })
  } catch (err) {
    console.error('Verify license error:', err)
    return res.status(500).json({ error: 'Failed to verify license' })
  }
}
