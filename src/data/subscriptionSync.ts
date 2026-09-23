import { parseSubscriptionFile, type SubscriptionImportResult } from './subscriptionImport'

export const SUBSCRIPTIONS_FILE_URL = '/data/subscriptions.xlsx'

export async function syncSubscriptionsFromProjectFile(): Promise<SubscriptionImportResult> {
  const response = await fetch(SUBSCRIPTIONS_FILE_URL, { cache: 'no-store' })
  if (!response.ok) {
    return {
      subscriptions: [],
      errors: [{ row: 0, message: `public${SUBSCRIPTIONS_FILE_URL} 파일을 찾을 수 없습니다.` }],
    }
  }

  const blob = await response.blob()
  return parseSubscriptionFile(blob)
}
