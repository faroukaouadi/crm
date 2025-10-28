const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test de l'endpoint de santé
async function testHealth() {
  try {
    console.log('🔍 Testing health endpoint...');
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', response.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

// Test de connexion
async function testLogin() {
  try {
    console.log('\n🔐 Testing login...');
    const loginData = {
      email: 'admin@crm.com',
      password: 'admin123'
    };
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    console.log('✅ Login successful:', response.data);
    
    return response.data.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
}

// Test de l'endpoint /me
async function testMe(token) {
  try {
    console.log('\n👤 Testing /me endpoint...');
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ /me endpoint successful:', response.data);
  } catch (error) {
    console.error('❌ /me endpoint failed:', error.response?.data || error.message);
  }
}

// Test de déconnexion
async function testLogout(token) {
  try {
    console.log('\n🚪 Testing logout...');
    const response = await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Logout successful:', response.data);
  } catch (error) {
    console.error('❌ Logout failed:', error.response?.data || error.message);
  }
}

// Exécuter tous les tests
async function runTests() {
  console.log('🧪 Starting API tests...\n');
  
  await testHealth();
  
  const token = await testLogin();
  
  if (token) {
    await testMe(token);
    await testLogout(token);
  }
  
  console.log('\n✨ Tests completed!');
}

runTests().catch(console.error);
