import { Link } from 'react-router-dom'
import { useTransactions } from '../../data/transactionStore'
import {
  formatYearMonth,
  filterByYearMonth,
  summarize,
  getRecentTransactions,
} from '../../data/transactionSelectors'
import { useSubscriptions } from '../../data/subscriptionStore'
import { getNextBillingDate } from '../../data/subscriptionSelectors'

const currency = new Intl.NumberFormat('ko-KR')

const Home = () => {
  const transactions = useTransactions()
  const subscriptions = useSubscriptions()

  const thisMonth = formatYearMonth(new Date())
  const monthlyTransactions = filterByYearMonth(transactions, thisMonth)
  const { income, expense, balance } = summarize(monthlyTransactions)
  const recent = getRecentTransactions(transactions, 5)
  const activeSubscriptions = subscriptions.filter((s) => s.active).slice(0, 3)

  const spendRatio = income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : 0

  if (transactions.length === 0) {
    return (
      <div className="px-4 pb-8 text-center">
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          아직 등록된 거래가 없습니다.
        </p>
        <Link
          to="/records"
          className="inline-block rounded-xl px-5 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          거래 추가하러 가기
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 pb-8 flex flex-col gap-4">
      {/* Hero card */}
      <div
        className="rounded-2xl p-5 text-white"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), #4f46e5)',
        }}
      >
        <p className="text-xs opacity-80 mb-1">{thisMonth} 이번 달 잔액</p>
        <p className="text-2xl font-bold mb-4">{currency.format(balance)}원</p>
        <div className="flex justify-between text-xs opacity-90 mb-1">
          <span>수입 {currency.format(income)}원</span>
          <span>지출 {currency.format(expense)}원</span>
        </div>
        <div className="h-2 rounded-full bg-white/25 overflow-hidden">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${spendRatio}%` }}
          />
        </div>
        {income > 0 && (
          <p className="text-xs opacity-80 mt-1">
            이번 달 지출이 수입의 {spendRatio}%예요
          </p>
        )}
      </div>

      {/* 최근 거래 */}
      <div
        className="rounded-2xl p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold">최근 거래</h2>
          <Link to="/records" className="text-xs" style={{ color: 'var(--color-primary)' }}>
            전체 보기
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            아직 등록된 거래가 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {recent.map((transaction) => (
              <li key={transaction.id} className="flex justify-between items-center py-2">
                <div className="flex flex-col">
                  <span className="text-sm">{transaction.category}</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {transaction.date}
                  </span>
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: transaction.type === '수입' ? 'var(--color-income)' : 'var(--color-expense)' }}
                >
                  {transaction.type === '수입' ? '+' : '-'}
                  {currency.format(transaction.amount)}원
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 정기 구독 */}
      <div
        className="rounded-2xl p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold">정기 구독</h2>
          <Link to="/settings" className="text-xs" style={{ color: 'var(--color-primary)' }}>
            전체 보기
          </Link>
        </div>
        {activeSubscriptions.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            활성화된 정기 구독이 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {activeSubscriptions.map((subscription) => (
              <li key={subscription.id} className="flex justify-between items-center py-2">
                <span className="text-sm">{subscription.name}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {currency.format(subscription.amount)}원
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    다음 결제 {getNextBillingDate(subscription) ?? '-'}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Home
