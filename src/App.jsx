import React, { useState, useEffect } from 'react'
import { LoginPage } from './components/auth/LoginPage'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { DashboardStats, RecentInvoices, QuickStats } from './components/dashboard/DashboardStats'
import { InvoicesTable } from './components/dashboard/InvoicesTable'
import { ClientsTable } from './components/dashboard/ClientsTable'
import { CompaniesTable } from './components/dashboard/CompaniesTable'
import { QuotesTable } from './components/dashboard/QuotesTable'
import { ReportsSection } from './components/dashboard/Reports'
import { ProfilePage } from './components/dashboard/ProfilePage'
import { UsersPage } from './components/dashboard/UsersPage'
import { SettingsPage } from './components/dashboard/SettingsPage'
import { NotificationProvider } from './contexts/NotificationContext'
import { 
  dashboardStats, 
  recentInvoices, 
  recentClients, 
  companies, 
  quotes, 
  navigationItems 
} from './data/mockData'
import authService from './services/authService'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showProfile, setShowProfile] = useState(false)

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await authService.verifyToken()
        if (isValid) {
          setIsAuthenticated(true)
          setUser(authService.getCurrentUser())
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsAuthenticated(false)
      setUser(null)
    }
  }

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser)
  }

  const handleShowProfile = () => {
    setActiveSection('profile')
  }

  const handleCloseProfile = () => {
    setActiveSection('dashboard')
  }

  const handleShowSettings = () => {
    setActiveSection('settings')
  }

  const handleCloseSettings = () => {
    setActiveSection('dashboard')
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
        return <InvoicesTable currentUser={user} />
      case 'clients':
        return <ClientsTable currentUser={user} />
      case 'companies':
        return <CompaniesTable currentUser={user} />
      case 'quotes':
        return <QuotesTable currentUser={user} />
      case 'reports':
        return <ReportsSection stats={dashboardStats} />
      case 'profile':
        return <ProfilePage user={user} onUserUpdate={handleUserUpdate} onClose={handleCloseProfile} />
      case 'users':
        return <UsersPage currentUser={user} />
      case 'settings':
        return <SettingsPage onClose={handleCloseSettings} />
      default:
        return <DashboardStats stats={dashboardStats} />
    }
  }

  if (!isAuthenticated) {
    return (
      <NotificationProvider>
        <LoginPage onLogin={handleLogin} />
      </NotificationProvider>
    )
  }

  // Afficher un loader pendant la vérification d'authentification
  if (isLoading) {
    return (
      <NotificationProvider>
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Vérification de l'authentification...</p>
          </div>
        </div>
      </NotificationProvider>
    )
  }

  return (
    <NotificationProvider>
      <div className="h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
        <Header onLogout={handleLogout} user={user} onShowProfile={handleShowProfile} onShowSettings={handleShowSettings} />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar 
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            navigationItems={navigationItems}
            user={user}
          />
          
          <main className="flex-1 overflow-y-auto">
            <div className="p-8 h-full">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  )
}

export default App