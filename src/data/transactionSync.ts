import { parseTransactionFile, type ImportResult } from './transactionImport'

// public/ 기준 표시용 경로 (안내 문구에 사용). 실제 fetch는 배포 base 경로를 붙여서 함.
export const TRANSACTIONS_FILE_URL = '/data/transactions.xlsx'

export async function syncTransactionsFromProjectFile(): Promise<ImportResult> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/transactions.xlsx`, {
    cache: 'no-store',
  })
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
