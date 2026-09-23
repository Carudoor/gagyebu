import type { Subscription } from './subscription'

function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate()
}

function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 오늘(또는 기준일) 이후 가장 가까운 결제일을 계산한다.
export function getNextBillingDate(subscription: Subscription, today: Date = new Date()): string | null {
  if (!subscription.active) return null
  const todayStr = toDateStr(today)
  if (subscription.endDate && subscription.endDate < todayStr) return null

  if (subscription.cycle === '매월') {
    let year = today.getFullYear()
    let month0 = today.getMonth()
    for (let i = 0; i < 24; i++) {
      const day = Math.min(subscription.billingDay, daysInMonth(year, month0))
      const candidate = `${year}-${String(month0 + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      if (candidate >= todayStr && candidate >= subscription.startDate) {
        if (!subscription.endDate || candidate <= subscription.endDate) return candidate
      }
      month0 += 1
      if (month0 > 11) {
        month0 = 0
        year += 1
      }
    }
    return null
  }

  // 매년: 시작일과 같은 달, 같은 결제일에 청구된다고 가정
  const startMonth0 = Number(subscription.startDate.slice(5, 7)) - 1
  let year = today.getFullYear()
  for (let i = 0; i < 5; i++) {
    const day = Math.min(subscription.billingDay, daysInMonth(year, startMonth0))
    const candidate = `${year}-${String(startMonth0 + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (candidate >= todayStr && candidate >= subscription.startDate) {
      if (!subscription.endDate || candidate <= subscription.endDate) return candidate
    }
    year += 1
  }
  return null
}

// 특정 월(YYYY-MM)에 실제로 청구가 발생하는 활성 구독들의 합계
export function getMonthlyProjection(subscriptions: Subscription[], yearMonth: string): number {
  const [yearStr, monthStr] = yearMonth.split('-')
  const year = Number(yearStr)
  const month0 = Number(monthStr) - 1
  const monthStart = `${yearMonth}-01`
  const monthEnd = `${yearMonth}-${String(daysInMonth(year, month0)).padStart(2, '0')}`

  return subscriptions
    .filter((s) => s.active)
    .filter((s) => s.startDate <= monthEnd && (!s.endDate || s.endDate >= monthStart))
    .filter((s) => {
      if (s.cycle === '매월') return true
      const startMonth = Number(s.startDate.slice(5, 7))
      return startMonth === month0 + 1
    })
    .reduce((sum, s) => sum + s.amount, 0)
}
