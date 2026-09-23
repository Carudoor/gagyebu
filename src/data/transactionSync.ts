import { parseTransactionFile, type ImportResult } from './transactionImport'

export const TRANSACTIONS_FILE_URL = '/data/transactions.xlsx'

export async function syncTransactionsFromProjectFile(): Promise<ImportResult> {
  const response = await fetch(TRANSACTIONS_FILE_URL, { cache: 'no-store' })
  if (!response.ok) {
    return {
      transactions: [],
      errors: [
        {
          row: 0,
          message: `public${TRANSACTIONS_FILE_URL} 파일을 찾을 수 없습니다.`,
        },
      ],
    }
  }

  const blob = await response.blob()
  return parseTransactionFile(blob)
}
