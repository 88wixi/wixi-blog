import { useEffect, useReducer } from 'react'
import {
  buildCities,
  cities as staticCities,
  fetchManifest,
  PHOTOS_API,
  type City,
  type R2Manifest,
} from '../data/photos.ts'

// 把上次拿到的 R2 清单缓存到 localStorage：再次进来先用缓存「秒出」，
// 后台再请求校验，有变化才更新——避免「空白占位 → 突然有图」的闪烁。
const LS_KEY = 'wixi-photos-manifest'

const readLS = (): R2Manifest | null => {
  try {
    const s = localStorage.getItem(LS_KEY)
    return s ? (JSON.parse(s) as R2Manifest) : null
  } catch {
    return null
  }
}
const writeLS = (m: R2Manifest) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(m))
  } catch {
    /* 隐私模式 / 配额满：忽略 */
  }
}

// 模块级状态，所有页面共享：初始就用缓存的清单建好城市，没有缓存才退回空的静态数据
let manifest: R2Manifest | null = readLS()
let citiesState: City[] = manifest ? buildCities(manifest) : staticCities
let fetched = false // 是否已完成一次网络校验
let inflight: Promise<void> | null = null

const subs = new Set<() => void>()
const emit = () => subs.forEach((fn) => fn())

const revalidate = (): Promise<void> => {
  inflight ??= fetchManifest().then((fresh) => {
    fetched = true
    if (fresh && JSON.stringify(fresh) !== JSON.stringify(manifest)) {
      manifest = fresh
      citiesState = buildCities(fresh)
      writeLS(fresh)
    }
    emit() // 即使内容没变，ready 状态也变了，要通知一次
  })
  return inflight
}

type Result = {
  cities: City[]
  /** 是否已拿到（或确认拿不到）R2 清单。false 时页面应显示骨架占位而非「整理中」。 */
  ready: boolean
}

/**
 * 城市列表 + 加载状态。优先用 localStorage 缓存的清单立即渲染，
 * 后台向 Cloudflare R2 的 Worker 校验更新。未配置 PHOTOS_API 时只用静态数据。
 */
export const usePhotoCities = (): Result => {
  const [, force] = useReducer((n: number) => n + 1, 0)

  useEffect(() => {
    subs.add(force)
    void revalidate()
    return () => {
      subs.delete(force)
    }
  }, [])

  // 有缓存清单 / 已校验完 / 根本没配接口 —— 都算「就绪」，不再显示骨架
  const ready = manifest !== null || fetched || !PHOTOS_API
  return { cities: citiesState, ready }
}
