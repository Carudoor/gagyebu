export type TransactionType = '수입' | '지출'

export interface Transaction {
  id: string
  date: string // YYYY-MM-DD
  type: TransactionType
  amount: number // 항상 양수, 부호는 type으로 구분
  category: string
  memo?: string
}
