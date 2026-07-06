export type Memo = {
  /** YYYY-MM-DD */
  date: string
  /** 正文，\n 换行会保留 */
  text: string
  /** 可选配图：R2 相对路径（如 osaka/IMG_0852.jpg、hero/forest-02.jpg）或完整 URL */
  image?: string
}

/**
 * 「碎念」数据直接放 R2 根路径的 memos.json，经 img.wixi88.xyz 直链读取——
 * 不走 Worker、不进代码仓库：编辑本地 JSON 后
 *   npx wrangler r2 object put wixi-blog/memos.json --file=memos.json --remote
 * 即发布（.json 不在 Cloudflare 默认边缘缓存扩展名里，更新即时可见）。
 */
const MEMOS_URL = 'https://img.wixi88.xyz/memos.json'

export const memoImageSrc = (image: string): string =>
  image.startsWith('http') ? image : `https://img.wixi88.xyz/${image}`

const isMemo = (v: unknown): v is Memo => {
  if (typeof v !== 'object' || v === null) return false
  const m = v as Record<string, unknown>
  return (
    typeof m.date === 'string' &&
    typeof m.text === 'string' &&
    (m.image === undefined || typeof m.image === 'string')
  )
}

/** 拉取碎念列表（按日期倒序）；失败返回 null，页面显示空态。 */
export const fetchMemos = async (): Promise<Memo[] | null> => {
  try {
    const res = await fetch(MEMOS_URL, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const data: unknown = await res.json()
    if (!Array.isArray(data)) return null
    return data.filter(isMemo).sort((a, b) => (a.date < b.date ? 1 : -1))
  } catch {
    return null
  }
}
