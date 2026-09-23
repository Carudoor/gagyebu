import { readSheet } from 'read-excel-file/browser'
import type { Transaction, TransactionType } from './transaction'
import { TEMPLATE_HEADERS } from './transactionTemplate'
import { createStableIdFactory } from './stableId'
import { normalizeDate } from './dateParsing'
import type { ImportError } from './importError'

export type { ImportError }

export interface ImportResult {
  transactions: Transaction[]
  errors: ImportError[]
}

export async function parseTransactionFile(source: File | Blob | ArrayBuffer): Promise<ImportResult> {
  const rows = await readSheet(source)
  const errors: ImportError[] = []

  if (rows.length === 0) {
    return { transactions: [], errors: [{ row: 1, message: '빈 파일입니다.' }] }
  }

  const headerRow = rows[0].map((cell) => String(cell ?? '').trim())
  const columnIndex = {
    date: headerRow.indexOf(TEMPLATE_HEADERS[0]),
    amount: headerRow.indexOf(TEMPLATE_HEADERS[1]),
    type: headerRow.indexOf(TEMPLATE_HEADERS[2]),
    category: headerRow.indexOf(TEMPLATE_HEADERS[3]),
    memo: headerRow.indexOf(TEMPLATE_HEADERS[4]),
  }

  const missingHeaders = TEMPLATE_HEADERS.filter((header) => !headerRow.includes(header))
  if (missingHeaders.length > 0) {
    return {
      transactions: [],
      errors: [{ row: 1, message: `다음 컬럼을 찾을 수 없습니다: ${missingHeaders.join(', ')}` }],
    }
  }

  const transactions: Transaction[] = []
  const nextId = createStableIdFactory()

  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2 // 1행은 헤더

    if (row.every((cell) => cell === null || cell === '')) {
      return // 빈 줄은 건너뜀
    }

    const date = normalizeDate(row[columnIndex.date])
    if (!date) {
      errors.push({ row: rowNumber, message: '날짜 형식을 확인해주세요. (예: 2026-09-01)' })
      return
    }

    const amountCell = row[columnIndex.amount]
    const amount = typeof amountCell === 'number' ? amountCell : Number(amountCell)
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      errors.push({ row: rowNumber, message: '금액은 0보다 큰 숫자여야 합니다.' })
      return
    }

    const typeValue = String(row[columnIndex.type] ?? '').trim()
    if (typeValue !== '수입' && typeValue !== '지출') {
      errors.push({ row: rowNumber, message: '구분은 "수입" 또는 "지출"이어야 합니다.' })
      return
    }

    const category = String(row[columnIndex.category] ?? '').trim()
    if (!category) {
      errors.push({ row: rowNumber, message: '카테고리를 입력해주세요.' })
      return
    }

    const memo = String(row[columnIndex.memo] ?? '').trim()

    transactions.push({
      id: nextId(date, typeValue, amount, category, memo),
      date,
      amount,
      type: typeValue as TransactionType,
      category,
      memo: memo || undefined,
    })
  })

  return { transactions, errors }
}
