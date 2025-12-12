'use client'

import { useEffect, useState } from 'react'
import { apiService } from '@/services/api'
import { FiX, FiTrendingUp, FiMessageSquare, FiUsers, FiAlertCircle } from 'react-icons/fi'

interface StatisticsProps {
  onClose: () => void
}

export default function Statistics({ onClose }: StatisticsProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const response = await apiService.getSupportStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = stats ? [
    {
      icon: <FiUsers className="text-blue-600" size={24} />,
      label: 'Active Threads',
      value: stats.active,
      color: 'blue',
      bgColor: 'bg-blue-50',
    },
    {
      icon: <FiMessageSquare className="text-green-600" size={24} />,
      label: 'Closed Threads',
      value: stats.closed,
      color: 'green',
      bgColor: 'bg-green-50',
    },
    {
      icon: <FiAlertCircle className="text-red-600" size={24} />,
      label: 'Unassigned',
      value: stats.unassigned,
      color: 'red',
      bgColor: 'bg-red-50',
    },
    {
      icon: <FiTrendingUp className="text-orange-600" size={24} />,
      label: 'High Priority',
      value: stats.highPriority,
      color: 'orange',
      bgColor: 'bg-orange-50',
    },
    {
      icon: <FiMessageSquare className="text-purple-600" size={24} />,
      label: 'Total Messages',
      value: stats.totalMessages,
      color: 'purple',
      bgColor: 'bg-purple-50',
    },
  ] : []

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Statistics Dashboard</h2>
            <p className="text-gray-600">Overview of support conversations and performance</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white rounded-lg transition-colors border border-gray-200"
          >
            <FiX size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
              {statCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className={`${card.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    {card.icon}
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Response Metrics */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Conversations</span>
                    <span className="font-semibold text-gray-900">{stats?.active || 0}</span>
                  </div>
                  <div className="h-px bg-gray-200"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Resolution Rate</span>
                    <span className="font-semibold text-green-600">
                      {stats?.closed && stats?.active + stats?.closed > 0
                        ? `${Math.round((stats.closed / (stats.active + stats.closed)) * 100)}%`
                        : '0%'}
                    </span>
                  </div>
                  <div className="h-px bg-gray-200"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Avg Messages/Thread</span>
                    <span className="font-semibold text-gray-900">
                      {stats?.totalMessages && stats?.active + stats?.closed > 0
                        ? Math.round(stats.totalMessages / (stats.active + stats.closed))
                        : 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Priority Distribution */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">High Priority</span>
                      <span className="text-sm font-semibold text-red-600">{stats?.highPriority || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${stats?.highPriority && stats?.active > 0
                            ? (stats.highPriority / stats.active) * 100
                            : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Unassigned</span>
                      <span className="text-sm font-semibold text-orange-600">{stats?.unassigned || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${stats?.unassigned && stats?.active > 0
                            ? (stats.unassigned / stats.active) * 100
                            : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Normal Priority</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {stats?.active - (stats?.highPriority || 0) || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${stats?.active && stats?.highPriority
                            ? ((stats.active - stats.highPriority) / stats.active) * 100
                            : 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Tips</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Prioritize unassigned and high-priority threads first</li>
                <li>• Maintain an active thread count below 50 for optimal response time</li>
                <li>• Close resolved threads to keep the dashboard organized</li>
                <li>• Use thread assignment to distribute workload among team members</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
