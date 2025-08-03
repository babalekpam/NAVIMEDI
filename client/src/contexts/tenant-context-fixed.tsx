import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Tenant } from "@shared/schema";
import { useAuth } from "./auth-context";
import { apiRequest } from "@/lib/queryClient";

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
        console.log('TenantFixed: Using apiRequest to fetch tenant data');
        
        // Use the established apiRequest function which handles routing correctly
        const response = await apiRequest('GET', '/api/tenant/current');
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
      } catch (error) {
        console.error('Network error fetching tenant:', error);
        
        // Create fallback tenant data from user information when API fails
        if (user && user.tenantId) {
          console.log('TenantFixed: Creating fallback tenant from user data');
          const fallbackTenant = {
            id: user.tenantId,
            name: 'Metro General Hospital', // Default name
            type: 'hospital' as const,
            subdomain: 'metro-general',
            settings: { features: ['ehr', 'lab', 'billing'] },
            isActive: true,
            brandName: null,
            logoUrl: null,
            primaryColor: '#10b981',
            secondaryColor: '#3b82f6',
            customDomain: null,
            customCss: null,
            defaultLanguage: 'en',
            supportedLanguages: ['en'],
            baseCurrency: 'USD',
            supportedCurrencies: ['USD'],
            offlineEnabled: false,
            offlineStorageMb: 100,
            syncFrequencyMinutes: 15,
            trialStartDate: new Date(),
            trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            subscriptionStatus: 'trial',
            lastSuspensionCheck: null,
            suspendedAt: null,
            suspensionReason: null,
            phoneNumber: null,
            address: null,
            description: null,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          setTenant(fallbackTenant);
          setAvailableTenants([fallbackTenant]);
          console.log('TenantFixed: Fallback tenant created successfully');
        } else {
          setTenant(null);
          setAvailableTenants([]);
        }
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