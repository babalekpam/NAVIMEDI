import { 
  BarChart3, 
  Users, 
  Calendar, 
  Pill, 
  TestTube, 
  FileText, 
  Shield, 
  Building, 
  Building2,
  UserCheck, 
  ClipboardList,
  Settings,
  Plus,
  Languages,
  DollarSign,
  Brain,
  WifiOff,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { cn } from "@/lib/utils";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  roles: string[];
}

const getSidebarItems = (t: (key: string) => string): SidebarItem[] => [
  // Clinical Section (only for tenant users)
  { id: "dashboard", label: t("dashboard"), icon: BarChart3, path: "/dashboard", roles: ["physician", "nurse", "pharmacist", "lab_technician", "receptionist", "billing_staff", "tenant_admin", "director", "super_admin"] },
  { id: "prescriptions", label: t("prescriptions"), icon: Pill, path: "/prescriptions", roles: ["physician", "nurse", "pharmacist", "tenant_admin", "director"] },
  { id: "pharmacy-dashboard", label: t("pharmacy-dashboard"), icon: Building2, path: "/pharmacy-dashboard", roles: ["pharmacist", "tenant_admin", "director"] },

  { id: "patients", label: t("patients"), icon: Users, path: "/patients", roles: ["physician", "nurse", "receptionist", "tenant_admin", "director"] },
  // Removed appointments from pharmacist role - they will use top navigation instead
  { id: "lab-orders", label: t("lab-orders"), icon: TestTube, path: "/lab-orders", roles: ["physician", "nurse", "lab_technician", "tenant_admin", "director"] },
  { id: "health-recommendations", label: t("health-recommendations"), icon: Brain, path: "/health-recommendations", roles: ["physician", "nurse", "tenant_admin", "director"] },
  { id: "medical-communications", label: t("medical-communications"), icon: Languages, path: "/medical-communications", roles: ["physician", "nurse", "receptionist", "tenant_admin", "director"] },
  
  // Operations Section (only for tenant users)
  { id: "billing", label: t("billing"), icon: FileText, path: "/billing", roles: ["billing_staff", "tenant_admin", "director", "receptionist"] },
  { id: "billing", label: t("billing"), icon: DollarSign, path: "/billing", roles: ["physician"] },
  { id: "reports", label: t("reports"), icon: BarChart3, path: "/reports", roles: ["physician", "nurse", "pharmacist", "lab_technician", "billing_staff", "tenant_admin", "director", "super_admin"] },
  
  // Advanced Features (White Label & Enterprise)
  { id: "white-label-settings", label: t("white-label-settings"), icon: Settings, path: "/white-label-settings", roles: ["tenant_admin", "director", "super_admin"] },
  { id: "offline-mode", label: t("offline-mode"), icon: WifiOff, path: "/offline-mode", roles: ["tenant_admin", "director", "super_admin"] },
  { id: "trial-status", label: t("trial-status"), icon: Clock, path: "/trial-status", roles: ["super_admin", "tenant_admin", "director", "physician", "nurse", "pharmacist", "lab_technician", "receptionist", "billing_staff", "insurance_manager"] },
  
  // Platform Administration Section (only for super admins)
  { id: "tenant-management", label: t("tenant-management"), icon: Building, path: "/tenant-management", roles: ["super_admin"] },
  { id: "user-roles", label: t("user-roles"), icon: UserCheck, path: "/user-roles", roles: ["tenant_admin", "director", "super_admin"] },
  { id: "audit-logs", label: t("audit-logs"), icon: Shield, path: "/audit-logs", roles: ["tenant_admin", "director", "super_admin"] },
];

export const Sidebar = () => {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { tenant: currentTenant } = useTenant();
  const { t } = useTranslation();

  if (!user) return null;

  const sidebarItems = getSidebarItems(t);
  const filteredItems = sidebarItems.filter(item => 
    item.roles.includes(user.role)
  );

  // For super admin, show platform management and enterprise features
  if (user.role === "super_admin") {
    const platformItems = filteredItems.filter(item => 
      ["dashboard", "tenant-management", "user-roles", "audit-logs", "reports", "white-label-settings", "offline-mode"].includes(item.id)
    );
    
    return (
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          {/* Navigation Menu for Platform Owner */}
          <nav className="space-y-2">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Platform Management
              </h3>
              {platformItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setLocation(item.path)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn("mr-3 h-4 w-4", isActive ? "text-blue-600" : "text-gray-400")} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>
    );
  }

  // Check if this is a pharmacy tenant by checking tenant ID and name
  const isPharmacyTenant = user.tenantId === "9ed7c3a3-cc12-414d-bc7e-7d0c1a3cf6e9" || // Working Test Pharmacy
                          currentTenant?.name?.toLowerCase().includes('pharmacy') || 
                          currentTenant?.name?.toLowerCase().includes('rx') || 
                          currentTenant?.type === "pharmacy";

  // For pharmacy users - show only pharmacy-specific items
  if (user.role === "pharmacist" || (user.role === "tenant_admin" && isPharmacyTenant)) {
    
    const pharmacyItems = filteredItems.filter(item => 
      ["dashboard", "pharmacy-dashboard", "prescriptions", "billing"].includes(item.id)
    );
    
    return (
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <nav className="space-y-2">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Pharmacy Operations
              </h3>
              {pharmacyItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setLocation(item.path)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn("mr-3 h-4 w-4", isActive ? "text-blue-600" : "text-gray-400")} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>
    );
  }

  // For regular tenant users (excluding pharmacists)
  const clinicalItems = filteredItems.filter(item => 
    !["pharmacy-dashboard"].includes(item.id)
  ).slice(0, 5);
  const operationItems = filteredItems.slice(5, 7);
  const adminItems = filteredItems.slice(7);

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        {/* Quick Actions - Only show for non-pharmacy tenant users */}
        {user.role !== "super_admin" && !isPharmacyTenant && (
          <div className="mb-8">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => setLocation("/patients/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Patient
            </Button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {/* Clinical Section */}
          {clinicalItems.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Clinical
              </h3>
              {clinicalItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setLocation(item.path)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn("mr-3 h-4 w-4", isActive ? "text-blue-600" : "text-gray-400")} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Operations Section */}
          {operationItems.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Operations
              </h3>
              {operationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setLocation(item.path)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn("mr-3 h-4 w-4", isActive ? "text-blue-600" : "text-gray-400")} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Administration Section */}
          {adminItems.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Administration
              </h3>
              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setLocation(item.path)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn("mr-3 h-4 w-4", isActive ? "text-blue-600" : "text-gray-400")} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
};
