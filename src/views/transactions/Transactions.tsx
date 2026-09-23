import { useState, type FormEvent } from 'react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash } from '@coreui/icons'
import BottomSheet from '../../components/BottomSheet'
import { addTransaction, deleteTransaction, useTransactions } from '../../data/transactionStore'
import type { TransactionType } from '../../data/transaction'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  OTHER_EXPENSE_CATEGORY,
  OTHER_INCOME_CATEGORY,
} from '../../data/categories'

const currency = new Intl.NumberFormat('ko-KR')

const fieldClass =
  'h-12 w-full rounded-xl border px-3 text-sm bg-transparent'
const fieldStyle = { borderColor: 'var(--color-border)', color: 'var(--color-text)' }
const labelClass = 'text-xs font-medium mb-1 block'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const Transactions = () => {
  const transactions = useTransactions()
  const [sheetOpen, setSheetOpen] = useState(false)

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

  const resetForm = () => {
    setDate(todayStr())
    setType('지출')
    setCategory(EXPENSE_CATEGORIES[0])
    setAmount('')
    setMemo('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const amountNumber = Number(amount)
    if (!date || !amountNumber || amountNumber <= 0 || !category) return

    addTransaction({ date, type, category, amount: amountNumber, memo: memo.trim() || undefined })
    resetForm()
    setSheetOpen(false)
  }

  return (
    <div className="relative">
      <div
        className="rounded-2xl p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold">거래 내역 ({transactions.length}건)</h2>
        </div>

        {transactions.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            아직 등록된 거래가 없습니다. 오른쪽 아래 + 버튼으로 추가해보세요.
          </p>
        ) : (
          <ul className="flex flex-col divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {transactions.map((transaction) => (
              <li key={transaction.id} className="flex justify-between items-center py-2 gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-sm truncate">{transaction.category}</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {transaction.date}
                    {transaction.memo && ` · ${transaction.memo}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: transaction.type === '수입' ? 'var(--color-income)' : 'var(--color-expense)' }}
                  >
                    {transaction.type === '수입' ? '+' : '-'}
                    {currency.format(transaction.amount)}원
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteTransaction(transaction.id)}
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
        aria-label="새 거래 추가"
      >
        <CIcon icon={cilPlus} size="xl" />
      </button>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="새 거래 추가">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={fieldClass}
                style={fieldStyle}
              />
            </div>
            <div>
              <label className={labelClass}>구분</label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as TransactionType)}
                className={fieldClass}
                style={fieldStyle}
              >
                <option value="지출">지출</option>
                <option value="수입">수입</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={fieldClass}
                style={fieldStyle}
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
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

          <div>
            <label className={labelClass}>메모</label>
            <input
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className={fieldClass}
              style={fieldStyle}
            />
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

export default Transactions
