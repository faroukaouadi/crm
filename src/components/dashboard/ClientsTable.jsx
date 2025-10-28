import React, { useState, useEffect } from 'react'
import { DataTable, TableCell } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatCard'
import { SectionHeader } from '../ui/StatCard'
import { formatCurrency } from '../../utils/helpers'
import clientService from '../../services/clientService'
import companyService from '../../services/companyService'

export const ClientsTable = ({ currentUser }) => {
  const [clients, setClients] = useState([])
  const [companies, setCompanies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingClient, setEditingClient] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isAddingCompany, setIsAddingCompany] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    industry: '',
    status: 'Prospect',
    source: 'Other',
    notes: '',
    tags: [],
    deals: 0,
    totalValue: 0,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  })
  const [companyFormData, setCompanyFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    size: 'small',
    description: '',
    status: 'prospect',
    revenue: 0,
    employees: 0,
    foundedYear: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    socialMedia: {
      linkedin: '',
      twitter: '',
      facebook: ''
    },
    tags: [],
    notes: ''
  })

  // Load clients and companies on component mount
  useEffect(() => {
    loadClients()
    loadCompanies()
  }, [])

  const loadClients = async () => {
    setIsLoading(true)
    setError('')
    try {
      const result = await clientService.getClients()
      if (result.success) {
        setClients(result.clients)
      } else {
        setError(result.error || 'Error loading clients')
      }
    } catch (error) {
      setError('Server connection error')
    } finally {
      setIsLoading(false)
    }
  }

  const loadCompanies = async () => {
    try {
      const result = await companyService.getCompanies()
      if (result.success) {
        setCompanies(result.companies)
      }
    } catch (error) {
      console.error('Error loading companies:', error)
    }
  }

  const handleAdd = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      industry: '',
      status: 'Prospect',
      source: 'Other',
      notes: '',
      tags: [],
      deals: 0,
      totalValue: 0,
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    })
    setIsAdding(true)
    setIsEditing(false)
    setEditingClient(null)
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setFormData({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone || '',
      company: client.company,
      position: client.position || '',
      industry: client.industry || '',
      status: client.status,
      source: client.source || 'Other',
      notes: client.notes || '',
      tags: client.tags || [],
      deals: client.deals || 0,
      totalValue: client.totalValue || 0,
      address: {
        street: client.address?.street || '',
        city: client.address?.city || '',
        state: client.address?.state || '',
        zipCode: client.address?.zipCode || '',
        country: client.address?.country || ''
      }
    })
    setIsEditing(true)
    setIsAdding(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      let result
      if (isAdding) {
        // Create new client
        result = await clientService.createClient(formData)
        if (result.success) {
          setSuccess('Client created successfully!')
          setIsAdding(false)
          loadClients() // Reload the list
        } else {
          setError(result.error || 'Error creating client')
        }
      } else {
        // Update existing client
        result = await clientService.updateClient(editingClient._id, formData)
        if (result.success) {
          setSuccess('Client updated successfully!')
          setIsEditing(false)
          setEditingClient(null)
          loadClients() // Reload the list
        } else {
          setError(result.error || 'Error updating client')
        }
      }
    } catch (error) {
      setError('Server connection error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) {
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const result = await clientService.deleteClient(clientId)
      if (result.success) {
        setSuccess('Client deleted successfully!')
        loadClients() // Reload the list
      } else {
        setError(result.error || 'Error deleting client')
      }
    } catch (error) {
      setError('Server connection error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setIsAdding(false)
    setIsAddingCompany(false)
    setEditingClient(null)
    setError('')
    setSuccess('')
  }

  const handleAddCompany = () => {
    setCompanyFormData({
      name: '',
      email: '',
      phone: '',
      website: '',
      industry: '',
      size: 'small',
      description: '',
      status: 'prospect',
      revenue: 0,
      employees: 0,
      foundedYear: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      socialMedia: {
        linkedin: '',
        twitter: '',
        facebook: ''
      },
      tags: [],
      notes: ''
    })
    setIsAddingCompany(true)
  }

  const handleCompanyChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setCompanyFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else if (name.startsWith('socialMedia.')) {
      const socialField = name.split('.')[1]
      setCompanyFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value
        }
      }))
    } else {
      setCompanyFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleCompanySubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await companyService.createCompany(companyFormData)
      if (result.success) {
        setSuccess('Company created successfully!')
        setIsAddingCompany(false)
        await loadCompanies() // Reload companies list
        // Set the newly created company as selected
        setFormData(prev => ({
          ...prev,
          company: result.company._id
        }))
      } else {
        setError(result.error || 'Error creating company')
      }
    } catch (error) {
      setError('Server connection error')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'Active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Inactive': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Prospect': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Lead': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status] || statusColors['Prospect']}`}>
        {status}
      </span>
    )
  }

  const headers = ['Name', 'Email', 'Company', 'Status', 'Deals', 'Total Value', 'Actions']

  const renderRow = (client) => [
    <TableCell key="name" className="font-medium">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xs">
            {client.firstName?.charAt(0)}{client.lastName?.charAt(0)}
          </span>
        </div>
        <div>
          <div className="font-medium">{client.firstName} {client.lastName}</div>
          {client.position && (
            <div className="text-xs text-gray-500 dark:text-gray-400">{client.position}</div>
          )}
        </div>
      </div>
    </TableCell>,
    <TableCell key="email" className="text-gray-600 dark:text-gray-400">{client.email}</TableCell>,
    <TableCell key="company">{client.company?.name || 'N/A'}</TableCell>,
    <TableCell key="status">{getStatusBadge(client.status)}</TableCell>,
    <TableCell key="deals" className="text-gray-600 dark:text-gray-400">{client.deals}</TableCell>,
    <TableCell key="totalValue" className="font-semibold">{formatCurrency(client.totalValue)}</TableCell>,
    <TableCell key="actions">
      <div className="flex space-x-2">
        <button
          onClick={() => handleEdit(client)}
          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(client._id)}
          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </TableCell>
  ]

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Clients & Quotes" 
        subtitle="Manage your clients"
        action={
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total: {clients.length} client{clients.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Add Client
            </button>
            <button
              onClick={loadClients}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Refresh
            </button>
          </div>
        }
      />

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center">
            <span className="text-red-500 text-lg mr-2">⚠️</span>
            <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <div className="flex items-center">
            <span className="text-green-500 text-lg mr-2">✅</span>
            <p className="text-green-700 dark:text-green-300 text-sm font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* Clients Table */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading clients...</p>
        </div>
      ) : (
        <DataTable headers={headers} data={clients} renderRow={renderRow} />
      )}

      {/* Add/Edit Modal */}
      {(isEditing || isAdding) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {isAdding ? 'Add New Client' : 'Edit Client'}
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
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company *
                    </label>
                    <div className="flex space-x-2">
                      <select
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select a company</option>
                        {companies.map((company) => (
                          <option key={company._id} value={company._id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddCompany}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        + Add Company
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Position
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                      <option value="Prospect">Prospect</option>
                      <option value="Lead">Lead</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Source
                    </label>
                    <select
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Email">Email</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Deals Count
                    </label>
                    <input
                      type="number"
                      name="deals"
                      value={formData.deals}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Total Value
                    </label>
                    <input
                      type="number"
                      name="totalValue"
                      value={formData.totalValue}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Address Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    placeholder="Additional notes about this client..."
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
                    {isLoading ? 'Saving...' : (isAdding ? 'Create Client' : 'Save Changes')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {isAddingCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Add New Company
                </h3>
                <button
                  onClick={() => setIsAddingCompany(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCompanySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={companyFormData.name}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={companyFormData.email}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Industry *
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={companyFormData.industry}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company Size
                    </label>
                    <select
                      name="size"
                      value={companyFormData.size}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="startup">Startup</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingCompany(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create Company'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
