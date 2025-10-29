const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class QuoteService {
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

  // Get all quotes
  async getQuotes(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/quotes${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching quotes');
      }

      return { success: true, ...data.data };
    } catch (error) {
      console.error('Get quotes error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get single quote
  async getQuote(quoteId) {
    try {
      const response = await fetch(`${API_BASE_URL}/quotes/${quoteId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching quote');
      }

      return { success: true, quote: data.data.quote };
    } catch (error) {
      console.error('Get quote error:', error);
      return { success: false, error: error.message };
    }
  }

  // Create new quote
  async createQuote(quoteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/quotes`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(quoteData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error creating quote');
      }

      return { success: true, quote: data.data.quote, message: data.message };
    } catch (error) {
      console.error('Create quote error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update quote
  async updateQuote(quoteId, quoteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/quotes/${quoteId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(quoteData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error updating quote');
      }

      return { success: true, quote: data.data.quote, message: data.message };
    } catch (error) {
      console.error('Update quote error:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete quote
  async deleteQuote(quoteId) {
    try {
      const response = await fetch(`${API_BASE_URL}/quotes/${quoteId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error deleting quote');
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Delete quote error:', error);
      return { success: false, error: error.message };
    }
  }

  // Accept quote
  async acceptQuote(quoteId) {
    try {
      const response = await fetch(`${API_BASE_URL}/quotes/${quoteId}/accept`, {
        method: 'PUT',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error accepting quote');
      }

      return { success: true, quote: data.data.quote, message: data.message };
    } catch (error) {
      console.error('Accept quote error:', error);
      return { success: false, error: error.message };
    }
  }

  // Reject quote
  async rejectQuote(quoteId, rejectionReason) {
    try {
      const response = await fetch(`${API_BASE_URL}/quotes/${quoteId}/reject`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ rejectionReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error rejecting quote');
      }

      return { success: true, quote: data.data.quote, message: data.message };
    } catch (error) {
      console.error('Reject quote error:', error);
      return { success: false, error: error.message };
    }
  }

  // Convert quote to invoice
  async convertToInvoice(quoteId, invoiceData) {
    try {
      const response = await fetch(`${API_BASE_URL}/quotes/${quoteId}/convert-to-invoice`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error converting quote to invoice');
      }

      return { 
        success: true, 
        invoice: data.data.invoice, 
        quote: data.data.quote, 
        message: data.message 
      };
    } catch (error) {
      console.error('Convert quote to invoice error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get quote statistics
  async getQuoteStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/quotes/stats/summary`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching quote stats');
      }

      return { success: true, stats: data.data };
    } catch (error) {
      console.error('Get quote stats error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instance singleton
const quoteService = new QuoteService();
export default quoteService;
