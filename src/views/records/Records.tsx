import { useState } from 'react'
import Transactions from '../transactions/Transactions'
import Statistics from '../statistics/Statistics'
import Charts from '../charts/Charts'

type Segment = 'transactions' | 'statistics' | 'charts'

const segments: { key: Segment; label: string }[] = [
  { key: 'transactions', label: '거래' },
  { key: 'statistics', label: '통계' },
  { key: 'charts', label: '그래프' },
]

const Records = () => {
  const [segment, setSegment] = useState<Segment>('transactions')

  return (
    <div className="tw:pt-4">
      <div className="tw:px-4 tw:mb-4">
        <div
          className="tw:flex tw:rounded-xl tw:p-1"
          style={{ backgroundColor: 'var(--color-border)' }}
        >
          {segments.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSegment(s.key)}
              className="tw:flex-1 tw:rounded-lg tw:py-2 tw:text-sm tw:font-medium tw:transition-colors"
              style={
                segment === s.key
                  ? { backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }
                  : { color: 'var(--color-text-secondary)' }
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tw:px-2">
        {segment === 'transactions' && <Transactions />}
        {segment === 'statistics' && <Statistics />}
        {segment === 'charts' && <Charts />}
      </div>
    </div>
  )
}

export default Records
