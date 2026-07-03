const { verifyToken, getCookieToken } = require('../../lib/auth')
const supabase = require('../../lib/supabase')

module.exports = async (req, res) => {
  const token = getCookieToken(req)
  const payload = token ? verifyToken(token) : null
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'POST') {
    try {
      const data = req.body
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Invalid data, expected object' })
      }
      const rows = Object.entries(data).map(([filename, category]) => ({
        filename,
        category
      }))
      if (rows.length === 0) {
        return res.status(200).json({ success: true })
      }
      const { error } = await supabase
        .from('file_categories')
        .upsert(rows, { onConflict: 'filename' })
      if (error) throw error
      return res.status(200).json({ success: true })
    } catch (err) {
      console.error('Save file categories error:', err)
      return res.status(500).json({ error: 'Failed to save file categories' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { filenames } = req.body
      if (!filenames || !Array.isArray(filenames)) {
        return res.status(400).json({ error: 'filenames must be an array' })
      }
      const { error } = await supabase
        .from('file_categories')
        .delete()
        .in('filename', filenames)
      if (error) throw error
      return res.status(200).json({ success: true })
    } catch (err) {
      console.error('Delete file categories error:', err)
      return res.status(500).json({ error: 'Failed to delete file categories' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
