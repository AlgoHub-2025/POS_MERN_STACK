import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Eye, TrendingUp, TrendingDown, Activity, Clock, Target, AlertTriangle, CheckCircle, Download, RefreshCw } from 'lucide-react'
import { VisionAnalytics } from '@/services/vision/visionAnalytics'

interface VisionAnalyticsDashboardProps {
  analytics: VisionAnalytics
  onExport?: () => void
  onRefresh?: () => void
  className?: string
}

export const VisionAnalyticsDashboard: React.FC<VisionAnalyticsDashboardProps> = ({
  analytics,
  onExport,
  onRefresh,
  className = ''
}) => {
  const [metrics, setMetrics] = useState(analytics.getMetrics())
  const [insights, setInsights] = useState(analytics.getInsights())
  const [summary, setSummary] = useState(analytics.getSummary())

  useEffect(() => {
    const updateData = () => {
      setMetrics(analytics.getMetrics())
      setInsights(analytics.getInsights())
      setSummary(analytics.getSummary())
    }

    updateData()
    const interval = setInterval(updateData, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [analytics])

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899']

  // Prepare chart data
  const performanceData = metrics.performanceOverTime.slice(-50).map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    accuracy: point.accuracy * 100,
    processingTime: point.processingTime,
    confidence: point.confidence * 100
  }))

  const categoryData = Object.entries(analytics.getAccuracyByCategory()).map(([category, accuracy]) => ({
    category: category.replace('_', ' ').toUpperCase(),
    accuracy: accuracy * 100,
    scans: metrics.accuracyByCategory[category]?.total || 0
  }))

  const lightingData = Object.entries(analytics.getAccuracyByLighting()).map(([condition, accuracy]) => ({
    condition: condition.charAt(0).toUpperCase() + condition.slice(1),
    accuracy: accuracy * 100,
    scans: metrics.accuracyByLighting[condition]?.total || 0
  }))

  const angleData = Object.entries(analytics.getAccuracyByAngle()).map(([angle, accuracy]) => ({
    angle,
    accuracy: accuracy * 100,
    scans: metrics.accuracyByAngle[angle]?.total || 0
  }))

  const pieData = [
    { name: 'Successful', value: metrics.successfulScans, color: '#10b981' },
    { name: 'Failed', value: metrics.totalScans - metrics.successfulScans, color: '#ef4444' }
  ]

  const renderMetricCard = (title: string, value: string | number, Icon: React.ComponentType<any>, color: string, trend?: { value: number; direction: 'up' | 'down' | 'stable' }) => (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-xs ${
            trend.direction === 'up' ? 'text-green-400' : 
            trend.direction === 'down' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  )

  const renderInsights = () => (
    <div className="space-y-2">
      {insights.map((insight, index) => (
        <div key={index} className={`p-3 rounded-lg border ${
          insight.type === 'warning' ? 'bg-yellow-900/20 border-yellow-400/50' :
          insight.type === 'success' ? 'bg-green-900/20 border-green-400/50' :
          'bg-blue-900/20 border-blue-400/50'
        }`}>
          <div className="flex items-start space-x-2">
            <div className={`mt-0.5 ${
              insight.type === 'warning' ? 'text-yellow-400' :
              insight.type === 'success' ? 'text-green-400' :
              'text-blue-400'
            }`}>
              {insight.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
              {insight.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {insight.type === 'info' && <Activity className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-300">{insight.message}</p>
              {insight.recommendation && (
                <p className="text-xs text-gray-400 mt-1">{insight.recommendation}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Eye className="w-6 h-6 mr-2 text-green-400" />
            Vision Recognition Analytics
          </h2>
          <p className="text-gray-400 text-sm mt-1">Real-time performance monitoring and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={onExport}
            className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
            title="Export data"
          >
            <Download className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderMetricCard(
          'Success Rate',
          `${(summary.successRate * 100).toFixed(1)}%`,
          Target,
          'bg-green-900/20',
          { value: 5.2, direction: 'up' }
        )}
        {renderMetricCard(
          'Total Scans',
          summary.totalScans.toLocaleString(),
          Activity,
          'bg-blue-900/20'
        )}
        {renderMetricCard(
          'Avg Confidence',
          `${(summary.averageConfidence * 100).toFixed(1)}%`,
          TrendingUp,
          'bg-purple-900/20'
        )}
        {renderMetricCard(
          'Processing Time',
          `${summary.averageProcessingTime.toFixed(0)}ms`,
          Clock,
          'bg-yellow-900/20'
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Over Time */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <h3 className="text-green-400 font-semibold mb-4">Performance Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#10b981', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fill: '#10b981', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={false}
                name="Accuracy %"
              />
              <Line 
                type="monotone" 
                dataKey="confidence" 
                stroke="#3b82f6" 
                strokeWidth={1}
                dot={false}
                name="Confidence %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Success Rate Pie Chart */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <h3 className="text-green-400 font-semibold mb-4">Success Rate Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
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
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }}></div>
                <span className="text-xs text-gray-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Performance */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <h3 className="text-green-400 font-semibold mb-4">Accuracy by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="category" 
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
              />
              <Bar dataKey="accuracy" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lighting Conditions */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <h3 className="text-green-400 font-semibold mb-4">Accuracy by Lighting</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={lightingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="condition" tick={{ fill: '#10b981', fontSize: 10 }} />
              <YAxis tick={{ fill: '#10b981', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="accuracy" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Angle Performance */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <h3 className="text-green-400 font-semibold mb-4">Accuracy by Angle</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={angleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="angle" tick={{ fill: '#10b981', fontSize: 10 }} />
              <YAxis tick={{ fill: '#10b981', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights and Product Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <h3 className="text-green-400 font-semibold mb-4">AI Insights</h3>
          {insights.length > 0 ? (
            renderInsights()
          ) : (
            <p className="text-gray-400 text-sm">No insights available at this time.</p>
          )}
        </div>

        {/* Top Performing Products */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <h3 className="text-green-400 font-semibold mb-4">Top Performing Products</h3>
          <div className="space-y-2">
            {metrics.topPerformingProducts.slice(0, 5).map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-300">{product.productName}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-400">{(product.accuracy * 100).toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">{product.detectionCount} scans</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <h3 className="text-green-400 font-semibold mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Top Category:</span>
            <span className="ml-2 text-white font-medium">{summary.topCategory}</span>
          </div>
          <div>
            <span className="text-gray-400">Worst Category:</span>
            <span className="ml-2 text-white font-medium">{summary.worstCategory}</span>
          </div>
          <div>
            <span className="text-gray-400">Performance Trend:</span>
            <span className={`ml-2 font-medium ${
              summary.performanceTrend === 'improving' ? 'text-green-400' :
              summary.performanceTrend === 'declining' ? 'text-red-400' :
              'text-gray-400'
            }`}>
              {summary.performanceTrend.charAt(0).toUpperCase() + summary.performanceTrend.slice(1)}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Failed Detections:</span>
            <span className="ml-2 text-white font-medium">{metrics.failedDetections.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisionAnalyticsDashboard
