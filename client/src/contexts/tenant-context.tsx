import { createContext, useContext, useState, useEffect, ReactNode, startTransition } from "react";
import { Tenant } from "@shared/schema";
import { useAuth } from "./auth-context";

interface TenantContextType {
  tenant: Tenant | null;
  currentTenant: Tenant | null; // Alias for compatibility
  availableTenants: Tenant[];
  switchTenant: (tenantId: string) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider = ({ children }: TenantProviderProps) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useAuth();

  useEffect(() => {
    // Wait for auth context to fully load first
    if (!token && !user) {
      console.log('Tenant context: No auth data, skipping tenant fetch');
      startTransition(() => {
        setIsLoading(false);
        setTenant(null);
        setAvailableTenants([]);
      });
      return;
    }

    // Additional validation - don't make requests without proper auth
    const storedToken = localStorage.getItem('auth_token');
    const effectiveToken = token || storedToken;
    
    if (!effectiveToken || !user) {
      console.log('Tenant context: Missing token or user', { 
        hasToken: !!token, 
        hasUser: !!user, 
        hasStoredToken: !!storedToken 
      });
      startTransition(() => {
        setIsLoading(false);
        setTenant(null);
        setAvailableTenants([]);
      });
      return;
    }

    // Validate token format
    if (effectiveToken === 'undefined' || effectiveToken === 'null' || effectiveToken.length < 10) {
      console.error('Tenant context: Invalid token format', { tokenPreview: effectiveToken?.substring(0, 20) });
      startTransition(() => {
        setIsLoading(false);
      });
      return;
    }

    // Fetch tenant information from API
    const fetchTenant = async () => {
      try {
        console.log('Tenant context: Fetching tenant with token preview:', effectiveToken.substring(0, 30) + '...');
        
        const response = await fetch('/api/tenant/current', {
          headers: {
            'Authorization': `Bearer ${effectiveToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Tenant context: Response status:', response.status, response.ok);
        
        if (response.ok) {
          const tenantData = await response.json();
          console.log('Tenant context: Raw response data:', tenantData);
          console.log('Tenant context: Successfully fetched tenant:', tenantData?.name || 'No name');
          
          if (tenantData && tenantData.id) {
            startTransition(() => {
              setTenant(tenantData);
              setAvailableTenants([tenantData]);
            });
            console.log('Tenant context: State updated successfully');
          } else {
            console.error('Tenant context: Invalid tenant data structure:', tenantData);
            startTransition(() => {
              setTenant(null);
              setAvailableTenants([]);
            });
          }
        } else {
          console.error('Failed to fetch tenant:', response.status, response.statusText);
          const errorData = await response.text();
          console.error('Response body:', errorData);
          
          // Clear invalid auth data if token is expired/invalid
          if (response.status === 401) {
            console.log('Tenant context: Clearing invalid auth data');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            startTransition(() => {
              setTenant(null);
              setAvailableTenants([]);
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch tenant:', error);
        startTransition(() => {
          setTenant(null);
          setAvailableTenants([]);
        });
      } finally {
        startTransition(() => {
          setIsLoading(false);
        });
      }
    };

    fetchTenant();
  }, [token, user?.id]); // Simplified dependencies

  const switchTenant = (tenantId: string) => {
    const selectedTenant = availableTenants.find(t => t.id === tenantId);
    if (selectedTenant) {
      setTenant(selectedTenant);
    }
  };

  return (
    <TenantContext.Provider value={{ tenant, currentTenant: tenant, availableTenants, switchTenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
};
