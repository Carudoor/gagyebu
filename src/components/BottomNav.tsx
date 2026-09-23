import { NavLink } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilHome, cilListRich, cilSettings } from '@coreui/icons'

const tabs = [
  { to: '/home', label: '홈', icon: cilHome },
  { to: '/records', label: '기록', icon: cilListRich },
  { to: '/settings', label: '설정', icon: cilSettings },
]

const BottomNav = () => {
  return (
    <nav
      className="tw:fixed tw:bottom-0 tw:left-0 tw:right-0 tw:z-40 tw:flex tw:justify-around tw:border-t tw:backdrop-blur-md"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundColor: 'color-mix(in srgb, var(--color-surface) 85%, transparent)',
        borderColor: 'var(--color-border)',
      }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className="tw:flex tw:flex-col tw:items-center tw:gap-1 tw:px-6 tw:py-2 tw:text-xs"
          style={({ isActive }) => ({
            color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
          })}
        >
          <CIcon icon={tab.icon} size="lg" />
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
