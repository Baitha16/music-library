const supabase = require('../lib/supabase')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { data, error } = await supabase.storage.from('music-library').list('', { limit: 1000 })

    if (error) throw error

    const files = (data || [])
      .filter(f => f.name.endsWith('.zip') || f.name.endsWith('.mid') || f.name.endsWith('.midi') || f.name.endsWith('.txt'))
      .map(f => ({
        name: f.name,
        size: f.metadata?.size || 0,
        uploadedAt: f.updated_at || f.created_at || new Date().toISOString()
      }))
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))

    return res.status(200).json({ files })
  } catch (err) {
    console.error('List files error:', err)
    return res.status(500).json({ error: 'Failed to list files', detail: err.message })
  }
}
