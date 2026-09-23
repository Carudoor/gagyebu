import { Link } from 'react-router-dom'
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCreditCard } from '@coreui/icons'
import { useLastSyncedAt, useTransactions } from '../../data/transactionStore'
import {
  formatYearMonth,
  filterByYearMonth,
  summarize,
  getRecentTransactions,
} from '../../data/transactionSelectors'
import { useSubscriptions } from '../../data/subscriptionStore'
import { getNextBillingDate } from '../../data/subscriptionSelectors'
import { getCategoryColor } from '../../data/categories'

const currency = new Intl.NumberFormat('ko-KR')

const Dashboard = () => {
  const transactions = useTransactions()
  const lastSyncedAt = useLastSyncedAt()
  const subscriptions = useSubscriptions()

  const thisMonth = formatYearMonth(new Date())
  const monthlyTransactions = filterByYearMonth(transactions, thisMonth)
  const { income, expense, balance } = summarize(monthlyTransactions)
  const recent = getRecentTransactions(transactions, 5)
  const activeSubscriptions = subscriptions.filter((s) => s.active)

  return (
    <>
      {transactions.length === 0 ? (
        <CCard className="mb-4">
          <CCardHeader>대시보드</CCardHeader>
          <CCardBody className="text-center py-5">
            <p className="text-body-secondary mb-3">아직 등록된 거래가 없습니다.</p>
            <CButton color="primary" as={Link} to="/transactions">
              거래 내역 추가하러 가기
            </CButton>
          </CCardBody>
        </CCard>
      ) : (
        <>
          {lastSyncedAt && (
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-body-secondary small">
                마지막으로 엑셀에서 가져온 시각: {new Date(lastSyncedAt).toLocaleString('ko-KR')}
              </span>
            </div>
          )}
          <CRow>
            <CCol xs={12} md={4}>
              <CCard className="mb-4">
                <CCardHeader>이번 달 수입</CCardHeader>
                <CCardBody className="fs-4 text-success">{currency.format(income)}원</CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} md={4}>
              <CCard className="mb-4">
                <CCardHeader>이번 달 지출</CCardHeader>
                <CCardBody className="fs-4 text-danger">{currency.format(expense)}원</CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} md={4}>
              <CCard className="mb-4">
                <CCardHeader>이번 달 잔액</CCardHeader>
                <CCardBody className={`fs-4 ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
                  {currency.format(balance)}원
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
          <CCard className="mb-4">
            <CCardHeader>최근 거래</CCardHeader>
            <CCardBody>
              {recent.length === 0 ? (
                <p className="text-body-secondary mb-0">아직 등록된 거래가 없습니다.</p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {recent.map((transaction) => (
                    <li
                      key={transaction.id}
                      className="d-flex justify-content-between align-items-center py-2 border-bottom"
                    >
                      <div>
                        <span className="text-body-secondary me-2">{transaction.date}</span>
                        <CBadge
                          color={transaction.type === '수입' ? 'success' : 'danger'}
                          className="me-2"
                        >
                          {transaction.type}
                        </CBadge>
                        {transaction.category}
                      </div>
                      <div>{currency.format(transaction.amount)}원</div>
                    </li>
                  ))}
                </ul>
              )}
            </CCardBody>
          </CCard>
        </>
      )}

      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          정기 구독
          <Link to="/subscriptions" className="small">
            전체 보기
          </Link>
        </CCardHeader>
        <CCardBody>
          {activeSubscriptions.length === 0 ? (
            <p className="text-body-secondary mb-0">활성화된 정기 구독이 없습니다.</p>
          ) : (
            <CRow>
              {activeSubscriptions.map((subscription) => (
                <CCol key={subscription.id} xs={6} sm={4} md={3} xl={2} className="mb-3">
                  <div className="border rounded p-3 h-100 d-flex flex-column align-items-center text-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3 mb-2"
                      style={{
                        width: 56,
                        height: 56,
                        backgroundColor: getCategoryColor('지출', subscription.category),
                      }}
                    >
                      <CIcon icon={cilCreditCard} size="xl" className="text-white" />
                    </div>
                    <div className="fw-semibold text-truncate w-100">{subscription.name}</div>
                    <div className="text-body-secondary small">
                      {currency.format(subscription.amount)}원 · {subscription.cycle}
                    </div>
                    <div className="text-body-secondary small">
                      다음 결제 {getNextBillingDate(subscription) ?? '-'}
                    </div>
                  </div>
                </CCol>
              ))}
            </CRow>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Dashboard
