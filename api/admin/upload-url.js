const { verifyToken, getCookieToken } = require('../../lib/auth')
const supabase = require('../../lib/supabase')

function asciiFold(s) {
  const map = {
    'À':'A','Á':'A','Â':'A','Ã':'A','Ä':'A','Å':'A','Æ':'AE','Ç':'C','È':'E','É':'E',
    'Ê':'E','Ë':'E','Ì':'I','Í':'I','Î':'I','Ï':'I','Ð':'D','Ñ':'N','Ò':'O','Ó':'O',
    'Ô':'O','Õ':'O','Ö':'O','Ø':'O','Ù':'U','Ú':'U','Û':'U','Ü':'U','Ý':'Y','Þ':'TH',
    'ß':'ss','à':'a','á':'a','â':'a','ã':'a','ä':'a','å':'a','æ':'ae','ç':'c','è':'e',
    'é':'e','ê':'e','ë':'e','ì':'i','í':'i','î':'i','ï':'i','ð':'d','ñ':'n','ò':'o',
    'ó':'o','ô':'o','õ':'o','ö':'o','ø':'o','ù':'u','ú':'u','û':'u','ü':'u','ý':'y',
    'þ':'th','ÿ':'y'
  };
  return s.replace(/[^\x00-\x7F]/g, c => map[c] || '').replace(/\s+/g, '_');
}

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

  // Sanitize — ASCII-fold then strip dangerous chars, preserve original for display
  const safeName = asciiFold(filename).replace(/[<>:"/\\|?*\x00-\x1f\s]/g, '_')

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
