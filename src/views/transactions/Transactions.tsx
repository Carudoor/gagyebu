import { useState, type FormEvent } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
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
import { downloadTransactionTemplate } from '../../data/transactionTemplate'
import { syncTransactionsFromProjectFile, TRANSACTIONS_FILE_URL } from '../../data/transactionSync'
import type { ImportError } from '../../data/importError'
import {
  addTransaction,
  deleteTransaction,
  mergeTransactionsFromFile,
  useLastSyncedAt,
  useTransactions,
} from '../../data/transactionStore'
import type { TransactionType } from '../../data/transaction'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  OTHER_EXPENSE_CATEGORY,
  OTHER_INCOME_CATEGORY,
} from '../../data/categories'

const currency = new Intl.NumberFormat('ko-KR')

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const Transactions = () => {
  const transactions = useTransactions()
  const lastSyncedAt = useLastSyncedAt()

  // 새 거래 추가 폼
  const [date, setDate] = useState(todayStr())
  const [type, setType] = useState<TransactionType>('지출')
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')

  const categoryOptions =
    type === '수입' ? [...INCOME_CATEGORIES, OTHER_INCOME_CATEGORY] : [...EXPENSE_CATEGORIES, OTHER_EXPENSE_CATEGORY]

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType)
    setCategory(newType === '수입' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0])
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const amountNumber = Number(amount)
    if (!date || !amountNumber || amountNumber <= 0 || !category) return

    addTransaction({ date, type, category, amount: amountNumber, memo: memo.trim() || undefined })
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
      const result = await syncTransactionsFromProjectFile()
      if (result.errors.length > 0) {
        setErrors(result.errors)
      } else {
        setAddedCount(mergeTransactionsFromFile(result.transactions))
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
        <CCardHeader>새 거래 추가</CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <CRow className="g-3 align-items-end">
              <CCol xs={6} md={2}>
                <CFormLabel>날짜</CFormLabel>
                <CFormInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </CCol>
              <CCol xs={6} md={2}>
                <CFormLabel>구분</CFormLabel>
                <CFormSelect
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value as TransactionType)}
                >
                  <option value="지출">지출</option>
                  <option value="수입">수입</option>
                </CFormSelect>
              </CCol>
              <CCol xs={6} md={3}>
                <CFormLabel>카테고리</CFormLabel>
                <CFormSelect value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </CFormSelect>
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
              <CCol xs={12} md={2}>
                <CFormLabel>메모</CFormLabel>
                <CFormInput value={memo} onChange={(e) => setMemo(e.target.value)} />
              </CCol>
              <CCol xs={12} md={1}>
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
            과거 내역을 한 번에 넣고 싶을 때, 프로젝트의 <code>public{TRANSACTIONS_FILE_URL}</code>{' '}
            파일에 날짜/금액/구분/카테고리/메모를 채워넣고 아래 버튼을 누르면 이미 있는 항목은
            건너뛰고 새 항목만 추가됩니다.
          </p>
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <CButton color="secondary" variant="outline" disabled={isSyncing} onClick={() => void handleSync()}>
              <CIcon icon={cilReload} className="me-2" />
              {isSyncing ? '불러오는 중...' : '엑셀에서 가져오기'}
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
                  <CTableHeaderCell> </CTableHeaderCell>
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
                    <CTableDataCell>
                      <CButton
                        color="danger"
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTransaction(transaction.id)}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
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
