import React, { useState, useEffect } from 'react'
import { DataTable, TableCell } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatCard'
import { SectionHeader } from '../ui/StatCard'
import { formatCurrency } from '../../utils/helpers'
import quoteService from '../../services/quoteService'
import invoiceService from '../../services/invoiceService'
import clientService from '../../services/clientService'
import pdfService from '../../services/pdfService'
import { QuoteView } from './QuoteView'
import { useNotification } from '../../contexts/NotificationContext'
import { ConfirmationModal } from '../ui/ConfirmationModal'

export const QuotesTable = ({ currentUser }) => {
  const [quotes, setQuotes] = useState([])
  const [clients, setClients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { showSuccess, showError } = useNotification()
  const [editingQuote, setEditingQuote] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [viewingQuote, setViewingQuote] = useState(null)
  const [isViewing, setIsViewing] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, quoteId: null })
  const [formData, setFormData] = useState({
    client: '',
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 0,
    currency: 'USD',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    notes: '',
    terms: 'This quote is valid for 30 days from the issue date.',
    discount: 0,
    discountType: 'percentage',
    discountAmount: 0
  })
  const [conversionData, setConversionData] = useState({
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: 'Net 30'
  })
  const [rejectionData, setRejectionData] = useState({
    rejectionReason: ''
  })

  // Load quotes and clients on component mount
  useEffect(() => {
    loadQuotes()
    loadClients()
  }, [])

  const loadQuotes = async () => {
    setIsLoading(true)
    try {
      const result = await quoteService.getQuotes()
      if (result.success) {
        setQuotes(result.quotes)
      } else {
        showError(result.error || 'Error loading quotes')
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
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 0,
      currency: 'USD',
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
      notes: '',
      terms: 'This quote is valid for 30 days from the issue date.',
      discount: 0,
      discountType: 'percentage',
      discountAmount: 0
    })
    setIsAdding(true)
    setIsEditing(false)
    setEditingQuote(null)
  }

  const handleEdit = (quote) => {
    setEditingQuote(quote)
    setFormData({
      client: quote.client._id,
      issueDate: new Date(quote.issueDate).toISOString().split('T')[0],
      validUntil: new Date(quote.validUntil).toISOString().split('T')[0],
      status: quote.status,
      subtotal: quote.subtotal,
      taxRate: quote.taxRate,
      taxAmount: quote.taxAmount,
      totalAmount: quote.totalAmount,
      currency: quote.currency,
      items: quote.items.length > 0 ? quote.items : [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
      notes: quote.notes || '',
      terms: quote.terms || 'This quote is valid for 30 days from the issue date.',
      discount: quote.discount || 0,
      discountType: quote.discountType || 'percentage',
      discountAmount: quote.discountAmount || 0
    })
    setIsEditing(true)
    setIsAdding(false)
  }

  const handleAccept = (quote) => {
    setEditingQuote(quote)
    setIsAccepting(true)
  }

  const handleReject = (quote) => {
    setEditingQuote(quote)
    setRejectionData({ rejectionReason: '' })
    setIsRejecting(true)
  }

  const handleConvert = (quote) => {
    setEditingQuote(quote)
    setConversionData({
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: 'Net 30'
    })
    setIsConverting(true)
  }

  const handleView = (quote) => {
    setViewingQuote(quote)
    setIsViewing(true)
  }

  const handleDownloadPDF = async (quote) => {
    try {
      const result = await pdfService.generateQuotePDFCustom(quote)
      if (!result.success) {
        showError(result.error || 'Error generating PDF')
      }
    } catch (error) {
      showError('Error generating PDF')
    }
  }

  const handleCloseView = () => {
    setIsViewing(false)
    setViewingQuote(null)
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

  const handleConversionChange = (e) => {
    const { name, value } = e.target
    setConversionData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRejectionChange = (e) => {
    const { name, value } = e.target
    setRejectionData(prev => ({
      ...prev,
      [name]: value
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
    
    // Calculate discount amount
    let discountAmount = 0
    if (formData.discountType === 'percentage') {
      discountAmount = (subtotal * formData.discount) / 100
    } else {
      discountAmount = formData.discount
    }
    
    const subtotalAfterDiscount = subtotal - discountAmount
    const taxAmount = (subtotalAfterDiscount * formData.taxRate) / 100
    const totalAmount = subtotalAfterDiscount + taxAmount
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount
    }))
  }

  useEffect(() => {
    calculateTotals()
  }, [formData.items, formData.taxRate, formData.discount, formData.discountType])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let result
      if (isAdding) {
        result = await quoteService.createQuote(formData)
        if (result.success) {
          showSuccess('Quote created successfully!')
          setIsAdding(false)
          loadQuotes()
        } else {
          showError(result.error || 'Error creating quote')
        }
      } else {
        result = await quoteService.updateQuote(editingQuote._id, formData)
        if (result.success) {
          showSuccess('Quote updated successfully!')
          setIsEditing(false)
          setEditingQuote(null)
          loadQuotes()
        } else {
          showError(result.error || 'Error updating quote')
        }
      }
    } catch (error) {
      showError('Server connection error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await quoteService.acceptQuote(editingQuote._id)
      if (result.success) {
        showSuccess('Quote accepted successfully!')
        setIsAccepting(false)
        setEditingQuote(null)
        loadQuotes()
      } else {
        showError(result.error || 'Error accepting quote')
      }
    } catch (error) {
      showError('Server connection error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await quoteService.rejectQuote(editingQuote._id, rejectionData.rejectionReason)
      if (result.success) {
        showSuccess('Quote rejected successfully!')
        setIsRejecting(false)
        setEditingQuote(null)
        loadQuotes()
      } else {
        showError(result.error || 'Error rejecting quote')
      }
    } catch (error) {
      showError('Server connection error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConvertSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await quoteService.convertToInvoice(editingQuote._id, conversionData)
      if (result.success) {
        showSuccess('Quote converted to invoice successfully!')
        setIsConverting(false)
        setEditingQuote(null)
        loadQuotes()
      } else {
        showError(result.error || 'Error converting quote to invoice')
      }
    } catch (error) {
      showError('Server connection error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (quoteId) => {
    setDeleteConfirmation({ isOpen: true, quoteId })
  }

  const confirmDelete = async () => {
    if (!deleteConfirmation.quoteId) return

    setIsLoading(true)
    try {
      const result = await quoteService.deleteQuote(deleteConfirmation.quoteId)
      if (result.success) {
        showSuccess('Quote deleted successfully!')
        setDeleteConfirmation({ isOpen: false, quoteId: null })
        loadQuotes()
      } else {
        showError(result.error || 'Error deleting quote')
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
    setIsConverting(false)
    setIsAccepting(false)
    setIsRejecting(false)
    setIsViewing(false)
    setEditingQuote(null)
    setViewingQuote(null)
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      'sent': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'accepted': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'expired': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'converted': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status] || statusColors['draft']}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const headers = ['Quote #', 'Client', 'Amount', 'Status', 'Issue Date', 'Valid Until', 'Actions']

  const renderRow = (quote) => [
    <TableCell key="number" className="font-medium">#{quote.quoteNumber}</TableCell>,
    <TableCell key="client">
      <div>
        <div className="font-medium">{quote.client.firstName} {quote.client.lastName}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{quote.client.email}</div>
      </div>
    </TableCell>,
    <TableCell key="amount" className="font-semibold">{formatCurrency(quote.totalAmount)}</TableCell>,
    <TableCell key="status">{getStatusBadge(quote.status)}</TableCell>,
    <TableCell key="issueDate" className="text-gray-600 dark:text-gray-400">
      {new Date(quote.issueDate).toLocaleDateString()}
    </TableCell>,
    <TableCell key="validUntil" className="text-gray-600 dark:text-gray-400">
      {new Date(quote.validUntil).toLocaleDateString()}
    </TableCell>,
    <TableCell key="actions">
      <div className="flex space-x-2">
        <button
          onClick={() => handleView(quote)}
          className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
        >
          View
        </button>
        <button
          onClick={() => handleEdit(quote)}
          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
        {quote.status === 'sent' && (
          <>
            <button
              onClick={() => handleAccept(quote)}
              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => handleReject(quote)}
              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
          </>
        )}
        {quote.status === 'accepted' && (
          <button
            onClick={() => handleConvert(quote)}
            className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
          >
            Convert
          </button>
        )}
        <button
          onClick={() => handleDownloadPDF(quote)}
          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
        >
          PDF
        </button>
        <button
          onClick={() => handleDelete(quote._id)}
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
        title="Quotes" 
        subtitle="Manage your quotes"
        action={
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total: {quotes.length} quote{quotes.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Add Quote
            </button>
            <button
              onClick={loadQuotes}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Refresh
            </button>
          </div>
        }
      />

      {/* Quotes Table */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quotes...</p>
        </div>
      ) : (
        <DataTable headers={headers} data={quotes} renderRow={renderRow} />
      )}

      {/* Add/Edit Modal */}
      {(isEditing || isAdding) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {isAdding ? 'Add New Quote' : 'Edit Quote'}
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
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="expired">Expired</option>
                      <option value="converted">Converted</option>
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
                      Valid Until *
                    </label>
                    <input
                      type="date"
                      name="validUntil"
                      value={formData.validUntil}
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

                {/* Discount */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Discount</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Discount Type
                      </label>
                      <select
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Discount Value
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Discount Amount
                      </label>
                      <input
                        type="number"
                        value={formData.discountAmount}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Quote Items */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">Quote Items</h4>
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        Discount Amount
                      </label>
                      <input
                        type="number"
                        value={formData.discountAmount}
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

                {/* Notes and Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Terms
                    </label>
                    <textarea
                      name="terms"
                      value={formData.terms}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Quote terms and conditions..."
                    />
                  </div>
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
                    {isLoading ? 'Saving...' : (isAdding ? 'Create Quote' : 'Save Changes')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Accept Quote Modal */}
      {isAccepting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Accept Quote
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to accept this quote? This action cannot be undone.
              </p>

              <form onSubmit={handleAcceptSubmit} className="space-y-4">
                <div className="flex justify-end space-x-3">
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
                    {isLoading ? 'Processing...' : 'Accept Quote'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reject Quote Modal */}
      {isRejecting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Reject Quote
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rejection Reason
                  </label>
                  <textarea
                    name="rejectionReason"
                    value={rejectionData.rejectionReason}
                    onChange={handleRejectionChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Please provide a reason for rejection..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
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
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Reject Quote'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Invoice Modal */}
      {isConverting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Convert Quote to Invoice
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConvertSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={conversionData.dueDate}
                    onChange={handleConversionChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    name="paymentTerms"
                    value={conversionData.paymentTerms}
                    onChange={handleConversionChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Net 30"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
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
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Converting...' : 'Convert to Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Quote View Modal */}
      {isViewing && (
        <QuoteView 
          quote={viewingQuote} 
          onClose={handleCloseView}
          onDownloadPDF={handleDownloadPDF}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, quoteId: null })}
        onConfirm={confirmDelete}
        title="Delete Quote"
        message="Are you sure you want to delete this quote? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isLoading}
      />
    </div>
  )
}
