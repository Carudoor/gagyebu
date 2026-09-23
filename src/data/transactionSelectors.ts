import type { Transaction } from './transaction'

export function formatYearMonth(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function getYearMonth(dateStr: string): string {
  return dateStr.slice(0, 7) // 'YYYY-MM-DD' -> 'YYYY-MM'
}

export function filterByYearMonth(transactions: Transaction[], yearMonth: string): Transaction[] {
  return transactions.filter((transaction) => getYearMonth(transaction.date) === yearMonth)
}

export interface Summary {
  income: number
  expense: number
  balance: number
}

export function summarize(transactions: Transaction[]): Summary {
  const income = transactions
    .filter((t) => t.type === '수입')
    .reduce((sum, t) => sum + t.amount, 0)
  const expense = transactions
    .filter((t) => t.type === '지출')
    .reduce((sum, t) => sum + t.amount, 0)
  return { income, expense, balance: income - expense }
}

export function getRecentTransactions(transactions: Transaction[], limit: number): Transaction[] {
  // transactions는 이미 날짜 내림차순으로 정렬되어 저장되어 있음 (transactionStore 참고)
  return transactions.slice(0, limit)
}

export interface CategoryTotal {
  category: string
  amount: number
}

export function getCategoryTotals(
  transactions: Transaction[],
  type: Transaction['type'],
): CategoryTotal[] {
  const totals = new Map<string, number>()
  transactions
    .filter((t) => t.type === type)
    .forEach((t) => totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount))

  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export interface MonthlySummary extends Summary {
  yearMonth: string
}

function getRecentYearMonths(monthCount: number): string[] {
  const now = new Date()
  const months: string[] = []
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(formatYearMonth(d))
  }
  return months
}

// 최근 monthCount개월(이번 달 포함)의 월별 수입/지출/잔액
export function getMonthlySeries(transactions: Transaction[], monthCount: number): MonthlySummary[] {
  return getRecentYearMonths(monthCount).map((yearMonth) => ({
    yearMonth,
    ...summarize(filterByYearMonth(transactions, yearMonth)),
  }))
}

export interface CategoryMonthlyTotals {
  yearMonth: string
  totals: CategoryTotal[]
}

// 최근 monthCount개월의 월별 카테고리 합계 (그래프 페이지의 카테고리 추이용)
export function getCategoryMonthlySeries(
  transactions: Transaction[],
  type: Transaction['type'],
  monthCount: number,
): CategoryMonthlyTotals[] {
  return getRecentYearMonths(monthCount).map((yearMonth) => ({
    yearMonth,
    totals: getCategoryTotals(filterByYearMonth(transactions, yearMonth), type),
  }))
}
