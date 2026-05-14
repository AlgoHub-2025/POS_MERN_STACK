import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users,
  Brain,
  BarChart3,
  Calendar,
  Download,
  Filter,
  Package,
  Clock,
  ArrowUp,
  ArrowDown,
  Eye,
  Target,
  Zap
} from 'lucide-react'

interface SalesData {
  date: string
  sales: number
  orders: number
  revenue: number
}

interface TopProduct {
  id: string
  name: string
  sales: number
  revenue: number
  trend: 'up' | 'down' | 'stable'
  trendPercent: number
}

interface AIInsight {
  title: string
  description: string
  type: 'warning' | 'success' | 'info' | 'action'
  icon: React.ElementType
  action?: string
}

const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState('30days')
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      setSalesData([
        { date: '2024-02-01', sales: 145, orders: 89, revenue: 1245.50 },
        { date: '2024-02-02', sales: 162, orders: 98, revenue: 1389.25 },
        { date: '2024-02-03', sales: 138, orders: 76, revenue: 1156.75 },
        { date: '2024-02-04', sales: 189, orders: 112, revenue: 1678.90 },
        { date: '2024-02-05', sales: 201, orders: 125, revenue: 1892.40 },
        { date: '2024-02-06', sales: 175, orders: 103, revenue: 1567.80 },
        { date: '2024-02-07', sales: 193, orders: 118, revenue: 1745.60 },
      ])

      setTopProducts([
        {
          id: '1',
          name: 'Espresso Beans',
          sales: 342,
          revenue: 4456.58,
          trend: 'up',
          trendPercent: 25.3
        },
        {
          id: '2',
          name: 'Cappuccino',
          sales: 289,
          revenue: 1300.50,
          trend: 'up',
          trendPercent: 18.7
        },
        {
          id: '3',
          name: 'Latte',
          sales: 267,
          revenue: 1001.25,
          trend: 'down',
          trendPercent: -5.2
        },
        {
          id: '4',
          name: 'Croissant',
          sales: 198,
          revenue: 445.50,
          trend: 'stable',
          trendPercent: 2.1
        },
        {
          id: '5',
          name: 'Milk',
          sales: 156,
          revenue: 778.44,
          trend: 'up',
          trendPercent: 12.8
        }
      ])

      setIsLoading(false)
    }, 1000)
  }, [])

  const periods = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: '1year', label: 'Last Year' }
  ]

  const aiInsights: AIInsight[] = [
    {
      title: 'Revenue Growth',
      description: 'Sales increased 23% compared to last period',
      type: 'success',
      icon: TrendingUp
    },
    {
      title: 'Peak Hours',
      description: 'Most sales occur between 8-10 AM daily',
      type: 'info',
      icon: Clock
    },
    {
      title: 'Inventory Alert',
      description: 'Cappuccino cups running low - reorder recommended',
      type: 'warning',
      icon: Package,
      action: 'Order Now'
    },
    {
      title: 'Optimize Pricing',
      description: 'AI suggests bundle deals for pastries to increase average order value',
      type: 'action',
      icon: Brain,
      action: 'View Suggestions'
    }
  ]

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$12,456',
      change: 23.5,
      changeType: 'increase',
      icon: DollarSign
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: 18.2,
      changeType: 'increase',
      icon: ShoppingCart
    },
    {
      title: 'Customers',
      value: '892',
      change: -2.4,
      changeType: 'decrease',
      icon: Users
    },
    {
      title: 'Avg Order Value',
      value: '$10.09',
      change: 4.1,
      changeType: 'increase',
      icon: BarChart3
    }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp
      case 'down': return TrendingDown
      default: return Target
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-success-600'
      case 'down': return 'text-error-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your business performance and AI-powered insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="input pl-10 appearance-none cursor-pointer"
            >
              {periods.map(p => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <button className="btn-secondary hover:scale-105 transition-transform duration-200">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className="card p-6 hover-lift animate-slide-up" 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {metric.value}
                </p>
                {metric.change && (
                  <div className="flex items-center mt-2 space-x-1">
                    {metric.changeType === 'increase' ? (
                      <TrendingUp className="w-4 h-4 text-success-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-error-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      metric.changeType === 'increase' 
                        ? 'text-success-600 dark:text-success-400' 
                        : 'text-error-600 dark:text-error-400'
                    }`}>
                      {metric.changeType === 'increase' ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl hover:scale-110 transition-transform duration-300">
                <metric.icon className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trends Chart */}
        <div className="lg:col-span-2 card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Sales Trends
              </h3>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setSelectedMetric('revenue')}
                  className={`btn-sm px-3 py-1 ${
                    selectedMetric === 'revenue' ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  Revenue
                </button>
                <button 
                  onClick={() => setSelectedMetric('orders')}
                  className={`btn-sm px-3 py-1 ${
                    selectedMetric === 'orders' ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  Orders
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-primary-600 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">
                  Interactive chart visualization
                </p>
                <p className="text-sm text-gray-500">
                  {selectedMetric === 'revenue' ? 'Revenue over time' : 'Order volume trends'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Brain className="w-5 h-5 text-primary-600 mr-2" />
              AI Insights
            </h3>
          </div>
          <div className="card-body space-y-3">
            {aiInsights.map((insight, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border animate-slide-up hover-lift ${
                  insight.type === 'warning' ? 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800' :
                  insight.type === 'success' ? 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800' :
                  insight.type === 'action' ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800' :
                  'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
                }`}
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    insight.type === 'warning' ? 'bg-warning-100 dark:bg-warning-800' :
                    insight.type === 'success' ? 'bg-success-100 dark:bg-success-800' :
                    insight.type === 'action' ? 'bg-primary-100 dark:bg-primary-800' :
                    'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <insight.icon className={`w-4 h-4 ${
                      insight.type === 'warning' ? 'text-warning-600 dark:text-warning-400' :
                      insight.type === 'success' ? 'text-success-600 dark:text-success-400' :
                      insight.type === 'action' ? 'text-primary-600 dark:text-primary-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {insight.description}
                    </p>
                    {insight.action && (
                      <button className="btn-primary btn-sm mt-2 hover:scale-105 transition-transform duration-200">
                        <Zap className="w-3 h-3 mr-1" />
                        {insight.action}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.7s' }}>
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Top Products
            </h3>
            <button className="btn-ghost btn-sm hover:scale-105 transition-transform duration-200">
              <Eye className="w-4 h-4 mr-2" />
              View All
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="tablead">
                <tr>
                  <th>Product</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr 
                    key={product.id}
                    className="hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-200"
                    style={{ animationDelay: `${0.8 + index * 0.05}s` }}
                  >
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-primary-600" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="font-semibold">{product.sales}</td>
                    <td className="font-semibold">${product.revenue.toFixed(2)}</td>
                    <td>
                      <div className="flex items-center space-x-1">
                        {React.createElement(getTrendIcon(product.trend), {
                          className: `w-4 h-4 ${getTrendColor(product.trend)}`
                        })}
                        <span className={`text-sm font-medium ${getTrendColor(product.trend)}`}>
                          {product.trend === 'up' ? '+' : ''}{product.trendPercent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '0.9s' }}>
        <div className="card p-4 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Daily Sales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${salesData.reduce((sum, day) => sum + day.revenue, 0) / salesData.length}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-success-100 to-success-200 rounded-xl">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card p-4 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Peak Day</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {salesData.length > 0 ? salesData.reduce((max, day) => 
                  day.revenue > max.revenue ? day : max, salesData[0]).date.slice(-2) : 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card p-4 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Growth Rate</p>
              <p className="text-2xl font-bold text-success-600">
                +23.5%
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-success-100 to-success-200 rounded-xl">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
