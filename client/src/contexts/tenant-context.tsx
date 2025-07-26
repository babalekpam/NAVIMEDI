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
    const fetchTenants = async () => {
      if (!token || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // For super_admin, fetch all tenants
        if (user.role === "super_admin") {
          const response = await fetch("/api/tenants", {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const tenants = await response.json();
            setAvailableTenants(tenants);
          }
        }

        // Set current tenant based on user's tenantId
        if (user.tenantId) {
          const currentTenant = availableTenants.find(t => t.id === user.tenantId);
          if (currentTenant) {
            setTenant(currentTenant);
          } else {
            // Fetch the specific tenant
            const response = await fetch(`/api/tenants/${user.tenantId}`, {
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            });
            if (response.ok) {
              const tenantData = await response.json();
              setTenant(tenantData);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching tenant data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenants();
  }, [user, token, availableTenants]);

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
