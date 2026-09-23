import { useSyncExternalStore } from 'react'
import type { Transaction } from './transaction'

const STORAGE_KEY = 'household-ledger.transactions'

const listeners = new Set<() => void>()
let transactions: Transaction[] = load()

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

export function useTransactions() {
  return useSyncExternalStore(subscribe, getTransactions)
}
