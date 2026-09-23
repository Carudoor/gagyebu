// 엑셀 파일을 매번 통째로 다시 읽어서 로컬 상태를 교체하기 때문에,
// 행 내용이 같으면 매번 같은 id가 나오도록 내용 기반 해시로 id를 만든다.
// (내용이 완전히 같은 행이 여러 개면 등장 순서로 구분한다.)
export function createStableIdFactory() {
  const seen = new Map<string, number>()

  return (...parts: (string | number)[]) => {
    const key = parts.join('|')
    const occurrence = seen.get(key) ?? 0
    seen.set(key, occurrence + 1)
    return hashString(`${key}|${occurrence}`)
  }
}

function hashString(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(hash, 31) + input.charCodeAt(i)) | 0
  }
  return (hash >>> 0).toString(36)
}
