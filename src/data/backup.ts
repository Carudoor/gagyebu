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
