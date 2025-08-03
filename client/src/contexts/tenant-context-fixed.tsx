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
        // Use full URL to bypass any Vite proxy issues
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/tenant/current?t=${Date.now()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          cache: 'no-cache',  // Prevent any caching issues
        });

        console.log('TenantFixed: Response status:', response.status, response.ok);
        console.log('TenantFixed: Response headers:', Object.fromEntries(response.headers));
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          console.log('TenantFixed: Content-Type:', contentType);
          
          if (contentType && contentType.includes('application/json')) {
            const tenantData = await response.json();
            console.log('TenantFixed: Successfully received tenant data:', tenantData?.name || 'No name');
            console.log('TenantFixed: Full tenant data structure:', tenantData);
            
            if (tenantData && tenantData.id) {
              setTenant(tenantData);
              setAvailableTenants([tenantData]);
              console.log('TenantFixed: Tenant state updated successfully!');
            } else {
              console.error('TenantFixed: Invalid tenant data structure:', tenantData);
              setTenant(null);
              setAvailableTenants([]);
            }
          } else {
            const textResponse = await response.text();
            console.error('TenantFixed: Non-JSON response received:', textResponse.substring(0, 200));
            setTenant(null);
            setAvailableTenants([]);
          }
        } else {
          console.error('TenantFixed: Failed to fetch tenant:', response.status);
          const errorText = await response.text();
          console.error('TenantFixed: Error response:', errorText.substring(0, 200));
          
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