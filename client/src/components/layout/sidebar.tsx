import { 
  BarChart3, 
  Users, 
  Calendar, 
  Pill, 
  TestTube, 
  FileText, 
  Shield, 
  Building, 
  UserCheck, 
  ClipboardList,
  Settings,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  // Clinical Section
  { id: "dashboard", label: "Overview", icon: BarChart3, path: "/dashboard", roles: ["physician", "nurse", "pharmacist", "lab_technician", "receptionist", "billing_staff", "tenant_admin", "super_admin"] },
  { id: "patients", label: "Patient Records", icon: Users, path: "/patients", roles: ["physician", "nurse", "receptionist", "tenant_admin"] },
  { id: "appointments", label: "Appointments", icon: Calendar, path: "/appointments", roles: ["physician", "nurse", "receptionist", "tenant_admin"] },
  { id: "prescriptions", label: "Prescriptions", icon: Pill, path: "/prescriptions", roles: ["physician", "nurse", "pharmacist", "tenant_admin"] },
  { id: "lab-orders", label: "Lab Results", icon: TestTube, path: "/lab-orders", roles: ["physician", "nurse", "lab_technician", "tenant_admin"] },
  
  // Operations Section
  { id: "billing", label: "Billing & Claims", icon: FileText, path: "/billing", roles: ["billing_staff", "physician", "tenant_admin"] },
  
  // Administration Section
  { id: "tenant-management", label: "Tenant Management", icon: Building, path: "/tenant-management", roles: ["super_admin", "tenant_admin"] },
  { id: "user-roles", label: "User Roles", icon: UserCheck, path: "/user-roles", roles: ["tenant_admin", "super_admin"] },
  { id: "audit-logs", label: "Audit Logs", icon: ClipboardList, path: "/audit-logs", roles: ["tenant_admin", "super_admin"] },
  { id: "compliance", label: "HIPAA Compliance", icon: Shield, path: "/compliance", roles: ["tenant_admin", "super_admin"] },
];

export const Sidebar = () => {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const filteredItems = sidebarItems.filter(item => 
    item.roles.includes(user.role)
  );

  const clinicalItems = filteredItems.slice(0, 5);
  const operationItems = filteredItems.slice(5, 6);
  const adminItems = filteredItems.slice(6);

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        {/* Quick Actions */}
        <div className="mb-8">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => setLocation("/patients/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Patient
          </Button>
        </div>

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
