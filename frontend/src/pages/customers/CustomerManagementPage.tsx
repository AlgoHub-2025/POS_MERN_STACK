import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar,
  Star,
  TrendingUp,
  Award,
  Gift,
  CreditCard,
  MapPin,
  Eye,
  Download,
  Crown,
  Heart,
  Zap
} from 'lucide-react'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  joinDate: string
  lastVisit: string
  totalSpent: number
  orderCount: number
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  loyaltyPoints: number
  address: string
  city: string
  preferences: string[]
  notes: string
  status: 'active' | 'inactive' | 'vip'
  avatar?: string
}

interface LoyaltyProgram {
  tier: string
  points: number
  benefits: string[]
  nextTierPoints: number
  color: string
  icon: React.ElementType
}

export const CustomerManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTier, setSelectedTier] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [showLoyaltyInfo, setShowLoyaltyInfo] = useState<string | null>(null)

  useEffect(() => {
    // Simulate API call to fetch customers
    const fetchCustomers = async () => {
      setIsLoading(true)
      
      const mockCustomers: Customer[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phone: '+1-555-0123',
          joinDate: '2025-01-15',
          lastVisit: '2026-02-16',
          totalSpent: 2847.50,
          orderCount: 127,
          loyaltyTier: 'gold',
          loyaltyPoints: 2847,
          address: '123 Main St',
          city: 'New York',
          preferences: ['coffee', 'pastries', 'morning visits'],
          notes: 'Regular morning customer, prefers espresso',
          status: 'vip'
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@email.com',
          phone: '+1-555-0124',
          joinDate: '2025-03-20',
          lastVisit: '2026-02-15',
          totalSpent: 1523.75,
          orderCount: 68,
          loyaltyTier: 'silver',
          loyaltyPoints: 1523,
          address: '456 Oak Ave',
          city: 'Brooklyn',
          preferences: ['lattes', 'afternoon visits'],
          notes: 'Loves vanilla lattes',
          status: 'active'
        },
        {
          id: '3',
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.j@email.com',
          phone: '+1-555-0125',
          joinDate: '2025-06-10',
          lastVisit: '2026-02-14',
          totalSpent: 567.25,
          orderCount: 34,
          loyaltyTier: 'bronze',
          loyaltyPoints: 567,
          address: '789 Pine Rd',
          city: 'Queens',
          preferences: ['cappuccino', 'evening visits'],
          notes: 'New customer, potential for upsell',
          status: 'active'
        }
      ]

      // Simulate API delay
      setTimeout(() => {
        setCustomers(mockCustomers)
        setIsLoading(false)
      }, 1000)
    }

    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    
    const matchesTier = selectedTier === 'all' || customer.loyaltyTier === selectedTier
    const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus
    
    return matchesSearch && matchesTier && matchesStatus
  })

  const loyaltyTiers: LoyaltyProgram[] = [
    {
      tier: 'bronze',
      points: 0,
      benefits: ['5% points bonus', 'Birthday reward'],
      nextTierPoints: 1000,
      color: 'bg-orange-900/50 text-orange-400 border-orange-400/30',
      icon: Award
    },
    {
      tier: 'silver',
      points: 1000,
      benefits: ['10% points bonus', 'Free drink on birthday', 'Exclusive offers'],
      nextTierPoints: 2500,
      color: 'bg-gray-600 text-gray-300 border-gray-400/30',
      icon: Star
    },
    {
      tier: 'gold',
      points: 2500,
      benefits: ['15% points bonus', 'Free birthday treat', 'VIP events', 'Priority service'],
      nextTierPoints: 5000,
      color: 'bg-yellow-900/50 text-yellow-400 border-yellow-400/30',
      icon: Crown
    },
    {
      tier: 'platinum',
      points: 5000,
      benefits: ['20% points bonus', 'Exclusive menu access', 'Personal barista', 'Free delivery'],
      nextTierPoints: 5000,
      color: 'bg-purple-900/50 text-purple-400 border-purple-400/30',
      icon: Gift
    }
  ]

  const getTierInfo = (tier: string) => loyaltyTiers.find(t => t.tier === tier)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900/50 text-green-400 border-green-400/30'
      case 'vip': return 'bg-purple-900/50 text-purple-400 border-purple-400/30'
      case 'inactive': return 'bg-red-900/50 text-red-400 border-red-400/30'
      default: return 'bg-gray-700 text-gray-400'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(filteredCustomers.map(customer => customer.id))
    }
  }

  const handleSendEmail = (customerId: string) => {
    console.log('Sending email to customer:', customerId)
    // Implement email functionality
  }

  const handleViewDetails = (customerId: string) => {
    console.log('Viewing customer details:', customerId)
    // Implement detailed view
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-400 rounded-full animate-spin border-t-transparent"></div>
          <p className="text-green-400 mt-4">Loading Customers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-400 mb-2">Customer Management</h1>
        <p className="text-gray-400">Manage customer relationships, loyalty programs, and engagement</p>
      </div>

      {/* Loyalty Program Overview */}
      <div className="bg-gradient-to-r from-purple-900/50 to-orange-900/50 rounded-xl p-6 border border-purple-400/30 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-green-400 flex items-center">
            <Crown className="w-6 h-6 mr-3" />
            Loyalty Program
          </h2>
          <button
            onClick={() => setShowLoyaltyInfo(showLoyaltyInfo ? null : 'overview')}
            className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {showLoyaltyInfo === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {loyaltyTiers.map((tier) => {
              const Icon = tier.icon
              return (
                <div key={tier.tier} className={`rounded-lg p-4 border ${tier.color}`}>
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-8 h-8" />
                    <span className="text-sm font-medium capitalize">{tier.tier}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-400">Points Required:</span>
                      <span className="text-white ml-2">{tier.points}</span>
                    </div>
                    <div className="text-xs space-y-1">
                      {tier.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Filters and Actions */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-green-400 placeholder-green-400/40"
            />
          </div>

          {/* Loyalty Tier Filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-green-400"
          >
            <option value="all">All Tiers</option>
            {loyaltyTiers.map(tier => (
              <option key={tier.tier} value={tier.tier}>
                {tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-green-400"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="vip">VIP</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Actions */}
          <div className="flex space-x-2">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => {
          const tierInfo = getTierInfo(customer.loyaltyTier)
          const TierIcon = tierInfo?.icon || Star
          
          return (
            <div key={customer.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-400/50 transition-all duration-200">
              {/* Customer Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-green-400 font-semibold text-lg">
                      {customer.firstName} {customer.lastName}
                    </h3>
                    <p className="text-gray-400 text-sm">{customer.email}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(customer.status)}`}>
                    <span>{customer.status.toUpperCase()}</span>
                  </div>
                  {tierInfo && (
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm border ${tierInfo.color}`}>
                      <TierIcon className="w-4 h-4" />
                      <span>{customer.loyaltyTier.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-xs">Total Spent</p>
                  <p className="text-green-400 font-semibold">{formatCurrency(customer.totalSpent)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Orders</p>
                  <p className="text-green-400 font-semibold">{customer.orderCount}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Loyalty Points</p>
                  <p className="text-purple-400 font-semibold">{customer.loyaltyPoints}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Member Since</p>
                  <p className="text-gray-300 font-semibold">{customer.joinDate}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <MapPin className="w-4 h-4" />
                  <span>{customer.city}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>Last visit: {customer.lastVisit}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <input
                  type="checkbox"
                  checked={selectedCustomers.includes(customer.id)}
                  onChange={() => handleSelectCustomer(customer.id)}
                  className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded"
                />
                <button
                  onClick={() => handleViewDetails(customer.id)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                  title="View Details"
                >
                  <Eye className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => handleSendEmail(customer.id)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                  title="Send Email"
                >
                  <Mail className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                  title="Edit Customer"
                >
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No customers found</p>
          <p className="text-gray-500">Try adjusting your filters or add new customers</p>
        </div>
      )}
    </div>
  )
}
