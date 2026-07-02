const { getConfig } = require('../lib/config')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const config = await getConfig()
    return res.status(200).json(config)
  } catch (err) {
    console.error('Config error:', err)
    return res.status(500).json({ error: 'Failed to load config' })
  }
}
