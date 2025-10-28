const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ClientService {
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

  // Get all clients
  async getClients(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/clients${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching clients');
      }

      return { success: true, ...data.data };
    } catch (error) {
      console.error('Get clients error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get single client
  async getClient(clientId) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching client');
      }

      return { success: true, client: data.data.client };
    } catch (error) {
      console.error('Get client error:', error);
      return { success: false, error: error.message };
    }
  }

  // Create new client
  async createClient(clientData) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(clientData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error creating client');
      }

      return { success: true, client: data.data.client, message: data.message };
    } catch (error) {
      console.error('Create client error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update client
  async updateClient(clientId, clientData) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(clientData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error updating client');
      }

      return { success: true, client: data.data.client, message: data.message };
    } catch (error) {
      console.error('Update client error:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete client
  async deleteClient(clientId) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error deleting client');
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Delete client error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get client statistics
  async getClientStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/stats/summary`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching client stats');
      }

      return { success: true, stats: data.data };
    } catch (error) {
      console.error('Get client stats error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instance singleton
const clientService = new ClientService();
export default clientService;
