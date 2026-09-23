import { getTransactions } from './transactionStore'
import { getSubscriptions } from './subscriptionStore'
import type { Transaction } from './transaction'
import type { Subscription } from './subscription'

export const BACKUP_SCHEMA_VERSION = 1

export interface BackupData {
  schemaVersion: typeof BACKUP_SCHEMA_VERSION
  exportedAt: string
  transactions: Transaction[]
  subscriptions: Subscription[]
}

export function createBackup(): BackupData {
  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    transactions: getTransactions(),
    subscriptions: getSubscriptions(),
  }
}

function backupFileName(): string {
  const date = new Date().toISOString().slice(0, 10)
  return `가계부_백업_${date}.json`
}

function downloadBackupFile(file: File) {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export type ShareBackupResult = 'shared' | 'downloaded' | 'cancelled'

// 가능하면 OS 공유 시트(디스코드/메시지/에어드랍 등으로 바로 전송)를 띄우고,
// 지원 안 하는 환경(주로 데스크톱 브라우저)에서는 파일 다운로드로 대체한다.
export async function shareOrDownloadBackup(): Promise<ShareBackupResult> {
  const backup = createBackup()
  const json = JSON.stringify(backup, null, 2)
  const file = new File([json], backupFileName(), { type: 'application/json' })

  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean
    share?: (data: { files: File[]; title?: string }) => Promise<void>
  }

  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file], title: '가계부 백업' })
      return 'shared'
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return 'cancelled'
      }
      throw error
    }
  }

  downloadBackupFile(file)
  return 'downloaded'
}

function isTransaction(value: unknown): value is Transaction {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.date === 'string' &&
    (v.type === '수입' || v.type === '지출') &&
    typeof v.amount === 'number' &&
    typeof v.category === 'string' &&
    (v.memo === undefined || typeof v.memo === 'string')
  )
}

function isSubscription(value: unknown): value is Subscription {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.category === 'string' &&
    typeof v.amount === 'number' &&
    typeof v.billingDay === 'number' &&
    (v.cycle === '매월' || v.cycle === '매년') &&
    typeof v.startDate === 'string' &&
    typeof v.active === 'boolean' &&
    (v.endDate === undefined || typeof v.endDate === 'string') &&
    (v.memo === undefined || typeof v.memo === 'string')
  )
}

export interface RestorePreview {
  exportedAt: string | null
  transactions: Transaction[]
  subscriptions: Subscription[]
  skippedTransactions: number
  skippedSubscriptions: number
}

export async function readBackupFile(file: File): Promise<RestorePreview> {
  const text = await file.text()

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('올바른 JSON 파일이 아닙니다.')
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('백업 파일 형식이 올바르지 않습니다.')
  }
  const data = parsed as Record<string, unknown>

  if (!Array.isArray(data.transactions) && !Array.isArray(data.subscriptions)) {
    throw new Error('백업 파일에 거래/구독 데이터가 없습니다.')
  }

  const rawTransactions = Array.isArray(data.transactions) ? data.transactions : []
  const rawSubscriptions = Array.isArray(data.subscriptions) ? data.subscriptions : []
  const transactions = rawTransactions.filter(isTransaction)
  const subscriptions = rawSubscriptions.filter(isSubscription)

  return {
    exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : null,
    transactions,
    subscriptions,
    skippedTransactions: rawTransactions.length - transactions.length,
    skippedSubscriptions: rawSubscriptions.length - subscriptions.length,
  }
}
