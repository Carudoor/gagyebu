import { useState, type FormEvent } from 'react'
import {
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
import { cilPlus, cilTrash } from '@coreui/icons'
import { addTransaction, deleteTransaction, useTransactions } from '../../data/transactionStore'
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
