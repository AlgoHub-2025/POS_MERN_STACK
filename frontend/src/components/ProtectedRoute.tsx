import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  fallbackPath?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  fallbackPath = '/login'
}) => {
  const location = useLocation()

  // Use Redux state for authentication (unified with App.tsx)
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  // Also check localStorage as fallback for demo login
  const localStorageAuth = localStorage.getItem('isAuthenticated') === 'true'

  // Redirect to login if not authenticated via either method
  if (!isAuthenticated && !localStorageAuth) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  // For demo purposes, skip permission checks
  return <>{children}</>
}

export default ProtectedRoute
