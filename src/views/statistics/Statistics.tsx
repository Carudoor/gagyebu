import { useMemo, useState } from 'react'
import { CChartDoughnut } from '@coreui/react-chartjs'
import { useTransactions } from '../../data/transactionStore'
import { formatYearMonth, getYearMonth, filterByYearMonth, getCategoryTotals } from '../../data/transactionSelectors'
import { getCategoryColor } from '../../data/categories'

const currency = new Intl.NumberFormat('ko-KR')

const cardClass = 'rounded-2xl p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] mb-4'
const cardStyle = { backgroundColor: 'var(--color-surface)' }

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
      <div className={cardClass} style={cardStyle}>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="h-11 rounded-xl border px-3 text-base"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
        >
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      <div className={cardClass} style={cardStyle}>
        <h2 className="text-base font-semibold mb-3">지출 카테고리별 비중</h2>
        {expenseTotals.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            해당 월에 지출 내역이 없습니다.
          </p>
        ) : (
          <>
            <CChartDoughnut
              className="mb-4"
              data={{
                labels: expenseTotals.map((item) => item.category),
                datasets: [
                  {
                    data: expenseTotals.map((item) => item.amount),
                    backgroundColor: expenseTotals.map((item) => getCategoryColor('지출', item.category)),
                  },
                ],
              }}
              options={{ plugins: { legend: { position: 'bottom' } } }}
            />
            <ul className="flex flex-col divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {expenseTotals.map((item) => (
                <li key={item.category} className="flex justify-between items-center py-2">
                  <span className="flex items-center gap-2 text-sm">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getCategoryColor('지출', item.category) }}
                    />
                    {item.category}
                  </span>
                  <span className="text-sm text-right">
                    {currency.format(item.amount)}원
                    <span className="ml-2" style={{ color: 'var(--color-text-secondary)' }}>
                      {((item.amount / expenseSum) * 100).toFixed(1)}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className={cardClass} style={cardStyle}>
        <h2 className="text-base font-semibold mb-3">수입 출처별 금액</h2>
        {incomeTotals.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            해당 월에 수입 내역이 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {incomeTotals.map((item) => (
              <li key={item.category} className="flex justify-between items-center py-2">
                <span className="flex items-center gap-2 text-sm">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: getCategoryColor('수입', item.category) }}
                  />
                  {item.category}
                </span>
                <span className="text-sm text-right">
                  {currency.format(item.amount)}원
                  <span className="ml-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {((item.amount / incomeSum) * 100).toFixed(1)}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

export default Statistics
