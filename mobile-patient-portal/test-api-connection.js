/**
 * Test script to verify NaviMED API key connection
 * Replace 'YOUR_API_KEY_HERE' with your actual API key
 */

const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
const API_BASE_URL = 'https://navimedi.org/api';

async function testAPIConnection() {
  try {
    console.log('🔧 Testing NaviMED API connection...');
    
    // Test basic platform health
    const response = await fetch(`${API_BASE_URL}/platform/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Mobile-App': 'NaviMED-Patient-Portal',
        'X-Mobile-API-Key': API_KEY,
        'X-App-Version': '1.0.0'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Connection successful!');
      console.log('📊 Platform data:', data);
      return true;
    } else {
      console.error('❌ API Connection failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

// Run the test
testAPIConnection();