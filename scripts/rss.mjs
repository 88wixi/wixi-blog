// 构建后生成 dist/rss.xml（在 package.json 的 build 里跑，接在 vite build 之后）。
// frontmatter 解析是 src/data/articles.ts 里那套的极简子集：这里只需要
// slug / title / date / excerpt 四个标量字段。
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const SITE = 'https://www.wixi88.xyz' // 正式域名；GH Pages 镜像里的 feed 也指向这里
const TITLE = 'wixi 的林间小记'
const DESC = '文字、影像与城市记忆 —— 技术札记、阅读记录，以及对生活系统的观察。'
const SRC = 'content/articles'
const OUT = 'dist/rss.xml'

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const parse = (raw, fallbackSlug) => {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)
  const data = {}
  if (m) {
    for (const line of m[1].split(/\r?\n/)) {
      const kv = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line)
      if (kv) data[kv[1]] = kv[2].trim()
    }
  }
  return {
    slug: data.slug || fallbackSlug,
    title: data.title || fallbackSlug,
    date: data.date || '1970-01-01',
    excerpt: data.excerpt || '',
  }
}

const files = (await readdir(SRC)).filter((f) => f.endsWith('.md'))
const posts = await Promise.all(
  files.map(async (f) => parse(await readFile(join(SRC, f), 'utf8'), f.replace(/\.md$/, ''))),
)
posts.sort((a, b) => (a.date < b.date ? 1 : -1))

const items = posts
  .map((p) => {
    const url = `${SITE}/articles/${encodeURIComponent(p.slug)}`
    return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${p.date}T00:00:00+08:00`).toUTCString()}</pubDate>
      <description>${esc(p.excerpt)}</description>
    </item>`
  })
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(TITLE)}</title>
    <link>${SITE}/</link>
    <description>${esc(DESC)}</description>
    <language>zh-cn</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`

await writeFile(OUT, xml)
console.log(`rss: ${posts.length} 篇文章 → ${OUT}`)
