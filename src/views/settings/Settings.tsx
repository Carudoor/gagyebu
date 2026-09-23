import { useState } from 'react'
import Subscriptions from '../subscriptions/Subscriptions'
import Backup from '../backup/Backup'
import { applyTheme, getStoredThemeMode, type ThemeMode } from '../../theme'

type Segment = 'subscriptions' | 'backup'

const segments: { key: Segment; label: string }[] = [
  { key: 'subscriptions', label: '정기 구독' },
  { key: 'backup', label: '백업' },
]

const themeOptions: { key: ThemeMode; label: string }[] = [
  { key: 'light', label: '라이트' },
  { key: 'dark', label: '다크' },
  { key: 'auto', label: '자동' },
]

const Settings = () => {
  const [segment, setSegment] = useState<Segment>('subscriptions')
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredThemeMode())

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode)
    applyTheme(mode)
  }

  return (
    <div className="tw:pt-4">
      <div
        className="tw:mx-4 tw:mb-4 tw:rounded-2xl tw:p-4 tw:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <h2 className="tw:text-base tw:font-semibold tw:mb-3">테마</h2>
        <div className="tw:flex tw:rounded-xl tw:p-1" style={{ backgroundColor: 'var(--color-border)' }}>
          {themeOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => handleThemeChange(option.key)}
              className="tw:flex-1 tw:rounded-lg tw:py-2 tw:text-sm tw:font-medium"
              style={
                themeMode === option.key
                  ? { backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }
                  : { color: 'var(--color-text-secondary)' }
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tw:px-4 tw:mb-4">
        <div className="tw:flex tw:rounded-xl tw:p-1" style={{ backgroundColor: 'var(--color-border)' }}>
          {segments.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSegment(s.key)}
              className="tw:flex-1 tw:rounded-lg tw:py-2 tw:text-sm tw:font-medium"
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
        {segment === 'subscriptions' && <Subscriptions />}
        {segment === 'backup' && <Backup />}
      </div>
    </div>
  )
}

export default Settings
