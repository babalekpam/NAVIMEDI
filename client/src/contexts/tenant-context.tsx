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
          // Fallback to mock tenant if API fails - use appropriate tenant based on user role and tenant ID
          let mockTenant: Tenant;
          const baseMockTenant = {
            settings: {},
            isActive: true,
            brandName: null,
            logoUrl: null,
            primaryColor: "#10b981",
            secondaryColor: "#3b82f6", 
            customDomain: null,
            customCss: null,
            defaultLanguage: "en",
            supportedLanguages: ['en'],
            baseCurrency: "USD" as const,
            supportedCurrencies: ['USD'],
            offlineEnabled: false,
            offlineStorageMb: 100,
            syncFrequencyMinutes: 15,
            trialStartDate: new Date(),
            trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            subscriptionStatus: 'trial' as const,
            lastSuspensionCheck: null,
            suspendedAt: null,
            suspensionReason: null,
            phoneNumber: null,
            address: null,
            description: null,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          if (user.role === 'super_admin') {
            mockTenant = {
              ...baseMockTenant,
              id: user.tenantId,
              name: 'ARGILETTE Platform',
              type: 'platform',
              subdomain: 'platform'
            };
          } else if (user.tenantId === '37a1f504-6f59-4d2f-9eec-d108cd2b83d7') {
            // Metro General Hospital
            mockTenant = {
              ...baseMockTenant,
              id: user.tenantId,
              name: 'Metro General Hospital',
              type: 'hospital',
              subdomain: 'metro-general'
            };
          } else {
            // Default pharmacy fallback
            mockTenant = {
              ...baseMockTenant,
              id: user.tenantId,
              name: 'Working Test Pharmacy',
              type: 'pharmacy',
              subdomain: 'pharmacy'
            };
          }
          setTenant(mockTenant);
          setAvailableTenants([mockTenant]);
        }
      } catch (error) {
        console.error('Failed to fetch tenant:', error);
        // Fallback to mock tenant - use appropriate tenant based on user role and tenant ID
        let mockTenant: Tenant;
        const baseMockTenant = {
          settings: {},
          isActive: true,
          brandName: null,
          logoUrl: null,
          primaryColor: "#10b981",
          secondaryColor: "#3b82f6", 
          customDomain: null,
          customCss: null,
          defaultLanguage: "en",
          supportedLanguages: ['en'],
          baseCurrency: "USD" as const,
          supportedCurrencies: ['USD'],
          offlineEnabled: false,
          offlineStorageMb: 100,
          syncFrequencyMinutes: 15,
          trialStartDate: new Date(),
          trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          subscriptionStatus: 'trial' as const,
          lastSuspensionCheck: null,
          suspendedAt: null,
          suspensionReason: null,
          phoneNumber: null,
          address: null,
          description: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        if (user.role === 'super_admin') {
          mockTenant = {
            ...baseMockTenant,
            id: user.tenantId,
            name: 'ARGILETTE Platform',
            type: 'platform',
            subdomain: 'platform'
          };
        } else if (user.tenantId === '37a1f504-6f59-4d2f-9eec-d108cd2b83d7') {
          // Metro General Hospital
          mockTenant = {
            ...baseMockTenant,
            id: user.tenantId,
            name: 'Metro General Hospital',
            type: 'hospital',
            subdomain: 'metro-general'
          };
        } else {
          // Default pharmacy fallback
          mockTenant = {
            ...baseMockTenant,
            id: user.tenantId,
            name: 'Working Test Pharmacy',
            type: 'pharmacy',
            subdomain: 'pharmacy'
          };
        }
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
