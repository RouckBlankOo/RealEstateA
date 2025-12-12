'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FiMessageSquare, 
  FiUsers, 
  FiSettings, 
  FiLogOut,
  FiBarChart2,
  FiHelpCircle
} from 'react-icons/fi'
import NotificationBell from "@/components/NotificationBell";

export default function Sidebar() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('messages')

  const handleLogout = () => {
    localStorage.removeItem('supportToken')
    localStorage.removeItem('supportUser')
    router.push('/login')
  }

  const navItems = [
    { id: 'messages', icon: FiMessageSquare, label: 'Messages', active: true },
    { id: 'customers', icon: FiUsers, label: 'Customers' },
    { id: 'analytics', icon: FiBarChart2, label: 'Analytics' },
    { id: 'help', icon: FiHelpCircle, label: 'Help' },
  ]

  return (
    <div className="w-16 bg-gray-900 flex flex-col items-center py-4 border-r border-gray-800">
      {/* Logo */}
      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-8">
        <span className="text-white font-bold text-lg">S</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
              activeTab === item.id
                ? 'bg-orange-500 text-white'
                : 'text-gray-500 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {/* Tooltip */}
            <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {item.label}
            </span>
          </button>
        ))}
        {/* Notification Bell */}
        <div className="mt-4">
          <NotificationBell />
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center space-y-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
            activeTab === 'settings'
              ? 'bg-orange-500 text-white'
              : 'text-gray-500 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <FiSettings className="w-5 h-5" />
          <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Settings
          </span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group relative"
        >
          <FiLogOut className="w-5 h-5" />
          <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Logout
          </span>
        </button>

        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm mt-2 cursor-pointer">
          A
        </div>
      </div>
    </div>
  )
}
