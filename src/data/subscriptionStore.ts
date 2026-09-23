import { useSyncExternalStore } from 'react'
import type { Subscription } from './subscription'

const STORAGE_KEY = 'household-ledger.subscriptions'
const SYNCED_AT_KEY = 'household-ledger.subscriptions.syncedAt'

const listeners = new Set<() => void>()
let subscriptions: Subscription[] = load()
let lastSyncedAt: string | null = localStorage.getItem(SYNCED_AT_KEY)

function load(): Subscription[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Subscription[]) : []
  } catch {
    return []
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions))
  listeners.forEach((listener) => listener())
}

export function getSubscriptions() {
  return subscriptions
}

export function getSubscriptionsLastSyncedAt() {
  return lastSyncedAt
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setSubscriptions(newOnes: Subscription[]) {
  subscriptions = [...newOnes]
  lastSyncedAt = new Date().toISOString()
  localStorage.setItem(SYNCED_AT_KEY, lastSyncedAt)
  save()
}

export function useSubscriptions() {
  return useSyncExternalStore(subscribe, getSubscriptions)
}

export function useSubscriptionsLastSyncedAt() {
  return useSyncExternalStore(subscribe, getSubscriptionsLastSyncedAt)
}
