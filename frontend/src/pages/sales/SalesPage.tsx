import React, { useState, useEffect } from 'react'
import {
    ShoppingCart,
    Search,
    Download,
    DollarSign,
    TrendingUp,
    Clock,
    Receipt,
    Eye,
    CreditCard,
    Banknote,
    Smartphone,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'

interface SaleTransaction {
    id: string
    orderNumber: string
    customer: string
    items: number
    total: number
    paymentMethod: 'cash' | 'card' | 'digital'
    status: 'completed' | 'refunded' | 'pending' | 'cancelled'
    date: string
    time: string
    cashier: string
}

export const SalesPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [paymentFilter, setPaymentFilter] = useState('all')
    const [sales, setSales] = useState<SaleTransaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedPeriod, setSelectedPeriod] = useState('today')
    const [selectedSale, setSelectedSale] = useState<SaleTransaction | null>(null)

    useEffect(() => {
        const mockSales: SaleTransaction[] = [
            { id: '1', orderNumber: 'ORD-2026-001', customer: 'John Doe', items: 3, total: 45.99, paymentMethod: 'card', status: 'completed', date: '2026-02-20', time: '10:30 AM', cashier: 'Sarah J.' },
            { id: '2', orderNumber: 'ORD-2026-002', customer: 'Jane Smith', items: 2, total: 23.50, paymentMethod: 'cash', status: 'completed', date: '2026-02-20', time: '10:15 AM', cashier: 'Mike C.' },
            { id: '3', orderNumber: 'ORD-2026-003', customer: 'Bob Johnson', items: 5, total: 67.25, paymentMethod: 'digital', status: 'pending', date: '2026-02-20', time: '09:45 AM', cashier: 'Sarah J.' },
            { id: '4', orderNumber: 'ORD-2026-004', customer: 'Alice Brown', items: 1, total: 12.99, paymentMethod: 'card', status: 'completed', date: '2026-02-20', time: '09:30 AM', cashier: 'Emily R.' },
            { id: '5', orderNumber: 'ORD-2026-005', customer: 'Charlie Wilson', items: 4, total: 89.50, paymentMethod: 'cash', status: 'completed', date: '2026-02-20', time: '09:00 AM', cashier: 'Sarah J.' },
            { id: '6', orderNumber: 'ORD-2026-006', customer: 'Diana Prince', items: 2, total: 34.75, paymentMethod: 'digital', status: 'refunded', date: '2026-02-20', time: '08:45 AM', cashier: 'Mike C.' },
            { id: '7', orderNumber: 'ORD-2026-007', customer: 'Edward King', items: 6, total: 112.00, paymentMethod: 'card', status: 'completed', date: '2026-02-20', time: '08:15 AM', cashier: 'Emily R.' },
            { id: '8', orderNumber: 'ORD-2026-008', customer: 'Fiona Green', items: 1, total: 8.50, paymentMethod: 'cash', status: 'cancelled', date: '2026-02-20', time: '08:00 AM', cashier: 'Sarah J.' },
        ]
        setTimeout(() => {
            setSales(mockSales)
            setIsLoading(false)
        }, 600)
    }, [])

    const periodSales = sales.filter(sale => {
        if (selectedPeriod === 'today') return sale.date === '2026-02-20'
        if (selectedPeriod === 'week') return true
        if (selectedPeriod === 'month') return true
        return true
    })

    const filteredSales = periodSales.filter(sale => {
        const matchesSearch = sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || sale.status === statusFilter
        const matchesPayment = paymentFilter === 'all' || sale.paymentMethod === paymentFilter
        return matchesSearch && matchesStatus && matchesPayment
    })

    const totalRevenue = periodSales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.total, 0)
    const totalOrders = periodSales.filter(s => s.status === 'completed').length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const refundAmount = periodSales.filter(s => s.status === 'refunded').reduce((sum, s) => sum + s.total, 0)

    const handleExport = () => {
        const rows = [
            ['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Cashier', 'Date', 'Time'],
            ...filteredSales.map(sale => [
                sale.orderNumber,
                sale.customer,
                sale.items,
                sale.total.toFixed(2),
                sale.paymentMethod,
                sale.status,
                sale.cashier,
                sale.date,
                sale.time
            ])
        ]
        const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
        const link = document.createElement('a')
        link.href = url
        link.download = `sales_${selectedPeriod}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return 'badge-success'
            case 'pending': return 'badge-warning'
            case 'refunded': return 'badge-error'
            case 'cancelled': return 'badge-gray'
            default: return 'badge-gray'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-3 h-3 mr-1" />
            case 'pending': return <Clock className="w-3 h-3 mr-1" />
            case 'refunded': return <XCircle className="w-3 h-3 mr-1" />
            case 'cancelled': return <AlertCircle className="w-3 h-3 mr-1" />
            default: return null
        }
    }

    const getPaymentIcon = (method: string) => {
        switch (method) {
            case 'card': return <CreditCard className="w-4 h-4 text-blue-500" />
            case 'cash': return <Banknote className="w-4 h-4 text-green-500" />
            case 'digital': return <Smartphone className="w-4 h-4 text-purple-500" />
            default: return null
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-400 rounded-full animate-spin border-t-transparent mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-4">Loading Sales...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between animate-slide-up">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-1">Sales</h1>
                    <p className="text-gray-600 dark:text-gray-400">Track transactions, revenue and sales performance</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        {['today', 'week', 'month'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 capitalize ${selectedPeriod === period
                                        ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-700 dark:text-primary-300'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                                    }`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleExport} className="btn-primary">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, change: '+12.5%', trend: 'up', icon: DollarSign, color: 'from-emerald-500 to-green-600' },
                    { title: 'Total Orders', value: totalOrders.toString(), change: '+8.2%', trend: 'up', icon: ShoppingCart, color: 'from-blue-500 to-indigo-600' },
                    { title: 'Avg Order Value', value: `$${avgOrderValue.toFixed(2)}`, change: '+4.1%', trend: 'up', icon: TrendingUp, color: 'from-purple-500 to-violet-600' },
                    { title: 'Refunds', value: `$${refundAmount.toFixed(2)}`, change: '-15.3%', trend: 'down', icon: Receipt, color: 'from-rose-500 to-red-600' },
                ].map((kpi, index) => (
                    <div key={kpi.title} className="card p-6 hover-lift animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{kpi.title}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{kpi.value}</p>
                                <div className="flex items-center mt-2 space-x-1">
                                    {kpi.trend === 'up' ? (
                                        <ArrowUpRight className="w-4 h-4 text-success-500" />
                                    ) : (
                                        <ArrowDownRight className="w-4 h-4 text-error-500" />
                                    )}
                                    <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-success-600' : 'text-error-600'}`}>
                                        {kpi.change}
                                    </span>
                                </div>
                            </div>
                            <div className={`p-3 bg-gradient-to-br ${kpi.color} rounded-xl shadow-lg`}>
                                <kpi.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card p-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by customer or order number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="refunded">Refunded</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="input w-auto">
                        <option value="all">All Payments</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="digital">Digital Wallet</option>
                    </select>
                </div>
            </div>

            {/* Sales Table */}
            <div className="card animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <div className="card-header flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Transactions</h3>
                    <span className="badge-primary">{filteredSales.length} results</span>
                </div>
                <div className="card-body p-0">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead className="tablead">
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Cashier</th>
                                    <th>Time</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-200">
                                        <td className="font-mono text-sm font-semibold text-primary-600 dark:text-primary-400">{sale.orderNumber}</td>
                                        <td>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-bold text-primary-700">{sale.customer.split(' ').map(n => n[0]).join('')}</span>
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{sale.customer}</span>
                                            </div>
                                        </td>
                                        <td className="text-gray-600 dark:text-gray-400">{sale.items} items</td>
                                        <td className="font-semibold text-gray-900 dark:text-gray-100">${sale.total.toFixed(2)}</td>
                                        <td>
                                            <div className="flex items-center space-x-2">
                                                {getPaymentIcon(sale.paymentMethod)}
                                                <span className="text-sm capitalize text-gray-600 dark:text-gray-400">{sale.paymentMethod}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${getStatusBadge(sale.status)} flex items-center w-fit`}>
                                                {getStatusIcon(sale.status)}
                                                {sale.status}
                                            </span>
                                        </td>
                                        <td className="text-gray-600 dark:text-gray-400 text-sm">{sale.cashier}</td>
                                        <td className="text-gray-500 text-sm">{sale.time}</td>
                                        <td>
                                            <button
                                                onClick={() => setSelectedSale(sale)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-4 h-4 text-gray-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Payment Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
                {[
                    { method: 'Card', count: sales.filter(s => s.paymentMethod === 'card').length, total: sales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.total, 0), icon: CreditCard, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { method: 'Cash', count: sales.filter(s => s.paymentMethod === 'cash').length, total: sales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0), icon: Banknote, color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    { method: 'Digital', count: sales.filter(s => s.paymentMethod === 'digital').length, total: sales.filter(s => s.paymentMethod === 'digital').reduce((sum, s) => sum + s.total, 0), icon: Smartphone, color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                ].map((pm) => (
                    <div key={pm.method} className={`card p-5 hover-lift ${pm.bg}`}>
                        <div className="flex items-center space-x-4">
                            <div className={`p-3 bg-gradient-to-br ${pm.color} rounded-xl shadow-lg`}>
                                <pm.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{pm.method} Payments</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">${pm.total.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">{pm.count} transactions</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedSale(null)}>
                    <div className="card w-full max-w-md p-6" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Transaction Details</h2>
                            <button onClick={() => setSelectedSale(null)} className="btn-ghost btn-sm">Close</button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span>Order</span><strong>{selectedSale.orderNumber}</strong></div>
                            <div className="flex justify-between"><span>Customer</span><strong>{selectedSale.customer}</strong></div>
                            <div className="flex justify-between"><span>Total</span><strong>${selectedSale.total.toFixed(2)}</strong></div>
                            <div className="flex justify-between"><span>Payment</span><strong className="capitalize">{selectedSale.paymentMethod}</strong></div>
                            <div className="flex justify-between"><span>Status</span><strong className="capitalize">{selectedSale.status}</strong></div>
                            <div className="flex justify-between"><span>Cashier</span><strong>{selectedSale.cashier}</strong></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SalesPage
