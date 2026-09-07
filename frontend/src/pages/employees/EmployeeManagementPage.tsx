import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  BarChart3,
  Target,
} from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  department: string
  hireDate: string
  status: 'active' | 'on-leave' | 'terminated'
  hourlyRate: number
  monthlyHours: number
  totalSales: number
  ordersProcessed: number
  averageOrderValue: number
  performanceScore: number
  attendanceRate: number
  nextShift: string
  avatar?: string
}

interface Shift {
  id: string
  employeeId: string
  employeeName: string
  date: string
  startTime: string
  endTime: string
  position: string
  status: 'scheduled' | 'in-progress' | 'completed'
}

interface PerformanceMetric {
  employeeId: string
  employeeName: string
  metric: string
  value: number
  target: number
  trend: 'up' | 'down' | 'stable'
}

export const EmployeeManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'employees' | 'schedule' | 'performance'>('employees')
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  useEffect(() => {
    // Simulate API call to fetch employee data
    const fetchEmployeeData = async () => {
      setIsLoading(true)
      
      const mockEmployees: Employee[] = [
        {
          id: '1',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.j@algohub.com',
          phone: '+1-555-0101',
          position: 'Senior Barista',
          department: 'Operations',
          hireDate: '2024-03-15',
          status: 'active',
          hourlyRate: 18.50,
          monthlyHours: 160,
          totalSales: 15420.75,
          ordersProcessed: 892,
          averageOrderValue: 17.30,
          performanceScore: 92,
          attendanceRate: 98.5,
          nextShift: '2026-02-17 08:00'
        },
        {
          id: '2',
          firstName: 'Mike',
          lastName: 'Chen',
          email: 'mike.c@algohub.com',
          phone: '+1-555-0102',
          position: 'Cashier',
          department: 'Operations',
          hireDate: '2024-06-20',
          status: 'active',
          hourlyRate: 15.00,
          monthlyHours: 145,
          totalSales: 8934.50,
          ordersProcessed: 567,
          averageOrderValue: 15.75,
          performanceScore: 85,
          attendanceRate: 95.2,
          nextShift: '2026-02-17 10:00'
        },
        {
          id: '3',
          firstName: 'Emily',
          lastName: 'Rodriguez',
          email: 'emily.r@algohub.com',
          phone: '+1-555-0103',
          position: 'Store Manager',
          department: 'Management',
          hireDate: '2023-11-10',
          status: 'active',
          hourlyRate: 25.00,
          monthlyHours: 168,
          totalSales: 0,
          ordersProcessed: 0,
          averageOrderValue: 0,
          performanceScore: 95,
          attendanceRate: 99.1,
          nextShift: '2026-02-17 07:00'
        }
      ]

      const mockShifts: Shift[] = [
        {
          id: '1',
          employeeId: '1',
          employeeName: 'Sarah Johnson',
          date: '2026-02-17',
          startTime: '08:00',
          endTime: '16:00',
          position: 'Senior Barista',
          status: 'scheduled'
        },
        {
          id: '2',
          employeeId: '2',
          employeeName: 'Mike Chen',
          date: '2026-02-17',
          startTime: '10:00',
          endTime: '18:00',
          position: 'Cashier',
          status: 'scheduled'
        },
        {
          id: '3',
          employeeId: '3',
          employeeName: 'Emily Rodriguez',
          date: '2026-02-17',
          startTime: '07:00',
          endTime: '15:00',
          position: 'Store Manager',
          status: 'scheduled'
        }
      ]

      const mockPerformanceMetrics: PerformanceMetric[] = [
        {
          employeeId: '1',
          employeeName: 'Sarah Johnson',
          metric: 'Sales Target',
          value: 92,
          target: 100,
          trend: 'up'
        },
        {
          employeeId: '2',
          employeeName: 'Mike Chen',
          metric: 'Customer Satisfaction',
          value: 88,
          target: 90,
          trend: 'stable'
        },
        {
          employeeId: '3',
          employeeName: 'Emily Rodriguez',
          metric: 'Team Performance',
          value: 95,
          target: 85,
          trend: 'up'
        }
      ]

      // Simulate API delay
      setTimeout(() => {
        setEmployees(mockEmployees)
        setShifts(mockShifts)
        setPerformanceMetrics(mockPerformanceMetrics)
        setIsLoading(false)
      }, 1000)
    }

    fetchEmployeeData()
  }, [])

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment
    const matchesStatus = selectedStatus === 'all' || employee.status === selectedStatus
    
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const departments = ['all', ...Array.from(new Set(employees.map(emp => emp.department)))]
  const statuses = ['all', 'active', 'on-leave', 'terminated']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-400/30'
      case 'on-leave': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-400/30'
      case 'terminated': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-400/30'
      default: return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const handleAddEmployee = () => {
    const name = window.prompt('Employee name')
    if (!name?.trim()) return
    const [firstName, ...lastNameParts] = name.trim().split(' ')
    const newEmployee: Employee = {
      id: Date.now().toString(),
      firstName,
      lastName: lastNameParts.join(' ') || 'Employee',
      email: `${firstName.toLowerCase()}@algohub.com`,
      phone: '',
      position: 'New Hire',
      department: 'Operations',
      hireDate: new Date().toISOString().split('T')[0],
      status: 'active',
      hourlyRate: 15,
      monthlyHours: 0,
      totalSales: 0,
      ordersProcessed: 0,
      averageOrderValue: 0,
      performanceScore: 0,
      attendanceRate: 100,
      nextShift: 'Not scheduled'
    }
    setEmployees(prev => [newEmployee, ...prev])
    setActionMessage(`Added ${newEmployee.firstName} ${newEmployee.lastName}`)
  }

  const handleExportEmployees = () => {
    const rows = [
      ['Name', 'Email', 'Phone', 'Position', 'Department', 'Status', 'Hourly Rate', 'Performance', 'Attendance'],
      ...filteredEmployees.map(employee => [
        `${employee.firstName} ${employee.lastName}`,
        employee.email,
        employee.phone,
        employee.position,
        employee.department,
        employee.status,
        employee.hourlyRate,
        employee.performanceScore,
        employee.attendanceRate
      ])
    ]
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'employees.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleScheduleShift = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId)
    if (!employee) return
    setActiveTab('schedule')
    setActionMessage(`Scheduling view opened for ${employee.firstName} ${employee.lastName}`)
  }

  const handleViewPerformance = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId)
    if (!employee) return
    setActiveTab('performance')
    setActionMessage(`Showing performance metrics for ${employee.firstName} ${employee.lastName}`)
  }

  const handleEditEmployee = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId)
    if (!employee) return
    const position = window.prompt('Position', employee.position)
    if (!position?.trim()) return
    setEmployees(prev => prev.map(emp => emp.id === employeeId ? { ...emp, position: position.trim() } : emp))
    setActionMessage(`Updated ${employee.firstName} ${employee.lastName}`)
  }

  const handleEditShift = (shiftId: string) => {
    const shift = shifts.find(item => item.id === shiftId)
    if (!shift) return
    const startTime = window.prompt('Start time', shift.startTime)
    const endTime = window.prompt('End time', shift.endTime)
    if (!startTime?.trim() || !endTime?.trim()) return
    setShifts(prev => prev.map(item => item.id === shiftId ? { ...item, startTime: startTime.trim(), endTime: endTime.trim() } : item))
    setActionMessage(`Updated shift for ${shift.employeeName}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 dark:border-green-400 rounded-full animate-spin border-t-transparent"></div>
          <p className="text-green-700 dark:text-green-400 mt-4">Loading Employee Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-green-400 mb-2">Employee Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage staff, schedules, and performance metrics</p>
        {actionMessage && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-400/30 dark:bg-green-900/40 dark:text-green-300">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-left text-green-700 hover:text-green-900 dark:text-green-200 dark:hover:text-white">Dismiss</button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl p-1 border border-gray-200 shadow-sm mb-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
          <button
            onClick={() => setActiveTab('employees')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'employees'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Employees
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'schedule'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            Schedule
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'performance'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Performance
          </button>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm mb-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-green-400 dark:placeholder-green-400/40"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-green-400"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-green-400"
          >
            <option value="all">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row xl:flex-row gap-2">
            <button
              onClick={handleAddEmployee}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
            <button
              onClick={handleExportEmployees}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="min-w-0 bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:border-green-400/50 transition-all duration-200 dark:bg-gray-800 dark:border-gray-700">
              {/* Employee Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="flex min-w-0 items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">
                      {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-green-700 dark:text-green-400 font-semibold text-lg break-words">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm break-words">{employee.position}</p>
                  </div>
                </div>
                <div className={`inline-flex w-fit items-center space-x-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(employee.status)}`}>
                  <span>{employee.status.toUpperCase()}</span>
                </div>
              </div>

              {/* Employee Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Performance Score</p>
                  <p className="text-green-700 dark:text-green-400 font-semibold">{employee.performanceScore}%</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Attendance</p>
                  <p className="text-green-700 dark:text-green-400 font-semibold">{employee.attendanceRate}%</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Monthly Hours</p>
                  <p className="text-gray-800 dark:text-gray-300 font-semibold">{employee.monthlyHours}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Hourly Rate</p>
                  <p className="break-words text-gray-800 dark:text-gray-300 font-semibold">{formatCurrency(employee.hourlyRate)}</p>
                </div>
              </div>

              {/* Sales Performance */}
              {employee.totalSales > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Sales Performance</span>
                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-gray-700 dark:text-gray-300">Total Sales:</span>
                      <span className="min-w-0 break-words text-right text-green-700 dark:text-green-400">{formatCurrency(employee.totalSales)}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-gray-700 dark:text-gray-300">Orders:</span>
                      <span className="text-gray-700 dark:text-gray-300">{employee.ordersProcessed}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-gray-700 dark:text-gray-300">Avg Order:</span>
                      <span className="min-w-0 break-words text-right text-gray-700 dark:text-gray-300">{formatCurrency(employee.averageOrderValue)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Shift */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">Next Shift:</span>
                </div>
                <span className="min-w-0 break-words text-blue-600 dark:text-blue-400 text-sm">{employee.nextShift}</span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(employee.id)}
                  onChange={() => handleSelectEmployee(employee.id)}
                  className="w-4 h-4 text-green-500 bg-white border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <button
                  onClick={() => handleViewPerformance(employee.id)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                  title="View Performance"
                >
                  <BarChart3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => handleScheduleShift(employee.id)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                  title="Schedule Shift"
                >
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => handleEditEmployee(employee.id)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                  title="Edit Employee"
                >
                  <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-green-400 flex items-center">
              <Calendar className="w-6 h-6 mr-3" />
              Today's Schedule
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Employee</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Position</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Start Time</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">End Time</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                  <th className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr key={shift.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 dark:border-gray-700/50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4 text-green-700 dark:text-green-400 font-medium">{shift.employeeName}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{shift.position}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{shift.startTime}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{shift.endTime}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm border ${
                        shift.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-400/30' :
                        shift.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-400/30' :
                        'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
                      }`}>
                        {shift.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleEditShift(shift.id)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                      >
                        <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {performanceMetrics.map((metric) => (
            <div key={`${metric.employeeId}-${metric.metric}`} className="min-w-0 bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="min-w-0 break-words text-green-700 dark:text-green-400 font-semibold">{metric.employeeName}</h3>
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{metric.metric}</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}%</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Target: {metric.target}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      metric.value >= metric.target ? 'bg-green-500 dark:bg-green-400' : 'bg-yellow-500 dark:bg-yellow-400'
                    }`}
                    style={{ width: `${Math.min(metric.value, 100)}%` }}
                  ></div>
                </div>
                <div className="flex items-center space-x-2">
                  {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                  {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                  {metric.trend === 'stable' && <div className="w-4 h-4 bg-gray-500 rounded-full" />}
                  <span className="text-gray-500 dark:text-gray-400 text-sm capitalize">{metric.trend}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredEmployees.length === 0 && activeTab === 'employees' && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-400 text-lg mb-2">No employees found</p>
          <p className="text-gray-500 dark:text-gray-500">Try adjusting your filters or add new employees</p>
        </div>
      )}
    </div>
  )
}
