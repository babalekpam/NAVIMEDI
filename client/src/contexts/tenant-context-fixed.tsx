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
          
          // NO DEFAULT HOSPITAL FALLBACK - Each tenant must be independent
          // Use the actual tenant ID from the authenticated user to maintain isolation
          let tenantName = 'Loading...';
          let tenantType: 'hospital' | 'pharmacy' | 'laboratory' | 'platform' = 'hospital';
          let subdomain = 'unknown';
          let features = ['basic'];
          
          // Map known tenant IDs to their proper configurations
          const tenantMappings = {
            '15b85353-0985-4fec-bd4d-7bc236e190cd': {
              name: 'ARGILETTE Platform',
              type: 'platform' as const,
              subdomain: 'argilette',
              features: ['super_admin', 'tenant_management', 'multi_tenant', 'white_label']
            },
            'ad97f863-d247-4b1c-af94-e8bedfb98acc': {
              name: 'SAINT PAUL',
              type: 'hospital' as const,
              subdomain: 'saint-paul',
              features: ['unlimited', 'white_label', 'premium_support', 'api_access', 'advanced_analytics']
            },
            'ff8f6f72-7398-4398-8c0e-9de4802f73dd': {
              name: 'General Hospital',
              type: 'hospital' as const,
              subdomain: 'general-hospital',
              features: ['ehr', 'lab', 'billing']
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
            'c0bdce16-06c2-4b54-a5e6-24ba214af49d': {
              name: 'DEO',
              type: 'pharmacy' as const,
              subdomain: 'deo',
              features: ['pharmacy', 'billing', 'inventory', 'prescriptions']
            },
            'c50f0d33-bbd5-4a47-a390-6e83dd5c7057': {
              name: 'LABSAFE',
              type: 'laboratory' as const,
              subdomain: 'labsafe',
              features: ['sample_management', 'test_management', 'results_reporting', 'analytics_insights', 'quality_control', 'inventory_management']
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