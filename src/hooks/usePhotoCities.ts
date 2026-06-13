import { useEffect, useState } from 'react'
import {
  buildCities,
  cities as staticCities,
  fetchManifest,
  type City,
} from '../data/photos.ts'

// 进程内缓存：拉取一次后各页面共用，路由切换不再重复请求
let cached: City[] | null = null
let inflight: Promise<City[] | null> | null = null

const load = (): Promise<City[] | null> => {
  if (cached) return Promise.resolve(cached)
  inflight ??= fetchManifest().then((manifest) => {
    if (!manifest) return null
    cached = buildCities(manifest)
    return cached
  })
  return inflight
}

/**
 * 返回城市列表：先给静态数据（本地图 + txt）保证首屏不空，
 * 再异步并入 Cloudflare R2 的自动清单。未配置 PHOTOS_API 时就只有静态数据。
 */
export const usePhotoCities = (): City[] => {
  const [cities, setCities] = useState<City[]>(cached ?? staticCities)

  useEffect(() => {
    if (cached) {
      setCities(cached)
      return
    }
    let alive = true
    load().then((merged) => {
      if (alive && merged) setCities(merged)
    })
    return () => {
      alive = false
    }
  }, [])

  return cities
}
