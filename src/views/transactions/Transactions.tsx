import { useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilReload } from '@coreui/icons'
import { downloadTransactionTemplate } from '../../data/transactionTemplate'
import { syncTransactionsFromProjectFile, TRANSACTIONS_FILE_URL } from '../../data/transactionSync'
import type { ImportError } from '../../data/transactionImport'
import { setTransactions, useLastSyncedAt, useTransactions } from '../../data/transactionStore'

const currency = new Intl.NumberFormat('ko-KR')

const Transactions = () => {
  const transactions = useTransactions()
  const lastSyncedAt = useLastSyncedAt()
  const [errors, setErrors] = useState<ImportError[]>([])
  const [syncedCount, setSyncedCount] = useState<number | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    setErrors([])
    setSyncedCount(null)
    try {
      const result = await syncTransactionsFromProjectFile()
      if (result.errors.length > 0) {
        // 파일에 문제가 있으면 기존 데이터를 지우지 않고 반영을 보류한다.
        setErrors(result.errors)
      } else {
        setTransactions(result.transactions)
        setSyncedCount(result.transactions.length)
      }
    } catch {
      setErrors([{ row: 0, message: '파일을 읽는 중 오류가 발생했습니다. 템플릿 형식을 확인해주세요.' }])
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>거래 내역 최신화</CCardHeader>
        <CCardBody>
          <p className="text-body-secondary">
            프로젝트의 <code>public{TRANSACTIONS_FILE_URL}</code> 파일을 직접 열어서
            날짜/금액/구분/카테고리/메모를 수정한 뒤, 아래 최신화 버튼을 누르면 그 내용으로
            반영됩니다. (파일 내용 전체로 교체됩니다. 파일에 오류가 있으면 반영하지 않고
            기존 데이터를 그대로 둡니다.)
          </p>
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <CButton color="primary" disabled={isSyncing} onClick={() => void handleSync()}>
              <CIcon icon={cilReload} className="me-2" />
              {isSyncing ? '불러오는 중...' : '최신화'}
            </CButton>
            <CButton
              color="secondary"
              variant="outline"
              onClick={() => void downloadTransactionTemplate()}
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

      <CCard className="mb-4">
        <CCardHeader>거래 내역 ({transactions.length}건)</CCardHeader>
        <CCardBody>
          {transactions.length === 0 ? (
            <p className="text-body-secondary mb-0">아직 등록된 거래가 없습니다.</p>
          ) : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>날짜</CTableHeaderCell>
                  <CTableHeaderCell>구분</CTableHeaderCell>
                  <CTableHeaderCell>카테고리</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">금액</CTableHeaderCell>
                  <CTableHeaderCell>메모</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {transactions.map((transaction) => (
                  <CTableRow key={transaction.id}>
                    <CTableDataCell>{transaction.date}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={transaction.type === '수입' ? 'success' : 'danger'}>
                        {transaction.type}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{transaction.category}</CTableDataCell>
                    <CTableDataCell className="text-end">
                      {currency.format(transaction.amount)}원
                    </CTableDataCell>
                    <CTableDataCell>{transaction.memo}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Transactions
