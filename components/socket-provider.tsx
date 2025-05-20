"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/use-toast'

// Create socket context
interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export const useSocket = () => {
  return useContext(SocketContext)
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const [shouldConnect, setShouldConnect] = useState(true)
  const MAX_CONNECTION_ATTEMPTS = 3
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Only initialize on client-side after component is mounted
  useEffect(() => {
    setMounted(true)
    return () => {
      // Clear any intervals/timeouts when component unmounts
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
    }
  }, [])

  // Setup ping interval to keep connection alive
  const setupPingInterval = (socketInstance: Socket) => {
    // Clear any existing interval
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
    
    // Setup new ping interval (every 20 seconds)
    pingIntervalRef.current = setInterval(() => {
      if (socketInstance && socketInstance.connected) {
        socketInstance.emit('ping:client', (response: any) => {
          if (response?.status === 'ok') {
            // Connection is still good
            if (!isConnected) setIsConnected(true)
          }
        })
      }
    }, 20000) // 20 seconds
  }

  // Cleanup socket on auth status change
  useEffect(() => {
    // If status changes to unauthenticated, clean up socket connection
    if (status === 'unauthenticated' && socket) {
      console.log('Session ended, cleaning up socket connection')
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)
      
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
    }
  }, [status, socket])

  useEffect(() => {
    // Skip socket initialization during SSR or if not authenticated
    if (!mounted || status !== 'authenticated' || !session?.user || !shouldConnect) return

    // Cleanup any existing socket before creating a new one
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }

    // Clear any existing timeouts/intervals
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)

    // Improved connection options
    const options = {
      path: '/api/socketio',
      transports: ['websocket'], // Start with websocket only to reduce connection attempts
      reconnectionAttempts: 3,   // Limit reconnection attempts to reduce flickering
      reconnectionDelay: 3000,   // Longer delay between attempts
      reconnectionDelayMax: 10000,
      timeout: 45000,            // Longer timeout
      autoConnect: true,
      forceNew: true,
      auth: {
        userId: session.user.email || 'anonymous',
      },
    }

    // Initialize socket connection
    try {
      // Use window.location if available (client-side only)
      const url = typeof window !== 'undefined' 
        ? (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin)
        : 'http://localhost:3000'
      
      console.log('Initializing socket connection to:', url)
      
      // Create socket with error handling
      const socketInstance = io(url, options)
      
      socketInstance.on('connect', () => {
        console.log('Socket connected with ID:', socketInstance.id)
        setIsConnected(true)
        setConnectionAttempts(0) // Reset connection attempts on successful connection
        
        // Setup ping interval to keep connection alive
        setupPingInterval(socketInstance)
        
        // Only show toast on first connection, not reconnections
        if (!isConnected) {
          toast({
            title: 'Connected to server',
            description: 'Real-time updates enabled',
            variant: 'default',
          })
        }
      })

      // Handle specific welcome event from server
      socketInstance.on('connection:established', (data) => {
        console.log('Connection established:', data)
        setIsConnected(true)
        setConnectionAttempts(0)
      })

      socketInstance.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message)
        setConnectionAttempts(prev => prev + 1)
        
        // Don't show toast for every reconnection attempt
        if (!isConnected && connectionAttempts === 0) {
          toast({
            title: 'Connection issue',
            description: `Real-time updates may be delayed`,
            variant: 'default', // Use default instead of destructive to be less alarming
          })
        }
        
        // If we've exceeded max attempts, stop trying to reconnect
        if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
          console.log('Maximum connection attempts reached. Stopping reconnection.')
          setShouldConnect(false)
          socketInstance.disconnect()
          // Allow retry after a minute
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = setTimeout(() => {
            setShouldConnect(true)
            setConnectionAttempts(0)
          }, 60000)
        }
      })

      socketInstance.on('reconnect_attempt', (attemptNumber) => {
        console.log(`Reconnection attempt #${attemptNumber}`)
      })

      socketInstance.on('reconnect', (attemptNumber) => {
        console.log(`Socket reconnected after ${attemptNumber} attempts`)
        setIsConnected(true)
        setConnectionAttempts(0)
        
        // Restart ping interval
        setupPingInterval(socketInstance)
      })

      socketInstance.on('reconnect_error', (error) => {
        console.error('Reconnection error:', error)
      })

      socketInstance.on('reconnect_failed', () => {
        console.error('Failed to reconnect after multiple attempts')
        setIsConnected(false)
        setShouldConnect(false)
        // Allow retry after a minute
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = setTimeout(() => {
          setShouldConnect(true)
          setConnectionAttempts(0)
        }, 60000)
      })

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        
        // Only change isConnected state for network-related issues
        if (reason !== 'io client disconnect' && reason !== 'io server disconnect') {
          setIsConnected(false)
        }
        
        // Clear ping interval on disconnect
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
      })

      socketInstance.on('notification', (message) => {
        toast({
          title: 'Notification',
          description: message,
          variant: 'default',
        })
      })

      setSocket(socketInstance)

      // Cleanup function
      return () => {
        console.log('Cleaning up socket connection...')
        if (socketInstance) {
          socketInstance.removeAllListeners()
          socketInstance.disconnect()
        }
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      }
    } catch (error) {
      console.error('Error initializing socket:', error)
      toast({
        title: 'Socket Error',
        description: 'Failed to initialize socket connection',
        variant: 'destructive',
      })
      return () => {}
    }
  }, [session, toast, mounted, status, connectionAttempts, shouldConnect])

  // Don't use socket during server-side rendering
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
