import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

const Dashboard = lazy(() => import('./views/dashboard/Dashboard'))
const Transactions = lazy(() => import('./views/transactions/Transactions'))
const Statistics = lazy(() => import('./views/statistics/Statistics'))
const Charts = lazy(() => import('./views/charts/Charts'))
const Subscriptions = lazy(() => import('./views/subscriptions/Subscriptions'))

export interface AppRoute {
  path: string
  name: string
  element: LazyExoticComponent<ComponentType>
}

const routes: AppRoute[] = [
  { path: '/dashboard', name: '대시보드', element: Dashboard },
  { path: '/transactions', name: '거래 내역', element: Transactions },
  { path: '/statistics', name: '카테고리별 통계', element: Statistics },
  { path: '/charts', name: '그래프', element: Charts },
  { path: '/subscriptions', name: '정기 구독 관리', element: Subscriptions },
]

export default routes
