import { useState, type FormEvent } from 'react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash } from '@coreui/icons'
import BottomSheet from '../../components/BottomSheet'
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

const cardClass = 'rounded-2xl p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] mb-4'
const cardStyle = { backgroundColor: 'var(--color-surface)' }
const fieldClass = 'h-12 w-full rounded-xl border px-3 text-sm bg-transparent'
const fieldStyle = { borderColor: 'var(--color-border)', color: 'var(--color-text)' }
const labelClass = 'text-xs font-medium mb-1 block'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const Subscriptions = () => {
  const subscriptions = useSubscriptions()
  const [sheetOpen, setSheetOpen] = useState(false)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [billingDay, setBillingDay] = useState('1')
  const [cycle, setCycle] = useState<SubscriptionCycle>('매월')
  const [startDate, setStartDate] = useState(todayStr())
  const [memo, setMemo] = useState('')

  const resetForm = () => {
    setName('')
    setCategory('')
    setAmount('')
    setBillingDay('1')
    setCycle('매월')
    setStartDate(todayStr())
    setMemo('')
  }

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
    resetForm()
    setSheetOpen(false)
  }

  const thisMonth = formatYearMonth(new Date())
  const monthlyProjection = getMonthlyProjection(subscriptions, thisMonth)
  const activeCount = subscriptions.filter((s) => s.active).length

  return (
    <div className="relative">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={cardClass.replace('mb-4', '')} style={cardStyle}>
          <p className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            이번 달 예상 고정비
          </p>
          <p className="text-lg font-bold">{currency.format(monthlyProjection)}원</p>
        </div>
        <div className={cardClass.replace('mb-4', '')} style={cardStyle}>
          <p className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            활성 구독 수
          </p>
          <p className="text-lg font-bold">{activeCount}개</p>
        </div>
      </div>

      <div className={cardClass} style={cardStyle}>
        <h2 className="text-base font-semibold mb-3">
          정기 구독 목록 ({subscriptions.length}건)
        </h2>
        {subscriptions.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            아직 등록된 정기 구독이 없습니다. 오른쪽 아래 + 버튼으로 추가해보세요.
          </p>
        ) : (
          <ul className="flex flex-col divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {subscriptions.map((subscription) => (
              <li key={subscription.id} className="flex justify-between items-center py-3 gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{subscription.name}</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {subscription.category} · {subscription.cycle} · 다음 결제{' '}
                    {getNextBillingDate(subscription) ?? '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold">{currency.format(subscription.amount)}원</span>
                  <button
                    type="button"
                    onClick={() => updateSubscription(subscription.id, { active: !subscription.active })}
                    className="rounded-full px-2 py-1 text-xs font-medium"
                    style={
                      subscription.active
                        ? { backgroundColor: 'color-mix(in srgb, var(--color-income) 15%, transparent)', color: 'var(--color-income)' }
                        : { backgroundColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }
                    }
                  >
                    {subscription.active ? '활성' : '비활성'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSubscription(subscription.id)}
                    className="p-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                    aria-label="삭제"
                  >
                    <CIcon icon={cilTrash} size="sm" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="fixed z-30 flex items-center justify-center h-14 w-14 rounded-full text-white shadow-lg"
        style={{
          backgroundColor: 'var(--color-primary)',
          right: '1.25rem',
          bottom: 'calc(5.5rem + env(safe-area-inset-bottom))',
        }}
        aria-label="새 구독 추가"
      >
        <CIcon icon={cilPlus} size="xl" />
      </button>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="새 구독 추가">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className={labelClass}>이름</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} style={fieldStyle} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>카테고리</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={fieldClass}
                style={fieldStyle}
              />
            </div>
            <div>
              <label className={labelClass}>금액</label>
              <input
                type="number"
                min={1}
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={fieldClass}
                style={fieldStyle}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>결제일</label>
              <input
                type="number"
                min={1}
                max={31}
                value={billingDay}
                onChange={(e) => setBillingDay(e.target.value)}
                className={fieldClass}
                style={fieldStyle}
              />
            </div>
            <div>
              <label className={labelClass}>주기</label>
              <select
                value={cycle}
                onChange={(e) => setCycle(e.target.value as SubscriptionCycle)}
                className={fieldClass}
                style={fieldStyle}
              >
                <option value="매월">매월</option>
                <option value="매년">매년</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={fieldClass}
                style={fieldStyle}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>메모</label>
            <input value={memo} onChange={(e) => setMemo(e.target.value)} className={fieldClass} style={fieldStyle} />
          </div>
          <button
            type="submit"
            className="h-13 w-full rounded-xl py-3 text-white font-semibold mt-2"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            저장하기
          </button>
        </form>
      </BottomSheet>
    </div>
  )
}

export default Subscriptions
