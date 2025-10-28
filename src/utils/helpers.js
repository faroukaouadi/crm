// Utilitaires pour le CRM
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(amount)
}

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

export const getStatusColor = (status) => {
  const colors = {
    Paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    Overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    Active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    Approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    Rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

export const getCardColors = () => {
  return {
    invoices: '#10b981',
    clients: '#3b82f6', 
    companies: '#8b5cf6',
    revenue: '#f59e0b'
  }
}
