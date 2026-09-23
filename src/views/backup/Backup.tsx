import { useRef, useState, type ChangeEvent } from 'react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilCloudUpload } from '@coreui/icons'
import { readBackupFile, shareOrDownloadBackup, type RestorePreview } from '../../data/backup'
import { mergeTransactions, replaceAllTransactions, useTransactions } from '../../data/transactionStore'
import { mergeSubscriptions, replaceAllSubscriptions, useSubscriptions } from '../../data/subscriptionStore'

const cardClass = 'rounded-2xl p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] mb-4'
const cardStyle = { backgroundColor: 'var(--color-surface)' }
const primaryButtonClass = 'rounded-xl px-4 py-3 text-sm font-semibold text-white'
const outlineButtonClass = 'rounded-xl px-4 py-3 text-sm font-semibold border'

function AlertBox({ tone, children }: { tone: 'success' | 'warning' | 'danger' | 'info'; children: React.ReactNode }) {
  const toneColors: Record<typeof tone, { bg: string; text: string }> = {
    success: { bg: 'color-mix(in srgb, var(--color-income) 15%, transparent)', text: 'var(--color-income)' },
    warning: { bg: 'color-mix(in srgb, #f59e0b 15%, transparent)', text: '#b45309' },
    danger: { bg: 'color-mix(in srgb, var(--color-expense) 15%, transparent)', text: 'var(--color-expense)' },
    info: { bg: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', text: 'var(--color-text)' },
  }
  const { bg, text } = toneColors[tone]
  return (
    <div className="rounded-xl p-3 mt-3 text-sm" style={{ backgroundColor: bg, color: text }}>
      {children}
    </div>
  )
}

const Backup = () => {
  const transactions = useTransactions()
  const subscriptions = useSubscriptions()

  // 내보내기
  const [isSharing, setIsSharing] = useState(false)
  const [exportResult, setExportResult] = useState<
    'shared' | 'downloaded' | 'cancelled' | 'error' | null
  >(null)

  const handleExport = async () => {
    setIsSharing(true)
    setExportResult(null)
    try {
      const outcome = await shareOrDownloadBackup()
      setExportResult(outcome)
    } catch {
      setExportResult('error')
    } finally {
      setIsSharing(false)
    }
  }

  // 복원
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<RestorePreview | null>(null)
  const [readError, setReadError] = useState<string | null>(null)
  const [confirmingReplace, setConfirmingReplace] = useState(false)
  const [restoreResult, setRestoreResult] = useState<string | null>(null)

  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setReadError(null)
    setRestoreResult(null)
    setConfirmingReplace(false)
    try {
      const result = await readBackupFile(file)
      setPreview(result)
    } catch (error) {
      setPreview(null)
      setReadError(error instanceof Error ? error.message : '파일을 읽을 수 없습니다.')
    }
  }

  const cancelPreview = () => {
    setPreview(null)
    setConfirmingReplace(false)
  }

  const handleMerge = () => {
    if (!preview) return
    const addedTransactions = mergeTransactions(preview.transactions)
    const addedSubscriptions = mergeSubscriptions(preview.subscriptions)
    setRestoreResult(`거래 ${addedTransactions}건, 구독 ${addedSubscriptions}건을 새로 추가했습니다.`)
    setPreview(null)
  }

  const handleReplace = () => {
    if (!preview) return
    replaceAllTransactions(preview.transactions)
    replaceAllSubscriptions(preview.subscriptions)
    setRestoreResult(
      `현재 데이터를 거래 ${preview.transactions.length}건, 구독 ${preview.subscriptions.length}건으로 교체했습니다.`,
    )
    setPreview(null)
    setConfirmingReplace(false)
  }

  return (
    <>
      <div className={cardClass} style={cardStyle}>
        <h2 className="text-base font-semibold mb-2">내보내기</h2>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          거래 내역 {transactions.length}건, 정기 구독 {subscriptions.length}건이 담긴 백업 파일을
          만듭니다. 이 데이터는 이 기기의 브라우저에만 저장되어 있으니, 만들어진 파일을 디스코드
          DM이나 파일 앱 등 안전한 곳에 보관해두세요.
        </p>
        <button
          type="button"
          disabled={isSharing}
          onClick={() => void handleExport()}
          className={primaryButtonClass}
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <CIcon icon={cilCloudDownload} className="me-2" />
          {isSharing ? '만드는 중...' : '백업 파일 내보내기 / 공유'}
        </button>

        {exportResult === 'shared' && <AlertBox tone="success">공유 시트로 전달했습니다.</AlertBox>}
        {exportResult === 'downloaded' && <AlertBox tone="success">백업 파일을 다운로드했습니다.</AlertBox>}
        {exportResult === 'cancelled' && <AlertBox tone="warning">공유가 취소되었습니다.</AlertBox>}
        {exportResult === 'error' && (
          <AlertBox tone="danger">백업 파일을 만드는 중 오류가 발생했습니다.</AlertBox>
        )}
      </div>

      <div className={cardClass} style={cardStyle}>
        <h2 className="text-base font-semibold mb-2">복원</h2>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          백업 파일(.json)을 선택하면 내용을 확인한 뒤, 지금 데이터에 <strong>합칠지</strong> 아니면{' '}
          <strong>완전히 교체</strong>할지 고를 수 있습니다.
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={outlineButtonClass}
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        >
          <CIcon icon={cilCloudUpload} className="me-2" />
          백업 파일 선택
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => void handleFileSelected(e)}
        />

        {readError && <AlertBox tone="danger">{readError}</AlertBox>}
        {restoreResult && <AlertBox tone="success">{restoreResult}</AlertBox>}

        {preview && (
          <AlertBox tone="info">
            <div className="mb-2">
              이 백업 파일에는 거래 {preview.transactions.length}건, 구독 {preview.subscriptions.length}
              건이 있습니다.
              {preview.exportedAt && (
                <> (내보낸 시각: {new Date(preview.exportedAt).toLocaleString('ko-KR')})</>
              )}
              {(preview.skippedTransactions > 0 || preview.skippedSubscriptions > 0) && (
                <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  형식이 맞지 않아 건너뛴 항목: 거래 {preview.skippedTransactions}건, 구독{' '}
                  {preview.skippedSubscriptions}건
                </div>
              )}
            </div>

            {!confirmingReplace ? (
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleMerge}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-white"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  지금 데이터에 합치기
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingReplace(true)}
                  className="rounded-lg px-3 py-2 text-xs font-semibold border"
                  style={{ borderColor: 'var(--color-expense)', color: 'var(--color-expense)' }}
                >
                  완전히 교체하기
                </button>
                <button
                  type="button"
                  onClick={cancelPreview}
                  className="rounded-lg px-3 py-2 text-xs"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  취소
                </button>
              </div>
            ) : (
              <div>
                <p className="font-semibold mb-2">
                  정말 교체할까요? 지금 있는 거래 {transactions.length}건, 구독 {subscriptions.length}
                  건은 사라지고 되돌릴 수 없습니다.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleReplace}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-white"
                    style={{ backgroundColor: 'var(--color-expense)' }}
                  >
                    네, 교체합니다
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingReplace(false)}
                    className="rounded-lg px-3 py-2 text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </AlertBox>
        )}
      </div>
    </>
  )
}

export default Backup
