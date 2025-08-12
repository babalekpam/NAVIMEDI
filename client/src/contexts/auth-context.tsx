import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";
import { useLocation } from "wouter";

interface AuthUser {
  id: string;
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  mustChangePassword?: boolean;
  isTemporaryPassword?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (username: string, password: string, tenantId: string, navigate?: (path: string) => void) => Promise<void>;
  setAuthData: (token: string, user: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    // Simple validation - just check if both exist
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        // Only clear if parsing fails
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string, tenantId: string, navigate?: (path: string) => void) => {
    const loginData: any = { username, password };
    // Only include tenantId if it's not empty (for regular users)
    if (tenantId && tenantId.trim() !== "") {
      loginData.tenantId = tenantId;
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
    
    console.log('Login successful, user data:', data.user);
    
    // Store authentication data immediately to prevent multiple login attempts
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
    
    setToken(data.token);
    setUser(data.user);
    
    // Determine redirect path based on user role and organization type
    let redirectPath = '/dashboard';
    if (data.user.mustChangePassword || data.user.isTemporaryPassword) {
      redirectPath = '/change-password';
    } else if (data.user.role === 'patient') {
      redirectPath = '/patient-portal';
    } else if (data.user.role === 'super_admin') {
      redirectPath = '/super-admin-dashboard';
    } else if (data.user.role === 'tenant_admin' || data.user.role === 'director') {
      // For tenant admins, check organization type to route to correct dashboard
      const tenantType = data.user.tenant?.type;
      if (tenantType === 'laboratory') {
        redirectPath = '/laboratory-dashboard';
      } else if (tenantType === 'pharmacy') {
        redirectPath = '/pharmacy-dashboard';
      } else {
        redirectPath = '/admin-dashboard'; // Hospital/clinic default
      }
    } else if (data.user.role === 'lab_technician') {
      redirectPath = '/laboratory-dashboard';
    } else if (data.user.role === 'pharmacist') {
      redirectPath = '/pharmacy-dashboard';
    } else if (data.user.role === 'receptionist') {
      redirectPath = '/receptionist-dashboard';
    }
    
    // Use React routing if available, otherwise fall back to window.location
    if (navigate) {
      navigate(redirectPath);
    } else {
      window.location.href = redirectPath;
    }
  };

  const setAuthData = (token: string, user: AuthUser) => {
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, setAuthData, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
