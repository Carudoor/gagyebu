import { legacy_createStore as createStore } from 'redux'

export interface RootState {
  sidebarShow: boolean
  sidebarUnfoldable: boolean
  theme: 'light' | 'dark' | 'auto'
}

const initialState: RootState = {
  sidebarShow: true,
  sidebarUnfoldable: false,
  theme: 'light',
}

type Action = { type: 'set' } & Partial<RootState>

const changeState = (state: RootState = initialState, { type, ...rest }: Action): RootState => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    default:
      return state
  }
}

const store = createStore(changeState)
export default store
