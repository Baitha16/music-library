const crypto = require('crypto')
const { verifyToken, getCookieToken } = require('../../lib/auth')
const { getConfig, saveConfig } = require('../../lib/config')

module.exports = async (req, res) => {
  const token = getCookieToken(req)
  const payload = token ? verifyToken(token) : null
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'POST') {
    const { action } = req.body || {}

    if (action === 'generate') {
      const type = req.body.type
      if (!['trial', 'weekly', 'monthly', 'yearly', 'lifetime'].includes(type)) {
        return res.status(400).json({ error: 'Invalid license type' })
      }

      const key = crypto.randomBytes(12).toString('hex').match(/.{1,4}/g).join('-').toUpperCase()

      const config = await getConfig()
      config.licenses = config.licenses || {}

      const entry = {
        type,
        createdAt: new Date().toISOString(),
        activatedAt: null,
        active: true
      }

      if (type === 'weekly') {
        const d = new Date(); d.setDate(d.getDate() + 7); entry.expiresAt = d.toISOString()
      } else if (type === 'monthly') {
        const d = new Date(); d.setMonth(d.getMonth() + 1); entry.expiresAt = d.toISOString()
      } else if (type === 'yearly') {
        const d = new Date(); d.setFullYear(d.getFullYear() + 1); entry.expiresAt = d.toISOString()
      }

      config.licenses[key] = entry
      await saveConfig(config)

      return res.status(200).json({ key, type })
    }

    if (action === 'toggle') {
      const { key } = req.body
      const config = await getConfig()
      if (!config.licenses || !config.licenses[key]) {
        return res.status(404).json({ error: 'License not found' })
      }
      config.licenses[key].active = !config.licenses[key].active
      await saveConfig(config)
      return res.status(200).json({ key, active: config.licenses[key].active })
    }

    if (action === 'delete') {
      const { key } = req.body
      const config = await getConfig()
      if (config.licenses) delete config.licenses[key]
      await saveConfig(config)
      return res.status(200).json({ success: true })
    }

    return res.status(400).json({ error: 'Unknown action' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
