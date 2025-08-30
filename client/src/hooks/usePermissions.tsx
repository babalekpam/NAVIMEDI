import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/contexts/tenant-context";

interface Permission {
  id: string;
  role: string;
  module: string;
  permissions: string[];
  isActive: boolean;
}

// Define the exact permissions structure the user specified
const TENANT_ADMIN_PERMISSIONS = {
  patients: ["view", "search"],
  appointments: ["view"],
  users: ["view", "create", "update", "deactivate"],
  roles: ["assign", "modify"],
  tenant_settings: ["view", "update"],
  audit_logs: ["view"],
  reports: ["view", "generate"],
  billing: ["view", "manage"],
  service_price: ["view", "manage"],
  dashboard: ["view_admin"]
};

const DEFAULT_ROLE_PERMISSIONS = {
  physician: {
    patients: ["view", "search"],
    appointments: ["view", "create", "update"],
    prescriptions: ["view", "create", "edit"],
    lab_orders: ["view", "create"],
    dashboard: ["view"]
  },
  nurse: {
    patients: ["view"],
    appointments: ["view"],
    prescriptions: ["view"],
    lab_orders: ["view"],
    dashboard: ["view"]
  },
  receptionist: {
    patients: ["view", "create", "update"],
    appointments: ["view", "create", "update", "cancel"],
    dashboard: ["view"]
  },
  billing_staff: {
    patients: ["view"],
    billing: ["view", "manage"],
    service_price: ["view"],
    dashboard: ["view"]
  },
  lab_technician: {
    patients: ["view"],
    lab_orders: ["view", "update"],
    dashboard: ["view"]
  }
};

export const usePermissions = () => {
  const { user } = useAuth();
  const { tenant } = useTenant();

  // Fetch user permissions from API
  const { data: apiPermissions, isLoading } = useQuery({
    queryKey: ["/api/role-permissions", user?.role],
    queryFn: async () => {
      if (!user?.role) return [];
      const response = await fetch("/api/role-permissions", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.filter((p: Permission) => p.role === user.role && p.isActive);
    },
    enabled: !!user?.role && !!tenant
  });

  // Get effective permissions for current user
  const getEffectivePermissions = () => {
    if (!user?.role) return {};

    // Super admin gets all permissions
    if (user.role === 'super_admin') {
      return {
        patients: ["view", "search", "create", "edit", "delete"],
        appointments: ["view", "create", "edit", "delete", "cancel"],
        users: ["view", "create", "update", "delete", "deactivate"],
        roles: ["assign", "modify", "create", "delete"],
        tenant_settings: ["view", "update", "delete"],
        audit_logs: ["view", "export"],
        reports: ["view", "generate", "export"],
        billing: ["view", "manage", "process"],
        service_price: ["view", "manage"],
        dashboard: ["view_admin", "manage"],
        prescriptions: ["view", "create", "edit", "approve", "delete"],
        lab_orders: ["view", "create", "edit", "approve", "delete"],
        departments: ["view", "create", "edit", "delete"],
        inventory: ["view", "create", "edit", "delete", "reorder"],
        staff_management: ["view", "create", "edit", "delete", "assign_roles"]
      };
    }

    // Tenant admin gets specified permissions
    if (user.role === 'tenant_admin') {
      // If API permissions exist, use those; otherwise use defaults
      if (apiPermissions && apiPermissions.length > 0) {
        const permissions: Record<string, string[]> = {};
        apiPermissions.forEach((p: Permission) => {
          permissions[p.module] = p.permissions || [];
        });
        return permissions;
      }
      return TENANT_ADMIN_PERMISSIONS;
    }

    // Other roles get API permissions or defaults
    if (apiPermissions && apiPermissions.length > 0) {
      const permissions: Record<string, string[]> = {};
      apiPermissions.forEach((p: Permission) => {
        permissions[p.module] = p.permissions || [];
      });
      return permissions;
    }

    // Fall back to default permissions
    return DEFAULT_ROLE_PERMISSIONS[user.role as keyof typeof DEFAULT_ROLE_PERMISSIONS] || {};
  };

  // Check if user has specific permission
  const hasPermission = (module: string, permission: string): boolean => {
    const permissions = getEffectivePermissions();
    return permissions[module]?.includes(permission) || false;
  };

  // Check if user can access module at all
  const canAccessModule = (module: string): boolean => {
    const permissions = getEffectivePermissions();
    return permissions[module] && permissions[module].length > 0;
  };

  // Get all permissions for a module
  const getModulePermissions = (module: string): string[] => {
    const permissions = getEffectivePermissions();
    return permissions[module] || [];
  };

  return {
    permissions: getEffectivePermissions(),
    hasPermission,
    canAccessModule,
    getModulePermissions,
    isLoading,
    userRole: user?.role
  };
};