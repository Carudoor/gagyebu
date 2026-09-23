import { CChartBar } from '@coreui/react-chartjs'
import { useTransactions } from '../../data/transactionStore'
import { getMonthlySeries, getCategoryMonthlySeries } from '../../data/transactionSelectors'
import { EXPENSE_CATEGORIES, OTHER_EXPENSE_CATEGORY, getCategoryColor } from '../../data/categories'

const MONTH_COUNT = 6

const cardClass = 'rounded-2xl p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] mb-4'
const cardStyle = { backgroundColor: 'var(--color-surface)' }

const Charts = () => {
  const transactions = useTransactions()
  const monthlySeries = getMonthlySeries(transactions, MONTH_COUNT)
  const categoryMonthlySeries = getCategoryMonthlySeries(transactions, '지출', MONTH_COUNT)

  const hasAnyExpense = categoryMonthlySeries.some((month) => month.totals.length > 0)
  // 스택 순서를 categories.ts 순서로 고정하고, 목록에 없는 값은 전부 '기타 지출'로 묶는다.
  const expenseCategoryOrder = [...EXPENSE_CATEGORIES, OTHER_EXPENSE_CATEGORY]

  return (
    <>
      <div className={cardClass} style={cardStyle}>
        <h2 className="text-base font-semibold mb-3">
          월별 수입 · 지출 · 잔액 (최근 {MONTH_COUNT}개월)
        </h2>
        <CChartBar
          data={{
            labels: monthlySeries.map((m) => m.yearMonth),
            datasets: [
              { label: '수입', backgroundColor: '#008300', data: monthlySeries.map((m) => m.income) },
              { label: '지출', backgroundColor: '#e34948', data: monthlySeries.map((m) => m.expense) },
              { label: '잔액', backgroundColor: '#2a78d6', data: monthlySeries.map((m) => m.balance) },
            ],
          }}
          options={{ plugins: { legend: { position: 'bottom' } } }}
        />
      </div>

      <div className={cardClass} style={cardStyle}>
        <h2 className="text-base font-semibold mb-3">
          카테고리별 지출 추이 (최근 {MONTH_COUNT}개월)
        </h2>
        {!hasAnyExpense ? (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            최근 {MONTH_COUNT}개월간 지출 내역이 없습니다.
          </p>
        ) : (
          <CChartBar
            data={{
              labels: categoryMonthlySeries.map((m) => m.yearMonth),
              datasets: expenseCategoryOrder.map((category) => ({
                label: category,
                backgroundColor: getCategoryColor('지출', category),
                data: categoryMonthlySeries.map((m) => {
                  if (category === OTHER_EXPENSE_CATEGORY) {
                    return m.totals
                      .filter((t) => !(EXPENSE_CATEGORIES as readonly string[]).includes(t.category))
                      .reduce((sum, t) => sum + t.amount, 0)
                  }
                  return m.totals.find((t) => t.category === category)?.amount ?? 0
                }),
              })),
            }}
            options={{
              plugins: { legend: { position: 'bottom' } },
              scales: { x: { stacked: true }, y: { stacked: true } },
            }}
          />
        )}
      </div>
    </>
  )
}

export default Charts
