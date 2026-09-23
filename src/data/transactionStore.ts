import { useSyncExternalStore } from 'react'
import type { Transaction } from './transaction'

const STORAGE_KEY = 'household-ledger.transactions'
const SYNCED_AT_KEY = 'household-ledger.transactions.syncedAt'

const listeners = new Set<() => void>()
let transactions: Transaction[] = load()
let lastSyncedAt: string | null = localStorage.getItem(SYNCED_AT_KEY)

function load(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Transaction[]) : []
  } catch {
    return []
  }
}

function sortByDateDesc(list: Transaction[]) {
  return [...list].sort((a, b) => b.date.localeCompare(a.date))
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  listeners.forEach((listener) => listener())
}

export function getTransactions() {
  return transactions
}

export function getLastSyncedAt() {
  return lastSyncedAt
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// 앱에서 직접 한 건 추가 (id는 이번 세션에서만 유효하면 되므로 랜덤 생성)
export function addTransaction(transaction: Omit<Transaction, 'id'>) {
  const withId: Transaction = { ...transaction, id: crypto.randomUUID() }
  transactions = sortByDateDesc([withId, ...transactions])
  save()
}

export function updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id'>>) {
  transactions = sortByDateDesc(
    transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  )
  save()
}

export function deleteTransaction(id: string) {
  transactions = transactions.filter((t) => t.id !== id)
  save()
}

// 엑셀 파일에서 가져와 병합 (내용 기반 id라 이미 있는 건 건너뛰고 새 것만 추가됨).
// 반환값: 새로 추가된 건수.
export function mergeTransactionsFromFile(incoming: Transaction[]): number {
  const existingIds = new Set(transactions.map((t) => t.id))
  const additions = incoming.filter((t) => !existingIds.has(t.id))
  transactions = sortByDateDesc([...transactions, ...additions])
  lastSyncedAt = new Date().toISOString()
  localStorage.setItem(SYNCED_AT_KEY, lastSyncedAt)
  save()
  return additions.length
}

export function useTransactions() {
  return useSyncExternalStore(subscribe, getTransactions)
}

export function useLastSyncedAt() {
  return useSyncExternalStore(subscribe, getLastSyncedAt)
}
