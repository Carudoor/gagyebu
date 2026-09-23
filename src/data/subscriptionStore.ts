import { useSyncExternalStore } from 'react'
import type { Subscription } from './subscription'

const STORAGE_KEY = 'household-ledger.subscriptions'

const listeners = new Set<() => void>()
let subscriptions: Subscription[] = load()

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

export function useSubscriptions() {
  return useSyncExternalStore(subscribe, getSubscriptions)
}
