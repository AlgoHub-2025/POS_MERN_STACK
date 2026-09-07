import React, { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Shield,
  Globe,
  Wallet,
  Banknote,
  QrCode
} from 'lucide-react'

interface PaymentGateway {
  id: string
  name: string
  type: 'credit_card' | 'digital_wallet' | 'bank_transfer' | 'crypto'
  status: 'active' | 'inactive' | 'testing'
  fees: {
    percentage: number
    fixed: number
  }
  monthlyVolume: number
  transactionCount: number
  successRate: number
  averageProcessingTime: number
  supportedCurrencies: string[]
  lastTransaction: string
}

interface Transaction {
  id: string
  gateway: string
  amount: number
  currency: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  paymentMethod: string
  customer: string
  timestamp: string
  processingTime: number
  fees: number
  netAmount: number
}

interface PaymentStats {
  totalVolume: number
  totalTransactions: number
  averageTransaction: number
  successRate: number
  totalFees: number
  netRevenue: number
  gatewayDistribution: Array<{
    gateway: string
    percentage: number
    volume: number
  }>
}

export const PaymentProcessingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gateways' | 'transactions' | 'analytics' | 'settings'>('gateways')
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month')

  useEffect(() => {
    // Simulate API call to fetch payment data
    const fetchPaymentData = async () => {
      setIsLoading(true)
      
      const mockGateways: PaymentGateway[] = [
        {
          id: '1',
          name: 'Stripe',
          type: 'credit_card',
          status: 'active',
          fees: { percentage: 2.9, fixed: 0.30 },
          monthlyVolume: 45670.50,
          transactionCount: 342,
          successRate: 98.5,
          averageProcessingTime: 1.2,
          supportedCurrencies: ['USD', 'EUR', 'GBP'],
          lastTransaction: '2026-02-16 14:30'
        },
        {
          id: '2',
          name: 'PayPal',
          type: 'digital_wallet',
          status: 'active',
          fees: { percentage: 3.4, fixed: 0.30 },
          monthlyVolume: 28450.75,
          transactionCount: 189,
          successRate: 97.2,
          averageProcessingTime: 2.1,
          supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD'],
          lastTransaction: '2026-02-16 14:25'
        },
        {
          id: '3',
          name: 'Square',
          type: 'credit_card',
          status: 'active',
          fees: { percentage: 2.6, fixed: 0.10 },
          monthlyVolume: 15234.25,
          transactionCount: 127,
          successRate: 99.1,
          averageProcessingTime: 0.8,
          supportedCurrencies: ['USD', 'CAD'],
          lastTransaction: '2026-02-16 14:15'
        },
        {
          id: '4',
          name: 'Apple Pay',
          type: 'digital_wallet',
          status: 'testing',
          fees: { percentage: 2.0, fixed: 0.00 },
          monthlyVolume: 0,
          transactionCount: 0,
          successRate: 0,
          averageProcessingTime: 0.5,
          supportedCurrencies: ['USD'],
          lastTransaction: 'N/A'
        }
      ]

      const mockTransactions: Transaction[] = [
        {
          id: '1',
          gateway: 'Stripe',
          amount: 45.50,
          currency: 'USD',
          status: 'completed',
          paymentMethod: 'Credit Card (****1234)',
          customer: 'John Doe',
          timestamp: '2026-02-16 14:30:15',
          processingTime: 1.2,
          fees: 1.62,
          netAmount: 43.88
        },
        {
          id: '2',
          gateway: 'PayPal',
          amount: 25.00,
          currency: 'USD',
          status: 'completed',
          paymentMethod: 'PayPal Balance',
          customer: 'Jane Smith',
          timestamp: '2026-02-16 14:25:30',
          processingTime: 2.1,
          fees: 1.15,
          netAmount: 23.85
        },
        {
          id: '3',
          gateway: 'Square',
          amount: 12.75,
          currency: 'USD',
          status: 'failed',
          paymentMethod: 'Credit Card (****5678)',
          customer: 'Mike Johnson',
          timestamp: '2026-02-16 14:15:45',
          processingTime: 0.8,
          fees: 0.00,
          netAmount: 0.00
        }
      ]

      const mockStats: PaymentStats = {
        totalVolume: 89355.50,
        totalTransactions: 658,
        averageTransaction: 135.78,
        successRate: 98.2,
        totalFees: 2156.42,
        netRevenue: 87199.08,
        gatewayDistribution: [
          { gateway: 'Stripe', percentage: 51.1, volume: 45670.50 },
          { gateway: 'PayPal', percentage: 31.8, volume: 28450.75 },
          { gateway: 'Square', percentage: 17.1, volume: 15234.25 }
        ]
      }

      // Simulate API delay
      setTimeout(() => {
        setGateways(mockGateways)
        setTransactions(mockTransactions)
        setStats(mockStats)
        setIsLoading(false)
      }, 1000)
    }

    fetchPaymentData()
  }, [dateRange])

  const getGatewayIcon = (type: string) => {
    switch (type) {
      case 'credit_card': return <CreditCard className="w-5 h-5" />
      case 'digital_wallet': return <Smartphone className="w-5 h-5" />
      case 'bank_transfer': return <Banknote className="w-5 h-5" />
      case 'crypto': return <Wallet className="w-5 h-5" />
      default: return <CreditCard className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-400/30'
      case 'inactive': return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
      case 'testing': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-400/30'
      default: return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
    }
  }

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-400/30'
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-400/30'
      case 'failed': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-400/30'
      case 'refunded': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/50 dark:text-purple-400 dark:border-purple-400/30'
      default: return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 dark:border-green-400 rounded-full animate-spin border-t-transparent"></div>
          <p className="text-green-700 dark:text-green-400 mt-4">Loading Payment Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-green-400 mb-2">Payment Processing</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage payment gateways, transactions, and financial analytics</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 lg:gap-6 mb-8">
          <div className="min-w-0 bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between gap-3 mb-4">
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-green-700 dark:text-green-400 text-sm text-right">Total Volume</span>
            </div>
            <p className="min-w-0 break-words text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalVolume)}</p>
          </div>

          <div className="min-w-0 bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between gap-3 mb-4">
              <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-blue-700 dark:text-blue-400 text-sm text-right">Transactions</span>
            </div>
            <p className="min-w-0 break-words text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTransactions.toLocaleString()}</p>
          </div>

          <div className="min-w-0 bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <span className="text-purple-700 dark:text-purple-400 text-sm text-right">Avg Transaction</span>
            </div>
            <p className="min-w-0 break-words text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.averageTransaction)}</p>
          </div>

          <div className="min-w-0 bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-green-700 dark:text-green-400 text-sm text-right">Success Rate</span>
            </div>
            <p className="min-w-0 break-words text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</p>
          </div>

          <div className="min-w-0 bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between gap-3 mb-4">
              <CreditCard className="w-8 h-8 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <span className="text-orange-700 dark:text-orange-400 text-sm text-right">Total Fees</span>
            </div>
            <p className="min-w-0 break-words text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalFees)}</p>
          </div>

          <div className="min-w-0 bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between gap-3 mb-4">
              <Wallet className="w-8 h-8 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
              <span className="text-cyan-700 dark:text-cyan-400 text-sm text-right">Net Revenue</span>
            </div>
            <p className="min-w-0 break-words text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.netRevenue)}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl p-1 border border-gray-200 shadow-sm mb-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab('gateways')}
            className={`py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'gateways'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            <CreditCard className="w-5 h-5 inline mr-2" />
            Gateways
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'transactions'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            <Activity className="w-5 h-5 inline mr-2" />
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'analytics'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'settings'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            <Settings className="w-5 h-5 inline mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Gateways Tab */}
      {activeTab === 'gateways' && (
        <div className="space-y-6">
          {/* Gateway Actions */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-green-400">Payment Gateways</h2>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Gateway</span>
              </button>
            </div>
          </div>

          {/* Gateways Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gateways.map((gateway) => (
              <div key={gateway.id} className="min-w-0 bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:border-green-400/50 transition-all duration-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex min-w-0 items-center space-x-3">
                    <div className={`p-3 rounded-lg border flex-shrink-0 ${getStatusColor(gateway.status)}`}>
                      {getGatewayIcon(gateway.type)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-green-700 dark:text-green-400 font-semibold text-lg truncate">{gateway.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm capitalize">{gateway.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className={`inline-flex w-fit items-center space-x-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(gateway.status)}`}>
                    <span>{gateway.status.toUpperCase()}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Monthly Volume:</span>
                    <span className="min-w-0 break-words text-right text-green-700 dark:text-green-400">{formatCurrency(gateway.monthlyVolume)}</span>
                  </div>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Transactions:</span>
                    <span className="text-gray-700 dark:text-gray-300">{gateway.transactionCount}</span>
                  </div>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Success Rate:</span>
                    <span className="text-green-700 dark:text-green-400">{gateway.successRate}%</span>
                  </div>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Processing Time:</span>
                    <span className="text-gray-700 dark:text-gray-300">{gateway.averageProcessingTime}s</span>
                  </div>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Fees:</span>
                    <span className="min-w-0 break-words text-right text-gray-700 dark:text-gray-300">{gateway.fees.percentage}% + {formatCurrency(gateway.fees.fixed)}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors duration-200 text-sm dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
                    <Edit className="w-4 h-4 inline mr-1" />
                    Configure
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors duration-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Transaction Filters */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-green-400">Recent Transactions</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-green-400"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Transaction ID</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Gateway</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Time</th>
                    <th className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 dark:border-gray-700/50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 text-green-700 dark:text-green-400 font-medium">#{transaction.id}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{transaction.gateway}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{transaction.customer}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatCurrency(transaction.amount, transaction.currency)}</td>
                      <td className="py-3 px-4">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm border ${getTransactionStatusColor(transaction.status)}`}>
                          <span>{transaction.status.toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{transaction.timestamp}</td>
                      <td className="py-3 px-4 text-center">
                        <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:bg-gray-700 dark:hover:bg-gray-600">
                          <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-6">
          {/* Gateway Distribution */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-green-400 mb-4">Gateway Distribution</h2>
            <div className="space-y-4">
              {stats.gatewayDistribution.map((gateway) => (
                <div key={gateway.gateway} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 dark:bg-green-400 rounded flex-shrink-0"></div>
                    <span className="text-gray-700 dark:text-gray-300 truncate">{gateway.gateway}</span>
                  </div>
                  <div className="min-w-0 text-right">
                    <p className="break-words text-green-700 dark:text-green-400 font-medium">{formatCurrency(gateway.volume)}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{gateway.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-gray-900 dark:text-green-400 font-semibold mb-4">Processing Performance</h3>
              <div className="space-y-3">
                {gateways.filter(g => g.status === 'active').map((gateway) => (
                  <div key={gateway.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-gray-700 dark:text-gray-300">{gateway.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-700 dark:text-green-400">{gateway.averageProcessingTime}s</span>
                      <Zap className="w-4 h-4 text-yellow-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-gray-900 dark:text-green-400 font-semibold mb-4">Success Rates</h3>
              <div className="space-y-3">
                {gateways.filter(g => g.status === 'active').map((gateway) => (
                  <div key={gateway.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-gray-700 dark:text-gray-300">{gateway.name}</span>
                      <span className="text-green-700 dark:text-green-400">{gateway.successRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${gateway.successRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-green-400 mb-4">Payment Settings</h2>
            
            <div className="space-y-6">
              {/* Default Gateway */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                <h3 className="text-gray-900 dark:text-green-400 font-semibold mb-3">Default Gateway</h3>
                <select className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-2 rounded-lg dark:bg-gray-600 dark:text-white dark:border-gray-500">
                  {gateways.filter(g => g.status === 'active').map(gateway => (
                    <option key={gateway.id} value={gateway.id}>{gateway.name}</option>
                  ))}
                </select>
              </div>

              {/* Currency Settings */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                <h3 className="text-gray-900 dark:text-green-400 font-semibold mb-3">Currency Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Default Currency</label>
                    <select className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-2 rounded-lg dark:bg-gray-600 dark:text-white dark:border-gray-500">
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Auto-convert Currency</label>
                    <select className="w-full bg-white text-gray-900 border border-gray-300 px-4 py-2 rounded-lg dark:bg-gray-600 dark:text-white dark:border-gray-500">
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                <h3 className="text-gray-900 dark:text-green-400 font-semibold mb-3">Security Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-gray-700 dark:text-gray-300">Enable 3D Secure</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-green-400" />
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-gray-700 dark:text-gray-300">Fraud Detection</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-green-400" />
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-gray-700 dark:text-gray-300">Address Verification</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-green-400" />
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200">
                  Save Settings
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors duration-200 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">
                  Test Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
