import React from 'react'
import { DataTable, TableCell } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatCard'
import { SectionHeader } from '../ui/StatCard'
import { formatCurrency } from '../../utils/helpers'

export const QuotesTable = ({ quotes }) => {
  const headers = ['ID', 'Client', 'Amount', 'Status', 'Date', 'Valid Until']
  
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
        title="Quotes" 
        subtitle="Manage your quotes"
      />
      <DataTable headers={headers} data={quotes} renderRow={renderRow} />
    </div>
  )
}
