const { verifyToken, getCookieToken } = require('../lib/auth')
const supabase = require('../lib/supabase')

const REPORT_PATH = 'reports/log.json'

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  // GET — admin only, retrieve reports
  if (req.method === 'GET') {
    const token = getCookieToken(req)
    const payload = token ? verifyToken(token) : null
    if (!payload) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    try {
      const { data, error } = await supabase.storage
        .from('music-library')
        .download(REPORT_PATH)
      if (error) {
        if (error.message?.includes('not found') || error.message?.includes('Object not found')) {
          return res.status(200).json({ reports: [] })
        }
        throw error
      }
      const reports = JSON.parse(await data.text())
      return res.status(200).json({ reports })
    } catch (err) {
      console.error('Get reports error:', err)
      return res.status(500).json({ error: 'Failed to load reports' })
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { filename, reason, comment } = req.body || {}
  if (!filename || !reason) {
    return res.status(400).json({ error: 'Missing filename or reason' })
  }

  try {
    let reports = []
    const { data, error } = await supabase.storage
      .from('music-library')
      .download(REPORT_PATH)

    if (error) {
      if (!error.message?.includes('not found') && !error.message?.includes('Object not found')) {
        console.error('Report read error:', error)
      }
    } else {
      try { reports = JSON.parse(await data.text()) } catch {}
    }

    reports.push({
      filename,
      reason,
      comment: comment || '',
      reportedAt: new Date().toISOString()
    })

    const buffer = Buffer.from(JSON.stringify(reports, null, 2), 'utf-8')
    const { error: uploadError } = await supabase.storage
      .from('music-library')
      .upload(REPORT_PATH, buffer, { upsert: true, contentType: 'application/json' })

    if (uploadError) throw uploadError

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Report error:', err)
    return res.status(500).json({ error: 'Failed to submit report' })
  }
}
