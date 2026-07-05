import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Sun, Moon, LogOut } from 'lucide-react'

import { RootState, AppDispatch } from '@/store'
import { toggleSidebar, setSidebarOpen, setTheme } from '@/store/slices/uiSlice'
import { logout } from '@/store/slices/authSlice'
import Sidebar from './Sidebar'
import TopNav from './TopNav'

const Layout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { sidebarOpen, theme } = useSelector((state: RootState) => state.ui)
  const { user } = useSelector((state: RootState) => state.auth)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()

  // Check if we're on the POS page - if so, hide sidebar and use full page layout
  const isPOSPage = location.pathname === '/pos'

  useEffect(() => {
    const checkMobile = () => {
      const nextIsMobile = window.innerWidth < 1024
      setIsMobile(nextIsMobile)
      dispatch(setSidebarOpen(!nextIsMobile))
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [dispatch])

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }, [theme])

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar())
  }

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    dispatch(setTheme(newTheme))
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  // POS Page Layout - Full screen without sidebar
  if (isPOSPage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Minimal top bar for POS only */}
        <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AH</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              AlgoHub POS Terminal
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title={`Current theme: ${theme}`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {/* User Menu */}
            {user && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user.firstName} {user.lastName}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* POS Page Content - Full Width */}
        <main className="h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    )
  }

  // Normal Layout with Sidebar
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={handleSidebarToggle}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} isMobile={isMobile} />

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen && !isMobile ? 'lg:ml-64' : ''}`}>
        {/* Top Navigation */}
        <TopNav
          onSidebarToggle={handleSidebarToggle}
          onThemeToggle={handleThemeToggle}
          onLogout={handleLogout}
          user={user}
          theme={theme}
        />

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
