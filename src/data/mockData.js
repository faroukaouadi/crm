// Données statiques pour le CRM
export const dashboardStats = {
  invoices: {
    total: 156,
    totalAmount: 485670,
    pending: 23,
    paid: 133,
    percentage: 85
  },
  clients: {
    total: 342,
    active: 298,
    new: 12,
    percentage: 87
  },
  companies: {
    total: 89,
    active: 76,
    percentage: 85
  },
  revenue: {
    thisMonth: 156780,
    lastMonth: 142350,
    growth: 10.2
  }
}

export const recentInvoices = [
  { id: 1, client: 'Acme Corp', amount: 155420, status: 'Paid', date: '2024-01-15', due: '2024-01-30' },
  { id: 2, client: 'Tech Solutions', amount: 8950, status: 'Pending', date: '2024-01-18', due: '2024-02-01' },
  { id: 3, client: 'Global Industries', amount: 25600, status: 'Paid', date: '2024-01-20', due: '2024-02-05' },
  { id: 4, client: 'Digital Agency', amount: 12300, status: 'Overdue', date: '2024-01-10', due: '2024-01-25' },
  { id: 5, client: 'Startup Inc', amount: 7800, status: 'Pending', date: '2024-01-22', due: '2024-02-07' }
]

export const recentClients = [
  { id: 1, name: 'Acme Corp', email: 'contact@acme.com', company: 'Acme Corp', status: 'Active', deals: 5, total: 125400 },
  { id: 2, name: 'John Doe', email: 'john@tech.com', company: 'Tech Solutions', status: 'Active', deals: 3, total: 45600 },
  { id: 3, name: 'Jane Smith', email: 'jane@global.com', company: 'Global Industries', status: 'Active', deals: 8, total: 189000 },
  { id: 4, name: 'Mike Johnson', email: 'mike@digital.com', company: 'Digital Agency', status: 'Active', deals: 2, total: 28700 },
  { id: 5, name: 'Sarah Wilson', email: 'sarah@startup.com', company: 'Startup Inc', status: 'Active', deals: 1, total: 15600 }
]

export const companies = [
  { id: 1, name: 'Acme Corporation', type: 'Company', employees: 250, industry: 'Technology', revenue: 1500000, status: 'Active' },
  { id: 2, name: 'Tech Solutions Inc', type: 'Company', employees: 120, industry: 'IT Services', revenue: 850000, status: 'Active' },
  { id: 3, name: 'Global Industries', type: 'Company', employees: 500, industry: 'Manufacturing', revenue: 5000000, status: 'Active' },
  { id: 4, name: 'Digital Marketing Pro', type: 'Agency', employees: 45, industry: 'Marketing', revenue: 480000, status: 'Active' },
  { id: 5, name: 'John Doe', type: 'Person', employees: 1, industry: 'Consulting', revenue: 120000, status: 'Active' }
]

export const quotes = [
  { id: 1, client: 'Acme Corp', amount: 25000, status: 'Approved', date: '2024-01-15', validUntil: '2024-02-15' },
  { id: 2, client: 'Tech Solutions', amount: 18000, status: 'Pending', date: '2024-01-20', validUntil: '2024-02-20' },
  { id: 3, client: 'Global Industries', amount: 45000, status: 'Rejected', date: '2024-01-10', validUntil: '2024-02-10' },
  { id: 4, client: 'Digital Agency', amount: 32000, status: 'Approved', date: '2024-01-22', validUntil: '2024-02-22' },
  { id: 5, client: 'Startup Inc', amount: 15000, status: 'Pending', date: '2024-01-25', validUntil: '2024-02-25' }
]

export const navigationItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
  { id: 'invoices', label: 'Factures', icon: '💰' },
  { id: 'clients', label: 'Clients', icon: '👥' },
  { id: 'companies', label: 'Sociétés', icon: '🏢' },
  { id: 'quotes', label: 'Devis', icon: '📄' },
  { id: 'reports', label: 'Rapports', icon: '📈' }
]

// Données pour les graphiques
export const revenueData = [
  { month: 'Jan', revenue: 142000 },
  { month: 'Fév', revenue: 148000 },
  { month: 'Mar', revenue: 152000 },
  { month: 'Avr', revenue: 145000 },
  { month: 'Mai', revenue: 158000 },
  { month: 'Juin', revenue: 156780 }
]

export const invoiceStatusData = [
  { name: 'Payée', value: 133, color: '#10b981' },
  { name: 'En attente', value: 23, color: '#f59e0b' },
  { name: 'En retard', value: 8, color: '#ef4444' }
]

export const clientGrowthData = [
  { month: 'Jan', newClients: 8, totalClients: 310 },
  { month: 'Fév', newClients: 10, totalClients: 320 },
  { month: 'Mar', newClients: 12, totalClients: 332 },
  { month: 'Avr', newClients: 9, totalClients: 341 },
  { month: 'Mai', newClients: 14, totalClients: 355 },
  { month: 'Juin', newClients: 12, totalClients: 367 }
]

export const comparisonData = [
  { month: 'Jan', lastMonth: 120000, thisMonth: 142000 },
  { month: 'Fév', lastMonth: 130000, thisMonth: 148000 },
  { month: 'Mar', lastMonth: 140000, thisMonth: 152000 },
  { month: 'Avr', lastMonth: 135000, thisMonth: 145000 },
  { month: 'Mai', lastMonth: 150000, thisMonth: 158000 },
  { month: 'Juin', lastMonth: 142350, thisMonth: 156780 }
]

export const sectorData = [
  { sector: 'Technologie', value: 185000 },
  { sector: 'IT Services', value: 145000 },
  { sector: 'Manufacturing', value: 210000 },
  { sector: 'Marketing', value: 98000 },
  { sector: 'Consulting', value: 75000 }
]
