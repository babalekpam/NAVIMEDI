import React, { createContext, useContext, useState, useEffect } from 'react';

interface SupplierUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  userType: 'supplier';
  organizationName: string;
}

interface SupplierAuthContextType {
  user: SupplierUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: SupplierUser) => void;
  logout: () => void;
}

const SupplierAuthContext = createContext<SupplierAuthContextType | undefined>(undefined);

export function SupplierAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupplierUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only check for supplier authentication
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');

    if (storedToken && storedUser && userType === 'supplier') {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.userType === 'supplier') {
          setToken(storedToken);
          setUser(userData);
        } else {
          // Clear non-supplier data
          localStorage.clear();
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.clear();
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (newToken: string, userData: SupplierUser) => {
    console.log('[SUPPLIER AUTH] Logging in supplier:', userData.username);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', 'supplier');
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    console.log('[SUPPLIER AUTH] Logging out supplier');
    localStorage.clear();
    setToken(null);
    setUser(null);
    window.location.replace('/supplier-login');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token && user.userType === 'supplier',
    isLoading,
    login,
    logout
  };

  return (
    <SupplierAuthContext.Provider value={value}>
      {children}
    </SupplierAuthContext.Provider>
  );
}

export function useSupplierAuth() {
  const context = useContext(SupplierAuthContext);
  if (context === undefined) {
    throw new Error('useSupplierAuth must be used within a SupplierAuthProvider');
  }
  return context;
}