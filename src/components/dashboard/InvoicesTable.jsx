import React, { useState, useEffect } from 'react'
import { DataTable, TableCell } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatCard'
import { SectionHeader } from '../ui/StatCard'
import { formatCurrency } from '../../utils/helpers'
import invoiceService from '../../services/invoiceService'
import clientService from '../../services/clientService'
import pdfService from '../../services/pdfService'
import { InvoiceView } from './InvoiceView'
import { useNotification } from '../../contexts/NotificationContext'
import { ConfirmationModal } from '../ui/ConfirmationModal'

export const InvoicesTable = ({ currentUser }) => {
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { showSuccess, showError } = useNotification()
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isMarkingPaid, setIsMarkingPaid] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState(null)
  const [isViewing, setIsViewing] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, invoiceId: null })
  const [formData, setFormData] = useState({
    client: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 0,
    currency: 'USD',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    notes: '',
    paymentTerms: 'Net 30',
    paymentMethod: 'bank_transfer'
  })
  const [paymentData, setPaymentData] = useState({
    paidAmount: 0,
    paymentMethod: 'bank_transfer',
    paidDate: new Date().toISOString().split('T')[0]
  })

  // Load invoices and clients on component mount
  useEffect(() => {
    loadInvoices()
    loadClients()
  }, [])

  const loadInvoices = async () => {
    setIsLoading(true)
    try {
      const result = await invoiceService.getInvoices()
      if (result.success) {
        setInvoices(result.invoices)
      } else {
        showError(result.error || 'Error loading invoices')
      }
    } catch (error) {
      showError('Server connection error')
    } finally {
      setIsLoading(false)
    }
  }

  const loadClients = async () => {
    try {
      const result = await clientService.getClients()
      if (result.success) {
        setClients(result.clients)
      }
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const handleAdd = () => {
    setFormData({
      client: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 0,
      currency: 'USD',
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
      notes: '',
      paymentTerms: 'Net 30',
      paymentMethod: 'bank_transfer'
    })
    setIsAdding(true)
    setIsEditing(false)
    setEditingInvoice(null)
  }

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice)
    setFormData({
      client: invoice.client._id,
      issueDate: new Date(invoice.issueDate).toISOString().split('T')[0],
      dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
      status: invoice.status,
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      totalAmount: invoice.totalAmount,
      currency: invoice.currency,
      items: invoice.items.length > 0 ? invoice.items : [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
      notes: invoice.notes || '',
      paymentTerms: invoice.paymentTerms || 'Net 30',
      paymentMethod: invoice.paymentMethod || 'bank_transfer'
    })
    setIsEditing(true)
    setIsAdding(false)
  }

  const handleView = (invoice) => {
    setViewingInvoice(invoice)
    setIsViewing(true)
  }

  const handleDownloadPDF = async (invoice) => {
    try {
      const result = await pdfService.generateInvoicePDFCustom(invoice)
      if (!result.success) {
        showError(result.error || 'Error generating PDF')
      }
    } catch (error) {
      showError('Error generating PDF')
    }
  }

  const handleCloseView = () => {
    setIsViewing(false)
    setViewingInvoice(null)
  }

  const handleMarkPaid = (invoice) => {
    setEditingInvoice(invoice)
    setPaymentData({
      paidAmount: invoice.totalAmount,
      paymentMethod: 'bank_transfer',
      paidDate: new Date().toISOString().split('T')[0]
    })
    setIsMarkingPaid(true)
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target
    
    if (name.startsWith('items.')) {
      const [items, index, field] = name.split('.')
      const newItems = [...formData.items]
      newItems[index][field] = type === 'number' ? parseFloat(value) || 0 : value
      
      // Recalculate item total
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].total = newItems[index].quantity * newItems[index].unitPrice
      }
      
      setFormData(prev => ({
        ...prev,
        items: newItems
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }))
    }
  }

  const handlePaymentChange = (e) => {
    const { name, value, type } = e.target
    setPaymentData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }))
  }

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }))
    }
  }

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0)
    const taxAmount = (subtotal * formData.taxRate) / 100
    const totalAmount = subtotal + taxAmount
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      totalAmount
    }))
  }

  useEffect(() => {
    calculateTotals()
  }, [formData.items, formData.taxRate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let result
      if (isAdding) {
        result = await invoiceService.createInvoice(formData)
        if (result.success) {
          showSuccess('Invoice created successfully!')
          setIsAdding(false)
          loadInvoices()
        } else {
          showError(result.error || 'Error creating invoice')
        }
      } else {
        result = await invoiceService.updateInvoice(editingInvoice._id, formData)
        if (result.success) {
          showSuccess('Invoice updated successfully!')
          setIsEditing(false)
          setEditingInvoice(null)
          loadInvoices()
        } else {
          showError(result.error || 'Error updating invoice')
        }
      }
    } catch (error) {
      showError('Server connection error')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await invoiceService.markInvoicePaid(editingInvoice._id, paymentData)
      if (result.success) {
        showSuccess('Invoice marked as paid successfully!')
        setIsMarkingPaid(false)
        setEditingInvoice(null)
        loadInvoices()
      } else {
        showError(result.error || 'Error marking invoice as paid')
      }
    } catch (error) {
      showError('Server connection error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (invoiceId) => {
    setDeleteConfirmation({ isOpen: true, invoiceId })
  }

  const confirmDelete = async () => {
    if (!deleteConfirmation.invoiceId) return

    setIsLoading(true)
    try {
      const result = await invoiceService.deleteInvoice(deleteConfirmation.invoiceId)
      if (result.success) {
        showSuccess('Invoice deleted successfully!')
        setDeleteConfirmation({ isOpen: false, invoiceId: null })
        loadInvoices()
      } else {
        showError(result.error || 'Error deleting invoice')
      }
    } catch (error) {
      showError('Server connection error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setIsAdding(false)
    setIsMarkingPaid(false)
    setIsViewing(false)
    setEditingInvoice(null)
    setViewingInvoice(null)
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      'sent': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'paid': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'overdue': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'cancelled': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status] || statusColors['draft']}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const headers = ['Invoice #', 'Client', 'Amount', 'Status', 'Issue Date', 'Due Date', 'Actions']

  const renderRow = (invoice) => [
    <TableCell key="number" className="font-medium">#{invoice.invoiceNumber}</TableCell>,
    <TableCell key="client">
      <div>
        <div className="font-medium">{invoice.client.firstName} {invoice.client.lastName}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{invoice.client.email}</div>
      </div>
    </TableCell>,
    <TableCell key="amount" className="font-semibold">{formatCurrency(invoice.totalAmount)}</TableCell>,
    <TableCell key="status">{getStatusBadge(invoice.status)}</TableCell>,
    <TableCell key="issueDate" className="text-gray-600 dark:text-gray-400">
      {new Date(invoice.issueDate).toLocaleDateString()}
    </TableCell>,
    <TableCell key="dueDate" className="text-gray-600 dark:text-gray-400">
      {new Date(invoice.dueDate).toLocaleDateString()}
    </TableCell>,
    <TableCell key="actions">
      <div className="flex space-x-2">
        <button
          onClick={() => handleView(invoice)}
          className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
        >
          View
        </button>
        <button
          onClick={() => handleEdit(invoice)}
          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
        {invoice.status !== 'paid' && (
          <button
            onClick={() => handleMarkPaid(invoice)}
            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
          >
            Mark Paid
          </button>
        )}
        <button
          onClick={() => handleDownloadPDF(invoice)}
          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
        >
          PDF
        </button>
        <button
          onClick={() => handleDelete(invoice._id)}
          className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </TableCell>
  ]

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Invoices & Payments" 
        subtitle="Manage your invoices and payments"
        action={
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total: {invoices.length} invoice{invoices.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Add Invoice
            </button>
            <button
              onClick={loadInvoices}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Refresh
            </button>
          </div>
        }
      />

      {/* Invoices Table */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading invoices...</p>
        </div>
      ) : (
        <DataTable headers={headers} data={invoices} renderRow={renderRow} />
      )}

      {/* Add/Edit Modal */}
      {(isEditing || isAdding) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {isAdding ? 'Add New Invoice' : 'Edit Invoice'}
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Client *
                    </label>
                    <select
                      name="client"
                      value={formData.client}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a client</option>
                      {clients.map((client) => (
                        <option key={client._id} value={client._id}>
                          {client.firstName} {client.lastName} - {client.company?.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Issue Date *
                    </label>
                    <input
                      type="date"
                      name="issueDate"
                      value={formData.issueDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      name="taxRate"
                      value={formData.taxRate}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                    </select>
                  </div>
                </div>

                {/* Invoice Items */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">Invoice Items</h4>
                    <button
                      type="button"
                      onClick={addItem}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      + Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            name={`items.${index}.description`}
                            value={item.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Item description"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            name={`items.${index}.quantity`}
                            value={item.quantity}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Unit Price
                          </label>
                          <input
                            type="number"
                            name={`items.${index}.unitPrice`}
                            value={item.unitPrice}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="flex items-end space-x-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Total
                            </label>
                            <input
                              type="number"
                              value={item.total}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                            />
                          </div>
                          
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="px-2 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subtotal
                      </label>
                      <input
                        type="number"
                        value={formData.subtotal}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tax Amount
                      </label>
                      <input
                        type="number"
                        value={formData.taxAmount}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Total Amount
                      </label>
                      <input
                        type="number"
                        value={formData.totalAmount}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : (isAdding ? 'Create Invoice' : 'Save Changes')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Paid Modal */}
      {isMarkingPaid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Mark Invoice as Paid
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Paid Amount
                  </label>
                  <input
                    type="number"
                    name="paidAmount"
                    value={paymentData.paidAmount}
                    onChange={handlePaymentChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    value={paymentData.paymentMethod}
                    onChange={handlePaymentChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    name="paidDate"
                    value={paymentData.paidDate}
                    onChange={handlePaymentChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Mark as Paid'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invoice View Modal */}
      {isViewing && (
        <InvoiceView 
          invoice={viewingInvoice} 
          onClose={handleCloseView}
          onDownloadPDF={handleDownloadPDF}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, invoiceId: null })}
        onConfirm={confirmDelete}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isLoading}
      />
    </div>
  )
}
