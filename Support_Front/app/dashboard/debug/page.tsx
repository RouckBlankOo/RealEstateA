'use client'

import { useEffect, useState } from 'react'
import { apiService, API_URL } from '@/services/api'

export default function DebugPage() {
  const [status, setStatus] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setLoading(true)
    const checks: any = {}

    // Check 1: Local Storage
    const token = localStorage.getItem('supportToken')
    const user = localStorage.getItem('supportUser')
    checks.tokenExists = !!token
    checks.tokenPreview = token ? token.substring(0, 20) + '...' : 'None'
    checks.user = user ? JSON.parse(user) : null

    // Check 2: API URL
    checks.apiUrl = API_URL

    // Check 3: Try to fetch tickets
    try {
      const response = await apiService.getSupportTickets()
      checks.apiSuccess = response.success
      checks.ticketCount = response.data?.length || 0
      checks.tickets = response.data
    } catch (error: any) {
      checks.apiSuccess = false
      checks.apiError = error.message
      checks.apiErrorDetails = error.response?.data
    }

    setStatus(checks)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug Dashboard</h1>

        <button
          onClick={checkStatus}
          className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🔄 Refresh Status
        </button>

        {loading ? (
          <div className="bg-white p-6 rounded shadow">Loading...</div>
        ) : (
          <div className="space-y-4">
            {/* Authentication Status */}
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-4">🔐 Authentication</h2>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-semibold w-40">Token Exists:</span>
                  <span className={status.tokenExists ? 'text-green-600' : 'text-red-600'}>
                    {status.tokenExists ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-40">Token Preview:</span>
                  <span className="text-gray-600 text-sm font-mono">{status.tokenPreview}</span>
                </div>
                {status.user && (
                  <>
                    <div className="flex">
                      <span className="font-semibold w-40">User Email:</span>
                      <span>{status.user.email}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-40">User Role:</span>
                      <span>{status.user.role}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-40">User Name:</span>
                      <span>{status.user.firstName} {status.user.lastName}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* API Configuration */}
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-4">🌐 API Configuration</h2>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-semibold w-40">API URL:</span>
                  <span className="text-gray-600">{status.apiUrl}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-40">Endpoint:</span>
                  <span className="text-gray-600">{status.apiUrl}/api/support</span>
                </div>
              </div>
            </div>

            {/* API Response */}
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-4">📡 API Response</h2>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-semibold w-40">Success:</span>
                  <span className={status.apiSuccess ? 'text-green-600' : 'text-red-600'}>
                    {status.apiSuccess ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                {status.apiSuccess ? (
                  <>
                    <div className="flex">
                      <span className="font-semibold w-40">Ticket Count:</span>
                      <span className="text-gray-600">{status.ticketCount}</span>
                    </div>
                    {status.ticketCount > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Tickets:</h3>
                        <div className="space-y-2">
                          {status.tickets.map((ticket: any, index: number) => (
                            <div key={ticket._id} className="p-3 bg-gray-50 rounded">
                              <div className="font-semibold">
                                {index + 1}. {ticket.user?.firstName} {ticket.user?.lastName}
                              </div>
                              <div className="text-sm text-gray-600">{ticket.email}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                {ticket.content.substring(0, 100)}...
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Created: {new Date(ticket.createdAt).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex">
                      <span className="font-semibold w-40">Error:</span>
                      <span className="text-red-600">{status.apiError}</span>
                    </div>
                    {status.apiErrorDetails && (
                      <div className="mt-2">
                        <span className="font-semibold">Error Details:</span>
                        <pre className="mt-2 p-3 bg-red-50 rounded text-sm overflow-auto">
                          {JSON.stringify(status.apiErrorDetails, null, 2)}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Raw Status Object */}
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-4">🔍 Raw Status</h2>
              <pre className="p-4 bg-gray-50 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(status, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
