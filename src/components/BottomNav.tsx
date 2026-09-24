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
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className="flex flex-col items-center gap-1 px-6 py-2 text-xs"
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
