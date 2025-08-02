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
  Clock,
  UserPlus,
  CalendarPlus,
  Stethoscope,
  Video,
  MessageSquare,
  Receipt,
  Trophy,
  Timer,
  Archive,
  Package,
  ShoppingCart
} from "lucide-react";
import navimedLogo from "@assets/JPG_1753663321927.jpg";
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
  { id: "telemedicine-booking", label: "Telemedicine Booking", icon: Video, path: "/telemedicine-booking", roles: ["physician", "nurse", "receptionist", "tenant_admin", "director"] },
  { id: "register-patient", label: t("register-patient"), icon: UserPlus, path: "/patients?action=register", roles: ["receptionist", "tenant_admin", "director"] },
  { id: "book-appointment", label: t("book-appointment"), icon: CalendarPlus, path: "/appointments?action=book", roles: ["receptionist", "tenant_admin", "director"] },
  { id: "patients", label: t("patients"), icon: Users, path: "/patients", roles: ["physician", "nurse", "receptionist", "tenant_admin", "director"] },
  { id: "patient-medical-records", label: "Medical Records", icon: FileText, path: "/patient-medical-records", roles: ["physician", "nurse", "tenant_admin", "director"] },

  { id: "lab-records", label: "Lab Records", icon: TestTube, path: "/patient-medical-records", roles: ["lab_technician", "tenant_admin", "director"] },
  { id: "consultation-history", label: "Consultation History", icon: Stethoscope, path: "/consultation-history", roles: ["physician", "nurse", "tenant_admin", "director"] },
  { id: "appointments", label: t("appointments"), icon: Calendar, path: "/appointments", roles: ["physician", "nurse", "receptionist", "tenant_admin", "director"] },
  { id: "prescriptions", label: t("prescriptions"), icon: Pill, path: "/prescriptions", roles: ["physician", "nurse", "pharmacist", "receptionist", "tenant_admin", "director"] },
  { id: "lab-orders", label: t("lab-orders"), icon: TestTube, path: "/lab-orders", roles: ["physician", "nurse", "lab_technician", "receptionist", "tenant_admin", "director"] },
  { id: "lab-results", label: t("lab-results"), icon: FileText, path: "/lab-results", roles: ["physician", "nurse", "lab_technician", "tenant_admin", "director"] },
  { id: "post-lab-results", label: "Post Lab Results", icon: Plus, path: "/post-lab-results", roles: ["lab_technician", "tenant_admin", "director"] },
  { id: "achievements", label: "Laboratory Achievements", icon: Trophy, path: "/achievements", roles: ["lab_technician", "tenant_admin", "director"] },
  
  // Pharmacy Section - Enhanced Dashboard with all features integrated
  { id: "pharmacy-dashboard", label: "Pharmacy Dashboard", icon: Building2, path: "/pharmacy-dashboard", roles: ["pharmacist", "tenant_admin", "director"] },
  { id: "pharmacy-inventory", label: "Inventory Management", icon: Package, path: "/pharmacy-inventory", roles: ["pharmacist", "tenant_admin", "director"] },
  { id: "pharmacy-prescriptions", label: "Prescription Manager", icon: Pill, path: "/pharmacy-prescriptions", roles: ["pharmacist", "tenant_admin", "director"] },
  { id: "pharmacy-patient-management", label: "Pharmacy Patient Management", icon: Users, path: "/pharmacy-patient-management", roles: ["pharmacist", "billing_staff", "tenant_admin", "director"] },

  { id: "health-recommendations", label: t("health-recommendations"), icon: Brain, path: "/health-recommendations", roles: ["physician", "nurse", "tenant_admin", "director"] },
  { id: "medical-communications", label: t("medical-communications"), icon: Languages, path: "/medical-communications", roles: ["physician", "nurse", "receptionist", "tenant_admin", "director"] },
  { id: "patient-access-management", label: "Patient Access Management", icon: Shield, path: "/patient-access-management", roles: ["physician", "tenant_admin", "director", "super_admin"] },
  
  // Operations Section (only for tenant users)
  { id: "billing", label: t("billing"), icon: DollarSign, path: "/billing", roles: ["billing_staff", "receptionist", "physician", "tenant_admin", "director"] },
  { id: "hospital-billing", label: "Hospital Billing", icon: DollarSign, path: "/hospital-billing", roles: ["billing_staff", "receptionist", "physician", "tenant_admin", "director"] },
  { id: "pharmacy-billing", label: "Pharmacy Billing", icon: DollarSign, path: "/pharmacy-billing", roles: ["pharmacist", "pharmacy_admin", "tenant_admin", "director"] },
  { id: "laboratory-billing", label: "Laboratory Billing", icon: DollarSign, path: "/laboratory-billing", roles: ["lab_technician", "tenant_admin", "director"] },
  { id: "medication-insurance-claims", label: "Medication Claims", icon: Receipt, path: "/medication-insurance-claims", roles: ["tenant_admin", "billing_staff", "pharmacist", "pharmacy_admin", "physician"] },
  { id: "service-prices", label: t("service-prices"), icon: ClipboardList, path: "/service-pricing-management", roles: ["receptionist", "billing_staff", "tenant_admin", "director"] },
  { id: "reports", label: t("reports"), icon: BarChart3, path: "/reports", roles: ["physician", "nurse", "pharmacist", "lab_technician", "billing_staff", "tenant_admin", "director", "super_admin"] },
  
  // Advanced Features (White Label & Enterprise)
  { id: "white-label-settings", label: t("white-label-settings"), icon: Settings, path: "/white-label-settings", roles: ["tenant_admin", "director", "super_admin"] },
  { id: "offline-mode", label: t("offline-mode"), icon: WifiOff, path: "/offline-mode", roles: ["tenant_admin", "director", "super_admin"] },
  { id: "trial-status", label: t("trial-status"), icon: Clock, path: "/trial-status", roles: ["super_admin", "tenant_admin", "director", "physician", "nurse", "pharmacist", "lab_technician", "receptionist", "billing_staff", "insurance_manager"] },
  
  // Platform Administration Section (only for super admins)
  { id: "tenant-management", label: t("tenant-management"), icon: Building, path: "/tenant-management", roles: ["super_admin"] },
  { id: "admin-dashboard", label: "Hospital Administration", icon: UserCheck, path: "/admin-dashboard", roles: ["tenant_admin", "director"] },
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
          {/* NaviMed Logo */}
          <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-200">
            <img src={navimedLogo} alt="NaviMed" className="h-8 w-8 rounded-lg object-contain" />
            <div>
              <h1 className="text-sm font-bold text-blue-600">NAVIMED</h1>
              <p className="text-xs text-gray-500">Platform Admin</p>
            </div>
          </div>
          
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

  // Check if user is in a laboratory tenant
  const isLaboratoryTenant = currentTenant?.type === "laboratory";
  
  // For laboratory users - show only laboratory-specific items
  if (user.role === "lab_technician" || (user.role === "tenant_admin" && isLaboratoryTenant)) {
    
    const laboratoryItems = filteredItems.filter(item => 
      ["dashboard", "lab-records", "lab-orders", "lab-results", "post-lab-results", "achievements", "reports"].includes(item.id)
    );
    
    // Add laboratory billing as a special item for lab tenants
    laboratoryItems.push({
      id: "laboratory-billing",
      label: "Lab Insurance Claims",
      icon: Receipt,
      path: "/laboratory-billing",
      roles: ["lab_technician", "tenant_admin", "director"]
    });
    
    return (
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          {/* NaviMed Logo */}
          <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-200">
            <img src={navimedLogo} alt="NaviMed" className="h-8 w-8 rounded-lg object-contain" />
            <div>
              <h1 className="text-sm font-bold text-blue-600">NAVIMED</h1>
              <p className="text-xs text-gray-500">{currentTenant?.name || 'Laboratory'}</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Laboratory Operations
              </h3>
              {laboratoryItems.map((item) => {
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

  // For pharmacy users - show only pharmacy-specific items
  if (user.role === "pharmacist" || (user.role === "tenant_admin" && isPharmacyTenant)) {
    
    const pharmacyItems = filteredItems.filter(item => 
      ["dashboard", "pharmacy-dashboard", "billing", "pharmacy-billing", "pharmacy-patient-management"].includes(item.id)
    );
    
    return (
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          {/* NaviMed Logo */}
          <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-200">
            <img src={navimedLogo} alt="NaviMed" className="h-8 w-8 rounded-lg object-contain" />
            <div>
              <h1 className="text-sm font-bold text-blue-600">NAVIMED</h1>
              <p className="text-xs text-gray-500">{currentTenant?.name || 'Pharmacy'}</p>
            </div>
          </div>
          
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

  // For hospital users - include receptionist billing access
  const isHospitalTenant = currentTenant?.type === "hospital" || currentTenant?.type === "clinic";
  
  // For regular tenant users (excluding pharmacists, receptionists only exist in hospitals/clinics)
  const clinicalItems = filteredItems.filter(item => {
    // Receptionists should only exist in hospital/clinic tenants
    if (user.role === "receptionist" && !isHospitalTenant) {
      return false; // No receptionist access for pharmacy tenants
    }
    // For hospital receptionists, include billing access
    if (user.role === "receptionist" && isHospitalTenant && item.id === "hospital-billing") {
      return true;
    }
    // Include core clinical items - exclude laboratory-specific items for non-laboratory tenants
    const clinicalItemIds = ["dashboard", "patient-portal", "telemedicine-booking", "register-patient", "book-appointment", "patients", "patient-medical-records", "patient-messages", "consultation-history", "appointments", "prescriptions", "lab-orders", "lab-results", "health-recommendations", "medical-communications", "patient-access-management"];
    // For laboratory tenants, exclude prescription-related items and medical communications
    if (currentTenant?.type === "laboratory") {
      const labClinicalIds = ["dashboard", "patients", "lab-records", "lab-orders", "lab-results"];
      return labClinicalIds.includes(item.id);
    }
    return clinicalItemIds.includes(item.id) && !["pharmacy-dashboard", "lab-records"].includes(item.id);
  });
  const operationItems = filteredItems.filter(item => {
    const operationItemIds = ["billing", "service-prices"];
    return operationItemIds.includes(item.id);
  });
  const adminItems = filteredItems.filter(item => {
    // For laboratory tenants, exclude white-label settings and advanced features
    if (currentTenant?.type === "laboratory") {
      const labAdminIds = ["reports", "trial-status", "user-roles", "audit-logs"];
      return labAdminIds.includes(item.id);
    }
    const adminItemIds = ["reports", "white-label-settings", "offline-mode", "trial-status", "tenant-management", "admin-dashboard", "user-roles", "audit-logs"];
    return adminItemIds.includes(item.id);
  });

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        {/* NaviMed Logo */}
        <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-200">
          <img src={navimedLogo} alt="NaviMed" className="h-8 w-8 rounded-lg object-contain" />
          <div>
            <h1 className="text-sm font-bold text-blue-600">NAVIMED</h1>
            <p className="text-xs text-gray-500">{currentTenant?.name || 'Healthcare'}</p>
          </div>
        </div>
        
        {/* Quick Actions - Only show for non-pharmacy tenant users */}
        {user.role !== "super_admin" && !isPharmacyTenant && (
          <div className="mb-8 space-y-2">
            {/* Patient Portal Access Button - For Doctors and Hospital Staff */}
            {(user.role === "physician" || user.role === "nurse" || user.role === "receptionist" || user.role === "tenant_admin" || user.role === "director") && (
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md"
                onClick={() => setLocation("/patient-portal-staff")}
                title="Access patient portal to view from patient perspective"
              >
                <Users className="h-4 w-4 mr-2" />
                🔗 Patient Portal Access
              </Button>
            )}
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => setLocation("/patients?action=register")}
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
