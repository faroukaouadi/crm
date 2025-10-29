import React, { useState, useEffect } from 'react'
import { formatCurrency } from '../../utils/helpers'
import settingsService from '../../services/settingsService'

export const InvoiceView = ({ invoice, onClose, onDownloadPDF }) => {
  const [companyInfo, setCompanyInfo] = useState(null)

  useEffect(() => {
    loadCompanyInfo()
  }, [])

  const loadCompanyInfo = async () => {
    const result = await settingsService.getCompanyInfo()
    if (result.success) {
      setCompanyInfo(result.companyInfo)
    }
  }

  if (!invoice) return null

  // Default company info if not loaded yet
  const defaultCompanyInfo = {
    name: 'Your Company',
    address: {
      street: '123 Business Street',
      city: 'Business City',
      state: 'BC',
      zipCode: '12345',
      country: 'USA'
    },
    phone: '(555) 123-4567',
    email: 'info@yourcompany.com'
  }

  const company = companyInfo || defaultCompanyInfo

  const getStatusBadge = (status) => {
    const statusColors = {
      'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      'sent': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'paid': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'overdue': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'cancelled': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[status] || statusColors['draft']}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Invoice #{invoice.invoiceNumber}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {getStatusBadge(invoice.status)}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => onDownloadPDF(invoice)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download PDF</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          {/* Invoice Content */}
          <div id="invoice-content" className="space-y-6">
            {/* Company & Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">From:</h3>
                <div className="text-gray-700 dark:text-gray-300">
                  <p className="font-semibold">{company.name}</p>
                  {company.address?.street && <p>{company.address.street}</p>}
                  {(company.address?.city || company.address?.state || company.address?.zipCode) && (
                    <p>
                      {[company.address?.city, company.address?.state, company.address?.zipCode].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {company.address?.country && <p>{company.address.country}</p>}
                  {company.phone && <p>Phone: {company.phone}</p>}
                  {company.email && <p>Email: {company.email}</p>}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Bill To:</h3>
                <div className="text-gray-700 dark:text-gray-300">
                  <p className="font-semibold">{invoice.client.firstName} {invoice.client.lastName}</p>
                  <p>{invoice.client.email}</p>
                  {invoice.client.phone && <p>Phone: {invoice.client.phone}</p>}
                  {invoice.company && (
                    <>
                      <p className="font-semibold mt-2">{invoice.company.name}</p>
                      {invoice.company.address && (
                        <div>
                          {invoice.company.address.street && <p>{invoice.company.address.street}</p>}
                          {invoice.company.address.city && <p>{invoice.company.address.city}, {invoice.company.address.state} {invoice.company.address.zipCode}</p>}
                          {invoice.company.address.country && <p>{invoice.company.address.country}</p>}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Invoice Date</h4>
                <p className="text-gray-700 dark:text-gray-300">{formatDate(invoice.issueDate)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Due Date</h4>
                <p className="text-gray-700 dark:text-gray-300">{formatDate(invoice.dueDate)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Currency</h4>
                <p className="text-gray-700 dark:text-gray-300">{invoice.currency}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Quantity</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Unit Price</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.description}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.taxRate > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-700 dark:text-gray-300">Tax ({invoice.taxRate}%):</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(invoice.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 bg-gray-50 dark:bg-gray-700 px-4 rounded-lg">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {invoice.status === 'paid' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Payment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-green-700 dark:text-green-300">Paid Amount:</span>
                    <span className="ml-2 font-semibold text-green-800 dark:text-green-200">{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                  <div>
                    <span className="text-green-700 dark:text-green-300">Payment Method:</span>
                    <span className="ml-2 font-semibold text-green-800 dark:text-green-200 capitalize">{invoice.paymentMethod?.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-green-700 dark:text-green-300">Payment Date:</span>
                    <span className="ml-2 font-semibold text-green-800 dark:text-green-200">{formatDate(invoice.paidDate)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}

            {/* Terms */}
            {invoice.paymentTerms && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Terms</h4>
                <p className="text-gray-700 dark:text-gray-300">{invoice.paymentTerms}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
