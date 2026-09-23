export type ThemeMode = 'light' | 'dark' | 'auto'

const STORAGE_KEY = '가계부-theme'

function resolveEffective(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

// data-theme는 이 앱의 새 디자인 토큰(index.css)이 쓰고,
// data-coreui-theme은 CoreUI 컴포넌트를 그대로 쓰는 화면(기록/설정 일부)이
// 따라가는 값이라 두 속성을 같이 맞춰준다.
export function applyTheme(mode: ThemeMode) {
  const effective = resolveEffective(mode)
  document.documentElement.dataset.theme = effective
  document.documentElement.dataset.coreuiTheme = effective
  localStorage.setItem(STORAGE_KEY, mode)
}

export function getStoredThemeMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' || stored === 'auto' ? stored : 'auto'
}

export function initTheme() {
  applyTheme(getStoredThemeMode())
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getStoredThemeMode() === 'auto') applyTheme('auto')
  })
}
