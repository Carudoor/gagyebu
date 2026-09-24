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
    <div>
      <div className="px-4 mb-4">
        <div
          className="flex rounded-xl p-1"
          style={{ backgroundColor: 'var(--color-border)' }}
        >
          {segments.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSegment(s.key)}
              className="flex-1 rounded-lg py-2 text-sm font-medium transition-colors"
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

      <div className="px-4">
        {segment === 'transactions' && <Transactions />}
        {segment === 'statistics' && <Statistics />}
        {segment === 'charts' && <Charts />}
      </div>
    </div>
  )
}

export default Records
