/**
 * 搜索命中片段：Articles 页早就在全文搜 article.content（正文内联在包里，零成本），
 * 却始终只显示固定的 excerpt——搜到了却看不见搜到哪儿。这里负责把「命中的那一句」抠出来。
 *
 * 注意匹配的是 Markdown 源码，所以必须先把不该被搜到的部分剥掉：
 * 围栏代码块里的注释、图片的 base64/URL、链接的 URL——命中落在这些地方，
 * 用户点进去会发现「这句根本没这个词」。
 */

/** 剥掉围栏代码块、行内代码、图片、链接 URL（保留链接文字）、标题井号与强调符号 */
export const plainText = (md: string): string =>
  md
    .replace(/```[\s\S]*?```/g, ' ') // 围栏代码块
    .replace(/`[^`\n]*`/g, ' ') // 行内代码
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 图片（连 alt 一起去掉）
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接：只留文字
    .replace(/^#{1,6}\s+/gm, '') // 标题井号
    .replace(/[*_~>]/g, '') // 强调/ 引用符号
    .replace(/\s+/g, ' ')
    .trim()

export type Snippet = {
  before: string
  match: string
  after: string
}

/** 命中统计 + 第一处的上下文片段。query 已 trim 且非空时才调用。 */
export const findSnippet = (
  md: string,
  query: string,
  radius = 40,
): { count: number; snippet: Snippet | null } => {
  const text = plainText(md)
  const haystack = text.toLowerCase()
  const needle = query.toLowerCase()
  if (!needle) return { count: 0, snippet: null }

  let count = 0
  let from = 0
  let first = -1
  for (;;) {
    const at = haystack.indexOf(needle, from)
    if (at === -1) break
    if (first === -1) first = at
    count += 1
    from = at + needle.length
  }
  if (first === -1) return { count: 0, snippet: null }

  const start = Math.max(0, first - radius)
  const end = Math.min(text.length, first + needle.length + radius)
  return {
    count,
    snippet: {
      before: (start > 0 ? '…' : '') + text.slice(start, first),
      match: text.slice(first, first + needle.length),
      after: text.slice(first + needle.length, end) + (end < text.length ? '…' : ''),
    },
  }
}
