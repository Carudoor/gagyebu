import { parseSubscriptionFile, type SubscriptionImportResult } from './subscriptionImport'

// public/ 기준 표시용 경로 (안내 문구에 사용). 실제 fetch는 배포 base 경로를 붙여서 함.
export const SUBSCRIPTIONS_FILE_URL = '/data/subscriptions.xlsx'

export async function syncSubscriptionsFromProjectFile(): Promise<SubscriptionImportResult> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/subscriptions.xlsx`, {
    cache: 'no-store',
  })
  if (!response.ok) {
    return {
      subscriptions: [],
      errors: [{ row: 0, message: `public${SUBSCRIPTIONS_FILE_URL} 파일을 찾을 수 없습니다.` }],
    }
  }

  const blob = await response.blob()
  return parseSubscriptionFile(blob)
}
