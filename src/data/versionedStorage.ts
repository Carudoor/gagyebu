// localStorage에 배열을 저장할 때 스키마 버전을 같이 붙여서, 나중에 Transaction
// /Subscription의 필드 구조가 바뀌어도 예전 데이터를 안전하게 읽어올 수 있게 한다.
// (버전 올릴 때: currentVersion 늘리고, 아래 loadVersioned에 payload.version별
// 마이그레이션 단계를 추가할 것.)

export interface VersionedPayload<T> {
  version: number
  items: T[]
}

export function loadVersioned<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)

    // 버전 필드가 생기기 전(v0)의 예전 포맷 — 그냥 배열이었음
    if (Array.isArray(parsed)) {
      return parsed as T[]
    }

    if (parsed && typeof parsed === 'object' && 'items' in parsed && Array.isArray((parsed as VersionedPayload<T>).items)) {
      // 지금은 v1 하나뿐이라 마이그레이션할 게 없음.
      // 다음 버전이 생기면 여기서 (parsed as VersionedPayload<T>).version 보고 단계별로 변환할 것.
      return (parsed as VersionedPayload<T>).items
    }

    return []
  } catch {
    return []
  }
}

export function saveVersioned<T>(key: string, items: T[], currentVersion: number) {
  const payload: VersionedPayload<T> = { version: currentVersion, items }
  localStorage.setItem(key, JSON.stringify(payload))
}
