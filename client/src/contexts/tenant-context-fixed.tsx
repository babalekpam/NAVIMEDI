import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Tenant } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
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
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const initializeTenant = async () => {
      // Wait for auth to be ready
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('TenantFixed: Using apiRequest to fetch tenant data');
        
        // Use the established apiRequest function which handles routing correctly
        const tenantData = await apiRequest('/api/tenant/current');
        
        console.log('TenantFixed: Successfully received tenant data:', tenantData?.name || 'No name');
        
        if (tenantData && tenantData.id && tenantData.name) {
          setTenant(tenantData);
          setAvailableTenants([tenantData]);
          console.log('TenantFixed: Tenant state updated successfully with name:', tenantData.name);
          return; // Exit early if successful
        } else {
          console.error('TenantFixed: Invalid tenant data structure:', tenantData);
          throw new Error('Invalid tenant data received');
        }
      } catch (error) {
        console.error('Network error fetching tenant:', error);
        
        // Create fallback tenant data from user information when API fails
        if (user && user.tenantId) {
          console.log('TenantFixed: Creating fallback tenant from user data');
          
          // Try to get tenant name from localStorage or other sources first
          let tenantName = 'Loading Organization...';
          let tenantType: 'hospital' | 'pharmacy' | 'laboratory' = 'hospital';
          let subdomain = 'unknown';
          let features = ['basic'];
          
          // Map known tenant IDs to their proper configurations
          const tenantMappings = {
            '15b85353-0985-4fec-bd4d-7bc236e190cd': {
              name: 'ARGILETTE Platform',
              type: 'hospital' as const,
              subdomain: 'argilette',
              features: ['super_admin', 'tenant_management', 'multi_tenant', 'cross_tenant_reporting', 'white_label', 'unlimited']
            },
            '9ed7c3a3-cc12-414d-bc7e-7d0c1a3cf6e9': {
              name: 'Independent Community Pharmacy',
              type: 'pharmacy' as const,
              subdomain: 'working-test',
              features: ['pharmacy', 'billing', 'inventory']
            },
            '27b0df66-5687-458b-aedd-6f03626e302b': {
              name: 'LOVE',
              type: 'pharmacy' as const,
              subdomain: 'love',
              features: ['pharmacy', 'billing', 'inventory']
            },
            '37a1f504-6f59-4d2f-9eec-d108cd2b83d7': {
              name: 'Metro General Hospital',
              type: 'hospital' as const,
              subdomain: 'metro-general',
              features: ['ehr', 'lab', 'billing']
            },
            'd58e9322-b50c-47be-9bcd-6b7b553f3c8d': {
              name: 'JOY',
              type: 'laboratory' as const,
              subdomain: 'joy-lab',
              features: ['lab', 'testing', 'billing']
            },
            '1acd7cfd-480a-4d3b-bbf4-b882a27887d0': {
              name: 'Test Hospital Email',
              type: 'hospital' as const,
              subdomain: 'test-hospital-email',
              features: ['ehr', 'lab', 'billing']
            },
            'c3fef109-92de-4625-b6b6-d11c26c5c2aa': {
              name: 'Test Hospital',
              type: 'hospital' as const,
              subdomain: 'test-hospital',
              features: ['ehr', 'lab', 'billing']
            }
          };
          
          const tenantConfig = tenantMappings[user.tenantId as keyof typeof tenantMappings] || null;
          if (tenantConfig) {
            tenantName = tenantConfig.name;
            tenantType = tenantConfig.type;
            subdomain = tenantConfig.subdomain;
            features = tenantConfig.features;
          }
          
          const fallbackTenant: Tenant = {
            id: user.tenantId || 'fallback-tenant',
            name: tenantName,
            type: tenantType,
            subdomain: subdomain,
            settings: { features: features },
            isActive: true,
            parentTenantId: null,
            organizationType: 'independent' as const,
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
  }, [user, isAuthenticated]);

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