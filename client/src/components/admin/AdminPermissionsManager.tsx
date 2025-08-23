import { useState, useEffect } from "react";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Settings, Shield, Eye, Edit, Plus, Trash2, Save, RefreshCw, Users, Building2, Stethoscope, Heart, Microscope, Calculator, Phone, ClipboardList, FileText, Activity, Database, Package, DollarSign, Calendar, TestTube, Pill } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/contexts/tenant-context-fixed";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Define all available modules and their permissions
const moduleDefinitions = {
  dashboard: {
    name: "Dashboard",
    icon: Activity,
    description: "Main dashboard and overview",
    permissions: ["view", "refresh_data"]
  },
  patients: {
    name: "Patient Management",
    icon: Users,
    description: "Patient records, registration, and management",
    permissions: ["view", "create", "edit", "delete", "export"]
  },
  appointments: {
    name: "Appointments",
    icon: Calendar,
    description: "Appointment scheduling and management",
    permissions: ["view", "create", "edit", "delete", "cancel"]
  },
  prescriptions: {
    name: "Prescriptions",
    icon: Pill,
    description: "Prescription management and pharmacy",
    permissions: ["view", "create", "edit", "delete", "approve"]
  },
  lab_orders: {
    name: "Laboratory",
    icon: TestTube,
    description: "Lab orders, results, and testing",
    permissions: ["view", "create", "edit", "delete", "approve_results"]
  },
  billing: {
    name: "Billing & Claims",
    icon: DollarSign,
    description: "Financial operations and insurance claims",
    permissions: ["view", "create", "edit", "delete", "process_payments", "export"]
  },
  departments: {
    name: "Department Management",
    icon: Building2,
    description: "Hospital departments and organization",
    permissions: ["view", "create", "edit", "delete", "assign_staff"]
  },
  staff_management: {
    name: "Staff Management",
    icon: Users,
    description: "Employee management and roles",
    permissions: ["view", "create", "edit", "delete", "assign_roles", "manage_permissions"]
  },
  inventory: {
    name: "Inventory",
    icon: Package,
    description: "Medical supplies and equipment",
    permissions: ["view", "create", "edit", "delete", "reorder", "export"]
  },
  reports: {
    name: "Reports & Analytics",
    icon: FileText,
    description: "Reporting and data analysis",
    permissions: ["view", "create", "export", "schedule"]
  },
  settings: {
    name: "System Settings",
    icon: Settings,
    description: "Application configuration and settings",
    permissions: ["view", "edit", "backup", "restore"]
  },
  audit_logs: {
    name: "Audit Logs",
    icon: Database,
    description: "System activity and security logs",
    permissions: ["view", "export"]
  }
};

const roleDefinitions = {
  tenant_admin: {
    name: "Hospital Administrator",
    icon: Building2,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Complete administrative control over hospital operations"
  },
  director: {
    name: "Medical Director",
    icon: Shield,
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Medical leadership and clinical oversight"
  },
  physician: {
    name: "Physician",
    icon: Stethoscope,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Patient care and medical decision making"
  },
  nurse: {
    name: "Nurse",
    icon: Heart,
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Patient care and medication administration"
  },
  lab_technician: {
    name: "Lab Technician",
    icon: Microscope,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    description: "Laboratory operations and testing"
  },
  receptionist: {
    name: "Receptionist",
    icon: Phone,
    color: "bg-pink-100 text-pink-800 border-pink-200",
    description: "Patient registration and scheduling"
  },
  billing_staff: {
    name: "Billing Staff",
    icon: Calculator,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    description: "Financial operations and claims"
  },
  insurance_manager: {
    name: "Insurance Manager",
    icon: ClipboardList,
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    description: "Insurance coordination and authorization"
  }
};

const permissionLabels = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  export: "Export",
  approve: "Approve",
  cancel: "Cancel",
  process_payments: "Process Payments",
  approve_results: "Approve Results",
  assign_staff: "Assign Staff",
  assign_roles: "Assign Roles",
  manage_permissions: "Manage Permissions",
  reorder: "Reorder",
  schedule: "Schedule",
  backup: "Backup",
  restore: "Restore",
  refresh_data: "Refresh Data"
};

interface Permission {
  id: string;
  role: string;
  module: string;
  permissions: string[];
  isActive: boolean;
}

