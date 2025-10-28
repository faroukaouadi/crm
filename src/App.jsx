import React, { useState } from 'react'
import { LoginPage } from './components/auth/LoginPage'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { DashboardStats, RecentInvoices, QuickStats } from './components/dashboard/DashboardStats'
import { InvoicesTable, ClientsTable, CompaniesTable, QuotesTable } from './components/dashboard/Tables'
import { ReportsSection } from './components/dashboard/Reports'
import { 
  dashboardStats, 
  recentInvoices, 
  recentClients, 
  companies, 
  quotes, 
  navigationItems 
} from './data/mockData'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <DashboardStats stats={dashboardStats} />
            <QuickStats stats={dashboardStats} />
            <RecentInvoices invoices={recentInvoices} />
          </div>
        )
      case 'invoices':
        return <InvoicesTable invoices={recentInvoices} />
      case 'clients':
        return <ClientsTable clients={recentClients} />
      case 'companies':
        return <CompaniesTable companies={companies} />
      case 'quotes':
        return <QuotesTable quotes={quotes} />
      case 'reports':
        return <ReportsSection stats={dashboardStats} />
      default:
        return <DashboardStats stats={dashboardStats} />
    }
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <Header onLogout={handleLogout} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          navigationItems={navigationItems}
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App