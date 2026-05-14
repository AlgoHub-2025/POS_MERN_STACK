import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { TrendingUp, Mic, AlertCircle, CheckCircle, Clock, Globe } from 'lucide-react'

interface VoiceAnalyticsProps {
  voiceProcessor: any
  className?: string
}

export const VoiceAnalytics: React.FC<VoiceAnalyticsProps> = ({ voiceProcessor, className = '' }) => {
  const [analytics, setAnalytics] = useState<any>(null)
  const [commandHistory, setCommandHistory] = useState<any[]>([])
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const updateAnalytics = () => {
      const data = voiceProcessor.getAnalytics()
      const history = voiceProcessor.getCommandHistory()
      
      setAnalytics(data)
      setCommandHistory(history.slice(-20)) // Last 20 commands
    }

    updateAnalytics()
    const interval = setInterval(updateAnalytics, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [voiceProcessor])

  if (!analytics) {
    return (
      <div className={`p-4 bg-gray-900 border border-gray-700 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2 text-green-400">
          <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading analytics...</span>
        </div>
      </div>
    )
  }

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899']

  const intentData = Object.entries(analytics.intentDistribution).map(([intent, count]) => ({
    name: intent.replace('_', ' ').toUpperCase(),
    value: count as number,
    percentage: ((count as number) / analytics.totalCommands * 100).toFixed(1)
  }))

  const performanceMetrics = [
    {
      label: 'Success Rate',
      value: `${(analytics.successRate * 100).toFixed(1)}%`,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20'
    },
    {
      label: 'Avg Confidence',
      value: `${(analytics.averageConfidence * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20'
    },
    {
      label: 'Total Commands',
      value: analytics.totalCommands.toString(),
      icon: Mic,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20'
    },
    {
      label: 'Response Time',
      value: '<500ms',
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20'
    }
  ]

  const recentCommands = commandHistory.slice(-10).reverse().map(cmd => ({
    command: cmd.command,
    intent: cmd.intent,
    success: cmd.success,
    confidence: (cmd.confidence * 100).toFixed(1),
    time: new Date(cmd.timestamp).toLocaleTimeString()
  }))

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {performanceMetrics.map((metric, index) => (
          <div key={index} className={`p-3 ${metric.bgColor} border border-gray-700 rounded-lg`}>
            <div className="flex items-center justify-between">
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
              <span className={`text-xs font-medium ${metric.color}`}>
                {metric.value}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Intent Distribution */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <h3 className="text-green-400 font-semibold mb-3 flex items-center">
            <BarChart className="w-4 h-4 mr-2" />
            Intent Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={intentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#10b981', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fill: '#10b981', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#10b981' }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Success Rate Pie Chart */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <h3 className="text-green-400 font-semibold mb-3 flex items-center">
            <PieChart className="w-4 h-4 mr-2" />
            Command Success Rate
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Successful', value: analytics.totalCommands * analytics.successRate },
                  { name: 'Failed', value: analytics.totalCommands * (1 - analytics.successRate) }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-xs text-gray-400">Success</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-xs text-gray-400">Failed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Commands */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-green-400 font-semibold flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Recent Commands
          </h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-green-400 hover:text-green-300 transition-colors"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recentCommands.map((cmd, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded text-xs">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  cmd.success ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span className="text-gray-300 truncate" title={cmd.command}>
                  {cmd.command}
                </span>
              </div>
              <div className="flex items-center space-x-3 flex-shrink-0">
                <span className="text-green-400 bg-gray-700 px-2 py-1 rounded">
                  {cmd.intent}
                </span>
                <span className="text-gray-400">
                  {cmd.confidence}%
                </span>
                <span className="text-gray-500">
                  {cmd.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Analytics (when expanded) */}
      {showDetails && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <h3 className="text-green-400 font-semibold mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Detailed Analytics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Intent Breakdown */}
            <div>
              <h4 className="text-green-300 text-sm font-medium mb-2">Intent Breakdown</h4>
              <div className="space-y-1">
                {intentData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{item.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-400 h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-300 w-12 text-right">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Insights */}
            <div>
              <h4 className="text-green-300 text-sm font-medium mb-2">Performance Insights</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-gray-400">
                    Commands processed: {analytics.totalCommands}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-3 h-3 text-blue-400" />
                  <span className="text-gray-400">
                    Average confidence: {(analytics.averageConfidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-3 h-3 text-yellow-400" />
                  <span className="text-gray-400">
                    Failed commands: {Math.round(analytics.totalCommands * (1 - analytics.successRate))}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-3 h-3 text-purple-400" />
                  <span className="text-gray-400">
                    Most used intent: {intentData[0]?.name || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VoiceAnalytics
