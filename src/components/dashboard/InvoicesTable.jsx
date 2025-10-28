import React from 'react'
import { DataTable, TableCell } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatCard'
import { SectionHeader } from '../ui/StatCard'
import { formatCurrency } from '../../utils/helpers'

export const InvoicesTable = ({ invoices }) => {
  const headers = ['ID', 'Client', 'Amount', 'Status', 'Date', 'Due Date']
  
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
        title="Invoices & Payments" 
        subtitle="Manage your invoices and payments"
      />
      <DataTable headers={headers} data={invoices} renderRow={renderRow} />
    </div>
  )
}
