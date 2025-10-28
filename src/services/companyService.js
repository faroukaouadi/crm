const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class CompanyService {
  constructor() {
    this.token = localStorage.getItem('authToken') || null;
  }

  // Get authorization headers
  getHeaders() {
    // Always get the latest token from localStorage
    const token = localStorage.getItem('authToken') || null;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Get all companies
  async getCompanies(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/companies${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching companies');
      }

      return { success: true, ...data.data };
    } catch (error) {
      console.error('Get companies error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get single company
  async getCompany(companyId) {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching company');
      }

      return { success: true, company: data.data.company };
    } catch (error) {
      console.error('Get company error:', error);
      return { success: false, error: error.message };
    }
  }

  // Create new company
  async createCompany(companyData) {
    try {
      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(companyData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error creating company');
      }

      return { success: true, company: data.data.company, message: data.message };
    } catch (error) {
      console.error('Create company error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update company
  async updateCompany(companyId, companyData) {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(companyData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error updating company');
      }

      return { success: true, company: data.data.company, message: data.message };
    } catch (error) {
      console.error('Update company error:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete company
  async deleteCompany(companyId) {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error deleting company');
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Delete company error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get clients for a company
  async getCompanyClients(companyId) {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/clients`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching company clients');
      }

      return { success: true, clients: data.data.clients };
    } catch (error) {
      console.error('Get company clients error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get company statistics
  async getCompanyStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/stats/summary`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching company stats');
      }

      return { success: true, stats: data.data };
    } catch (error) {
      console.error('Get company stats error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instance singleton
const companyService = new CompanyService();
export default companyService;
