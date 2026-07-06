/**
 * 'YYYY-MM-DD' → 'YYYY.MM.DD'。
 * 不走 new Date()：ISO 日期字符串会按 UTC 解析，在西半球时区会显示成前一天。
 * 之前 Home / Articles / ArticleDetail 各写了一份，统一到这里。
 */
export const formatDate = (d: string): string => {
  const [y, m, day] = d.split('-')
  if (!y || !m || !day) return d
  return `${y}.${m.padStart(2, '0')}.${day.padStart(2, '0')}`
}
