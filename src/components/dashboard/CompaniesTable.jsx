import React from 'react'
import { DataTable, TableCell } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatCard'
import { SectionHeader } from '../ui/StatCard'
import { formatCurrency } from '../../utils/helpers'

export const CompaniesTable = ({ companies }) => {
  const headers = ['Name', 'Type', 'Employees', 'Industry', 'Revenue', 'Status']
  
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
        title="Company & Person Management" 
        subtitle="Manage your companies and contacts"
      />
      <DataTable headers={headers} data={companies} renderRow={renderRow} />
    </div>
  )
}
