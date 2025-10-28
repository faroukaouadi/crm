import React, { useState, useRef, useEffect } from 'react'

export const UserDropdown = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const menuItems = [
    { icon: '👤', label: 'Profil', action: () => console.log('Profil clicked') },
    { icon: '⚙️', label: 'Paramètres', action: () => console.log('Settings clicked') },
    { icon: '🔧', label: 'Paramètres de l\'app', action: () => console.log('App settings clicked') },
    { icon: '🚪', label: 'Déconnexion', action: onLogout, isLast: true }
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
      >
        AU
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-fadeInUp">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Admin User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">admin@crm.com</p>
          </div>
          
          <div className="py-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.action()
                  setIsOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  item.isLast ? 'border-t border-gray-200 dark:border-gray-700 mt-1 pt-3' : ''
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
