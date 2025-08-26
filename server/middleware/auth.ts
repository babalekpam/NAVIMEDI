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
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Special check: Receptionists are only allowed in hospital/clinic tenants
    if (req.user.role === "receptionist" && req.tenant?.type && req.tenant?.type !== "hospital" && req.tenant?.type !== "clinic") {
      return res.status(403).json({ message: "Receptionist role is only available for hospitals and clinics" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Insufficient permissions",
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};
