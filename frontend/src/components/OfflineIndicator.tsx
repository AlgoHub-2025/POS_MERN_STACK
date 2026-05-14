import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, AlertCircle, RefreshCw, Check } from 'lucide-react'

interface OfflineIndicatorProps {
  className?: string
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncQueueSize, setSyncQueueSize] = useState(0)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setTimeout(() => setShowStatus(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowStatus(true)
    }

    const handleConnectionChange = () => {
      setIsOnline(navigator.onLine)
      if (!navigator.onLine) {
        setShowStatus(true)
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('connectionchange', handleConnectionChange)

    // Check sync queue size periodically
    const checkSyncQueue = async () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel()
        messageChannel.port1.onmessage = (event) => {
          if (event.data && event.data.size !== undefined) {
            setSyncQueueSize(event.data.size)
          }
        }
        
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_SYNC_QUEUE_SIZE' },
          [messageChannel.port2]
        )
      }
    }

    const interval = setInterval(checkSyncQueue, 5000)
    checkSyncQueue() // Initial check

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('connectionchange', handleConnectionChange)
      clearInterval(interval)
    }
  }, [])

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-400 bg-red-900/20 border-red-400/50'
    if (syncQueueSize > 0) return 'text-yellow-400 bg-yellow-900/20 border-yellow-400/50'
    return 'text-green-400 bg-green-900/20 border-green-400/50'
  }

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />
    if (syncQueueSize > 0) return <RefreshCw className="w-4 h-4 animate-spin" />
    return <Wifi className="w-4 h-4" />
  }

  const getStatusText = () => {
    if (!isOnline) return 'Offline Mode'
    if (syncQueueSize > 0) return `Syncing (${syncQueueSize})`
    return 'Online'
  }

  const getDetailedStatus = () => {
    if (!isOnline) {
      return {
        title: 'Offline Mode Active',
        description: 'All transactions will be queued and synced when connection is restored.',
        icon: <WifiOff className="w-8 h-8 text-red-400" />,
        color: 'text-red-400'
      }
    }

    if (syncQueueSize > 0) {
      return {
        title: 'Sync in Progress',
        description: `${syncQueueSize} items waiting to sync with server.`,
        icon: <RefreshCw className="w-8 h-8 text-yellow-400 animate-spin" />,
        color: 'text-yellow-400'
      }
    }

    return {
      title: 'Fully Synced',
      description: 'All data is synchronized with the server.',
      icon: <Check className="w-8 h-8 text-green-400" />,
      color: 'text-green-400'
    }
  }

  const detailedStatus = getDetailedStatus()

  if (!showStatus && isOnline && syncQueueSize === 0) {
    return null
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      {/* Compact indicator */}
      <div
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg border
          bg-gray-900/90 backdrop-blur-sm transition-all duration-300
          ${getStatusColor()}
          ${showStatus ? 'cursor-default' : 'cursor-pointer'}
        `}
        onClick={() => setShowStatus(!showStatus)}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
        {!showStatus && (
          <AlertCircle className="w-3 h-3" />
        )}
      </div>

      {/* Detailed status panel */}
      {showStatus && (
        <div className="mt-2 p-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl min-w-80">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {detailedStatus.icon}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${detailedStatus.color}`}>
                {detailedStatus.title}
              </h3>
              <p className="text-gray-300 text-sm mt-1">
                {detailedStatus.description}
              </p>
              
              {/* Additional info */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Connection:</span>
                  <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
                    {isOnline ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                {syncQueueSize > 0 && (
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Queued items:</span>
                    <span className="text-yellow-400">{syncQueueSize}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex space-x-2">
                {syncQueueSize > 0 && (
                  <button
                    onClick={async () => {
                      // Trigger manual sync
                      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                        navigator.serviceWorker.controller.postMessage({
                          type: 'TRIGGER_SYNC'
                        })
                      }
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    Sync Now
                  </button>
                )}
                
                <button
                  onClick={() => setShowStatus(false)}
                  className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OfflineIndicator
