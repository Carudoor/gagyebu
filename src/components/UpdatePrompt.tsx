import { useRegisterSW } from 'virtual:pwa-register/react'

// 새 버전이 배포돼도 바로 적용하지 않고, 사용자가 확인을 눌러야 적용한다.
// 데이터 저장 형식이 바뀌는 업데이트를 내더라도, 쓰던 중에 갑자기 화면이
// 바뀌어서 입력하던 내용이 날아가는 일이 없게 하려는 목적.
const UpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      className="fixed inset-x-4 z-50 rounded-2xl p-4 shadow-lg"
      style={{
        bottom: 'calc(5.5rem + env(safe-area-inset-bottom))',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <p className="text-sm mb-3">
        새 버전이 있어요. 지금 저장된 데이터는 그대로 유지되니 편할 때 적용하세요.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void updateServiceWorker(true)}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          지금 적용
        </button>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          className="rounded-xl px-4 py-2 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          나중에
        </button>
      </div>
    </div>
  )
}

export default UpdatePrompt
