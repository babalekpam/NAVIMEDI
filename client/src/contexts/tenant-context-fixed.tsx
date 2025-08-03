import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Tenant } from "@shared/schema";
import { useAuth } from "./auth-context";

interface TenantContextType {
  tenant: Tenant | null;
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
    const initializeTenant = async () => {
      // Wait for auth to be ready
      if (!user || !token) {
        setIsLoading(false);
        return;
      }

      try {
        // Use apiRequest pattern for consistency
        const response = await fetch('/api/tenant/current', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const tenantData = await response.json();
          setTenant(tenantData);
          setAvailableTenants([tenantData]);
        } else {
          console.error('Failed to fetch tenant:', response.status);
          // Clear invalid session
          if (response.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
          }
        }
      } catch (error) {
        console.error('Network error fetching tenant:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTenant();
  }, [user, token]);

  const switchTenant = (tenantId: string) => {
    const selectedTenant = availableTenants.find(t => t.id === tenantId);
    if (selectedTenant) {
      setTenant(selectedTenant);
    }
  };

  return (
    <TenantContext.Provider value={{ tenant, availableTenants, switchTenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
};