const axios = require('axios');

// Conectándome a la API de QRcode-monkey con axios (https://axios-http.com/docs/instance)

const apiClient = axios.create({
  baseURL: 'https://api.qrcode-monkey.com',
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
  },
});

module.exports = apiClient;