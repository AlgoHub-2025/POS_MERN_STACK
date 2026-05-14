import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { useSelector } from 'react-redux'
import { combineReducers } from '@reduxjs/toolkit'

// Import slices (will be created as we build them)
import authSlice from './slices/authSlice'
import uiSlice from './slices/uiSlice'
import tenantSlice from './slices/tenantSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui'], // Only persist auth and ui state
  blacklist: ['tenant'], // Don't persist tenant state as it should be fetched fresh
}

const rootReducer = combineReducers({
  auth: authSlice,
  ui: uiSlice,
  tenant: tenantSlice,
  // Add more reducers as we create them
  // products: productsSlice,
  // sales: salesSlice,
  // inventory: inventorySlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
  devTools: true,
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Export typed hooks
export const useAppDispatch = () => store.dispatch
export const useAppSelector = <T>(selector: (state: RootState) => T) => {
  return useSelector(selector)
}
