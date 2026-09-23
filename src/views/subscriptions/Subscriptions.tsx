import { useState, type FormEvent } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilPlus, cilReload, cilTrash } from '@coreui/icons'
import { downloadSubscriptionTemplate } from '../../data/subscriptionTemplate'
import { syncSubscriptionsFromProjectFile, SUBSCRIPTIONS_FILE_URL } from '../../data/subscriptionSync'
import type { ImportError } from '../../data/importError'
import type { SubscriptionCycle } from '../../data/subscription'
import {
  addSubscription,
  deleteSubscription,
  mergeSubscriptionsFromFile,
  updateSubscription,
  useSubscriptions,
  useSubscriptionsLastSyncedAt,
} from '../../data/subscriptionStore'
import { getMonthlyProjection, getNextBillingDate } from '../../data/subscriptionSelectors'
import { formatYearMonth } from '../../data/transactionSelectors'

const currency = new Intl.NumberFormat('ko-KR')

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const Subscriptions = () => {
  const subscriptions = useSubscriptions()
  const lastSyncedAt = useSubscriptionsLastSyncedAt()

  // 새 구독 추가 폼
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [billingDay, setBillingDay] = useState('1')
  const [cycle, setCycle] = useState<SubscriptionCycle>('매월')
  const [startDate, setStartDate] = useState(todayStr())
  const [memo, setMemo] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const amountNumber = Number(amount)
    const billingDayNumber = Number(billingDay)
    if (!name.trim() || !category.trim() || !amountNumber || amountNumber <= 0) return
    if (!Number.isInteger(billingDayNumber) || billingDayNumber < 1 || billingDayNumber > 31) return

    addSubscription({
      name: name.trim(),
      category: category.trim(),
      amount: amountNumber,
      billingDay: billingDayNumber,
      cycle,
      startDate,
      active: true,
      memo: memo.trim() || undefined,
    })
    setName('')
    setCategory('')
    setAmount('')
    setMemo('')
  }

  // 엑셀 파일에서 가져오기 (병합)
  const [errors, setErrors] = useState<ImportError[]>([])
  const [addedCount, setAddedCount] = useState<number | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    setErrors([])
    setAddedCount(null)
    try {
      const result = await syncSubscriptionsFromProjectFile()
      if (result.errors.length > 0) {
        setErrors(result.errors)
      } else {
        setAddedCount(mergeSubscriptionsFromFile(result.subscriptions))
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
        <CCardHeader>새 구독 추가</CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <CRow className="g-3 align-items-end">
              <CCol xs={12} md={2}>
                <CFormLabel>이름</CFormLabel>
                <CFormInput value={name} onChange={(e) => setName(e.target.value)} />
              </CCol>
              <CCol xs={6} md={2}>
                <CFormLabel>카테고리</CFormLabel>
                <CFormInput value={category} onChange={(e) => setCategory(e.target.value)} />
              </CCol>
              <CCol xs={6} md={2}>
                <CFormLabel>금액</CFormLabel>
                <CFormInput
                  type="number"
                  min={1}
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </CCol>
              <CCol xs={4} md={1}>
                <CFormLabel>결제일</CFormLabel>
                <CFormInput
                  type="number"
                  min={1}
                  max={31}
                  value={billingDay}
                  onChange={(e) => setBillingDay(e.target.value)}
                />
              </CCol>
              <CCol xs={4} md={1}>
                <CFormLabel>주기</CFormLabel>
                <CFormSelect value={cycle} onChange={(e) => setCycle(e.target.value as SubscriptionCycle)}>
                  <option value="매월">매월</option>
                  <option value="매년">매년</option>
                </CFormSelect>
              </CCol>
              <CCol xs={4} md={2}>
                <CFormLabel>시작일</CFormLabel>
                <CFormInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </CCol>
              <CCol xs={10} md={1}>
                <CFormLabel>메모</CFormLabel>
                <CFormInput value={memo} onChange={(e) => setMemo(e.target.value)} />
              </CCol>
              <CCol xs={2} md={1}>
                <CButton type="submit" color="primary" className="w-100">
                  <CIcon icon={cilPlus} />
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      <CCard className="mb-4">
        <CCardHeader>엑셀에서 가져오기 (선택)</CCardHeader>
        <CCardBody>
          <p className="text-body-secondary">
            여러 구독을 한 번에 넣고 싶을 때, 프로젝트의 <code>public{SUBSCRIPTIONS_FILE_URL}</code>{' '}
            파일을 채워넣고 아래 버튼을 누르면 이미 있는 항목은 건너뛰고 새 항목만 추가됩니다.
          </p>
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <CButton color="secondary" variant="outline" disabled={isSyncing} onClick={() => void handleSync()}>
              <CIcon icon={cilReload} className="me-2" />
              {isSyncing ? '불러오는 중...' : '엑셀에서 가져오기'}
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
                마지막으로 가져온 시각: {new Date(lastSyncedAt).toLocaleString('ko-KR')}
              </span>
            )}
          </div>

          {addedCount !== null && (
            <CAlert color={addedCount > 0 ? 'success' : 'warning'} className="mt-3 mb-0">
              {addedCount > 0 ? `${addedCount}건을 새로 추가했습니다.` : '새로 추가된 항목이 없습니다.'}
            </CAlert>
          )}

          {errors.length > 0 && (
            <CAlert color="danger" className="mt-3 mb-0">
              <div className="fw-semibold mb-1">
                파일에 문제가 있어 가져오지 않았습니다. 수정 후 다시 시도해주세요.
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
                  <CTableHeaderCell> </CTableHeaderCell>
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
                        <CFormCheck
                          checked={subscription.active}
                          label={subscription.active ? '활성' : '비활성'}
                          onChange={(e) =>
                            updateSubscription(subscription.id, { active: e.target.checked })
                          }
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="danger"
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSubscription(subscription.id)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
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
