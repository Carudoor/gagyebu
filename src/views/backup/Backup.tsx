import { useRef, useState, type ChangeEvent } from 'react'
import { CAlert, CButton, CCard, CCardBody, CCardHeader } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilCloudUpload } from '@coreui/icons'
import { readBackupFile, shareOrDownloadBackup, type RestorePreview } from '../../data/backup'
import { mergeTransactions, replaceAllTransactions, useTransactions } from '../../data/transactionStore'
import { mergeSubscriptions, replaceAllSubscriptions, useSubscriptions } from '../../data/subscriptionStore'

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
      <CCard className="mb-4">
        <CCardHeader>내보내기</CCardHeader>
        <CCardBody>
          <p className="text-body-secondary">
            거래 내역 {transactions.length}건, 정기 구독 {subscriptions.length}건이 담긴 백업 파일을
            만듭니다. 이 데이터는 이 기기의 브라우저에만 저장되어 있으니, 만들어진 파일을 디스코드
            DM이나 파일 앱 등 안전한 곳에 보관해두세요.
          </p>
          <CButton color="primary" disabled={isSharing} onClick={() => void handleExport()}>
            <CIcon icon={cilCloudDownload} className="me-2" />
            {isSharing ? '만드는 중...' : '백업 파일 내보내기 / 공유'}
          </CButton>

          {exportResult === 'shared' && (
            <CAlert color="success" className="mt-3 mb-0">
              공유 시트로 전달했습니다.
            </CAlert>
          )}
          {exportResult === 'downloaded' && (
            <CAlert color="success" className="mt-3 mb-0">
              백업 파일을 다운로드했습니다.
            </CAlert>
          )}
          {exportResult === 'cancelled' && (
            <CAlert color="warning" className="mt-3 mb-0">
              공유가 취소되었습니다.
            </CAlert>
          )}
          {exportResult === 'error' && (
            <CAlert color="danger" className="mt-3 mb-0">
              백업 파일을 만드는 중 오류가 발생했습니다.
            </CAlert>
          )}
        </CCardBody>
      </CCard>

      <CCard className="mb-4">
        <CCardHeader>복원</CCardHeader>
        <CCardBody>
          <p className="text-body-secondary">
            백업 파일(.json)을 선택하면 내용을 확인한 뒤, 지금 데이터에 <strong>합칠지</strong>{' '}
            아니면 <strong>완전히 교체</strong>할지 고를 수 있습니다.
          </p>
          <CButton color="secondary" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <CIcon icon={cilCloudUpload} className="me-2" />
            백업 파일 선택
          </CButton>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="d-none"
            onChange={(e) => void handleFileSelected(e)}
          />

          {readError && (
            <CAlert color="danger" className="mt-3 mb-0">
              {readError}
            </CAlert>
          )}

          {restoreResult && (
            <CAlert color="success" className="mt-3 mb-0">
              {restoreResult}
            </CAlert>
          )}

          {preview && (
            <CAlert color="info" className="mt-3">
              <div className="mb-2">
                이 백업 파일에는 거래 {preview.transactions.length}건, 구독{' '}
                {preview.subscriptions.length}건이 있습니다.
                {preview.exportedAt && (
                  <>
                    {' '}
                    (내보낸 시각: {new Date(preview.exportedAt).toLocaleString('ko-KR')})
                  </>
                )}
                {(preview.skippedTransactions > 0 || preview.skippedSubscriptions > 0) && (
                  <div className="text-body-secondary small mt-1">
                    형식이 맞지 않아 건너뛴 항목: 거래 {preview.skippedTransactions}건, 구독{' '}
                    {preview.skippedSubscriptions}건
                  </div>
                )}
              </div>

              {!confirmingReplace ? (
                <div className="d-flex gap-2 flex-wrap">
                  <CButton color="primary" size="sm" onClick={handleMerge}>
                    지금 데이터에 합치기
                  </CButton>
                  <CButton color="danger" variant="outline" size="sm" onClick={() => setConfirmingReplace(true)}>
                    완전히 교체하기
                  </CButton>
                  <CButton color="secondary" variant="ghost" size="sm" onClick={cancelPreview}>
                    취소
                  </CButton>
                </div>
              ) : (
                <div>
                  <p className="fw-semibold mb-2">
                    정말 교체할까요? 지금 있는 거래 {transactions.length}건, 구독{' '}
                    {subscriptions.length}건은 사라지고 되돌릴 수 없습니다.
                  </p>
                  <div className="d-flex gap-2 flex-wrap">
                    <CButton color="danger" size="sm" onClick={handleReplace}>
                      네, 교체합니다
                    </CButton>
                    <CButton color="secondary" variant="ghost" size="sm" onClick={() => setConfirmingReplace(false)}>
                      취소
                    </CButton>
                  </div>
                </div>
              )}
            </CAlert>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Backup
