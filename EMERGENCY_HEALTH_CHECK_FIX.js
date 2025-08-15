// Emergency standalone health check server for debugging deployment issues
const express = require('express');
const app = express();

// Minimal health check endpoints
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'navimed-emergency-health', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

app.get('/status', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Emergency health check server running on port ${port}`);
  console.log('All endpoints: /, /health, /ping, /status');
});