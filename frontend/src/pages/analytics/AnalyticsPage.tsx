import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface AnalyticsData {
  totalSales: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
  salesGrowth: number
  ordersGrowth: number
  customersGrowth: number
  topProducts: Array<{
    name: string
    sales: number
    quantity: number
    revenue: number
  }>
  hourlySales: Array<{
    hour: string
    sales: number
    orders: number
  }>
  categoryBreakdown: Array<{
    category: string
    sales: number
    percentage: number
  }>
}

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('today')
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    // Simulate API call to fetch analytics data
    const fetchAnalyticsData = async () => {
      setIsLoading(true)
      
      // Mock data based on time range
      const mockData: AnalyticsData = {
        totalSales: timeRange === 'today' ? 2847.50 : 
                   timeRange === 'week' ? 19847.25 : 
                   timeRange === 'month' ? 84234.80 : 1010817.60,
        totalOrders: timeRange === 'today' ? 127 : 
                   timeRange === 'week' ? 892 : 
                   timeRange === 'month' ? 3847 : 46284,
        totalCustomers: timeRange === 'today' ? 89 : 
                     timeRange === 'week' ? 523 : 
                     timeRange === 'month' ? 1847 : 22134,
        averageOrderValue: 22.42,
        salesGrowth: 12.5,
        ordersGrowth: 8.3,
        customersGrowth: 15.7,
        topProducts: [
          { name: 'Espresso', sales: 342, quantity: 342, revenue: 1197.00 },
          { name: 'Cappuccino', sales: 287, quantity: 287, revenue: 1291.50 },
          { name: 'Latte', sales: 234, quantity: 234, revenue: 936.00 },
          { name: 'Americano', sales: 198, quantity: 198, revenue: 643.50 },
          { name: 'Croissant', sales: 156, quantity: 156, revenue: 351.00 }
        ],
        hourlySales: Array.from({ length: 24 }, (_, i) => ({
          hour: `${i.toString().padStart(2, '0')}:00`,
          sales: Math.floor(Math.random() * 500) + 50,
          orders: Math.floor(Math.random() * 20) + 2
        })),
        categoryBreakdown: [
          { category: 'Coffee', sales: 4567.80, percentage: 65.2 },
          { category: 'Bakery', sales: 1876.40, percentage: 26.8 },
          { category: 'Dairy', sales: 567.30, percentage: 8.1 }
        ]
      }

      // Simulate API delay
      setTimeout(() => {
        setAnalyticsData(mockData)
        setIsLoading(false)
      }, 1000)
    }

    fetchAnalyticsData()
  }, [timeRange])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'green' 
  }: {
    title: string
    value: string | number
    change?: number
    icon: React.ElementType
    color?: 'green' | 'blue' | 'purple' | 'orange'
  }) => {
    const isPositive = change && change > 0
    const colorClasses = {
      green: 'bg-green-900/50 border-green-400/30 text-green-400',
      blue: 'bg-blue-900/50 border-blue-400/30 text-blue-400',
      purple: 'bg-purple-900/50 border-purple-400/30 text-purple-400',
      orange: 'bg-orange-900/50 border-orange-400/30 text-orange-400'
    }

    return (
      <div className={`bg-gray-800 rounded-xl p-6 border ${colorClasses[color]}`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center space-x-1 text-sm ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-400 rounded-full animate-spin border-t-transparent"></div>
          <p className="text-green-400 mt-4">Loading Analytics...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-red-400">Failed to load analytics data</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-400 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Real-time insights and performance metrics</p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {(['today', 'week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                timeRange === range
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Sales"
          value={formatCurrency(analyticsData.totalSales)}
          change={analyticsData.salesGrowth}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Total Orders"
          value={analyticsData.totalOrders.toLocaleString()}
          change={analyticsData.ordersGrowth}
          icon={ShoppingCart}
          color="blue"
        />
        <MetricCard
          title="Total Customers"
          value={analyticsData.totalCustomers.toLocaleString()}
          change={analyticsData.customersGrowth}
          icon={Users}
          color="purple"
        />
        <MetricCard
          title="Avg Order Value"
          value={formatCurrency(analyticsData.averageOrderValue)}
          icon={Target}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Hourly Sales Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-green-400 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Hourly Sales
            </h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-end justify-between space-x-1">
            {analyticsData.hourlySales.map((hour, index) => (
              <div key={hour.hour} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-green-400 rounded-t transition-all duration-300 hover:bg-green-300"
                  style={{ 
                    height: `${(hour.sales / Math.max(...analyticsData.hourlySales.map(h => h.sales))) * 100}%`,
                    minHeight: '4px'
                  }}
                  title={`${hour.hour}: ${formatCurrency(hour.sales)}`}
                ></div>
                <span className="text-xs text-gray-400 mt-1">{hour.hour.split(':')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-green-400 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Category Breakdown
            </h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analyticsData.categoryBreakdown.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-400 rounded"></div>
                  <span className="text-gray-300">{category.category}</span>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium">{formatCurrency(category.sales)}</p>
                  <p className="text-gray-400 text-sm">{category.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-green-400 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Top Products
          </h2>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Product</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Quantity</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Revenue</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Performance</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.topProducts.map((product, index) => (
                <tr key={product.name} className="border-b border-gray-700/50">
                  <td className="py-3 px-4 text-green-400 font-medium">{product.name}</td>
                  <td className="py-3 px-4 text-gray-300 text-right">{product.quantity}</td>
                  <td className="py-3 px-4 text-gray-300 text-right">{formatCurrency(product.revenue)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(product.sales / Math.max(...analyticsData.topProducts.map(p => p.sales))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-green-400 text-sm">{product.sales}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
