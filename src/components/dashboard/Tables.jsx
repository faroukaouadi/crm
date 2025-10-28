import React from 'react'
import { DataTable, TableCell } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatCard'
import { SectionHeader } from '../ui/StatCard'
import { formatCurrency } from '../../utils/helpers'

export const InvoicesTable = ({ invoices }) => {
  const headers = ['ID', 'Client', 'Montant', 'Statut', 'Date', 'Échéance']
  
  const renderRow = (invoice) => [
    <TableCell key="id" className="font-medium">#{invoice.id}</TableCell>,
    <TableCell key="client">{invoice.client}</TableCell>,
    <TableCell key="amount" className="font-semibold">{formatCurrency(invoice.amount)}</TableCell>,
    <TableCell key="status"><StatusBadge status={invoice.status} /></TableCell>,
    <TableCell key="date" className="text-gray-600 dark:text-gray-400">{invoice.date}</TableCell>,
    <TableCell key="due" className="text-gray-600 dark:text-gray-400">{invoice.due}</TableCell>
  ]

  return (
    <div>
      <SectionHeader 
        title="Factures & Paiements" 
        subtitle="Gérez vos factures et paiements"
      />
      <DataTable headers={headers} data={invoices} renderRow={renderRow} />
    </div>
  )
}

export const ClientsTable = ({ clients }) => {
  const headers = ['Nom', 'Email', 'Société', 'Statut', 'Affaires', 'Total']
  
  const renderRow = (client) => [
    <TableCell key="name" className="font-medium">{client.name}</TableCell>,
    <TableCell key="email" className="text-gray-600 dark:text-gray-400">{client.email}</TableCell>,
    <TableCell key="company">{client.company}</TableCell>,
    <TableCell key="status"><StatusBadge status={client.status} /></TableCell>,
    <TableCell key="deals" className="text-gray-600 dark:text-gray-400">{client.deals}</TableCell>,
    <TableCell key="total" className="font-semibold">{formatCurrency(client.total)}</TableCell>
  ]

  return (
    <div>
      <SectionHeader 
        title="Clients & Devis" 
        subtitle="Gérez vos clients"
      />
      <DataTable headers={headers} data={clients} renderRow={renderRow} />
    </div>
  )
}

export const CompaniesTable = ({ companies }) => {
  const headers = ['Nom', 'Type', 'Employés', 'Secteur', 'Revenus', 'Statut']
  
  const renderRow = (company) => [
    <TableCell key="name" className="font-medium">{company.name}</TableCell>,
    <TableCell key="type" className="text-gray-600 dark:text-gray-400">{company.type}</TableCell>,
    <TableCell key="employees" className="text-gray-600 dark:text-gray-400">{company.employees}</TableCell>,
    <TableCell key="industry" className="text-gray-600 dark:text-gray-400">{company.industry}</TableCell>,
    <TableCell key="revenue" className="font-semibold">{formatCurrency(company.revenue)}</TableCell>,
    <TableCell key="status"><StatusBadge status={company.status} /></TableCell>
  ]

  return (
    <div>
      <SectionHeader 
        title="Gestion des Sociétés & Personnes" 
        subtitle="Gérez vos sociétés et contacts"
      />
      <DataTable headers={headers} data={companies} renderRow={renderRow} />
    </div>
  )
}

export const QuotesTable = ({ quotes }) => {
  const headers = ['ID', 'Client', 'Montant', 'Statut', 'Date', 'Valide jusqu\'au']
  
  const renderRow = (quote) => [
    <TableCell key="id" className="font-medium">#{quote.id}</TableCell>,
    <TableCell key="client">{quote.client}</TableCell>,
    <TableCell key="amount" className="font-semibold">{formatCurrency(quote.amount)}</TableCell>,
    <TableCell key="status"><StatusBadge status={quote.status} /></TableCell>,
    <TableCell key="date" className="text-gray-600 dark:text-gray-400">{quote.date}</TableCell>,
    <TableCell key="validUntil" className="text-gray-600 dark:text-gray-400">{quote.validUntil}</TableCell>
  ]

  return (
    <div>
      <SectionHeader 
        title="Devis" 
        subtitle="Gérez vos devis"
      />
      <DataTable headers={headers} data={quotes} renderRow={renderRow} />
    </div>
  )
}
