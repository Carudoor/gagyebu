export type SubscriptionCycle = '매월' | '매년'

export interface Subscription {
  id: string
  name: string
  category: string
  amount: number
  billingDay: number // 1~31
  cycle: SubscriptionCycle
  startDate: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  active: boolean
  memo?: string
}
