import { useState } from 'react'
import { CAlert, CButton, CCard, CCardBody, CCardHeader } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload } from '@coreui/icons'
import { shareOrDownloadBackup } from '../../data/backup'
import { useTransactions } from '../../data/transactionStore'
import { useSubscriptions } from '../../data/subscriptionStore'

const Backup = () => {
  const transactions = useTransactions()
  const subscriptions = useSubscriptions()
  const [isSharing, setIsSharing] = useState(false)
  const [result, setResult] = useState<'shared' | 'downloaded' | 'cancelled' | 'error' | null>(null)

  const handleExport = async () => {
    setIsSharing(true)
    setResult(null)
    try {
      const outcome = await shareOrDownloadBackup()
      setResult(outcome)
    } catch {
      setResult('error')
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>백업</CCardHeader>
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

        {result === 'shared' && (
          <CAlert color="success" className="mt-3 mb-0">
            공유 시트로 전달했습니다.
          </CAlert>
        )}
        {result === 'downloaded' && (
          <CAlert color="success" className="mt-3 mb-0">
            백업 파일을 다운로드했습니다.
          </CAlert>
        )}
        {result === 'cancelled' && (
          <CAlert color="warning" className="mt-3 mb-0">
            공유가 취소되었습니다.
          </CAlert>
        )}
        {result === 'error' && (
          <CAlert color="danger" className="mt-3 mb-0">
            백업 파일을 만드는 중 오류가 발생했습니다.
          </CAlert>
        )}
      </CCardBody>
    </CCard>
  )
}

export default Backup
