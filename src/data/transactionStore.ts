import { useSyncExternalStore } from 'react'
import type { Transaction } from './transaction'
import { loadVersioned, saveVersioned } from './versionedStorage'

const STORAGE_KEY = 'household-ledger.transactions'
const SCHEMA_VERSION = 1

const listeners = new Set<() => void>()
let transactions: Transaction[] = loadVersioned<Transaction>(STORAGE_KEY)

function sortByDateDesc(list: Transaction[]) {
  return [...list].sort((a, b) => b.date.localeCompare(a.date))
}

function save() {
  saveVersioned(STORAGE_KEY, transactions, SCHEMA_VERSION)
  listeners.forEach((listener) => listener())
}

export function getTransactions() {
  return transactions
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

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

// 백업 복원용. 반환값: 새로 추가된 건수 (이미 있는 id는 건너뜀).
export function mergeTransactions(incoming: Transaction[]): number {
  const existingIds = new Set(transactions.map((t) => t.id))
  const additions = incoming.filter((t) => !existingIds.has(t.id))
  transactions = sortByDateDesc([...transactions, ...additions])
  save()
  return additions.length
}

// 백업 복원용 — 현재 데이터를 통째로 교체함(되돌릴 수 없음).
export function replaceAllTransactions(newOnes: Transaction[]) {
  transactions = sortByDateDesc(newOnes)
  save()
}

export function useTransactions() {
  return useSyncExternalStore(subscribe, getTransactions)
}