const AdminPermissionsManager = () => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedRole, setSelectedRole] = useState<string>("physician");
  const [editingPermissions, setEditingPermissions] = useState<Record<string, string[]>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch current role permissions
  const { data: currentPermissions, isLoading, refetch } = useQuery({
    queryKey: ["/api/role-permissions", selectedRole],
    queryFn: async () => {
      const response = await fetch("/api/role-permissions", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch permissions');
      const data = await response.json();
      console.log("🔍 [PERMISSIONS] Fetched permissions:", data);
      return data;
    },
    enabled: !!selectedRole && !!tenant
  });

  // Initialize editing permissions when role changes
  useEffect(() => {
    console.log("🔄 [INIT] Initializing permissions for role:", selectedRole);
    console.log("🔄 [INIT] Current permissions data:", currentPermissions);
    
    const rolePermissions: Record<string, string[]> = {};
    
    // Initialize all modules with empty permissions
    Object.keys(moduleDefinitions).forEach(module => {
      rolePermissions[module] = [];
    });

    // Fill in existing permissions if any
    if (currentPermissions && Array.isArray(currentPermissions)) {
      currentPermissions
        .filter((p: Permission) => p.role === selectedRole && p.isActive)
        .forEach((p: Permission) => {
          if (rolePermissions[p.module]) {
            rolePermissions[p.module] = p.permissions || [];
          }
        });
    }

    console.log("🔄 [INIT] Final permissions state:", rolePermissions);
    setEditingPermissions(rolePermissions);
    setHasChanges(false);
  }, [currentPermissions, selectedRole]);

  // Save permissions mutation
  const savePermissionsMutation = useMutation({
    mutationFn: async (permissions: Record<string, string[]>) => {
      console.log("💾 [SAVE] Saving permissions:", permissions);
      const results = [];
      for (const [module, modulePermissions] of Object.entries(permissions)) {
        if (modulePermissions.length > 0) {
          console.log(`💾 [SAVE] Saving ${module}:`, modulePermissions);
          try {
            const result = await apiRequest("/api/role-permissions", {
              method: "POST",
              body: JSON.stringify({
                role: selectedRole,
                module,
                permissions: modulePermissions
              })
            });
            console.log(`✅ [SAVE] Saved ${module} successfully:`, result);
            results.push(result);
          } catch (error) {
            console.error(`❌ [SAVE] Error saving ${module}:`, error);
            throw error;
          }
        } else {
          console.log(`⏭️ [SAVE] Skipping ${module} - no permissions`);
        }
      }
      console.log("💾 [SAVE] All results:", results);
      return results;
    },
    onSuccess: (data) => {
      console.log("🎉 [SAVE] Save completed successfully:", data);
      toast({
        title: "Permissions Saved",
        description: `Permissions for ${roleDefinitions[selectedRole as keyof typeof roleDefinitions].name} have been updated successfully.`
      });
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ["/api/role-permissions"] });
      refetch();
    },
    onError: (error: any) => {
      console.error("💥 [SAVE] Save failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save permissions",
        variant: "destructive"
      });
    }
  });

  // Reset permissions mutation
  const resetPermissionsMutation = useMutation({
    mutationFn: async (role: string) => {
      const response = await fetch(`/api/role-permissions/${role}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to reset permissions');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Permissions Reset",
        description: `All permissions for ${roleDefinitions[selectedRole as keyof typeof roleDefinitions].name} have been reset.`
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset permissions",
        variant: "destructive"
      });
    }
  });

  const handlePermissionToggle = (module: string, permission: string, enabled: boolean) => {
    console.log("🔧 [TOGGLE] Module:", module, "Permission:", permission, "Enabled:", enabled);
    
    setEditingPermissions(prev => {
      const newPermissions = { ...prev };
      if (!newPermissions[module]) {
        newPermissions[module] = [];
      }
      
      if (enabled) {
        if (!newPermissions[module].includes(permission)) {
          newPermissions[module] = [...newPermissions[module], permission];
        }
      } else {
        newPermissions[module] = newPermissions[module].filter(p => p !== permission);
      }
      
      console.log("🔧 [TOGGLE] Updated permissions:", newPermissions);
      setHasChanges(true);
      return newPermissions;
    });
  };

  const handleSavePermissions = () => {
    savePermissionsMutation.mutate(editingPermissions);
  };

  const handleResetPermissions = () => {
    resetPermissionsMutation.mutate(selectedRole);
  };

  const hasModulePermissions = (module: string) => {
    return editingPermissions[module]?.length > 0;
  };

  if (!tenant || tenant.type !== 'hospital') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Admin permissions management is only available for hospital organizations.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (user?.role !== 'tenant_admin' && user?.role !== 'super_admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insufficient Permissions</CardTitle>
          <CardDescription>Only hospital administrators and super admins can manage permissions.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-permissions-manager">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Admin Permissions Manager
          </CardTitle>
          <CardDescription>
            Define exactly what each admin role can see and do in the application. 
            Control access to modules, features, and specific operations for complete customization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Label htmlFor="role-select">Select Role:</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-64" data-testid="select-role-permissions">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleDefinitions).map(([roleKey, role]) => {
                    const Icon = role.icon;
                    return (
                      <SelectItem key={roleKey} value={roleKey}>
                        <div className="flex items-center">
                          <Icon className="h-4 w-4 mr-2" />
                          {role.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                  Unsaved Changes
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                data-testid="button-refresh-permissions"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Overview */}
      {selectedRole && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {React.createElement(roleDefinitions[selectedRole as keyof typeof roleDefinitions].icon, { 
                  className: "h-5 w-5 mr-2" 
                })}
                <div>
                  <CardTitle>{roleDefinitions[selectedRole as keyof typeof roleDefinitions].name}</CardTitle>
                  <CardDescription>{roleDefinitions[selectedRole as keyof typeof roleDefinitions].description}</CardDescription>
                </div>
              </div>
              <Badge className={roleDefinitions[selectedRole as keyof typeof roleDefinitions].color}>
                {selectedRole}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Configure detailed permissions for this role across all application modules
              </div>
              <div className="flex space-x-2">
                {hasChanges && (
                  <div className="bg-yellow-100 px-3 py-1 rounded-md text-yellow-800 text-sm">
                    {Object.values(editingPermissions).reduce((acc, perms) => acc + perms.length, 0)} permissions enabled
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("🗑️ [RESET] Reset button clicked");
                    handleResetPermissions();
                  }}
                  disabled={resetPermissionsMutation.isPending}
                  data-testid="button-reset-permissions"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
                <Button
                  onClick={() => {
                    console.log("💾 [SAVE] Save button clicked, current state:", editingPermissions);
                    handleSavePermissions();
                  }}
                  disabled={!hasChanges || savePermissionsMutation.isPending}
                  data-testid="button-save-permissions"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {savePermissionsMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permissions Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Module Permissions</CardTitle>
          <CardDescription>
            Toggle specific permissions for each application module. Each module can have different levels of access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(moduleDefinitions).map(([moduleKey, module]) => {
              const Icon = module.icon;
              const modulePermissions = editingPermissions[moduleKey] || [];
              
              return (
                <Card key={moduleKey} className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 mr-3 text-gray-600" />
                        <div>
                          <CardTitle className="text-base">{module.name}</CardTitle>
                          <CardDescription className="text-sm">{module.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={hasModulePermissions(moduleKey) ? "default" : "secondary"}>
                        {modulePermissions.length} of {module.permissions.length} permissions
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {module.permissions.map((permission) => {
                        const isEnabled = modulePermissions.includes(permission);
                        console.log(`🔧 [RENDER] ${moduleKey}.${permission}:`, isEnabled, "from array:", modulePermissions);
                        
                        return (
                          <div key={permission} className="flex items-center space-x-3">
                            <Switch
                              id={`${moduleKey}-${permission}`}
                              checked={isEnabled}
                              onCheckedChange={(checked) => {
                                console.log(`🖱️ [CLICK] Switch clicked: ${moduleKey}.${permission} -> ${checked}`);
                                handlePermissionToggle(moduleKey, permission, checked);
                              }}
                              data-testid={`switch-${moduleKey}-${permission}`}
                            />
                            <Label 
                              htmlFor={`${moduleKey}-${permission}`}
                              className="text-sm font-medium cursor-pointer"
                              onClick={() => {
                                console.log(`🖱️ [LABEL] Label clicked: ${moduleKey}.${permission}`);
                                const newState = !isEnabled;
                                handlePermissionToggle(moduleKey, permission, newState);
                              }}
                            >
                              {permissionLabels[permission as keyof typeof permissionLabels] || permission}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Permission Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Summary</CardTitle>
          <CardDescription>Overview of all permissions granted to this role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(editingPermissions).map(([module, permissions]) => {
              if (permissions.length === 0) return null;
              const moduleInfo = moduleDefinitions[module as keyof typeof moduleDefinitions];
              const Icon = moduleInfo?.icon || Settings;
              
              return (
                <div key={module} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="font-medium">{moduleInfo?.name || module}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {permissions.map((permission) => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permissionLabels[permission as keyof typeof permissionLabels] || permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {Object.values(editingPermissions).every(perms => perms.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No permissions assigned to this role</p>
                <p className="text-sm">Enable permissions above to grant access to application features</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPermissionsManager;