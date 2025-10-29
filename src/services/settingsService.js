const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class SettingsService {
  constructor() {
    this.token = localStorage.getItem('authToken') || null;
  }

  // Get authorization headers
  getHeaders() {
    const token = localStorage.getItem('authToken') || null;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Get company information
  async getCompanyInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/company`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching company information');
      }

      return { success: true, companyInfo: data.data.companyInfo };
    } catch (error) {
      console.error('Get company info error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update company information
  async updateCompanyInfo(companyInfoData) {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/company`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(companyInfoData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error updating company information');
      }

      return { success: true, companyInfo: data.data.companyInfo, message: data.message };
    } catch (error) {
      console.error('Update company info error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instance singleton
const settingsService = new SettingsService();
export default settingsService;
