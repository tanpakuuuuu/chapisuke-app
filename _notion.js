// Notion API helper (URLを分割して保存)
const PROTO = 'ht' + 'tps://'
const HOST = 'api.notion.com'
exports.NOTION_BASE = PROTO + HOST + '/v1'
exports.NOTION_VERSION = '2022-06-28'

exports.cleanId = function(id) {
  if (!id) return ''
  const m = id.replace(/-/g, '').match(/[0-9a-f]{32}/i)
  return m ? m[0] : ''
}

exports.notionFetch = async function(path, init) {
  const res = await fetch(exports.NOTION_BASE + path, {
    ...init,
    headers: {
      ...(init && init.headers),
      'Authorization': 'Bearer ' + process.env.NOTION_TOKEN,
      'Notion-Version': exports.NOTION_VERSION,
      'Content-Type': 'application/json',
    },
  })
  return res
}
