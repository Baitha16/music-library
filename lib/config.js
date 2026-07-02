const supabase = require('./supabase')

const CONFIG_PATH = 'config/data.json'

const DEFAULT_CONFIG = {
  categories: ['West', 'Indo', 'Phonk', 'Anime & Japan'],
  fileCategories: {},
  tutorial: {
    title: 'Tutorial',
    content: 'Welcome to the Music Library!\n\nDownload the ZIP files you need.'
  }
}

async function getConfig() {
  const { data, error } = await supabase.storage
    .from('music-library')
    .download(CONFIG_PATH)

  if (error) {
    if (error.statusCode === '404' || error.message?.includes('not found') || error.message?.includes('Object not found')) {
      return JSON.parse(JSON.stringify(DEFAULT_CONFIG))
    }
    throw error
  }

  const text = await data.text()
  return JSON.parse(text)
}

async function saveConfig(config) {
  const json = JSON.stringify(config, null, 2)
  const buffer = Buffer.from(json, 'utf-8')

  const { error } = await supabase.storage
    .from('music-library')
    .upload(CONFIG_PATH, buffer, {
      upsert: true,
      contentType: 'application/json'
    })

  if (error) throw error
}

module.exports = { getConfig, saveConfig }
