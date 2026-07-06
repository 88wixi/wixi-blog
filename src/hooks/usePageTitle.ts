import { useEffect } from 'react'

const SITE = 'wixi 的林间小记'

/**
 * 按页面设置 document.title（「页面名 · 站点名」）。SPA 不设的话全站标题一模一样，
 * 收藏夹、历史记录、搜索引擎里都分不清页面。不传 title 则用站点默认名（首页）。
 */
export const usePageTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : SITE
  }, [title])
}
