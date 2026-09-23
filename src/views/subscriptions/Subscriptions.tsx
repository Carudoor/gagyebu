import { useState, type FormEvent } from 'react'
import {
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
import { cilPlus, cilTrash } from '@coreui/icons'
import type { SubscriptionCycle } from '../../data/subscription'
import {
  addSubscription,
  deleteSubscription,
  updateSubscription,
  useSubscriptions,
} from '../../data/subscriptionStore'
import { getMonthlyProjection, getNextBillingDate } from '../../data/subscriptionSelectors'
import { formatYearMonth } from '../../data/transactionSelectors'

const currency = new Intl.NumberFormat('ko-KR')

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const Subscriptions = () => {
  const subscriptions = useSubscriptions()

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
            <CTable hover responsive className="text-nowrap">
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
