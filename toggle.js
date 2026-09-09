// POST /api/toggle  body: { pageId, property, checked }
const { notionFetch, cleanId } = require('./_notion.js')

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', c => data += c)
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}) } catch (e) { reject(e) }
    })
    req.on('error', reject)
  })
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  try {
    const { pageId, property, checked } = await readBody(req)
    if (!pageId || !property || typeof checked !== 'boolean') {
      return res.status(400).json({ error: 'need pageId, property, checked' })
    }
    const r = await notionFetch('/pages/' + cleanId(pageId), {
      method: 'PATCH',
      body: JSON.stringify({ properties: { [property]: { checkbox: checked } } }),
    })
    if (!r.ok) return res.status(r.status).json({ error: await r.text() })
    res.status(200).json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) })
  }
}
