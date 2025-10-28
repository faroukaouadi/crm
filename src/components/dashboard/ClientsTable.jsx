import React from 'react'
import { DataTable, TableCell } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatCard'
import { SectionHeader } from '../ui/StatCard'
import { formatCurrency } from '../../utils/helpers'

export const ClientsTable = ({ clients }) => {
  const headers = ['Name', 'Email', 'Company', 'Status', 'Deals', 'Total']
  
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
        title="Clients & Quotes" 
        subtitle="Manage your clients"
      />
      <DataTable headers={headers} data={clients} renderRow={renderRow} />
    </div>
  )
}
