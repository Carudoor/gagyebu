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

export function addSubscription(subscription: Omit<Subscription, 'id'>) {
  const withId: Subscription = { ...subscription, id: crypto.randomUUID() }
  subscriptions = [withId, ...subscriptions]
  save()
}

export function updateSubscription(id: string, updates: Partial<Omit<Subscription, 'id'>>) {
  subscriptions = subscriptions.map((s) => (s.id === id ? { ...s, ...updates } : s))
  save()
}

export function deleteSubscription(id: string) {
  subscriptions = subscriptions.filter((s) => s.id !== id)
  save()
}

// 엑셀 파일에서 가져와 병합 (이미 있는 건 건너뛰고 새 것만 추가됨). 반환값: 새로 추가된 건수.
export function mergeSubscriptionsFromFile(incoming: Subscription[]): number {
  const existingIds = new Set(subscriptions.map((s) => s.id))
  const additions = incoming.filter((s) => !existingIds.has(s.id))
  subscriptions = [...subscriptions, ...additions]
  lastSyncedAt = new Date().toISOString()
  localStorage.setItem(SYNCED_AT_KEY, lastSyncedAt)
  save()
  return additions.length
}

export function useSubscriptions() {
  return useSyncExternalStore(subscribe, getSubscriptions)
}

export function useSubscriptionsLastSyncedAt() {
  return useSyncExternalStore(subscribe, getSubscriptionsLastSyncedAt)
}
