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
      <div className="tw:px-4 tw:pt-6 tw:pb-8 tw:text-center">
        <p className="tw:text-sm tw:mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          아직 등록된 거래가 없습니다.
        </p>
        <Link
          to="/records"
          className="tw:inline-block tw:rounded-xl tw:px-5 tw:py-3 tw:text-sm tw:font-semibold tw:text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          거래 추가하러 가기
        </Link>
      </div>
    )
  }

  return (
    <div className="tw:px-4 tw:pt-4 tw:pb-8 tw:flex tw:flex-col tw:gap-4">
      {/* Hero card */}
      <div
        className="tw:rounded-2xl tw:p-5 tw:text-white"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), #4f46e5)',
        }}
      >
        <p className="tw:text-xs tw:opacity-80 tw:mb-1">{thisMonth} 이번 달 잔액</p>
        <p className="tw:text-2xl tw:font-bold tw:mb-4">{currency.format(balance)}원</p>
        <div className="tw:flex tw:justify-between tw:text-xs tw:opacity-90 tw:mb-1">
          <span>수입 {currency.format(income)}원</span>
          <span>지출 {currency.format(expense)}원</span>
        </div>
        <div className="tw:h-2 tw:rounded-full tw:bg-white/25 tw:overflow-hidden">
          <div
            className="tw:h-full tw:rounded-full tw:bg-white"
            style={{ width: `${spendRatio}%` }}
          />
        </div>
        {income > 0 && (
          <p className="tw:text-xs tw:opacity-80 tw:mt-1">
            이번 달 지출이 수입의 {spendRatio}%예요
          </p>
        )}
      </div>

      {/* 최근 거래 */}
      <div
        className="tw:rounded-2xl tw:p-4 tw:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="tw:flex tw:justify-between tw:items-center tw:mb-3">
          <h2 className="tw:text-base tw:font-semibold">최근 거래</h2>
          <Link to="/records" className="tw:text-xs" style={{ color: 'var(--color-primary)' }}>
            전체 보기
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="tw:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            아직 등록된 거래가 없습니다.
          </p>
        ) : (
          <ul className="tw:flex tw:flex-col tw:divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {recent.map((transaction) => (
              <li key={transaction.id} className="tw:flex tw:justify-between tw:items-center tw:py-2">
                <div className="tw:flex tw:flex-col">
                  <span className="tw:text-sm">{transaction.category}</span>
                  <span className="tw:text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {transaction.date}
                  </span>
                </div>
                <span
                  className="tw:text-sm tw:font-semibold"
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
        className="tw:rounded-2xl tw:p-4 tw:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="tw:flex tw:justify-between tw:items-center tw:mb-3">
          <h2 className="tw:text-base tw:font-semibold">정기 구독</h2>
          <Link to="/settings" className="tw:text-xs" style={{ color: 'var(--color-primary)' }}>
            전체 보기
          </Link>
        </div>
        {activeSubscriptions.length === 0 ? (
          <p className="tw:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            활성화된 정기 구독이 없습니다.
          </p>
        ) : (
          <ul className="tw:flex tw:flex-col tw:divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {activeSubscriptions.map((subscription) => (
              <li key={subscription.id} className="tw:flex tw:justify-between tw:items-center tw:py-2">
                <span className="tw:text-sm">{subscription.name}</span>
                <div className="tw:text-right">
                  <div className="tw:text-sm tw:font-semibold">
                    {currency.format(subscription.amount)}원
                  </div>
                  <div className="tw:text-xs" style={{ color: 'var(--color-text-secondary)' }}>
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
