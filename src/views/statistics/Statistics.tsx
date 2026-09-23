import { useMemo, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { CChartDoughnut } from '@coreui/react-chartjs'
import { useTransactions } from '../../data/transactionStore'
import { formatYearMonth, getYearMonth, filterByYearMonth, getCategoryTotals } from '../../data/transactionSelectors'
import { getCategoryColor } from '../../data/categories'

const currency = new Intl.NumberFormat('ko-KR')

const Statistics = () => {
  const transactions = useTransactions()

  const monthOptions = useMemo(() => {
    const months = new Set(transactions.map((t) => getYearMonth(t.date)))
    months.add(formatYearMonth(new Date()))
    return [...months].sort((a, b) => b.localeCompare(a))
  }, [transactions])

  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0])
  const monthTransactions = filterByYearMonth(transactions, selectedMonth)

  const expenseTotals = getCategoryTotals(monthTransactions, '지출')
  const incomeTotals = getCategoryTotals(monthTransactions, '수입')
  const expenseSum = expenseTotals.reduce((sum, item) => sum + item.amount, 0)
  const incomeSum = incomeTotals.reduce((sum, item) => sum + item.amount, 0)

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>카테고리별 통계</CCardHeader>
        <CCardBody>
          <CFormSelect
            style={{ maxWidth: 200 }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </CFormSelect>
        </CCardBody>
      </CCard>

      <CRow>
        <CCol xs={12} lg={6}>
          <CCard className="mb-4">
            <CCardHeader>지출 카테고리별 비중</CCardHeader>
            <CCardBody>
              {expenseTotals.length === 0 ? (
                <p className="text-body-secondary mb-0">해당 월에 지출 내역이 없습니다.</p>
              ) : (
                <>
                  <CChartDoughnut
                    className="mb-4"
                    data={{
                      labels: expenseTotals.map((item) => item.category),
                      datasets: [
                        {
                          data: expenseTotals.map((item) => item.amount),
                          backgroundColor: expenseTotals.map((item) =>
                            getCategoryColor('지출', item.category),
                          ),
                        },
                      ],
                    }}
                    options={{ plugins: { legend: { position: 'bottom' } } }}
                  />
                  <CTable small>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>카테고리</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">금액</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">비중</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {expenseTotals.map((item) => (
                        <CTableRow key={item.category}>
                          <CTableDataCell>
                            <span
                              className="d-inline-block rounded-circle me-2"
                              style={{
                                width: 10,
                                height: 10,
                                backgroundColor: getCategoryColor('지출', item.category),
                              }}
                            />
                            {item.category}
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
                            {currency.format(item.amount)}원
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
                            {((item.amount / expenseSum) * 100).toFixed(1)}%
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} lg={6}>
          <CCard className="mb-4">
            <CCardHeader>수입 출처별 금액</CCardHeader>
            <CCardBody>
              {incomeTotals.length === 0 ? (
                <p className="text-body-secondary mb-0">해당 월에 수입 내역이 없습니다.</p>
              ) : (
                <CTable small>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>카테고리</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">금액</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">비중</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {incomeTotals.map((item) => (
                      <CTableRow key={item.category}>
                        <CTableDataCell>
                          <span
                            className="d-inline-block rounded-circle me-2"
                            style={{
                              width: 10,
                              height: 10,
                              backgroundColor: getCategoryColor('수입', item.category),
                            }}
                          />
                          {item.category}
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          {currency.format(item.amount)}원
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          {((item.amount / incomeSum) * 100).toFixed(1)}%
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Statistics
