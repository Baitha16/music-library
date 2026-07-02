const { verifyToken, getCookieToken } = require('../../lib/auth')
const { getConfig, saveConfig } = require('../../lib/config')

module.exports = async (req, res) => {
  const token = getCookieToken(req)
  const payload = token ? verifyToken(token) : null
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const config = await getConfig()
      return res.status(200).json(config)
    } catch (err) {
      return res.status(500).json({ error: 'Failed to load config' })
    }
  }

  if (req.method === 'POST') {
    try {
      const newConfig = req.body
      if (!newConfig.categories || !Array.isArray(newConfig.categories)) {
        return res.status(400).json({ error: 'Invalid config: categories must be an array' })
      }
      if (!newConfig.tutorial || !newConfig.tutorial.title || !newConfig.tutorial.content) {
        return res.status(400).json({ error: 'Invalid config: tutorial needs title and content' })
      }
      await saveConfig(newConfig)
      return res.status(200).json({ success: true })
    } catch (err) {
      console.error('Save config error:', err)
      return res.status(500).json({ error: 'Failed to save config' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
