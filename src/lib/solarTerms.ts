/**
 * 二十四节气 + 七十二候。
 *
 * 不引农历库、不打日历接口（这站在意国内加载速度）——用通用寿星公式现算：
 *   日 = floor(Y * 0.2422 + C) - floor((Y - 1) / 4)
 * Y 是年份后两位，C 是每个节气在 21 世纪的常数。个别年份会差一天，
 * 对页脚这行「今天是什么时令」的小字来说完全够用。
 *
 * 七十二候是每个节气再分三候、每候约五天，名字取《逸周书·时训解》的通行版本。
 */

type Term = {
  name: string
  month: number // 1-12
  c: number // 寿星公式常数（21 世纪）
  /** 三候 */
  pentads: [string, string, string]
}

// 按公历年内顺序排列（从小寒起），方便按日期顺序查找
const TERMS: Term[] = [
  { name: '小寒', month: 1, c: 5.4055, pentads: ['雁北乡', '鹊始巢', '雉始雊'] },
  { name: '大寒', month: 1, c: 20.12, pentads: ['鸡始乳', '征鸟厉疾', '水泽腹坚'] },
  { name: '立春', month: 2, c: 3.87, pentads: ['东风解冻', '蛰虫始振', '鱼陟负冰'] },
  { name: '雨水', month: 2, c: 18.73, pentads: ['獭祭鱼', '候雁北', '草木萌动'] },
  { name: '惊蛰', month: 3, c: 5.63, pentads: ['桃始华', '仓庚鸣', '鹰化为鸠'] },
  { name: '春分', month: 3, c: 20.646, pentads: ['玄鸟至', '雷乃发声', '始电'] },
  { name: '清明', month: 4, c: 4.81, pentads: ['桐始华', '田鼠化为鴽', '虹始见'] },
  { name: '谷雨', month: 4, c: 20.1, pentads: ['萍始生', '鸣鸠拂其羽', '戴胜降于桑'] },
  { name: '立夏', month: 5, c: 5.52, pentads: ['蝼蝈鸣', '蚯蚓出', '王瓜生'] },
  { name: '小满', month: 5, c: 21.04, pentads: ['苦菜秀', '靡草死', '麦秋至'] },
  { name: '芒种', month: 6, c: 5.678, pentads: ['螳螂生', '鵙始鸣', '反舌无声'] },
  { name: '夏至', month: 6, c: 21.37, pentads: ['鹿角解', '蜩始鸣', '半夏生'] },
  { name: '小暑', month: 7, c: 7.108, pentads: ['温风至', '蟋蟀居壁', '鹰始鸷'] },
  { name: '大暑', month: 7, c: 22.83, pentads: ['腐草为萤', '土润溽暑', '大雨时行'] },
  { name: '立秋', month: 8, c: 7.5, pentads: ['凉风至', '白露降', '寒蝉鸣'] },
  { name: '处暑', month: 8, c: 23.13, pentads: ['鹰乃祭鸟', '天地始肃', '禾乃登'] },
  { name: '白露', month: 9, c: 7.646, pentads: ['鸿雁来', '玄鸟归', '群鸟养羞'] },
  { name: '秋分', month: 9, c: 23.042, pentads: ['雷始收声', '蛰虫坯户', '水始涸'] },
  { name: '寒露', month: 10, c: 8.318, pentads: ['鸿雁来宾', '雀入大水为蛤', '菊有黄华'] },
  { name: '霜降', month: 10, c: 23.438, pentads: ['豺乃祭兽', '草木黄落', '蛰虫咸俯'] },
  { name: '立冬', month: 11, c: 7.438, pentads: ['水始冰', '地始冻', '雉入大水为蜃'] },
  { name: '小雪', month: 11, c: 22.36, pentads: ['虹藏不见', '天气上升地气下降', '闭塞而成冬'] },
  { name: '大雪', month: 12, c: 7.18, pentads: ['鹖鴠不鸣', '虎始交', '荔挺出'] },
  { name: '冬至', month: 12, c: 21.94, pentads: ['蚯蚓结', '麋角解', '水泉动'] },
]

/** 某年某节气的公历日 */
const termDay = (year: number, term: Term): number => {
  const y = year % 100
  return Math.floor(y * 0.2422 + term.c) - Math.floor((y - 1) / 4)
}

const atNoon = (year: number, month: number, day: number) => new Date(year, month - 1, day, 12)

export type SolarTerm = {
  /** 节气名，如「立秋」 */
  term: string
  /** 当前所处的候，如「寒蝉鸣」 */
  pentad: string
}

/**
 * 查出 date 当天所处的节气与候。
 * 落在小寒之前（1 月初几天）时回退到上一年的冬至。
 */
export const solarTermOf = (date: Date = new Date()): SolarTerm => {
  const year = date.getFullYear()
  const today = atNoon(year, date.getMonth() + 1, date.getDate()).getTime()

  // 从年内最后一个节气往回找第一个「已经到了」的
  for (let i = TERMS.length - 1; i >= 0; i -= 1) {
    const t = TERMS[i]
    const start = atNoon(year, t.month, termDay(year, t)).getTime()
    if (today >= start) {
      const days = Math.floor((today - start) / 86_400_000)
      return { term: t.name, pentad: t.pentads[Math.min(2, Math.floor(days / 5))] }
    }
  }

  // 1 月 1 日到小寒之间：仍属上一年的冬至
  const prev = TERMS[TERMS.length - 1]
  const start = atNoon(year - 1, prev.month, termDay(year - 1, prev)).getTime()
  const days = Math.floor((today - start) / 86_400_000)
  return { term: prev.name, pentad: prev.pentads[Math.min(2, Math.floor(days / 5))] }
}
