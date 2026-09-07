import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Coffee, Lock, Mail, AlertCircle, Building2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState, useAppDispatch } from '@/store'
import { clearError, login } from '@/store/slices/authSlice'

const LoginPage: React.FC = () => {
  const [tenantSlug, setTenantSlug] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth)
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [from, isAuthenticated, navigate])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await dispatch(login({
      tenantSlug: tenantSlug.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password,
    }))

    if (login.fulfilled.match(result)) {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full mb-6 shadow-2xl hover:scale-110 transition-transform duration-300">
            <Coffee className="w-10 h-10 text-white animate-bounce-in" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-3 text-shadow">
            AlgoHub POS
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Sign in to your account
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 dark:bg-gray-800/80 dark:border-gray-700/50 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-error-50 to-error-100 border border-error-200 rounded-xl dark:from-error-900/20 dark:to-error-800/20 dark:border-error-700 animate-bounce-in">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400 flex-shrink-0" />
                <span className="text-error-800 dark:text-error-200 text-sm font-medium">
                  {error}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <label htmlFor="tenantSlug" className="form-label flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>Tenant Slug</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="tenantSlug"
                  type="text"
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                  className="input pl-12 hover:border-primary-400 focus:border-primary-500 transition-all duration-200"
                  placeholder="your-store"
                  autoComplete="organization"
                  required
                />
              </div>
            </div>

            <div className="form-group animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <label htmlFor="email" className="form-label flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email Address</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-12 hover:border-primary-400 focus:border-primary-500 transition-all duration-200"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <label htmlFor="password" className="form-label flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-12 pr-12 hover:border-primary-400 focus:border-primary-500 transition-all duration-200"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary-600 transition-colors duration-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 hover:scale-110 transition-transform duration-200" />
                  ) : (
                    <Eye className="h-5 w-5 hover:scale-110 transition-transform duration-200" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center space-x-3">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded hover:scale-110 transition-transform duration-200"
                />
                <label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-primary-600 transition-colors duration-200">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline transition-all duration-200 hover:scale-105"
              >
                Forgot password?
              </button>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center text-lg py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent mr-3"></div>
                ) : null}
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline transition-all duration-200 hover:scale-105 inline-block"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center animate-slide-up" style={{ animationDelay: '0.9s' }}>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2026 AlgoHub POS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
