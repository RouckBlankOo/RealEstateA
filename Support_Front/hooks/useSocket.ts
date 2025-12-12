import { useEffect, useRef, useCallback } from 'react'
import io, { Socket } from 'socket.io-client'
import { useChatStore } from '@/store/chatStore'

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null)
  const currentThreadRef = useRef<string | null>(null)
  
  // Get store functions directly to avoid dependency issues
  const addMessage = useChatStore(state => state.addMessage)
  const updateMessage = useChatStore(state => state.updateMessage)
  const removeMessage = useChatStore(state => state.removeMessage)
  const updateThread = useChatStore(state => state.updateThread)
  const setTypingUser = useChatStore(state => state.setTypingUser)
  const setUserOnline = useChatStore(state => state.setUserOnline)

  // Initialize socket connection ONCE
  useEffect(() => {
    const token = localStorage.getItem('supportToken')
    if (!token) {
      console.log('❌ No support token found, skipping socket connection')
      return
    }

    // Prevent duplicate connections
    if (socketRef.current?.connected) {
      console.log('Socket already connected')
      return
    }

    console.log('🔌 Initializing socket connection to:', SOCKET_URL)

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Connected to socket server, socket id:', socket.id)
      
      // Rejoin current thread if any
      if (currentThreadRef.current) {
        console.log('🔄 Rejoining thread after reconnect:', currentThreadRef.current)
        socket.emit('thread:join', { threadId: currentThreadRef.current })
      }
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from socket server, reason:', reason)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    // Thread join confirmation
    socket.on('thread:joined', (data) => {
      console.log('✅ Successfully joined thread:', data.threadId)
    })

    // Message events
    socket.on('message:new', (data) => {
      console.log('📨 New message received via socket:', data)
      
      if (data.message) {
        // Ensure threadId is set on the message
        const messageWithThread = {
          ...data.message,
          threadId: data.threadId || data.message.threadId,
        };
        console.log('Adding message to store:', messageWithThread)
        addMessage(messageWithThread)
      }
      
      // Update thread's last message in the list
      if (data.threadId) {
        updateThread(data.threadId, {
          lastMessage: {
            content: data.message?.content?.text || 'Image',
            senderId: data.message?.sender?.userId,
            timestamp: new Date(data.message?.createdAt || Date.now()),
            type: data.message?.type || 'text',
          },
        })
      }
    })

    socket.on('message:edited', (data) => {
      console.log('✏️ Message edited:', data)
      updateMessage(data.message._id, data.message)
    })

    socket.on('message:deleted', (data) => {
      console.log('🗑️ Message deleted:', data)
      removeMessage(data.messageId)
    })

    // Typing events
    socket.on('typing:user', (data) => {
      setTypingUser(data.userId, data.isTyping)
    })

    // Read receipts
    socket.on('messages:read', (data) => {
      console.log('✅ Messages read:', data)
    })

    // Online/offline status
    socket.on('user:online', (data) => {
      setUserOnline(data.userId, true)
    })

    socket.on('user:offline', (data) => {
      setUserOnline(data.userId, false)
    })

    // Thread status changes
    socket.on('thread:status:changed', (data) => {
      console.log('📊 Thread status changed:', data)
      updateThread(data.threadId, { status: data.status })
    })

    // Cleanup on unmount only
    return () => {
      console.log('� Disconnecting socket')
      socket.disconnect()
      socketRef.current = null
    }
  }, []) // Empty dependency array - only run once!

  // Join thread function
  const joinThread = useCallback((threadId: string) => {
    if (socketRef.current?.connected) {
      console.log('📥 Joining thread room:', threadId)
      socketRef.current.emit('thread:join', { threadId })
      currentThreadRef.current = threadId
    } else {
      console.log('⚠️ Socket not connected, cannot join thread')
      currentThreadRef.current = threadId // Store for when socket connects
    }
  }, [])

  // Leave thread function  
  const leaveThread = useCallback((threadId: string) => {
    if (socketRef.current?.connected) {
      console.log('📤 Leaving thread room:', threadId)
      socketRef.current.emit('thread:leave', { threadId })
    }
    if (currentThreadRef.current === threadId) {
      currentThreadRef.current = null
    }
  }, [])

  // Return socket methods for components to use
  return {
    socket: socketRef.current,
    
    joinThread,
    leaveThread,
    
    sendMessage: (threadId: string, type: string, content: any, tempId?: string) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('message:send', { threadId, type, content, tempId })
      }
    },
    
    startTyping: (threadId: string) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('typing:start', { threadId })
      }
    },
    
    stopTyping: (threadId: string) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('typing:stop', { threadId })
      }
    },
    
    markAsRead: (threadId: string) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('message:read', { threadId })
      }
    },
    
    on: (event: string, handler: Function) => {
      if (socketRef.current) {
        socketRef.current.on(event, handler as any)
      }
    },
    
    off: (event: string, handler?: Function) => {
      if (socketRef.current) {
        socketRef.current.off(event, handler as any)
      }
    },
  }
}
