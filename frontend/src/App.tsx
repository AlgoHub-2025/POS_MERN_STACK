import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'

// Import pages
import DashboardPage from '@/pages/DashboardPage'
import ProductsPage from '@/pages/products/ProductsPageNew'
import ReportsPage from '@/pages/reports/ReportsPage'
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage'
import { InventoryPage } from '@/pages/inventory/InventoryPage'
import { CustomerManagementPage } from '@/pages/customers/CustomerManagementPage'
import { EmployeeManagementPage } from '@/pages/employees/EmployeeManagementPage'
import { AdvancedAuthPage } from '@/pages/auth/AdvancedAuthPage'
import { PaymentProcessingPage } from '@/pages/payments/PaymentProcessingPage'
import POSTerminalPage from '@/pages/pos/POSTerminalPage'
import DarkModePOSDemo from '@/pages/pos/DarkModePOSDemo'
import LoginPage from '@/pages/auth/LoginPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { SalesPage } from '@/pages/sales/SalesPage'

// Temporary placeholder components for pages not yet created
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        This page is under construction
      </p>
    </div>
  </div>
)

const RegisterPage: React.FC = () => <PlaceholderPage title="Register" />
const PurchasesPage: React.FC = () => <PlaceholderPage title="Purchases" />
const HelpPage: React.FC = () => <PlaceholderPage title="Help & Support" />
const ProfilePage: React.FC = () => <PlaceholderPage title="Profile" />
const NotificationsPage: React.FC = () => <PlaceholderPage title="Notifications" />

function App() {
  // Use Redux state for authentication, with localStorage fallback for demo login
  const { isAuthenticated: reduxAuth } = useSelector((state: RootState) => state.auth)
  const isAuthenticated = reduxAuth || localStorage.getItem('isAuthenticated') === 'true'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="pos" element={<POSTerminalPage />} />
          <Route path="pos-dark" element={<DarkModePOSDemo />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="customers" element={<CustomerManagementPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="financial" element={<PaymentProcessingPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="employees" element={<EmployeeManagementPage />} />
          <Route path="security" element={<AdvancedAuthPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="purchases" element={<PurchasesPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="review" element={<PlaceholderPage title="Review" />} />
        </Route>

        {/* Catch all route */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  404
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Page not found
                </p>
                <a
                  href="/dashboard"
                  className="btn-primary"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          }
        />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App
