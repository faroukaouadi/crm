import React, { useState, useEffect } from 'react'
import { DataTable, TableCell } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatCard'
import { SectionHeader } from '../ui/StatCard'
import { formatCurrency } from '../../utils/helpers'
import companyService from '../../services/companyService'

export const CompaniesTable = ({ currentUser }) => {
  const [companies, setCompanies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingCompany, setEditingCompany] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [expandedCompany, setExpandedCompany] = useState(null)
  const [companyClients, setCompanyClients] = useState({})
  const [formData, setFormData] = useState({
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

  // Load companies on component mount
  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    setIsLoading(true)
    setError('')
    try {
      const result = await companyService.getCompanies()
      if (result.success) {
        setCompanies(result.companies)
      } else {
        setError(result.error || 'Error loading companies')
      }
    } catch (error) {
      setError('Server connection error')
    } finally {
      setIsLoading(false)
    }
  }

  const loadCompanyClients = async (companyId) => {
    try {
      const result = await companyService.getCompanyClients(companyId)
      if (result.success) {
        setCompanyClients(prev => ({
          ...prev,
          [companyId]: result.clients
        }))
      }
    } catch (error) {
      console.error('Error loading company clients:', error)
    }
  }

  const handleAdd = () => {
    setFormData({
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
    setIsAdding(true)
    setIsEditing(false)
    setEditingCompany(null)
  }

  const handleEdit = (company) => {
    setEditingCompany(company)
    setFormData({
      name: company.name,
      email: company.email,
      phone: company.phone || '',
      website: company.website || '',
      industry: company.industry,
      size: company.size,
      description: company.description || '',
      status: company.status,
      revenue: company.revenue || 0,
      employees: company.employees || 0,
      foundedYear: company.foundedYear || '',
      address: {
        street: company.address?.street || '',
        city: company.address?.city || '',
        state: company.address?.state || '',
        zipCode: company.address?.zipCode || '',
        country: company.address?.country || ''
      },
      socialMedia: {
        linkedin: company.socialMedia?.linkedin || '',
        twitter: company.socialMedia?.twitter || '',
        facebook: company.socialMedia?.facebook || ''
      },
      tags: company.tags || [],
      notes: company.notes || ''
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
    } else if (name.startsWith('socialMedia.')) {
      const socialField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value
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
        result = await companyService.createCompany(formData)
        if (result.success) {
          setSuccess('Company created successfully!')
          setIsAdding(false)
          loadCompanies()
        } else {
          setError(result.error || 'Error creating company')
        }
      } else {
        result = await companyService.updateCompany(editingCompany._id, formData)
        if (result.success) {
          setSuccess('Company updated successfully!')
          setIsEditing(false)
          setEditingCompany(null)
          loadCompanies()
        } else {
          setError(result.error || 'Error updating company')
        }
      }
    } catch (error) {
      setError('Server connection error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company?')) {
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const result = await companyService.deleteCompany(companyId)
      if (result.success) {
        setSuccess('Company deleted successfully!')
        loadCompanies()
      } else {
        setError(result.error || 'Error deleting company')
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
    setEditingCompany(null)
    setError('')
    setSuccess('')
  }

  const toggleExpanded = async (companyId) => {
    if (expandedCompany === companyId) {
      setExpandedCompany(null)
    } else {
      setExpandedCompany(companyId)
      if (!companyClients[companyId]) {
        await loadCompanyClients(companyId)
      }
    }
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'inactive': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'prospect': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'lead': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status] || statusColors['prospect']}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getSizeBadge = (size) => {
    const sizeColors = {
      'startup': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'small': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'medium': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'large': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'enterprise': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sizeColors[size] || sizeColors['small']}`}>
        {size.charAt(0).toUpperCase() + size.slice(1)}
      </span>
    )
  }

  const headers = ['Name', 'Industry', 'Size', 'Employees', 'Revenue', 'Status', 'Actions']

  const renderRow = (company) => [
    <TableCell key="name" className="font-medium">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-linear-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xs">
            {company.name.charAt(0)}
          </span>
        </div>
        <div>
          <div className="font-medium">{company.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{company.email}</div>
        </div>
      </div>
    </TableCell>,
    <TableCell key="industry" className="text-gray-600 dark:text-gray-400">{company.industry}</TableCell>,
    <TableCell key="size">{getSizeBadge(company.size)}</TableCell>,
    <TableCell key="employees" className="text-gray-600 dark:text-gray-400">{company.employees}</TableCell>,
    <TableCell key="revenue" className="font-semibold">{formatCurrency(company.revenue)}</TableCell>,
    <TableCell key="status">{getStatusBadge(company.status)}</TableCell>,
    <TableCell key="actions">
      <div className="flex space-x-2">
        <button
          onClick={() => toggleExpanded(company._id)}
          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
        >
          {expandedCompany === company._id ? 'Hide' : 'View'} Clients
        </button>
        <button
          onClick={() => handleEdit(company)}
          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(company._id)}
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
        title="Company & Person Management" 
        subtitle="Manage your companies and contacts"
        action={
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total: {companies.length} compan{companies.length > 1 ? 'ies' : 'y'}
            </span>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Add Company
            </button>
            <button
              onClick={loadCompanies}
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

      {/* Companies Table */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading companies...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <DataTable headers={headers} data={companies} renderRow={renderRow} />
          
          {/* Expanded Company Clients */}
          {expandedCompany && companyClients[expandedCompany] && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Clients for {companies.find(c => c._id === expandedCompany)?.name}
              </h3>
              {companyClients[expandedCompany].length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companyClients[expandedCompany].map((client) => (
                    <div key={client._id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {client.firstName?.charAt(0)}{client.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {client.firstName} {client.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{client.position}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div>Email: {client.email}</div>
                        <div>Phone: {client.phone || 'N/A'}</div>
                        <div>Status: {client.status}</div>
                        <div>Deals: {client.deals}</div>
                        <div>Value: {formatCurrency(client.totalValue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No clients found for this company.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(isEditing || isAdding) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {isAdding ? 'Add New Company' : 'Edit Company'}
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
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
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
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Industry *
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
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
                      value={formData.size}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="startup">Startup</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Employees
                    </label>
                    <input
                      type="number"
                      name="employees"
                      value={formData.employees}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Revenue
                    </label>
                    <input
                      type="number"
                      name="revenue"
                      value={formData.revenue}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Founded Year
                    </label>
                    <input
                      type="number"
                      name="foundedYear"
                      value={formData.foundedYear}
                      onChange={handleChange}
                      min="1800"
                      max="2024"
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
                      <option value="prospect">Prospect</option>
                      <option value="lead">Lead</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
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

                {/* Social Media */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Social Media</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        name="socialMedia.linkedin"
                        value={formData.socialMedia.linkedin}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Twitter
                      </label>
                      <input
                        type="url"
                        name="socialMedia.twitter"
                        value={formData.socialMedia.twitter}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Facebook
                      </label>
                      <input
                        type="url"
                        name="socialMedia.facebook"
                        value={formData.socialMedia.facebook}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Description and Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Company description..."
                    />
                  </div>

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
                    {isLoading ? 'Saving...' : (isAdding ? 'Create Company' : 'Save Changes')}
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
