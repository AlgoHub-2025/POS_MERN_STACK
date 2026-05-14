import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { setTheme } from '@/store/slices/uiSlice'

type Theme = 'light' | 'dark' | 'system'

export const useDarkMode = () => {
  const dispatch = useDispatch()
  const { theme } = useSelector((state: RootState) => state.ui)
  const [isDark, setIsDark] = useState(false)
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light')

    const handleChange = (e: MediaQueryListEvent) => {
      const newPreference = e.matches ? 'dark' : 'light'
      setSystemPreference(newPreference)
      
      // If user has selected 'system' theme, update accordingly
      if (theme === 'system') {
        setIsDark(e.matches)
        updateDocumentClass(e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  useEffect(() => {
    // Determine actual theme based on user preference
    let actualTheme: 'light' | 'dark'
    
    switch (theme) {
      case 'light':
        actualTheme = 'light'
        break
      case 'dark':
        actualTheme = 'dark'
        break
      case 'system':
        actualTheme = systemPreference
        break
      default:
        actualTheme = systemPreference
    }
    
    setIsDark(actualTheme === 'dark')
    updateDocumentClass(actualTheme === 'dark')
  }, [theme, systemPreference])

  const updateDocumentClass = (dark: boolean) => {
    const root = document.documentElement
    
    if (dark) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }

  const toggleTheme = () => {
    const newTheme: Theme = isDark ? 'light' : 'dark'
    dispatch(setTheme(newTheme))
  }

  const setThemeMode = (newTheme: Theme) => {
    dispatch(setTheme(newTheme))
  }

  return {
    isDark,
    theme,
    systemPreference,
    toggleTheme,
    setThemeMode
  }
}
