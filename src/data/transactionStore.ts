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

export function setTransactions(newOnes: Transaction[]) {
  transactions = [...newOnes].sort((a, b) => b.date.localeCompare(a.date))
  lastSyncedAt = new Date().toISOString()
  localStorage.setItem(SYNCED_AT_KEY, lastSyncedAt)
  save()
}

export function useTransactions() {
  return useSyncExternalStore(subscribe, getTransactions)
}

export function useLastSyncedAt() {
  return useSyncExternalStore(subscribe, getLastSyncedAt)
}
