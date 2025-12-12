'use client'

import { useEffect, useState } from 'react'
import { useChatStore } from '@/store/chatStore'
import { apiService } from '@/services/api'
import { FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'

export default function ThreadList() {
  const { threads, setThreads, selectedThread, setSelectedThread } = useChatStore()
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'closed' | 'unassigned'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadThreads = async () => {
    setLoading(true)
    try {
      const params: any = { limit: 50 }
      
      if (filter === 'active' || filter === 'closed') {
        params.status = filter
      }
      
      const response = await apiService.getThreads(params)
      if (response.success) {
        let threadList = response.data
        
        // Filter unassigned
        if (filter === 'unassigned') {
          threadList = threadList.filter((t: any) => !t.assignedTo)
        }
        
        setThreads(threadList)
      }
    } catch (error) {
      console.error('Failed to load threads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadThreads()
  }, [filter])

  const filteredThreads = threads.filter((thread) => {
    if (!searchQuery) return true
    
    const user = thread.participants.find((p) => p.role === 'user')
    const userName = typeof user?.userId === 'object' ? user.userId.fullName : ''
    const lastMsg = thread.lastMessage?.content || ''
    
    return (
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMsg.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const getUser = (thread: any) => {
    const userParticipant = thread.participants.find((p: any) => p.role === 'user')
    return typeof userParticipant?.userId === 'object' ? userParticipant.userId : null
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
          <button
            onClick={loadThreads}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          {['all', 'active', 'closed', 'unassigned'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {loading && threads.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="spinner"></div>
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-gray-500 text-sm">No conversations found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredThreads.map((thread) => {
              const user = getUser(thread)
              const isSelected = selectedThread?._id === thread._id
              
              return (
                <div
                  key={thread._id}
                  onClick={() => setSelectedThread(thread)}
                  className={`p-4 cursor-pointer thread-item ${isSelected ? 'active' : ''} hover:bg-gray-50 transition-colors`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                        {user?.fullName?.charAt(0) || '?'}
                      </div>
                      {thread.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                          {thread.unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate text-sm">
                          {user?.fullName || 'Unknown User'}
                        </h3>
                        {thread.lastMessage && thread.lastMessage.timestamp && (
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {formatDistanceToNow(new Date(thread.lastMessage.timestamp), { addSuffix: true })}
                          </span>
                        )}
                      </div>

                      {/* Last Message */}
                      {thread.lastMessage && (
                        <p className="text-sm text-gray-600 truncate mb-2">
                          {thread.lastMessage.type === 'image' ? '📷 Image' : thread.lastMessage.content}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center space-x-2">
                        {thread.priority && (
                          <span className={`w-2 h-2 rounded-full ${getPriorityColor(thread.priority)}`}></span>
                        )}
                        {thread.category && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {thread.category.replace('_', ' ')}
                          </span>
                        )}
                        {thread.status === 'closed' && (
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                            Closed
                          </span>
                        )}
                        {thread.assignedTo && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            Assigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
