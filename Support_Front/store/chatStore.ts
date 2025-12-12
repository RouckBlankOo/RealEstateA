import { create } from 'zustand'

export interface User {
  _id: string
  fullName: string
  email: string
  avatar?: string
  role: string[]
}

export interface Message {
  _id: string
  threadId: string
  sender: {
    userId: User | string
    role: string
  }
  type: 'text' | 'image' | 'file' | 'system'
  content: {
    text?: string
    mediaUrl?: string
    fileName?: string
    fileSize?: number
    mimeType?: string
  }
  status: 'sent' | 'delivered' | 'read' | 'failed'
  readBy?: Array<{ userId: string; readAt: Date }>
  replyTo?: string
  isEdited?: boolean
  editedAt?: Date
  createdAt: string
  updatedAt: string
}

export interface Thread {
  _id: string
  participants: Array<{
    userId: User | string
    role: string
    lastReadAt?: Date
  }>
  type: 'user_to_user' | 'user_to_support' | 'group'
  status: 'active' | 'closed' | 'archived'
  subject?: string
  category?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  lastMessage?: {
    content: string
    senderId: string
    timestamp: Date
    type: string
  }
  unreadCount: number
  messageCount: number
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

interface ChatState {
  threads: Thread[]
  selectedThread: Thread | null
  messages: Message[]
  typingUsers: Set<string>
  onlineUsers: Set<string>
  stats: {
    active: number
    closed: number
    unassigned: number
    highPriority: number
    totalMessages: number
  } | null
  
  setThreads: (threads: Thread[]) => void
  addThread: (thread: Thread) => void
  updateThread: (threadId: string, updates: Partial<Thread>) => void
  setSelectedThread: (thread: Thread | null) => void
  
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  removeMessage: (messageId: string) => void
  
  setTypingUser: (userId: string, isTyping: boolean) => void
  setUserOnline: (userId: string, isOnline: boolean) => void
  setStats: (stats: any) => void
}

export const useChatStore = create<ChatState>((set) => ({
  threads: [],
  selectedThread: null,
  messages: [],
  typingUsers: new Set(),
  onlineUsers: new Set(),
  stats: null,

  setThreads: (threads) => set({ threads }),
  
  addThread: (thread) => set((state) => ({
    threads: [thread, ...state.threads]
  })),
  
  updateThread: (threadId, updates) => set((state) => ({
    threads: state.threads.map(t => 
      t._id === threadId ? { ...t, ...updates } : t
    ),
    selectedThread: state.selectedThread?._id === threadId 
      ? { ...state.selectedThread, ...updates }
      : state.selectedThread
  })),
  
  setSelectedThread: (thread) => set({ selectedThread: thread, messages: [] }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => {
    // Only add message if it belongs to the currently selected thread
    // or if no thread is selected (to avoid adding to wrong conversation)
    if (!state.selectedThread || message.threadId === state.selectedThread._id) {
      // Check if message already exists to avoid duplicates
      const exists = state.messages.some(m => m._id === message._id);
      if (exists) {
        return { messages: state.messages };
      }
      return { messages: [...state.messages, message] };
    }
    return { messages: state.messages };
  }),
  
  updateMessage: (messageId, updates) => set((state) => ({
    messages: state.messages.map(m =>
      m._id === messageId ? { ...m, ...updates } : m
    )
  })),
  
  removeMessage: (messageId) => set((state) => ({
    messages: state.messages.filter(m => m._id !== messageId)
  })),
  
  setTypingUser: (userId, isTyping) => set((state) => {
    const newTypingUsers = new Set(state.typingUsers)
    if (isTyping) {
      newTypingUsers.add(userId)
    } else {
      newTypingUsers.delete(userId)
    }
    return { typingUsers: newTypingUsers }
  }),
  
  setUserOnline: (userId, isOnline) => set((state) => {
    const newOnlineUsers = new Set(state.onlineUsers)
    if (isOnline) {
      newOnlineUsers.add(userId)
    } else {
      newOnlineUsers.delete(userId)
    }
    return { onlineUsers: newOnlineUsers }
  }),
  
  setStats: (stats) => set({ stats }),
}))
