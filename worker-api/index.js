// Cloudflare Worker：博客小接口（目前只有文章「喜欢」计数，后续阅读量等可以加路由）。
// KV 存储：key 为 likes:<slug>，值为纯数字字符串。
//
//   GET  /likes/<slug>  → { "count": 12 }
//   POST /likes/<slug>  → 计数 +1，返回 { "count": 13 }
//
// 说明：KV 是最终一致存储，并发点赞可能偶尔丢一次计数——个人博客的心意计数，
// 不值得为此上 Durable Objects。防刷靠前端 localStorage 记录已赞（够用了）。

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store', // 计数要看起来是活的
      ...cors,
    },
  })

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors })

    const url = new URL(request.url)
    const m = /^\/likes\/([\w-]{1,64})$/.exec(url.pathname)
    if (!m) return json({ error: 'not found' }, 404)
    const key = `likes:${m[1]}`

    if (request.method === 'GET') {
      const count = Number(await env.KV.get(key)) || 0
      return json({ count })
    }

    if (request.method === 'POST') {
      const count = (Number(await env.KV.get(key)) || 0) + 1
      await env.KV.put(key, String(count))
      return json({ count })
    }

    return json({ error: 'method not allowed' }, 405)
  },
}
