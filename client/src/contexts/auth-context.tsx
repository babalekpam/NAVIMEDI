import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";

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
  login: (username: string, password: string, tenantId: string) => Promise<void>;
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

    // Validate token format before using it
    if (storedToken && storedUser && 
        storedToken !== 'undefined' && 
        storedToken !== 'null' && 
        storedToken.length > 10) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.warn('Failed to parse stored user data, clearing auth:', error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    } else if (storedToken) {
      // Clear corrupted tokens
      console.warn('Clearing corrupted auth data');
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string, tenantId: string) => {
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
    
    // Add a small delay to ensure state is set before redirect
    setTimeout(() => {
      // Check if user needs to change temporary password
      if (data.user.mustChangePassword || data.user.isTemporaryPassword) {
        window.location.href = '/change-password';
      } else if (data.user.role === 'patient') {
        window.location.href = '/patient-portal';
      } else if (data.user.role === 'super_admin') {
        // Super admin gets their own dashboard with platform oversight
        console.log('Redirecting super admin to dashboard');
        window.location.href = '/super-admin-dashboard';
      } else if (data.user.role === 'tenant_admin' || data.user.role === 'director') {
        // Redirect tenant admins to unified admin dashboard
        window.location.href = '/admin-dashboard';
      } else if (data.user.role === 'lab_technician') {
        window.location.href = '/laboratory-dashboard';
      } else if (data.user.role === 'pharmacist') {
        window.location.href = '/pharmacy-dashboard';
      } else if (data.user.role === 'receptionist') {
        window.location.href = '/receptionist-dashboard';
      } else {
        window.location.href = '/dashboard';
      }
    }, 100);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
