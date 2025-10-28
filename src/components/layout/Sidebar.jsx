import React from 'react'

export const Sidebar = ({ activeSection, setActiveSection, navigationItems, user }) => {
  // Add Users item if user is super admin
  const allNavigationItems = user?.role === 'super_admin' 
    ? [...navigationItems, { id: 'users', label: 'Users', icon: '👤' }]
    : navigationItems

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shrink-0">
      <nav className="p-4 space-y-2 h-full overflow-y-auto">
        {allNavigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeSection === item.id 
                ? 'bg-linear-to-br from-blue-600 to-purple-600 text-white shadow-lg' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
