import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { io, Socket } from 'socket.io-client'
import { RootState } from '@/store'

interface UseSocketOptions {
  autoConnect?: boolean
  reconnection?: boolean
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { autoConnect = true, reconnection = true } = options
  const socketRef = useRef<Socket | null>(null)
  const { isAuthenticated, tokens } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (!isAuthenticated || !tokens?.accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }

    const socketUrl = ((import.meta as any).env?.VITE_SOCKET_URL as string | undefined) || window.location.origin
    
    socketRef.current = io(socketUrl, {
      auth: {
        token: tokens.accessToken
      },
      autoConnect,
      reconnection,
      transports: ['websocket', 'polling']
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [isAuthenticated, tokens, autoConnect, reconnection])

  const socket = socketRef.current

  const emit = (event: string, data?: any) => {
    socket?.emit(event, data)
  }

  const on = (event: string, callback: (...args: any[]) => void) => {
    socket?.on(event, callback)
  }

  const off = (event: string, callback?: (...args: any[]) => void) => {
    socket?.off(event, callback)
  }

  const joinRoom = (room: string) => {
    socket?.emit('join-room', room)
  }

  const leaveRoom = (room: string) => {
    socket?.emit('leave-room', room)
  }

  return {
    socket,
    isConnected: socket?.connected || false,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom
  }
}
