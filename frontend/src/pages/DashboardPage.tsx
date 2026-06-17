import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Brain,
  AlertTriangle,
  Calendar,
  FileDown
} from 'lucide-react'

interface MetricCard {
  title: string
  value: string
  change: number
  changeType: 'increase' | 'decrease'
  icon: React.ElementType
}

interface Transaction {
  id: number
  customer: string
  amount: string
  status: 'completed' | 'pending'
  time: string
}

interface LowStockItem {
  id: number
  name: string
  sku: string
  stock: number
  emoji: string
}

interface AIInsight {
  title: string
  description: string
  icon: React.ElementType
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = React.useState('30')

  const metrics: MetricCard[] = [
    {
      title: 'Total Revenue',
      value: '$12,450',
      change: 12.5,
      changeType: 'increase',
      icon: DollarSign
    },
    {
      title: 'Orders',
      value: '1,234',
      change: 8.2,
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
      icon: TrendingUp
    }
  ]

  const transactions: Transaction[] = [
    { id: 1001, customer: 'John Doe', amount: '$45.99', status: 'completed', time: '10:30 AM' },
    { id: 1002, customer: 'Jane Smith', amount: '$23.50', status: 'completed', time: '10:15 AM' },
    { id: 1003, customer: 'Bob Johnson', amount: '$67.25', status: 'pending', time: '9:45 AM' },
    { id: 1004, customer: 'Alice Brown', amount: '$12.99', status: 'completed', time: '9:30 AM' },
    { id: 1005, customer: 'Charlie Wilson', amount: '$89.50', status: 'completed', time: '9:00 AM' }
  ]

  const lowStockItems: LowStockItem[] = [
    { id: 1, name: 'Espresso Beans', sku: 'COF001', stock: 5, emoji: '☕' },
    { id: 2, name: 'Milk', sku: 'DAI001', stock: 8, emoji: '🥛' },
    { id: 3, name: 'Sugar', sku: 'SUG001', stock: 12, emoji: '🍚' }
  ]

  const aiInsights: AIInsight[] = [
    {
      title: 'Peak Hours',
      description: 'Most sales occur between 8-10 AM',
      icon: TrendingUp
    },
    {
      title: 'Top Product',
      description: 'Cappuccino is your best seller',
      icon: ShoppingCart
    }
  ]

  const handleExport = () => {
    const rows = [
      ['Metric', 'Value', 'Change'],
      ...metrics.map(metric => [metric.title, metric.value, `${metric.changeType === 'increase' ? '+' : ''}${metric.change}%`]),
      [],
      ['Recent Transactions'],
      ['ID', 'Customer', 'Amount', 'Status', 'Time'],
      ...transactions.map(transaction => [
        transaction.id,
        transaction.customer,
        transaction.amount,
        transaction.status,
        transaction.time
      ])
    ]
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `dashboard_last_${dateRange}_days.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 p-8 text-white shadow-2xl animate-slide-up">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-sm"></div>
        <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 blur-sm"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-primary-200 text-sm font-medium">Welcome back 👋</p>
            <h1 className="text-3xl font-bold mt-1 mb-2">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}!
            </h1>
            <p className="text-primary-100 text-sm max-w-md">
              Here's what's happening with your store today. You have <span className="font-semibold text-white">3 low stock alerts</span> and <span className="font-semibold text-white">5 pending orders</span>.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => setDateRange(dateRange === '30' ? '7' : dateRange === '7' ? '90' : '30')}
              className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-white/20"
            >
              <Calendar className="w-4 h-4 mr-2 inline" />
              Last {dateRange} Days
            </button>
            <button
              onClick={handleExport}
              className="px-5 py-2.5 bg-white text-primary-700 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <FileDown className="w-4 h-4 mr-2 inline" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
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
                    <span className={`text-sm font-medium ${metric.changeType === 'increase'
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
        {/* Recent Transactions */}
        <div className="lg:col-span-2 card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Transactions
            </h3>
          </div>
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="tablead">
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-200"
                      style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                    >
                      <td className="font-medium">#{transaction.id}</td>
                      <td>{transaction.customer}</td>
                      <td className="font-semibold">{transaction.amount}</td>
                      <td>
                        <span className={`badge ${transaction.status === 'completed'
                            ? 'badge-success'
                            : 'badge-warning'
                          }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="text-gray-500">{transaction.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <AlertTriangle className="w-5 h-5 text-warning-500 mr-2" />
              Low Stock Alerts
            </h3>
          </div>
          <div className="card-body space-y-3">
            {lowStockItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-warning-50 rounded-lg hover:bg-warning-100 transition-colors duration-200 animate-slide-up"
                style={{ animationDelay: `${0.7 + index * 0.1}s` }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-warning-600">
                    {item.stock} left
                  </p>
                  <button
                    onClick={() => navigate(`/products?reorder=${encodeURIComponent(item.sku)}`)}
                    className="btn-warning btn-sm mt-1 hover:scale-105 transition-transform duration-200"
                  >
                    Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-primary-50 via-primary-100 to-primary-200 rounded-xl p-6 border border-primary-200 dark:from-primary-900/30 dark:via-primary-800/30 dark:to-primary-700/30 dark:border-primary-700 animate-slide-up hover-lift" style={{ animationDelay: '0.9s' }}>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg hover:scale-110 transition-transform duration-300">
            <Brain className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold gradient-text mb-3">
              AI Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg backdrop-blur-sm animate-slide-up"
                  style={{ animationDelay: `${1.0 + index * 0.1}s` }}
                >
                  <div className="p-2 bg-gradient-to-br from-success-100 to-success-200 rounded-lg">
                    <insight.icon className="w-4 h-4 text-success-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {insight.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {insight.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
