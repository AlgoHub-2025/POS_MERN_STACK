import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  Key, 
  Users, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Smartphone,
  Mail,
  Clock,
  RefreshCw,
  Settings,
  UserPlus,
  Trash2,
  Edit,
  Download,
  Upload
} from 'lucide-react'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: 'active' | 'inactive' | 'suspended'
  twoFactorEnabled: boolean
  lastLogin: string
  permissions: string[]
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  isSystem: boolean
}

interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export const AdvancedAuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | '2fa' | 'security'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  useEffect(() => {
    // Simulate API call to fetch auth data
    const fetchAuthData = async () => {
      setIsLoading(true)
      
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@algohub.com',
          firstName: 'System',
          lastName: 'Administrator',
          role: 'Super Admin',
          status: 'active',
          twoFactorEnabled: true,
          lastLogin: '2026-02-16 14:30',
          permissions: ['all']
        },
        {
          id: '2',
          email: 'manager@algohub.com',
          firstName: 'Store',
          lastName: 'Manager',
          role: 'Manager',
          status: 'active',
          twoFactorEnabled: true,
          lastLogin: '2026-02-16 08:15',
          permissions: ['manage_inventory', 'manage_employees', 'view_reports']
        },
        {
          id: '3',
          email: 'cashier@algohub.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'Cashier',
          status: 'active',
          twoFactorEnabled: false,
          lastLogin: '2026-02-15 18:45',
          permissions: ['process_sales', 'view_products']
        }
      ]

      const mockRoles: Role[] = [
        {
          id: '1',
          name: 'Super Admin',
          description: 'Full system access with all permissions',
          permissions: ['all'],
          userCount: 1,
          isSystem: true
        },
        {
          id: '2',
          name: 'Manager',
          description: 'Store management with operational control',
          permissions: ['manage_inventory', 'manage_employees', 'view_reports', 'process_sales'],
          userCount: 3,
          isSystem: false
        },
        {
          id: '3',
          name: 'Cashier',
          description: 'Point of sale operations',
          permissions: ['process_sales', 'view_products'],
          userCount: 8,
          isSystem: false
        },
        {
          id: '4',
          name: 'Viewer',
          description: 'Read-only access to reports and analytics',
          permissions: ['view_reports', 'view_analytics'],
          userCount: 2,
          isSystem: false
        }
      ]

      // Simulate API delay
      setTimeout(() => {
        setUsers(mockUsers)
        setRoles(mockRoles)
        setIsLoading(false)
      }, 1000)
    }

    fetchAuthData()
  }, [])

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleEnable2FA = (userId: string) => {
    console.log('Enabling 2FA for user:', userId)
    // Generate mock 2FA setup data
    const mockSetup: TwoFactorSetup = {
      secret: 'JBSWY3DPEHPK3PXP',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      backupCodes: [
        '12345678', '87654321', '11112222', '33334444',
        '55556666', '77778888', '99990000', '11113333'
      ]
    }
    setTwoFactorSetup(mockSetup)
    setBackupCodes(mockSetup.backupCodes)
  }

  const handleDisable2FA = (userId: string) => {
    console.log('Disabling 2FA for user:', userId)
    // Update user state
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, twoFactorEnabled: false } : user
    ))
  }

  const handleCreateRole = () => {
    console.log('Creating new role')
    // Implement role creation
  }

  const handleEditRole = (roleId: string) => {
    console.log('Editing role:', roleId)
    // Implement role editing
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900/50 text-green-400 border-green-400/30'
      case 'inactive': return 'bg-gray-700 text-gray-400'
      case 'suspended': return 'bg-red-900/50 text-red-400 border-red-400/30'
      default: return 'bg-gray-700 text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-400 rounded-full animate-spin border-t-transparent"></div>
          <p className="text-green-400 mt-4">Loading Security Settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-400 mb-2">Advanced Authentication</h1>
        <p className="text-gray-400">Manage user authentication, roles, and security settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-800 rounded-xl p-1 border border-gray-700 mb-6">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'users'
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'roles'
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Shield className="w-5 h-5 inline mr-2" />
            Roles
          </button>
          <button
            onClick={() => setActiveTab('2fa')}
            className={`py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === '2fa'
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Smartphone className="w-5 h-5 inline mr-2" />
            2FA
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'security'
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Lock className="w-5 h-5 inline mr-2" />
            Security
          </button>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Actions */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  disabled={selectedUsers.length === 0}
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Invite ({selectedUsers.length})</span>
                </button>
              </div>
              <div className="flex space-x-2">
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">2FA</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Login</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/50 transition-colors duration-200">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-green-400 font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{user.role}</td>
                      <td className="py-3 px-4">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(user.status)}`}>
                          <span>{user.status.toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {user.twoFactorEnabled ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 text-sm">Enabled</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-400" />
                              <span className="text-red-400 text-sm">Disabled</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{user.lastLogin}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => user.twoFactorEnabled ? handleDisable2FA(user.id) : handleEnable2FA(user.id)}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              user.twoFactorEnabled 
                                ? 'bg-red-900/50 hover:bg-red-800/50' 
                                : 'bg-green-900/50 hover:bg-green-800/50'
                            }`}
                            title={user.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                          >
                            <Smartphone className="w-4 h-4 text-white" />
                          </button>
                          <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200">
                            <Edit className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Role Actions */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-green-400">Role Management</h2>
              <button 
                onClick={handleCreateRole}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Role</span>
              </button>
            </div>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-400/50 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-green-400 font-semibold text-lg">{role.name}</h3>
                    <p className="text-gray-400 text-sm">{role.description}</p>
                  </div>
                  {role.isSystem && (
                    <div className="px-2 py-1 bg-purple-900/50 text-purple-400 rounded text-xs">
                      SYSTEM
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Users</span>
                    <span className="text-green-400 font-medium">{role.userCount}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Permissions</span>
                    <span className="text-green-400 font-medium">{role.permissions.length}</span>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  {role.permissions.slice(0, 3).map((permission, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-gray-300 text-sm capitalize">{permission.replace('_', ' ')}</span>
                    </div>
                  ))}
                  {role.permissions.length > 3 && (
                    <p className="text-gray-400 text-xs">+{role.permissions.length - 3} more permissions</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditRole(role.id)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm"
                  >
                    <Edit className="w-4 h-4 inline mr-1" />
                    Edit
                  </button>
                  {!role.isSystem && (
                    <button className="bg-red-900/50 hover:bg-red-800/50 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2FA Tab */}
      {activeTab === '2fa' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-green-400 mb-4">Two-Factor Authentication Setup</h2>
            
            {!twoFactorSetup ? (
              <div className="text-center py-8">
                <Smartphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Select a user to enable or manage 2FA</p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200">
                  Setup 2FA for User
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* QR Code Section */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-green-400 font-semibold mb-4">Scan QR Code</h3>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                      <p className="text-gray-800 text-center">QR Code Placeholder</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-2">Or enter this code manually:</p>
                    <div className="flex items-center justify-center space-x-2">
                      <code className="bg-gray-900 text-green-400 px-4 py-2 rounded font-mono">
                        {twoFactorSetup.secret}
                      </code>
                      <button className="p-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors duration-200">
                        <Copy className="w-4 h-4 text-gray-300" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Backup Codes */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-green-400 font-semibold mb-4">Backup Codes</h3>
                  <p className="text-gray-400 text-sm mb-4">Save these codes in a secure location</p>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="bg-gray-900 px-4 py-2 rounded font-mono text-center text-green-400">
                        {code}
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                      <Download className="w-4 h-4 inline mr-2" />
                      Download Codes
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                      <RefreshCw className="w-4 h-4 inline mr-2" />
                      Generate New Codes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-green-400 mb-4">Security Settings</h2>
            
            <div className="space-y-6">
              {/* Password Policy */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-green-400 font-semibold mb-3">Password Policy</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Minimum password length</span>
                    <input type="number" defaultValue="8" className="bg-gray-600 text-white px-3 py-1 rounded w-20" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Require uppercase letters</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-green-400" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Require numbers</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-green-400" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Require special characters</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-green-400" />
                  </label>
                </div>
              </div>

              {/* Session Management */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-green-400 font-semibold mb-3">Session Management</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Session timeout (minutes)</span>
                    <input type="number" defaultValue="30" className="bg-gray-600 text-white px-3 py-1 rounded w-20" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Maximum concurrent sessions</span>
                    <input type="number" defaultValue="3" className="bg-gray-600 text-white px-3 py-1 rounded w-20" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Require re-authentication for sensitive actions</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-green-400" />
                  </label>
                </div>
              </div>

              {/* Login Security */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-green-400 font-semibold mb-3">Login Security</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Enable account lockout after failed attempts</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-green-400" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Lockout threshold</span>
                    <input type="number" defaultValue="5" className="bg-gray-600 text-white px-3 py-1 rounded w-20" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Lockout duration (minutes)</span>
                    <input type="number" defaultValue="15" className="bg-gray-600 text-white px-3 py-1 rounded w-20" />
                  </label>
                </div>
              </div>

              <div className="flex space-x-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200">
                  Save Security Settings
                </button>
                <button className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition-colors duration-200">
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
