import axios from 'axios';

// Base URL - replace with your actual backend URL
// In development, this might be your local IP with the port
// For example: 'http://192.168.1.100:5050'
// In production, this would be your deployed backend URL
const BASE_URL = 'http://10.0.2.2:5050';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API methods
const api = {
  // User endpoints
  addUser: async (userData) => {
    try {
      // Log the data being sent to help with debugging
      console.log('Adding user with data:', JSON.stringify(userData));
      
      // Make sure we're sending the exact fields expected by the schema
      const cleanedData = {
        username: userData.username,
        email: userData.email,
        password_hash: userData.password_hash
      };
      
      const response = await apiClient.post('users', cleanedData);
      return response.data;
    } catch (error) {
      console.error('API Error - addUser:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Check if username exists
  getUser: async (username) => {
    try {
      const response = await apiClient.get(`users/username/${username}`);
      return response.data;
    } catch (error) {
      console.error('API Error - getUser:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get user by email
  getUserByEmail: async (email) => {
    try {
      const response = await apiClient.get(`users/email/${email}`);
      return response.data;
    } catch (error) {
      console.error('API Error - getUserByEmail:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Wallet endpoints
  addWallet: async (walletData) => {
    try {
      console.log('Adding wallet with data:', JSON.stringify(walletData));
      
      // Make sure we're sending the exact fields expected by the schema
      const cleanedData = {
        user_id: walletData.user_id,
        wallet_address: walletData.wallet_address,
        public_address: walletData.public_address,
        wallet_type: walletData.wallet_type
      };
      
      const response = await apiClient.post('/wallets', cleanedData);
      return response.data;
    } catch (error) {
      console.error('API Error - addWallet:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get wallets for a user
  getUserWallets: async (userId) => {
    try {
      const response = await apiClient.get(`/wallets/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('API Error - getUserWallets:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Other API methods can be added here as needed

};

export default api;