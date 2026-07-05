import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { useSocket } from './useSocket'
import { RootState } from '@/store'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  data?: any
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useSelector((state: RootState) => state.auth)
  const { socket, on, off } = useSocket()

  useEffect(() => {
    if (!socket || !user) return

    // Listen for new notifications
    const handleNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false
      }

      setNotifications(prev => [newNotification, ...prev])
      setUnreadCount(prev => prev + 1)

      const toastMessage = `${notification.title}: ${notification.message}`

      // Show toast notification
      switch (notification.type) {
        case 'success':
          toast.success(toastMessage)
          break
        case 'error':
          toast.error(toastMessage)
          break
        case 'warning':
          toast(toastMessage, {
            icon: '⚠️',
          })
          break
        default:
          toast(toastMessage)
      }
    }

    // Listen for system notifications
    const handleSystemNotification = (data: any) => {
      handleNotification({
        type: data.type || 'info',
        title: data.title,
        message: data.message,
        data: data.data
      })
    }

    // Listen for sales notifications
    const handleSaleNotification = (data: any) => {
      handleNotification({
        type: 'success',
        title: 'New Sale Completed',
        message: `Sale #${data.saleId} - $${data.total}`,
        data: data
      })
    }

    // Listen for inventory alerts
    const handleInventoryAlert = (data: any) => {
      handleNotification({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${data.productName} is running low (${data.quantity} remaining)`,
        data: data
      })
    }

    // Listen for user activity
    const handleUserActivity = (data: any) => {
      handleNotification({
        type: 'info',
        title: 'User Activity',
        message: `${data.userName} ${data.action}`,
        data: data
      })
    }

    // Register event listeners
    on('notification', handleNotification)
    on('system-notification', handleSystemNotification)
    on('sale-completed', handleSaleNotification)
    on('inventory-alert', handleInventoryAlert)
    on('user-activity', handleUserActivity)

    // Cleanup
    return () => {
      off('notification', handleNotification)
      off('system-notification', handleSystemNotification)
      off('sale-completed', handleSaleNotification)
      off('inventory-alert', handleInventoryAlert)
      off('user-activity', handleUserActivity)
    }
  }, [socket, user, on, off])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }

  const clearNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId)
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1))
      }
      return prev.filter(n => n.id !== notificationId)
    })
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification
  }
}
