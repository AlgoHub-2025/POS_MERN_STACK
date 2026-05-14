import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Archive,
  FileText,
  Settings,
  Users,
  TrendingUp,
  CreditCard,
  Truck,
  HelpCircle,
  Monitor,
  Shield,
  UserCog,
  BarChart3
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

interface SidebarProps {
  isOpen: boolean
  isMobile: boolean
}

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: string
  permissions?: string[]
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'POS Terminal', href: '/pos', icon: Monitor },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Sales', href: '/sales', icon: ShoppingCart },
  { name: 'Inventory', href: '/inventory', icon: Archive },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Employees', href: '/employees', icon: UserCog },
  { name: 'Purchases', href: '/purchases', icon: Truck },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Financial', href: '/financial', icon: CreditCard },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobile }) => {
  const location = useLocation()
  const { currentTenant } = useSelector((state: RootState) => state.tenant)
  const { user } = useSelector((state: RootState) => state.auth)

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard'
    }
    if (href === '/pos') {
      return location.pathname === '/pos'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className={`
      sidebar fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out dark:bg-gray-800
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      ${!isMobile ? 'lg:translate-x-0' : ''}
    `}>
      {/* Logo and tenant info */}
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AH</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                AlgoHub POS
              </h1>
              {currentTenant && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {currentTenant.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* User info */}
        {user && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${active
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon className={`
                  mr-3 h-5 w-5 flex-shrink-0
                  ${active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'}
                `} />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-1">
            <NavLink
              to="/help"
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <HelpCircle className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
              Help & Support
            </NavLink>

            <a
              href="https://docs.algohub.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <FileText className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
              Documentation
            </a>
          </div>

          {/* Version info */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Version 1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
