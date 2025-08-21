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

  // Helper function to check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp && payload.exp < currentTime;
    } catch {
      return true; // Invalid token format
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    // Validate token format and expiration before using it
    if (storedToken && storedUser && 
        storedToken !== 'undefined' && 
        storedToken !== 'null' && 
        storedToken.length > 10) {
      
      // Check if token is expired
      if (isTokenExpired(storedToken)) {
        console.warn('Token is expired, clearing auth data');
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setIsLoading(false);
        return;
      }
      
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        console.log('Successfully restored auth state for user:', parsedUser.username);
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
    
    // Store redirect path for Router component to handle
    let redirectPath = '/dashboard';
    
    if (data.user.mustChangePassword || data.user.isTemporaryPassword) {
      redirectPath = '/change-password';
    } else if (data.user.role === 'patient') {
      redirectPath = '/patient-portal';
    } else if (data.user.role === 'super_admin') {
      console.log('Setting redirect for super admin to dashboard');
      redirectPath = '/super-admin-dashboard';
    } else if (data.user.role === 'tenant_admin' || data.user.role === 'director') {
      redirectPath = '/admin-dashboard';
    } else if (data.user.role === 'lab_technician') {
      redirectPath = '/laboratory-dashboard';
    } else if (data.user.role === 'pharmacist') {
      redirectPath = '/pharmacy-dashboard';
    } else if (data.user.role === 'receptionist') {
      redirectPath = '/receptionist-dashboard';
    }
    
    console.log('Login successful, storing redirect path:', redirectPath);
    localStorage.setItem('post_login_redirect', redirectPath);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("post_login_redirect");
    console.log('User logged out, clearing auth state and redirects');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
