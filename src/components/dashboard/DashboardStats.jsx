import React from 'react'
import { StatCard } from '../ui/StatCard'
import { DataTable, TableCell } from '../ui/DataTable'
import { GradientCard } from '../ui/StatCard'
import { SectionHeader } from '../ui/StatCard'
import { StatusBadge } from '../ui/StatCard'
import { RevenueChart, InvoiceStatusChart } from '../ui/Charts'
import { formatCurrency, getCardColors } from '../../utils/helpers'
import { revenueData, invoiceStatusData } from '../../data/mockData'

export const DashboardStats = ({ stats }) => {
  const colors = getCardColors()
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Factures"
        value={stats.invoices.total}
        subtitle={`${stats.invoices.percentage}% payées`}
        icon="💰"
        color={colors.invoices}
      />
      <StatCard
        title="Clients"
        value={stats.clients.total}
        subtitle={`${stats.clients.active} actifs`}
        icon="👥"
        color={colors.clients}
      />
      <StatCard
        title="Sociétés"
        value={stats.companies.total}
        subtitle={`${stats.companies.percentage}% actives`}
        icon="🏢"
        color={colors.companies}
      />
      <StatCard
        title="Revenus Mois"
        value={formatCurrency(stats.revenue.thisMonth)}
        subtitle={`+${stats.revenue.growth}% vs mois dernier`}
        icon="💵"
        color={colors.revenue}
      />
    </div>
  )
}

export const RecentInvoices = ({ invoices }) => {
  const headers = ['Client', 'Montant', 'Statut', 'Date']
  
  const renderRow = (invoice) => [
    <TableCell key="client" className="font-medium">{invoice.client}</TableCell>,
    <TableCell key="amount">{formatCurrency(invoice.amount)}</TableCell>,
    <TableCell key="status"><StatusBadge status={invoice.status} /></TableCell>,
    <TableCell key="date" className="text-gray-600 dark:text-gray-400">{invoice.date}</TableCell>
  ]

  return (
    <div>
      <SectionHeader 
        title="Factures récentes" 
        subtitle="Dernières factures créées"
        action={
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm">
            Voir tout →
          </button>
        }
      />
      <DataTable headers={headers} data={invoices} renderRow={renderRow} />
    </div>
  )
}

export const QuickStats = ({ stats }) => (
  <div className="space-y-6">
   

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RevenueChart data={revenueData} />
      <InvoiceStatusChart data={invoiceStatusData} />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <GradientCard gradient="bg-linear-to-br from-emerald-500 to-emerald-600">
        <div className="flex items-center justify-between">
          <span className="text-3xl">✅</span>
          <div className="text-right">
            <p className="text-3xl font-bold">{stats.invoices.paid}</p>
            <p className="text-emerald-100 text-sm">Factures payées</p>
          </div>
        </div>
      </GradientCard>
      
      <GradientCard gradient="bg-linear-to-br from-amber-500 to-orange-500">
        <div className="flex items-center justify-between">
          <span className="text-3xl">⏳</span>
          <div className="text-right">
            <p className="text-3xl font-bold">{stats.invoices.pending}</p>
            <p className="text-amber-100 text-sm">Factures en attente</p>
          </div>
        </div>
      </GradientCard>
      
      <GradientCard gradient="bg-linear-to-br from-blue-500 to-indigo-600">
        <div className="flex items-center justify-between">
          <span className="text-3xl">👥</span>
          <div className="text-right">
            <p className="text-3xl font-bold">{stats.clients.new}</p>
            <p className="text-blue-100 text-sm">Nouveaux clients</p>
          </div>
        </div>
      </GradientCard>
    </div>
  </div>
)
