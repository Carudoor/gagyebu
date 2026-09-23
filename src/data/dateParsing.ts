// 엑셀 셀 값을 'YYYY-MM-DD' 문자열로 정규화한다. 달력상 실제로 존재하는
// 날짜가 아니면(예: 2월 30일) null을 반환한다.
export function normalizeDate(value: unknown): string | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, '0')
    const d = String(value.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  if (typeof value === 'string') {
    const match = value.trim().match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/)
    if (match) {
      const [, yearStr, monthStr, dayStr] = match
      const year = Number(yearStr)
      const month = Number(monthStr)
      const day = Number(dayStr)
      const parsed = new Date(year, month - 1, day)
      const isValidCalendarDate =
        parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day
      if (!isValidCalendarDate) return null
      return `${yearStr}-${monthStr.padStart(2, '0')}-${dayStr.padStart(2, '0')}`
    }
  }

  return null
}
