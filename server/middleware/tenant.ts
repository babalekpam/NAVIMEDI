import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { Tenant } from "@shared/schema";

declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
    }
  }
}

export const setTenantContext = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get tenant from subdomain first
    const host = req.get("host");
    if (host) {
      const subdomain = host.split(".")[0];
      if (subdomain && subdomain !== "localhost" && subdomain !== "127") {
        const tenant = await storage.getTenantBySubdomain(subdomain);
        if (tenant) {
          req.tenant = tenant;
          return next();
        }
      }
    }

    // If authenticated, try to get tenant from user context
    if (req.user?.tenantId) {
      const tenant = await storage.getTenant(req.user.tenantId);
      if (tenant) {
        req.tenant = tenant;
        return next();
      }
    }

    // For tenant-specific routes, we'll require tenant context
    next();
  } catch (error) {
    console.error("Tenant context error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  if (!req.tenant) {
    return res.status(400).json({ 
      message: "Tenant context required. Please specify subdomain or ensure proper authentication." 
    });
  }

  if (!req.tenant.isActive) {
    return res.status(403).json({ message: "Tenant is inactive" });
  }

  next();
};
