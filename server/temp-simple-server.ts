import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoints for deployment
app.get("/", (req, res) => {
  res.status(200).json({
    status: "NaviMED Healthcare Platform is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: "1.0.0"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/ping", (req, res) => {
  res.status(200).json({ message: "pong", timestamp: new Date().toISOString() });
});

app.get("/status", (req, res) => {
  res.status(200).json({ 
    status: "operational", 
    service: "navimed-healthcare",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get("/ready", (req, res) => {
  res.status(200).json({ 
    status: "ready",
    timestamp: new Date().toISOString()
  });
});

app.get("/alive", (req, res) => {
  res.status(200).json({ 
    status: "alive",
    timestamp: new Date().toISOString()
  });
});

// Serve static files from client dist
const clientDistPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientDistPath));

// Catch-all handler for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 NaviMED Healthcare Platform running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health checks available at http://localhost:${PORT}/health`);
});