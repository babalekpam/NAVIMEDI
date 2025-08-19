import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface JWTPayload {
  userId: string;
  tenantId: string;
  role: string;
  username: string;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    role: string;
    username: string;
  };
  tenant?: any; // Allow full tenant object from tenant middleware
  tenantId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        tenantId: string;
        role: string;
        username: string;
      };
      userId?: string; // Add userId property
      tenant?: any; // Allow full tenant object from tenant middleware
      tenantId?: string;
    }
  }
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  // Reduced debug logging for performance

  if (!token) {
    // No token provided
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      console.error("Token expired at:", new Date(decoded.exp * 1000));
      return res.status(401).json({ message: "Token expired", code: "TOKEN_EXPIRED" });
    }
    
    req.user = {
      id: decoded.userId,
      tenantId: decoded.tenantId,
      role: decoded.role,
      username: decoded.username
    };
    req.userId = decoded.userId;
    req.tenantId = decoded.tenantId;
    
    // Token validated successfully
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.error("JWT Token expired:", error.expiredAt);
      return res.status(401).json({ message: "Token expired", code: "TOKEN_EXPIRED", expiredAt: error.expiredAt });
    } else if (error.name === 'JsonWebTokenError') {
      console.error("Invalid JWT token:", error.message);
      return res.status(401).json({ message: "Invalid token", code: "TOKEN_INVALID" });
    } else {
      console.error("Token verification error:", error);
      return res.status(401).json({ message: "Authentication failed", code: "AUTH_ERROR" });
    }
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    console.log("[ROLE CHECK] Path:", req.path, "User:", req.user?.role, "Tenant type:", req.tenant?.type, "Full tenant:", JSON.stringify(req.tenant));
    
    if (!req.user) {
      console.log("[ROLE CHECK] No user found - authentication required");
      return res.status(401).json({ message: "Authentication required" });
    }

    // Special check: Receptionists are only allowed in hospital/clinic tenants
    // Since tenant data isn't properly loaded yet, skip this check for now
    // TODO: Fix tenant data loading in middleware chain
    if (req.user.role === "receptionist" && req.tenant?.type && req.tenant?.type !== "hospital" && req.tenant?.type !== "clinic") {
      console.log("[ROLE CHECK] Receptionist blocked - tenant type:", req.tenant?.type, "tenant name:", req.tenant?.name);
      return res.status(403).json({ message: "Receptionist role is only available for hospitals and clinics" });
    }

    console.log("[ROLE CHECK] User role:", req.user.role, "Allowed roles:", allowedRoles);

    if (!allowedRoles.includes(req.user.role)) {
      console.log("[ROLE CHECK] Permission DENIED for role:", req.user.role, "Required:", allowedRoles);
      return res.status(403).json({ 
        message: "Insufficient permissions",
        required: allowedRoles,
        current: req.user.role
      });
    }

    console.log("[ROLE CHECK] Permission GRANTED for role:", req.user.role);
    next();
  };
};
