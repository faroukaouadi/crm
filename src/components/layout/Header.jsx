import React from 'react'
import { UserDropdown } from '../ui/UserDropdown'

export const Header = ({ onLogout, user, onShowProfile }) => (
  <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
    <div className="px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-lg">CRM</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">CRM System</h1>
      </div>
      <div className="flex items-center space-x-3">
        <button className="bg-gray-100 dark:bg-gray-700 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <span className="text-lg">🔔</span>
        </button>
        <UserDropdown onLogout={onLogout} user={user} onShowProfile={onShowProfile} />
      </div>
    </div>
  </header>
)
