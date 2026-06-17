import React, { useRef, useState } from 'react'
import {
    Building2,
    Palette,
    Bell,
    Plug,
    Database,
    Save,
    RotateCcw,
    Sun,
    Moon,
    Monitor,
    Mail,
    Smartphone,
    Cloud,
    CreditCard,
    CheckCircle,
    XCircle,
    ChevronRight,
    Shield,
    Clock,
    DollarSign,
    MapPin,
    Phone,
    Upload
} from 'lucide-react'

type TabId = 'business' | 'appearance' | 'notifications' | 'integrations' | 'system'

interface TabConfig {
    id: TabId
    label: string
    icon: React.ElementType
    description: string
}

const tabs: TabConfig[] = [
    { id: 'business', label: 'Business Profile', icon: Building2, description: 'Company information and branding' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme, colors and display' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts, emails and push' },
    { id: 'integrations', label: 'Integrations', icon: Plug, description: 'Third-party connections' },
    { id: 'system', label: 'System', icon: Database, description: 'Backup, logs and advanced' },
]

export const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('business')
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
    const [accentColor, setAccentColor] = useState('Blue')
    const [saved, setSaved] = useState(false)
    const logoInputRef = useRef<HTMLInputElement>(null)
    const importInputRef = useRef<HTMLInputElement>(null)
    const [businessInfo, setBusinessInfo] = useState({
        name: 'AlgoHub Coffee',
        email: 'contact@algohubcoffee.com',
        phone: '+1-555-0100',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'United States',
        timezone: 'America/New_York',
        currency: 'USD',
        taxRate: '8.875',
    })
    const [notifications, setNotifications] = useState({
        emailOrders: true,
        emailLowStock: true,
        emailReports: false,
        pushOrders: true,
        pushLowStock: true,
        pushSecurity: true,
        smsAlerts: false,
        dailyDigest: true,
        weeklyReport: true,
    })

    const handleSave = () => {
        localStorage.setItem('algohub-settings', JSON.stringify({ businessInfo, notifications, theme, accentColor }))
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        setBusinessInfo({ ...businessInfo, name: businessInfo.name })
        window.alert(`Logo selected: ${file.name}`)
        event.target.value = ''
    }

    const handleCreateBackup = () => {
        const backup = JSON.stringify({ businessInfo, notifications, theme, accentColor, createdAt: new Date().toISOString() }, null, 2)
        const url = URL.createObjectURL(new Blob([backup], { type: 'application/json' }))
        const link = document.createElement('a')
        link.href = url
        link.download = `algohub-settings-backup-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        URL.revokeObjectURL(url)
    }

    const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        try {
            const imported = JSON.parse(await file.text())
            if (imported.businessInfo) setBusinessInfo(imported.businessInfo)
            if (imported.notifications) setNotifications(imported.notifications)
            if (imported.theme) setTheme(imported.theme)
            if (imported.accentColor) setAccentColor(imported.accentColor)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch {
            window.alert('Import failed. Please choose a valid settings backup JSON file.')
        } finally {
            event.target.value = ''
        }
    }

    const handleRestoreBackup = () => {
        if (window.confirm('Restore settings from a backup file? Current unsaved changes may be replaced.')) {
            importInputRef.current?.click()
        }
    }

    const handleIntegrationAction = (name: string, connected: boolean) => {
        window.alert(`${connected ? 'Configure' : 'Connect'} ${name} is ready for backend integration.`)
    }

    const integrations = [
        { name: 'Stripe', description: 'Payment processing', icon: CreditCard, connected: true, color: 'bg-purple-500' },
        { name: 'Twilio', description: 'SMS & messaging', icon: Smartphone, color: 'bg-red-500', connected: false },
        { name: 'SendGrid', description: 'Email delivery', icon: Mail, color: 'bg-blue-500', connected: true },
        { name: 'AWS S3', description: 'Cloud storage', icon: Cloud, color: 'bg-orange-500', connected: true },
        { name: 'Google Maps', description: 'Location services', icon: MapPin, color: 'bg-green-500', connected: false },
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between animate-slide-up">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-1">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your store configuration and preferences</p>
                </div>
                <div className="flex items-center space-x-3">
                    <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    <input ref={importInputRef} type="file" accept="application/json,.json" onChange={handleImportData} className="hidden" />
                    <button onClick={() => window.location.reload()} className="btn-secondary">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </button>
                    <button onClick={handleSave} className="btn-primary">
                        {saved ? (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Tab Navigation Sidebar */}
                <div className="card p-2 animate-slide-up lg:col-span-1" style={{ animationDelay: '0.1s' }}>
                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group ${isActive
                                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{tab.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{tab.description}</p>
                                    </div>
                                    {isActive && <ChevronRight className="w-4 h-4 text-primary-500 flex-shrink-0" />}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Business Profile Tab */}
                    {activeTab === 'business' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Logo & Name */}
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Store Identity</h3>
                                <div className="flex items-start space-x-6">
                                    <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-2xl flex items-center justify-center flex-shrink-0 group cursor-pointer hover:shadow-lg transition-all duration-300">
                                        <Building2 className="w-10 h-10 text-primary-600 group-hover:scale-110 transition-transform duration-200" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="form-group">
                                            <label className="form-label">Business Name</label>
                                            <input className="input" value={businessInfo.name} onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })} />
                                        </div>
                                        <button
                                            onClick={() => logoInputRef.current?.click()}
                                            className="btn-secondary btn-sm"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload Logo
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="form-label flex items-center"><Mail className="w-4 h-4 mr-2" />Email</label>
                                        <input className="input" type="email" value={businessInfo.email} onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label flex items-center"><Phone className="w-4 h-4 mr-2" />Phone</label>
                                        <input className="input" value={businessInfo.phone} onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })} />
                                    </div>
                                    <div className="form-group md:col-span-2">
                                        <label className="form-label flex items-center"><MapPin className="w-4 h-4 mr-2" />Address</label>
                                        <input className="input" value={businessInfo.address} onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input className="input" value={businessInfo.city} onChange={(e) => setBusinessInfo({ ...businessInfo, city: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">State / Province</label>
                                        <input className="input" value={businessInfo.state} onChange={(e) => setBusinessInfo({ ...businessInfo, state: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Regional & Tax */}
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Regional & Tax Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="form-group">
                                        <label className="form-label flex items-center"><Clock className="w-4 h-4 mr-2" />Timezone</label>
                                        <select className="input" value={businessInfo.timezone} onChange={(e) => setBusinessInfo({ ...businessInfo, timezone: e.target.value })}>
                                            <option value="America/New_York">Eastern (ET)</option>
                                            <option value="America/Chicago">Central (CT)</option>
                                            <option value="America/Denver">Mountain (MT)</option>
                                            <option value="America/Los_Angeles">Pacific (PT)</option>
                                            <option value="Asia/Karachi">Pakistan (PKT)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label flex items-center"><DollarSign className="w-4 h-4 mr-2" />Currency</label>
                                        <select className="input" value={businessInfo.currency} onChange={(e) => setBusinessInfo({ ...businessInfo, currency: e.target.value })}>
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="PKR">PKR (₨)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label flex items-center"><Shield className="w-4 h-4 mr-2" />Tax Rate (%)</label>
                                        <input className="input" type="number" step="0.001" value={businessInfo.taxRate} onChange={(e) => setBusinessInfo({ ...businessInfo, taxRate: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Theme Selection */}
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Theme</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { value: 'light' as const, label: 'Light', icon: Sun, desc: 'Classic bright interface' },
                                        { value: 'dark' as const, label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
                                        { value: 'system' as const, label: 'System', icon: Monitor, desc: 'Match OS preference' },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setTheme(option.value)}
                                            className={`p-6 rounded-xl border-2 transition-all duration-300 text-left group hover-lift ${theme === option.value
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-lg shadow-primary-200/50 dark:shadow-primary-900/30'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            <option.icon className={`w-8 h-8 mb-3 ${theme === option.value ? 'text-primary-600' : 'text-gray-400'}`} />
                                            <p className={`font-semibold ${theme === option.value ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>{option.label}</p>
                                            <p className="text-sm text-gray-500 mt-1">{option.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Accent Colors */}
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Accent Color</h3>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { name: 'Blue', color: 'bg-blue-500', ring: 'ring-blue-400' },
                                        { name: 'Purple', color: 'bg-purple-500', ring: 'ring-purple-400' },
                                        { name: 'Green', color: 'bg-emerald-500', ring: 'ring-emerald-400' },
                                        { name: 'Rose', color: 'bg-rose-500', ring: 'ring-rose-400' },
                                        { name: 'Amber', color: 'bg-amber-500', ring: 'ring-amber-400' },
                                        { name: 'Teal', color: 'bg-teal-500', ring: 'ring-teal-400' },
                                        { name: 'Indigo', color: 'bg-indigo-500', ring: 'ring-indigo-400' },
                                    ].map((accent) => (
                                        <button
                                            key={accent.name}
                                            onClick={() => setAccentColor(accent.name)}
                                            className={`w-10 h-10 ${accent.color} rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ${accentColor === accent.name ? `ring-2 ${accent.ring}` : ''}`}
                                            title={accent.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Display options */}
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Display</h3>
                                <div className="space-y-4">
                                    <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Compact Mode</p>
                                            <p className="text-xs text-gray-500">Reduce spacing for more content</p>
                                        </div>
                                        <input type="checkbox" className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
                                    </label>
                                    <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Animations</p>
                                            <p className="text-xs text-gray-500">Enable smooth transitions and effects</p>
                                        </div>
                                        <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
                                    </label>
                                    <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Sidebar Always Visible</p>
                                            <p className="text-xs text-gray-500">Keep navigation sidebar open</p>
                                        </div>
                                        <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6 animate-fade-in">
                            {['Email Notifications', 'Push Notifications', 'Schedule'].map((section, sIdx) => (
                                <div key={section} className="card p-6" style={{ animationDelay: `${sIdx * 0.1}s` }}>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                        {sIdx === 0 && <Mail className="w-5 h-5 mr-2 text-primary-500" />}
                                        {sIdx === 1 && <Bell className="w-5 h-5 mr-2 text-primary-500" />}
                                        {sIdx === 2 && <Clock className="w-5 h-5 mr-2 text-primary-500" />}
                                        {section}
                                    </h3>
                                    <div className="space-y-3">
                                        {sIdx === 0 && (
                                            <>
                                                <ToggleRow label="New order confirmations" desc="Get emailed when a new order is placed" checked={notifications.emailOrders} onChange={(v) => setNotifications({ ...notifications, emailOrders: v })} />
                                                <ToggleRow label="Low stock alerts" desc="Be notified when inventory runs low" checked={notifications.emailLowStock} onChange={(v) => setNotifications({ ...notifications, emailLowStock: v })} />
                                                <ToggleRow label="Weekly report digest" desc="Receive summary reports every Monday" checked={notifications.emailReports} onChange={(v) => setNotifications({ ...notifications, emailReports: v })} />
                                            </>
                                        )}
                                        {sIdx === 1 && (
                                            <>
                                                <ToggleRow label="Order updates" desc="Real-time push for new and updated orders" checked={notifications.pushOrders} onChange={(v) => setNotifications({ ...notifications, pushOrders: v })} />
                                                <ToggleRow label="Low stock warnings" desc="Instant alert when stock is critical" checked={notifications.pushLowStock} onChange={(v) => setNotifications({ ...notifications, pushLowStock: v })} />
                                                <ToggleRow label="Security alerts" desc="Failed logins and suspicious activity" checked={notifications.pushSecurity} onChange={(v) => setNotifications({ ...notifications, pushSecurity: v })} />
                                            </>
                                        )}
                                        {sIdx === 2 && (
                                            <>
                                                <ToggleRow label="Daily digest" desc="Summary of the day's activity at 6 PM" checked={notifications.dailyDigest} onChange={(v) => setNotifications({ ...notifications, dailyDigest: v })} />
                                                <ToggleRow label="Weekly report" desc="Comprehensive weekly analytics" checked={notifications.weeklyReport} onChange={(v) => setNotifications({ ...notifications, weeklyReport: v })} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Integrations Tab */}
                    {activeTab === 'integrations' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Connected Services</h3>
                                <div className="space-y-4">
                                    {integrations.map((integration, index) => (
                                        <div
                                            key={integration.name}
                                            className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 hover:shadow-md animate-slide-up"
                                            style={{ animationDelay: `${index * 0.08}s` }}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 ${integration.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                                    <integration.icon className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{integration.name}</p>
                                                    <p className="text-sm text-gray-500">{integration.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                {integration.connected ? (
                                                    <span className="badge-success flex items-center">
                                                        <CheckCircle className="w-3 h-3 mr-1" />Connected
                                                    </span>
                                                ) : (
                                                    <span className="badge-gray flex items-center">
                                                        <XCircle className="w-3 h-3 mr-1" />Disconnected
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handleIntegrationAction(integration.name, integration.connected)}
                                                    className={`btn-sm ${integration.connected ? 'btn-secondary' : 'btn-primary'}`}
                                                >
                                                    {integration.connected ? 'Configure' : 'Connect'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* System Tab */}
                    {activeTab === 'system' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* System Info */}
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">System Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { label: 'Application Version', value: 'v4.0.0' },
                                        { label: 'Node.js Version', value: 'v20.11.0' },
                                        { label: 'Database', value: 'MongoDB 7.0' },
                                        { label: 'Last Backup', value: 'Today, 03:00 AM' },
                                        { label: 'Uptime', value: '14 days, 6 hours' },
                                        { label: 'Storage Used', value: '2.4 GB / 10 GB' },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Data Management */}
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Data Management</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button onClick={handleCreateBackup} className="btn-success w-full py-4">
                                        <Database className="w-5 h-5 mr-2" />
                                        Create Backup
                                    </button>
                                    <button onClick={() => importInputRef.current?.click()} className="btn-secondary w-full py-4">
                                        <Upload className="w-5 h-5 mr-2" />
                                        Import Data
                                    </button>
                                    <button onClick={handleRestoreBackup} className="btn-warning w-full py-4">
                                        <RotateCcw className="w-5 h-5 mr-2" />
                                        Restore Backup
                                    </button>
                                </div>
                            </div>

                            {/* Storage Usage Bar */}
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Storage Usage</h3>
                                <div className="space-y-4">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                                        <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-4 rounded-full transition-all duration-500" style={{ width: '24%' }}></div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">2.4 GB used</span>
                                        <span className="text-gray-600 dark:text-gray-400">10 GB total</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { label: 'Products & Images', value: '1.2 GB', percent: '50%', color: 'bg-blue-500' },
                                            { label: 'Reports & Logs', value: '0.8 GB', percent: '33%', color: 'bg-amber-500' },
                                            { label: 'Backups', value: '0.4 GB', percent: '17%', color: 'bg-emerald-500' },
                                        ].map((item) => (
                                            <div key={item.label} className="text-center">
                                                <div className={`w-3 h-3 ${item.color} rounded-full mx-auto mb-1`}></div>
                                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
                                                <p className="text-xs text-gray-500">{item.value} ({item.percent})</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Toggle row component
const ToggleRow: React.FC<{ label: string; desc: string; checked: boolean; onChange: (val: boolean) => void }> = ({ label, desc, checked, onChange }) => (
    <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
        <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
            <p className="text-xs text-gray-500">{desc}</p>
        </div>
        <div className="relative">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only"
            />
            <div
                onClick={() => onChange(!checked)}
                className={`w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${checked ? 'translate-x-5.5 ml-[22px]' : 'translate-x-0.5 ml-[2px]'}`}></div>
            </div>
        </div>
    </label>
)

export default SettingsPage
