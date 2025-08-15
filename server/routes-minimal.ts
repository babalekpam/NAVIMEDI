import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Basic health check
  app.get('/debug', (req, res) => {
    res.status(200).json({
      status: 'diagnostic',
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy", 
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      platform: "NaviMED Healthcare Platform"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}