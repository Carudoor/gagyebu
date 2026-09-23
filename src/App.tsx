import { Suspense, lazy } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav'

const Home = lazy(() => import('./views/home/Home'))
const Records = lazy(() => import('./views/records/Records'))
const Settings = lazy(() => import('./views/settings/Settings'))

const App = () => {
  return (
    <HashRouter>
      <div
        className="min-h-dvh flex flex-col"
        style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
      >
        <main
          className="flex-1 overflow-y-auto"
          style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}
        >
          <Suspense
            fallback={
              <div className="p-6 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                불러오는 중...
              </div>
            }
          >
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/records" element={<Records />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Suspense>
        </main>
        <BottomNav />
      </div>
    </HashRouter>
  )
}

export default App
