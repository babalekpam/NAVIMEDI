import { createServer } from 'http';
import { URL } from 'url';

const PORT = process.env.PORT || 5000;

const server = createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const pathname = url.pathname;

  console.log(`${req.method} ${pathname}`);

  // Handle OPTIONS requests for CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoints
  if (pathname === '/' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: "NaviMED Healthcare Platform is running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: "1.0.0"
    }));
    return;
  }

  if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      status: "healthy", 
      timestamp: new Date().toISOString() 
    }));
    return;
  }

  if (pathname === '/ping' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      message: "pong", 
      timestamp: new Date().toISOString() 
    }));
    return;
  }

  if (pathname === '/status' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      status: "operational", 
      service: "navimed-healthcare",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }));
    return;
  }

  if (pathname === '/ready' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      status: "ready",
      timestamp: new Date().toISOString()
    }));
    return;
  }

  if (pathname === '/alive' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      status: "alive",
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Default 404 for other routes
  res.writeHead(404);
  res.end(JSON.stringify({ 
    error: "Not found",
    timestamp: new Date().toISOString()
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NaviMED Healthcare Platform (Minimal Server) running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health checks available at http://localhost:${PORT}/health`);
});

export default server;