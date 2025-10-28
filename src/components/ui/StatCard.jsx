import React from 'react'

export const StatCard = ({ title, value, subtitle, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">{title}</h3>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: `${color}15` }}>
        <span className="text-xl">{icon}</span>
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
    <p className="text-gray-500 dark:text-gray-400 text-sm">{subtitle}</p>
  </div>
)

export const StatusBadge = ({ status }) => {
  const colors = {
    Paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    Overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    Active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    Approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    Rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'}`}>
      {status}
    </span>
  )
}

export const GradientCard = ({ children, gradient, className = "" }) => (
  <div className={`rounded-xl shadow-sm p-6 text-white ${gradient} ${className}`}>
    {children}
  </div>
)

export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{title}</h2>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{subtitle}</p>
    </div>
    {action && action}
  </div>
)
