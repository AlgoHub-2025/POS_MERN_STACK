import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    timestamp: number
    read: boolean
  }>
  loading: {
    global: boolean
    [key: string]: boolean
  }
  modals: {
    [key: string]: boolean
  }
  breadcrumbs: Array<{
    label: string
    href?: string
  }>
  pageTitle: string
  pageDescription?: string
}

const initialState: UIState = {
  theme: 'system',
  sidebarOpen: true,
  notifications: [],
  loading: {
    global: false,
  },
  modals: {},
  breadcrumbs: [],
  pageTitle: '',
  pageDescription: undefined,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id' | 'timestamp' | 'read'>>) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
      }
      state.notifications.unshift(notification)
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50)
      }
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.read = true
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true
      })
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.loading
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false
    },
    closeAllModals: (state) => {
      state.modals = {}
    },
    setBreadcrumbs: (state, action: PayloadAction<UIState['breadcrumbs']>) => {
      state.breadcrumbs = action.payload
    },
    addBreadcrumb: (state, action: PayloadAction<{ label: string; href?: string }>) => {
      state.breadcrumbs.push(action.payload)
    },
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload
    },
    setPageDescription: (state, action: PayloadAction<string | undefined>) => {
      state.pageDescription = action.payload
    },
  },
})

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearNotifications,
  setLoading,
  setGlobalLoading,
  openModal,
  closeModal,
  closeAllModals,
  setBreadcrumbs,
  addBreadcrumb,
  setPageTitle,
  setPageDescription,
} = uiSlice.actions

// Selectors
export const selectTheme = (state: { ui: UIState }) => state.ui.theme
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications
export const selectUnreadNotifications = (state: { ui: UIState }) => 
  state.ui.notifications.filter(n => !n.read)
export const selectUnreadNotificationCount = (state: { ui: UIState }) => 
  state.ui.notifications.filter(n => !n.read).length
export const selectLoading = (state: { ui: UIState }) => state.ui.loading
export const selectGlobalLoading = (state: { ui: UIState }) => state.ui.loading.global
export const selectModals = (state: { ui: UIState }) => state.ui.modals
export const selectBreadcrumbs = (state: { ui: UIState }) => state.ui.breadcrumbs
export const selectPageTitle = (state: { ui: UIState }) => state.ui.pageTitle
export const selectPageDescription = (state: { ui: UIState }) => state.ui.pageDescription

export default uiSlice.reducer
