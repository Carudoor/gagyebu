import type { ReactElement } from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilCalendar,
  cilChart,
  cilChartPie,
  cilCloudDownload,
  cilSpeedometer,
  cilWallet,
} from '@coreui/icons'

export type NavEntry =
  | { type: 'title'; name: string }
  | { type: 'link'; name: string; to: string; icon: ReactElement }

const _nav: NavEntry[] = [
  { type: 'title', name: '가계부' },
  {
    type: 'link',
    name: '대시보드',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    type: 'link',
    name: '거래 내역',
    to: '/transactions',
    icon: <CIcon icon={cilWallet} customClassName="nav-icon" />,
  },
  {
    type: 'link',
    name: '카테고리별 통계',
    to: '/statistics',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
  },
  {
    type: 'link',
    name: '그래프',
    to: '/charts',
    icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
  },
  {
    type: 'link',
    name: '정기 구독 관리',
    to: '/subscriptions',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
  {
    type: 'link',
    name: '백업',
    to: '/backup',
    icon: <CIcon icon={cilCloudDownload} customClassName="nav-icon" />,
  },
]

export default _nav
