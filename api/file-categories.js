const supabase = require('../lib/supabase')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { data, error } = await supabase
      .from('file_categories')
      .select('filename, category')
    if (error) throw error
    const result = {}
    for (const row of data || []) {
      result[row.filename] = row.category
    }
    return res.status(200).json(result)
  } catch (err) {
    console.error('File categories error:', err)
    return res.status(500).json({ error: 'Failed to load file categories' })
  }
}
