import { readSheet } from 'read-excel-file/browser'
import type { Subscription, SubscriptionCycle } from './subscription'
import { SUBSCRIPTION_TEMPLATE_HEADERS } from './subscriptionTemplate'
import { createStableIdFactory } from './stableId'
import { normalizeDate } from './dateParsing'
import type { ImportError } from './importError'

export interface SubscriptionImportResult {
  subscriptions: Subscription[]
  errors: ImportError[]
}

export async function parseSubscriptionFile(
  source: File | Blob | ArrayBuffer,
): Promise<SubscriptionImportResult> {
  const rows = await readSheet(source)
  const errors: ImportError[] = []

  if (rows.length === 0) {
    return { subscriptions: [], errors: [{ row: 1, message: '빈 파일입니다.' }] }
  }

  const headerRow = rows[0].map((cell) => String(cell ?? '').trim())
  const columnIndex = {
    name: headerRow.indexOf(SUBSCRIPTION_TEMPLATE_HEADERS[0]),
    category: headerRow.indexOf(SUBSCRIPTION_TEMPLATE_HEADERS[1]),
    amount: headerRow.indexOf(SUBSCRIPTION_TEMPLATE_HEADERS[2]),
    billingDay: headerRow.indexOf(SUBSCRIPTION_TEMPLATE_HEADERS[3]),
    cycle: headerRow.indexOf(SUBSCRIPTION_TEMPLATE_HEADERS[4]),
    startDate: headerRow.indexOf(SUBSCRIPTION_TEMPLATE_HEADERS[5]),
    endDate: headerRow.indexOf(SUBSCRIPTION_TEMPLATE_HEADERS[6]),
    active: headerRow.indexOf(SUBSCRIPTION_TEMPLATE_HEADERS[7]),
    memo: headerRow.indexOf(SUBSCRIPTION_TEMPLATE_HEADERS[8]),
  }

  const missingHeaders = SUBSCRIPTION_TEMPLATE_HEADERS.filter((header) => !headerRow.includes(header))
  if (missingHeaders.length > 0) {
    return {
      subscriptions: [],
      errors: [{ row: 1, message: `다음 컬럼을 찾을 수 없습니다: ${missingHeaders.join(', ')}` }],
    }
  }

  const subscriptions: Subscription[] = []
  const nextId = createStableIdFactory()

  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2

    if (row.every((cell) => cell === null || cell === '')) {
      return
    }

    const name = String(row[columnIndex.name] ?? '').trim()
    if (!name) {
      errors.push({ row: rowNumber, message: '이름을 입력해주세요.' })
      return
    }

    const category = String(row[columnIndex.category] ?? '').trim()
    if (!category) {
      errors.push({ row: rowNumber, message: '카테고리를 입력해주세요.' })
      return
    }

    const amountCell = row[columnIndex.amount]
    const amount = typeof amountCell === 'number' ? amountCell : Number(amountCell)
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      errors.push({ row: rowNumber, message: '금액은 0보다 큰 숫자여야 합니다.' })
      return
    }

    const billingDayCell = row[columnIndex.billingDay]
    const billingDay = typeof billingDayCell === 'number' ? billingDayCell : Number(billingDayCell)
    if (!Number.isInteger(billingDay) || billingDay < 1 || billingDay > 31) {
      errors.push({ row: rowNumber, message: '결제일은 1~31 사이의 숫자여야 합니다.' })
      return
    }

    const cycleValue = String(row[columnIndex.cycle] ?? '').trim()
    if (cycleValue !== '매월' && cycleValue !== '매년') {
      errors.push({ row: rowNumber, message: '주기는 "매월" 또는 "매년"이어야 합니다.' })
      return
    }

    const startDate = normalizeDate(row[columnIndex.startDate])
    if (!startDate) {
      errors.push({ row: rowNumber, message: '시작일 형식을 확인해주세요. (예: 2026-01-15)' })
      return
    }

    const endDateCell = row[columnIndex.endDate]
    let endDate: string | undefined
    if (endDateCell !== null && endDateCell !== '' && endDateCell !== undefined) {
      const normalizedEndDate = normalizeDate(endDateCell)
      if (!normalizedEndDate) {
        errors.push({ row: rowNumber, message: '종료일 형식을 확인해주세요. (예: 2026-12-31)' })
        return
      }
      endDate = normalizedEndDate
    }

    const activeCell = row[columnIndex.active]
    const activeText = String(activeCell ?? '').trim()
    const active = typeof activeCell === 'boolean' ? activeCell : activeText !== '아니오' && activeText !== 'N'

    const memo = String(row[columnIndex.memo] ?? '').trim()

    subscriptions.push({
      id: nextId(name, category, amount, billingDay, cycleValue, startDate),
      name,
      category,
      amount,
      billingDay,
      cycle: cycleValue as SubscriptionCycle,
      startDate,
      endDate,
      active,
      memo: memo || undefined,
    })
  })

  return { subscriptions, errors }
}
