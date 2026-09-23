import { useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilReload } from '@coreui/icons'
import { downloadSubscriptionTemplate } from '../../data/subscriptionTemplate'
import { syncSubscriptionsFromProjectFile, SUBSCRIPTIONS_FILE_URL } from '../../data/subscriptionSync'
import type { ImportError } from '../../data/importError'
import {
  setSubscriptions,
  useSubscriptions,
  useSubscriptionsLastSyncedAt,
} from '../../data/subscriptionStore'
import { getMonthlyProjection, getNextBillingDate } from '../../data/subscriptionSelectors'
import { formatYearMonth } from '../../data/transactionSelectors'

const currency = new Intl.NumberFormat('ko-KR')

const Subscriptions = () => {
  const subscriptions = useSubscriptions()
  const lastSyncedAt = useSubscriptionsLastSyncedAt()
  const [errors, setErrors] = useState<ImportError[]>([])
  const [syncedCount, setSyncedCount] = useState<number | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    setErrors([])
    setSyncedCount(null)
    try {
      const result = await syncSubscriptionsFromProjectFile()
      if (result.errors.length > 0) {
        setErrors(result.errors)
      } else {
        setSubscriptions(result.subscriptions)
        setSyncedCount(result.subscriptions.length)
      }
    } catch {
      setErrors([{ row: 0, message: '파일을 읽는 중 오류가 발생했습니다. 템플릿 형식을 확인해주세요.' }])
    } finally {
      setIsSyncing(false)
    }
  }

  const thisMonth = formatYearMonth(new Date())
  const monthlyProjection = getMonthlyProjection(subscriptions, thisMonth)
  const activeCount = subscriptions.filter((s) => s.active).length

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>정기 구독 최신화</CCardHeader>
        <CCardBody>
          <p className="text-body-secondary">
            프로젝트의 <code>public{SUBSCRIPTIONS_FILE_URL}</code> 파일을 직접 열어서 수정한 뒤,
            아래 최신화 버튼을 누르면 그 내용으로 반영됩니다. (파일 내용 전체로 교체되며, 오류가
            있으면 반영하지 않고 기존 데이터를 그대로 둡니다.)
          </p>
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <CButton color="primary" disabled={isSyncing} onClick={() => void handleSync()}>
              <CIcon icon={cilReload} className="me-2" />
              {isSyncing ? '불러오는 중...' : '최신화'}
            </CButton>
            <CButton
              color="secondary"
              variant="outline"
              onClick={() => void downloadSubscriptionTemplate()}
            >
              <CIcon icon={cilCloudDownload} className="me-2" />
              양식 참고용 다운로드
            </CButton>
            {lastSyncedAt && (
              <span className="text-body-secondary small">
                마지막 최신화: {new Date(lastSyncedAt).toLocaleString('ko-KR')}
              </span>
            )}
          </div>

          {syncedCount !== null && (
            <CAlert color={syncedCount > 0 ? 'success' : 'warning'} className="mt-3 mb-0">
              {syncedCount}건으로 최신화했습니다.
            </CAlert>
          )}

          {errors.length > 0 && (
            <CAlert color="danger" className="mt-3 mb-0">
              <div className="fw-semibold mb-1">
                파일에 문제가 있어 반영하지 않았습니다. 수정 후 다시 최신화해주세요.
              </div>
              <ul className="mb-0 ps-3">
                {errors.slice(0, 10).map((error, index) => (
                  <li key={index}>
                    {error.row}행: {error.message}
                  </li>
                ))}
                {errors.length > 10 && <li>...외 {errors.length - 10}건</li>}
              </ul>
            </CAlert>
          )}
        </CCardBody>
      </CCard>

      <CRow>
        <CCol xs={12} md={6}>
          <CCard className="mb-4">
            <CCardHeader>이번 달 예상 고정비</CCardHeader>
            <CCardBody className="fs-4">{currency.format(monthlyProjection)}원</CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} md={6}>
          <CCard className="mb-4">
            <CCardHeader>활성 구독 수</CCardHeader>
            <CCardBody className="fs-4">{activeCount}개</CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CCard className="mb-4">
        <CCardHeader>정기 구독 목록 ({subscriptions.length}건)</CCardHeader>
        <CCardBody>
          {subscriptions.length === 0 ? (
            <p className="text-body-secondary mb-0">아직 등록된 정기 구독이 없습니다.</p>
          ) : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>이름</CTableHeaderCell>
                  <CTableHeaderCell>카테고리</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">금액</CTableHeaderCell>
                  <CTableHeaderCell>주기</CTableHeaderCell>
                  <CTableHeaderCell>다음 결제일</CTableHeaderCell>
                  <CTableHeaderCell>상태</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {subscriptions.map((subscription) => {
                  const nextBillingDate = getNextBillingDate(subscription)
                  return (
                    <CTableRow key={subscription.id}>
                      <CTableDataCell>{subscription.name}</CTableDataCell>
                      <CTableDataCell>{subscription.category}</CTableDataCell>
                      <CTableDataCell className="text-end">
                        {currency.format(subscription.amount)}원
                      </CTableDataCell>
                      <CTableDataCell>{subscription.cycle}</CTableDataCell>
                      <CTableDataCell>{nextBillingDate ?? '-'}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={subscription.active ? 'success' : 'secondary'}>
                          {subscription.active ? '활성' : '비활성'}
                        </CBadge>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Subscriptions
