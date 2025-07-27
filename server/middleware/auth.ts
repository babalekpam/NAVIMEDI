import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface JWTPayload {
  userId: string;
  tenantId: string;
  role: string;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    role: string;
    username: string;
  };
  tenant?: {
    id: string;
  };
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
      tenant?: {
        id: string;
      };
      tenantId?: string;
    }
  }
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  console.log("[AUTH DEBUG] Path:", req.path, "Token present:", !!token, "Token preview:", token?.substring(0, 20) + "...");

  if (!token) {
    console.log("[AUTH DEBUG] No token provided");
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = {
      id: decoded.userId,
      tenantId: decoded.tenantId,
      role: decoded.role,
      username: decoded.username
    };
    req.tenantId = decoded.tenantId;
    console.log("[AUTH DEBUG] Token valid for user:", decoded.userId, "tenant:", decoded.tenantId);
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    console.log("[DEBUG] Role check - User role:", req.user.role, "Allowed roles:", allowedRoles);

    if (!allowedRoles.includes(req.user.role)) {
      console.log("[DEBUG] Permission denied for role:", req.user.role);
      return res.status(403).json({ 
        message: "Insufficient permissions",
        required: allowedRoles,
        current: req.user.role
      });
    }

    console.log("[DEBUG] Permission granted for role:", req.user.role);
    next();
  };
};
