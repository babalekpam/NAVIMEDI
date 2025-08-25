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
  ShoppingCart,
  Megaphone,
  RotateCcw,
  RefreshCw,
  ArrowLeftRight,
  Heart,
  Truck,
  Phone,
  Smartphone,
  // Laboratory Management Icons
  Microscope,
  FlaskConical,
  Beaker,
  Gauge,
  Activity,
  TrendingUp,
  Target,
  AlertTriangle,
  Calendar as CalendarIcon,
  ClipboardCheck,
  Wrench,
  Cog,
  Database,
  Monitor,
  Wifi,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  GraduationCap,
  MapPin,
  Thermometer,
  Zap,
  Layers,
  Grid,
  List,
  BarChart2,
  PieChart,
  LineChart,
  Clipboard,
  FileBarChart,
  Factory,
  Leaf,
  FlaskRound,
  ScanLine,
  QrCode,
  Star,
  Award,
  Medal,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  MoreVertical,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  UserX,
  UserCog,
  Users2,
  PersonStanding,
  ShieldCheck,
  AlertOctagon,
  CheckSquare,
  Square,
  SquareCheck,
  Calendar as CalendarDays,
  CalendarClock,
  CalendarCheck,
  Clock3,
  Clock9,
  Hourglass,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RotateCw,
  Repeat,
  Shuffle,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind,
  Volume2,
  VolumeX,
  Bluetooth,
  Radio,
  Headphones
} from "lucide-react";
import navimedLogo from "@assets/JPG_1753663321927.jpg";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/contexts/tenant-context-fixed";
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
  { id: "dashboard", label: t("dashboard"), icon: BarChart3, path: "/dashboard", roles: ["physician", "nurse", "lab_technician", "receptionist", "billing_staff", "tenant_admin", "director"] },
  { id: "super-admin-dashboard", label: t("dashboard"), icon: BarChart3, path: "/super-admin-dashboard", roles: ["super_admin"] },
  { id: "supplier-management", label: "Supplier Management", icon: Building2, path: "/supplier-management", roles: ["super_admin"] },
  { id: "counter-reset", label: "Counter Reset", icon: RotateCcw, path: "/admin/counter-reset", roles: ["super_admin"] },
  { id: "advertisements", label: "Advertisement Marketplace", icon: Megaphone, path: "/advertisements", roles: ["physician", "nurse", "receptionist", "tenant_admin", "director", "pharmacist", "lab_technician", "super_admin"] },
  { id: "register-patient", label: t("register-patient"), icon: UserPlus, path: "/patients?action=register", roles: ["receptionist", "tenant_admin", "director"] },
  { id: "book-appointment", label: t("book-appointment"), icon: CalendarPlus, path: "/appointments?action=book", roles: ["receptionist", "tenant_admin", "director"] },
  { id: "patients", label: t("patients"), icon: Users, path: "/patients", roles: ["physician", "nurse", "receptionist", "tenant_admin", "director"] },
  { id: "patient-medical-records", label: "Medical Records", icon: FileText, path: "/patient-medical-records", roles: ["physician", "nurse", "tenant_admin", "director"] },

  { id: "lab-records", label: "Lab Records", icon: TestTube, path: "/patient-medical-records", roles: ["lab_technician", "tenant_admin", "director"] },
  { id: "consultation-history", label: "Consultation History", icon: Stethoscope, path: "/consultation-history", roles: ["physician", "nurse", "tenant_admin", "director"] },
  { id: "appointments", label: t("appointments"), icon: Calendar, path: "/appointments", roles: ["physician", "nurse", "receptionist", "tenant_admin", "director"] },
  { id: "prescriptions", label: t("prescriptions"), icon: Pill, path: "/prescriptions", roles: ["physician", "nurse", "tenant_admin", "director"] },
  { id: "lab-orders", label: t("lab-orders"), icon: TestTube, path: "/lab-orders", roles: ["physician", "nurse", "lab_technician", "receptionist", "tenant_admin", "director"] },
  { id: "lab-results", label: t("lab-results"), icon: FileText, path: "/lab-results", roles: ["physician", "nurse", "lab_technician", "tenant_admin", "director"] },
  { id: "post-lab-results", label: "Post Lab Results", icon: Plus, path: "/post-lab-results", roles: ["lab_technician", "tenant_admin", "director"] },
  { id: "achievements", label: "Laboratory Achievements", icon: Trophy, path: "/achievements", roles: ["lab_technician", "tenant_admin", "director"] },
  
  // Pharmacy Section - Comprehensive Navigation for Pharmacy Tenants
  { id: "pharmacy-dashboard", label: "Dashboard", icon: BarChart3, path: "/dashboard", roles: ["pharmacist", "tenant_admin", "director"] },
  { id: "prescription-management", label: "💊 Prescriptions", icon: Pill, path: "/prescriptions", roles: ["pharmacist", "tenant_admin", "director"] },
  { id: "prescription-refills", label: "Prescription Refills", icon: RefreshCw, path: "/prescriptions", roles: ["pharmacist", "tenant_admin", "director"] },
  { id: "prescription-transfers", label: "Prescription Transfers", icon: ArrowLeftRight, path: "/prescriptions", roles: ["pharmacist", "tenant_admin", "director"] },
  { id: "pharmacy-inventory", label: "📦 Inventory", icon: Package, path: "/pharmacy-inventory", roles: ["pharmacist", "tenant_admin", "director"] },
  { id: "health-wellness", label: "🛒 Health & Wellness", icon: Heart, path: "/pharmacy-inventory", roles: ["pharmacist", "tenant_admin", "director"] },
  { id: "insurance-verification", label: "💰 Insurance & Savings", icon: DollarSign, path: "/pharmacy-pos", roles: ["pharmacist", "tenant_admin", "director"] },
  { id: "delivery-pickup", label: "🚚 Delivery & Pickup", icon: Truck, path: "/pharmacy-patient-management", roles: ["pharmacist", "tenant_admin", "director"] },
  { id: "customer-accounts", label: "👤 Customer Accounts", icon: Users, path: "/pharmacy-patient-management", roles: ["pharmacist", "tenant_admin", "director"] },
  { id: "pharmacy-support", label: "📞 Support & Chat", icon: Phone, path: "/dashboard", roles: ["pharmacist", "tenant_admin", "director"] },
  { id: "digital-services", label: "📱 Digital Services", icon: Smartphone, path: "/dashboard", roles: ["pharmacist", "tenant_admin", "director"] },
  { id: "prescription-archives", label: "Prescription Archives", icon: Archive, path: "/prescription-archives", roles: ["pharmacist", "tenant_admin", "director"] },
  { id: "pharmacy-patient-management", label: "Patient Management", icon: Users, path: "/pharmacy-patient-management", roles: ["pharmacist", "billing_staff", "tenant_admin", "director"] },
  { id: "pharmacy-employee-management", label: "Employee Management", icon: UserCheck, path: "/user-roles", roles: ["tenant_admin", "director"] },
  { id: "pharmacy-billing", label: "Billing", icon: DollarSign, path: "/pharmacy-pos", roles: ["pharmacist", "pharmacy_admin", "tenant_admin", "director"] },
  { id: "pharmacy-insurance-claims", label: "Insurance Claims", icon: Receipt, path: "/pharmacy-pos", roles: ["pharmacist", "pharmacy_admin", "tenant_admin", "director"] },

  { id: "health-recommendations", label: t("health-recommendations"), icon: Brain, path: "/health-recommendations", roles: ["physician", "nurse", "tenant_admin", "director"] },
  { id: "medical-communications", label: t("medical-communications"), icon: Languages, path: "/medical-communications", roles: ["physician", "nurse", "receptionist", "tenant_admin", "director"] },
  { id: "patient-access-management", label: "Patient Access Management", icon: Shield, path: "/patient-access-management", roles: ["physician", "tenant_admin", "director", "super_admin"] },
  
  // Operations Section (only for tenant users - excluding pharmacy users)
  { id: "billing", label: t("billing"), icon: DollarSign, path: "/billing", roles: ["billing_staff", "receptionist", "physician", "tenant_admin", "director"] },
  { id: "hospital-billing", label: "Hospital Billing", icon: DollarSign, path: "/hospital-billing", roles: ["billing_staff", "receptionist", "physician", "tenant_admin", "director"] },
  { id: "laboratory-billing", label: "Laboratory Billing", icon: DollarSign, path: "/laboratory-billing", roles: ["lab_technician", "tenant_admin", "director"] },
  { id: "service-prices", label: t("service-prices"), icon: ClipboardList, path: "/service-pricing-management", roles: ["tenant_admin", "director"] },
  { id: "reports", label: t("reports"), icon: BarChart3, path: "/reports", roles: ["physician", "nurse", "lab_technician", "billing_staff", "tenant_admin", "director", "super_admin"] },
  
  // Advanced Features (White Label & Enterprise)
  { id: "white-label-settings", label: t("white-label-settings"), icon: Settings, path: "/white-label-settings", roles: ["tenant_admin", "director", "super_admin"] },
  { id: "offline-mode", label: t("offline-mode"), icon: WifiOff, path: "/offline-mode", roles: ["tenant_admin", "director", "super_admin"] },
  
  // Platform Administration Section (only for super admins)
  { id: "tenant-management", label: t("tenant-management"), icon: Building, path: "/tenant-management", roles: ["super_admin"] },
  { id: "client-management", label: "Client Management", icon: Building2, path: "/admin/clients", roles: ["super_admin"] },
  { id: "admin-dashboard", label: "Administration", icon: UserCheck, path: "/user-roles", roles: ["tenant_admin", "director"] },
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
  const filteredItems = sidebarItems.filter(item => {
    return item.roles.includes(user.role);
  });



  // For super admin, show platform management and enterprise features
  if (user.role === "super_admin") {
    const platformItems = filteredItems.filter(item => 
      ["super-admin-dashboard", "tenant-management", "client-management", "user-roles", "audit-logs", "reports", "white-label-settings", "offline-mode", "advertisements"].includes(item.id)
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
                          user.tenantId === "c0bdce16-06c2-4b54-a5e6-24ba214af49d" || // DEO Pharmacy
                          currentTenant?.name?.toLowerCase().includes('pharmacy') || 
                          currentTenant?.name?.toLowerCase().includes('rx') || 
                          currentTenant?.name?.toLowerCase().includes('deo') ||
                          currentTenant?.type === "pharmacy";

  // Check if user is in a laboratory tenant
  const isLaboratoryTenant = currentTenant?.type === "laboratory";
  
  // For laboratory users - show comprehensive laboratory management features
  if (user.role === "lab_technician" || (user.role === "tenant_admin" && isLaboratoryTenant)) {
    
    // Core Operations
    const coreOperationsItems = [
      { id: "lab-dashboard", label: "📊 Dashboard Overview", icon: BarChart3, path: "/dashboard", roles: ["lab_technician", "tenant_admin", "director"] },
      { id: "sample-management", label: "📋 Sample Management", icon: TestTube, path: "/lab/sample-management", roles: ["lab_technician", "tenant_admin", "director"] },
      { id: "test-management", label: "🧪 Test Management", icon: FlaskConical, path: "/lab/test-management", roles: ["lab_technician", "tenant_admin", "director"] },
      { id: "results-reporting", label: "📊 Results & Reporting", icon: FileBarChart, path: "/lab/results-reporting", roles: ["lab_technician", "tenant_admin", "director"] }
    ];
    
    // Analytics & Insights
    const analyticsItems = [
      { id: "analytics-dashboard", label: "📈 Analytics & Insights", icon: TrendingUp, path: "/lab/analytics", roles: ["lab_technician", "tenant_admin", "director"] },
      { id: "quality-control", label: "🎯 Quality Control", icon: Target, path: "/lab/quality-control", roles: ["lab_technician", "tenant_admin", "director"] }
    ];
    
    // Resource Management
    const resourceItems = [
      { id: "inventory-management", label: "🏪 Inventory Management", icon: Package, path: "/lab/inventory", roles: ["lab_technician", "tenant_admin", "director"] },
      { id: "staff-scheduling", label: "👥 Staff & Scheduling", icon: Users, path: "/lab/staff-scheduling", roles: ["tenant_admin", "director"] },
      { id: "equipment-management", label: "🔧 Equipment Management", icon: Wrench, path: "/lab/equipment", roles: ["lab_technician", "tenant_admin", "director"] }
    ];
    
    // Patient & Client Services
    const clientServicesItems = [
      { id: "patient-management", label: "👤 Patient Management", icon: Users, path: "/lab/patients", roles: ["lab_technician", "tenant_admin", "director"] },
      { id: "client-portal", label: "🏥 Client Portal", icon: Building2, path: "/lab/client-portal", roles: ["lab_technician", "tenant_admin", "director"] }
    ];
    
    // Compliance & Administration
    const complianceItems = [
      { id: "regulatory-compliance", label: "📋 Regulatory Compliance", icon: Shield, path: "/lab/compliance", roles: ["tenant_admin", "director"] },
      { id: "financial-management", label: "💰 Financial Management", icon: DollarSign, path: "/laboratory-billing", roles: ["tenant_admin", "director"] },
      { id: "system-administration", label: "⚙️ System Administration", icon: Settings, path: "/lab/administration", roles: ["tenant_admin", "director"] }
    ];
    
    // Specialized Laboratory Features
    const specializedItems = [
      { id: "research-labs", label: "🔬 Research Labs", icon: Microscope, path: "/lab/research", roles: ["lab_technician", "tenant_admin", "director"] },
      { id: "clinical-labs", label: "🩸 Clinical Labs", icon: Heart, path: "/lab/clinical", roles: ["lab_technician", "tenant_admin", "director"] },
      { id: "industrial-labs", label: "🏭 Industrial Labs", icon: Factory, path: "/lab/industrial", roles: ["lab_technician", "tenant_admin", "director"] }
    ];
    
    // Modern Digital Features
    const digitalItems = [
      { id: "mobile-integration", label: "📱 Mobile Integration", icon: Smartphone, path: "/lab/mobile", roles: ["lab_technician", "tenant_admin", "director"] },
      { id: "automation-ai", label: "🤖 Automation & AI", icon: Brain, path: "/lab/automation", roles: ["lab_technician", "tenant_admin", "director"] }
    ];
    
    return (
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          {/* NaviMed Logo */}
          <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-200">
            <img src={navimedLogo} alt="NaviMed" className="h-8 w-8 rounded-lg object-contain" />
            <div>
              <h1 className="text-sm font-bold text-purple-600">LABSAFE</h1>
              <p className="text-xs text-gray-500">{currentTenant?.name || 'Laboratory'}</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            {/* Core Operations */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">
                Core Operations
              </h3>
              {coreOperationsItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setLocation(item.path)}
                    className={cn(
                      "w-full flex items-center px-2 py-2 text-xs font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-purple-600 bg-purple-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn("mr-2 h-3 w-3", isActive ? "text-purple-600" : "text-gray-400")} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            
            {/* Analytics & Insights */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">
                Analytics & Quality
              </h3>
              {analyticsItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setLocation(item.path)}
                    className={cn(
                      "w-full flex items-center px-2 py-2 text-xs font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn("mr-2 h-3 w-3", isActive ? "text-blue-600" : "text-gray-400")} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            
            {/* Resource Management */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3">
                Resource Management
              </h3>
              {resourceItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setLocation(item.path)}
                    className={cn(
                      "w-full flex items-center px-2 py-2 text-xs font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-green-600 bg-green-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn("mr-2 h-3 w-3", isActive ? "text-green-600" : "text-gray-400")} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            
            {/* Client Services */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-3">
                Client Services
              </h3>
              {clientServicesItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setLocation(item.path)}
                    className={cn(
                      "w-full flex items-center px-2 py-2 text-xs font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-orange-600 bg-orange-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn("mr-2 h-3 w-3", isActive ? "text-orange-600" : "text-gray-400")} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            
            {/* Compliance & Administration */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-3">
                Compliance & Admin
              </h3>
              {complianceItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setLocation(item.path)}
                    className={cn(
                      "w-full flex items-center px-2 py-2 text-xs font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-red-600 bg-red-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn("mr-2 h-3 w-3", isActive ? "text-red-600" : "text-gray-400")} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            
            {/* Specialized Features */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">
                Specialized Labs
              </h3>
              {specializedItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setLocation(item.path)}
                    className={cn(
                      "w-full flex items-center px-2 py-2 text-xs font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn("mr-2 h-3 w-3", isActive ? "text-indigo-600" : "text-gray-400")} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            
            {/* Digital Features */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-cyan-600 uppercase tracking-wider mb-3">
                Digital Features
              </h3>
              {digitalItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setLocation(item.path)}
                    className={cn(
                      "w-full flex items-center px-2 py-2 text-xs font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-cyan-600 bg-cyan-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn("mr-2 h-3 w-3", isActive ? "text-cyan-600" : "text-gray-400")} />
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
  if (user.role === "pharmacist" || ((user.role === "tenant_admin" || user.role === "director") && isPharmacyTenant)) {
    
    const pharmacyItems = filteredItems.filter(item => 
      ["pharmacy-dashboard", "prescription-management", "prescription-refills", "prescription-transfers", "pharmacy-inventory", "health-wellness", "insurance-verification", "delivery-pickup", "customer-accounts", "pharmacy-support", "digital-services", "prescription-archives", "pharmacy-patient-management", "pharmacy-employee-management", "pharmacy-billing", "pharmacy-insurance-claims", "admin-dashboard", "advertisements"].includes(item.id)
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
    const clinicalItemIds = ["dashboard", "patient-portal", "register-patient", "book-appointment", "patients", "patient-medical-records", "patient-messages", "consultation-history", "appointments", "prescriptions", "lab-orders", "lab-results", "health-recommendations", "medical-communications", "patient-access-management"];
    // For laboratory tenants, exclude prescription-related items and medical communications
    if (currentTenant?.type === "laboratory") {
      const labClinicalIds = ["dashboard", "patients", "lab-records", "lab-orders", "lab-results"];
      return labClinicalIds.includes(item.id);
    }
    return clinicalItemIds.includes(item.id) && !["pharmacy-dashboard", "lab-records"].includes(item.id);
  });
  const operationItems = filteredItems.filter(item => {
    const operationItemIds = ["billing", "service-prices", "advertisements"];
    return operationItemIds.includes(item.id);
  });
  const adminItems = filteredItems.filter(item => {
    // For laboratory tenants, exclude white-label settings and advanced features
    if (currentTenant?.type === "laboratory") {
      const labAdminIds = ["reports", "user-roles", "audit-logs"];
      return labAdminIds.includes(item.id);
    }
    const adminItemIds = ["reports", "white-label-settings", "offline-mode", "tenant-management", "admin-dashboard", "user-roles", "audit-logs"];
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
