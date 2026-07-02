const supabase = require('../lib/supabase')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const name = req.query.name
  if (!name) {
    return res.status(400).json({ error: 'Missing name parameter' })
  }

  try {
    const { data, error } = await supabase.storage.from('music-library').createSignedUrl(name, 300)

    if (error) throw error

    return res.writeHead(302, { Location: data.signedUrl }).end()
  } catch (err) {
    console.error('Download error:', err)
    return res.status(404).json({ error: 'File not found' })
  }
}
