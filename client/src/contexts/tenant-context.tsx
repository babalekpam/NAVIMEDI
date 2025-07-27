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
    if (!token || !user) {
      setIsLoading(false);
      return;
    }

    // Fetch tenant information from API
    const fetchTenant = async () => {
      try {
        const response = await fetch('/api/tenant/current', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const tenantData = await response.json();
          setTenant(tenantData);
          setAvailableTenants([tenantData]);
        } else {
          // Fallback to mock tenant if API fails - check if this is pharmacy tenant
          const mockTenant: Tenant = {
            id: user.tenantId,
            name: user.role === 'super_admin' ? 'ARGILETTE Platform' : 'Working Test Pharmacy',
            type: user.role === 'super_admin' ? 'platform' : 'pharmacy',
            subdomain: user.role === 'super_admin' ? 'platform' : 'pharmacy',
            settings: {},
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          setTenant(mockTenant);
          setAvailableTenants([mockTenant]);
        }
      } catch (error) {
        console.error('Failed to fetch tenant:', error);
        // Fallback to mock tenant - check if this is pharmacy tenant
        const mockTenant: Tenant = {
          id: user.tenantId,
          name: user.role === 'super_admin' ? 'ARGILETTE Platform' : 'Working Test Pharmacy',
          type: user.role === 'super_admin' ? 'platform' : 'pharmacy',
          subdomain: user.role === 'super_admin' ? 'platform' : 'pharmacy',
          settings: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setTenant(mockTenant);
        setAvailableTenants([mockTenant]);
      } finally {
        setIsLoading(false);
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
    <TenantContext.Provider value={{ tenant, availableTenants, switchTenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
};
