// GET /api/list?kind=tasks|later|buy|payments
const { notionFetch, cleanId } = require('./_notion.js')

async function queryDb(dbId, body) {
  const res = await notionFetch('/databases/' + cleanId(dbId) + '/query', {
    method: 'POST',
    body: JSON.stringify(body || {}),
  })
  if (!res.ok) throw new Error('Notion ' + res.status + ': ' + (await res.text()))
  return res.json()
}

function getTitle(p) {
  const props = p.properties || {}
  for (const v of Object.values(props)) {
    if (v.type === 'title') return (v.title || []).map(t => t.plain_text).join('')
  }
  return ''
}
const getSelect = (p, n) => p.properties?.[n]?.select?.name || ''
const getMulti  = (p, n) => (p.properties?.[n]?.multi_select || []).map(o => o.name)
const getDate   = (p, n) => p.properties?.[n]?.date?.start || ''
const getNumber = (p, n) => p.properties?.[n]?.number ?? null
const getCheck  = (p, n) => !!p.properties?.[n]?.checkbox

module.exports = async (req, res) => {
  try {
    const kind = (req.query && req.query.kind) || new URL(req.url, 'http://x').searchParams.get('kind')

    if (kind === 'tasks') {
      // 完了も未完了も全部引っ張る（tag=todayのもの）
      const all = await queryDb(process.env.INBOX_DB, {
        filter: { property: 'タグ', select: { equals: 'today' } },
        sorts: [{ property: 'time', direction: 'ascending' }],
        page_size: 200,
      })
      const mapped = all.results.map(p => ({
        id: p.id,
        title: getTitle(p),
        time: getSelect(p, 'time'),
        who:  getSelect(p, 'だれ'),
        due:  getDate(p, '期限'),
        done: getCheck(p, 'チェックボックス 2'),
        toggleProperty: 'チェックボックス 2',
      }))
      const items = mapped.filter(t => !t.done)
      const doneItems = mapped.filter(t => t.done)
      return res.status(200).json({ items, doneItems, doneCount: doneItems.length, all: mapped })
    }

    if (kind === 'later') {
      const data = await queryDb(process.env.INBOX_DB, {
        filter: { and: [
          { property: 'タグ', select: { equals: 'inbox' } },
          { property: 'チェックボックス', checkbox: { equals: false } },
        ]},
        page_size: 50,
      })
      return res.status(200).json({ items: data.results.map(p => ({
        id: p.id, title: getTitle(p), who: getSelect(p, 'だれ'),
        toggleProperty: 'チェックボックス',
      })) })
    }

    if (kind === 'buy') {
      const data = await queryDb(process.env.BUY_DB, {
        filter: { and: [
          { property: '列2', checkbox: { equals: false } },
          { property: '必要日', date: { next_week: {} } },
        ]},
        sorts: [{ property: '必要日', direction: 'ascending' }],
        page_size: 100,
      })
      return res.status(200).json({ items: data.results.map(p => ({
        id: p.id, title: getTitle(p), due: getDate(p, '必要日'),
        tags: getMulti(p, 'タグ'), toggleProperty: '列2',
      })) })
    }

    if (kind === 'payments') {
      const data = await queryDb(process.env.PAYMENTS_DB, {
        filter: { and: [
          { property: '...', checkbox: { equals: false } },
          { property: '期限', date: { is_not_empty: true } },
        ]},
        sorts: [{ property: '期限', direction: 'ascending' }],
        page_size: 50,
      })
      return res.status(200).json({ items: data.results.map(p => ({
        id: p.id, title: getTitle(p), due: getDate(p, '期限'),
        amount: getNumber(p, '金額'), toggleProperty: '...',
      })) })
    }

    res.status(400).json({ error: 'unknown kind' })
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) })
  }
}
