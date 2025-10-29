const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class InvoiceService {
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

  // Get all invoices
  async getInvoices(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/invoices${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching invoices');
      }

      return { success: true, ...data.data };
    } catch (error) {
      console.error('Get invoices error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get single invoice
  async getInvoice(invoiceId) {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching invoice');
      }

      return { success: true, invoice: data.data.invoice };
    } catch (error) {
      console.error('Get invoice error:', error);
      return { success: false, error: error.message };
    }
  }

  // Create new invoice
  async createInvoice(invoiceData) {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error creating invoice');
      }

      return { success: true, invoice: data.data.invoice, message: data.message };
    } catch (error) {
      console.error('Create invoice error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update invoice
  async updateInvoice(invoiceId, invoiceData) {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error updating invoice');
      }

      return { success: true, invoice: data.data.invoice, message: data.message };
    } catch (error) {
      console.error('Update invoice error:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete invoice
  async deleteInvoice(invoiceId) {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error deleting invoice');
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Delete invoice error:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark invoice as paid
  async markInvoicePaid(invoiceId, paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/mark-paid`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error marking invoice as paid');
      }

      return { success: true, invoice: data.data.invoice, message: data.message };
    } catch (error) {
      console.error('Mark invoice paid error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get invoice statistics
  async getInvoiceStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/stats/summary`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching invoice stats');
      }

      return { success: true, stats: data.data };
    } catch (error) {
      console.error('Get invoice stats error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instance singleton
const invoiceService = new InvoiceService();
export default invoiceService;
