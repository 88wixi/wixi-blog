// Cloudflare Worker：列出 R2 bucket 里的图片，按「顶层文件夹(=城市 slug)」分组返回 JSON。
// 部署后把它的地址填给前端的 VITE_PHOTOS_API；之后往 R2 上传新图即时生效，
// 不用再改代码、也不用重新部署网站。
//
// 返回示例： { "nanjing": ["IMG_2605.jpeg", ...], "osaka": ["IMG_0852.jpg", ...] }

const IMG = /\.(jpe?g|png|webp|avif|gif)$/i

const cors = {
  'Access-Control-Allow-Origin': '*', // 公开图床清单，允许任意来源；想收紧改成你的站点域名
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors })
    if (request.method !== 'GET')
      return new Response('Method Not Allowed', { status: 405, headers: cors })

    // 可选 ?prefix=nanjing/ 只列某座城；不传则列全部
    const prefix = new URL(request.url).searchParams.get('prefix') ?? ''
    const grouped = {}
    let cursor

    do {
      const list = await env.BUCKET.list({ prefix, cursor, limit: 1000 })
      for (const obj of list.objects) {
        if (!IMG.test(obj.key)) continue
        const slash = obj.key.indexOf('/')
        if (slash <= 0) continue // 只收 <slug>/<file> 结构，跳过根目录散图
        const slug = obj.key.slice(0, slash)
        const file = obj.key.slice(slash + 1)
        if (!file || file.includes('/')) continue // 跳过更深层子目录
        ;(grouped[slug] ||= []).push(file)
      }
      cursor = list.truncated ? list.cursor : null
    } while (cursor)

    for (const slug of Object.keys(grouped)) {
      grouped[slug].sort((a, b) => a.localeCompare(b, 'zh'))
    }

    return new Response(JSON.stringify(grouped), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        // CDN 缓存 60s，新图最多 1 分钟出现；过期后一天内先回旧清单、后台再刷新，
        // 避免恰好撞上过期的访客干等一次列桶
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=86400',
        ...cors,
      },
    })
  },
}
