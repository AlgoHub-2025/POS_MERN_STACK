import React from 'react'
import { 
  Home, 
  Package, 
  BarChart3, 
  ShoppingCart, 
  Menu 
} from 'lucide-react'

export const SkipLinks: React.FC = () => {
  const skipToContent = () => {
    const mainContent = document.getElementById('main-content')
    mainContent?.focus()
  }

  const skipToNavigation = () => {
    const navigation = document.getElementById('main-navigation')
    navigation?.focus()
  }

  const skipToProducts = () => {
    const products = document.getElementById('products-section')
    products?.focus()
  }

  const skipToReports = () => {
    const reports = document.getElementById('reports-section')
    reports?.focus()
  }

  const skipToPOS = () => {
    const pos = document.getElementById('pos-terminal')
    pos?.focus()
  }

  return (
    <div className="sr-only">
      <nav aria-label="Skip navigation links">
        <ul className="space-y-2">
          <li>
            <a
              href="#main-content"
              onClick={(e) => {
                e.preventDefault()
                skipToContent()
              }}
              className="absolute top-0 left-0 -translate-y-full bg-primary-600 text-white px-4 py-2 rounded-b-lg focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary-400 z-50 transition-transform duration-200"
            >
              Skip to main content
            </a>
          </li>
          <li>
            <a
              href="#main-navigation"
              onClick={(e) => {
                e.preventDefault()
                skipToNavigation()
              }}
              className="absolute top-0 left-0 -translate-y-full bg-primary-600 text-white px-4 py-2 rounded-b-lg focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary-400 z-50 transition-transform duration-200"
            >
              <Menu className="w-4 h-4 inline mr-2" />
              Skip to navigation
            </a>
          </li>
          <li>
            <a
              href="#products-section"
              onClick={(e) => {
                e.preventDefault()
                skipToProducts()
              }}
              className="absolute top-0 left-0 -translate-y-full bg-primary-600 text-white px-4 py-2 rounded-b-lg focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary-400 z-50 transition-transform duration-200"
            >
              <Package className="w-4 h-4 inline mr-2" />
              Skip to products
            </a>
          </li>
          <li>
            <a
              href="#reports-section"
              onClick={(e) => {
                e.preventDefault()
                skipToReports()
              }}
              className="absolute top-0 left-0 -translate-y-full bg-primary-600 text-white px-4 py-2 rounded-b-lg focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary-400 z-50 transition-transform duration-200"
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Skip to reports
            </a>
          </li>
          <li>
            <a
              href="#pos-terminal"
              onClick={(e) => {
                e.preventDefault()
                skipToPOS()
              }}
              className="absolute top-0 left-0 -translate-y-full bg-primary-600 text-white px-4 py-2 rounded-b-lg focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary-400 z-50 transition-transform duration-200"
            >
              <ShoppingCart className="w-4 h-4 inline mr-2" />
              Skip to POS terminal
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default SkipLinks
