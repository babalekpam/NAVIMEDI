import { useState, useEffect, useMemo } from "react";
import { SimpleRoleChanger } from "@/components/SimpleRoleChanger";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserCheck, Users, Plus, Edit, HelpCircle, Info, Shield, Key, Eye, EyeOff, Settings } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context-fixed";
import { useTranslation } from "@/contexts/translation-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  tenantId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["director", "physician", "nurse", "pharmacist", "lab_technician", "receptionist", "billing_staff", "tenant_admin"]),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

const roleDescriptions = {
  director: "Executive oversight of healthcare operations, strategic planning, and organizational management",
  physician: "Full access to patient records, prescriptions, and clinical data",
  nurse: "Access to patient care, medication administration, and clinical workflows",
  pharmacist: "Prescription management, drug interactions, and pharmacy operations",
  lab_technician: "Laboratory orders, test results, and diagnostic data management",
  receptionist: "Patient scheduling, registration, and basic administrative tasks",
  billing_staff: "Insurance claims, billing processes, and financial data",
  tenant_admin: "Full tenant management, user administration, and system configuration"
};

const rolePermissions = {
  director: {
    patients: ["view", "search"],
    appointments: ["view", "create", "update", "cancel"],
    prescriptions: ["view"],
    labOrders: ["view"],
    billing: ["view", "manage"],
    reports: ["view", "generate"],
    users: ["view", "create_staff"],
    auditLogs: ["view"],
    dashboard: ["view_metrics"]
  },
  physician: {
    patients: ["view", "create", "update", "search", "medical_records"],
    appointments: ["view", "create", "update", "cancel"],
    prescriptions: ["view", "create", "update", "cancel"],
    labOrders: ["view", "create", "update", "assign"],
    consultations: ["view", "create", "update", "finalize"],
    vitalSigns: ["view", "record"],
    medicalHistory: ["view", "edit"],
    billing: ["view"],
    reports: ["view"],
    communications: ["view", "create"],
    dashboard: ["view_clinical"]
  },
  nurse: {
    patients: ["view", "search", "basic_info"],
    appointments: ["view", "update_status"],
    prescriptions: ["view"],
    labOrders: ["view"],
    consultations: ["view", "assist"],
    vitalSigns: ["view", "record"],
    medicalHistory: ["view"],
    patientCheckIn: ["manage"],
    communications: ["view"],
    dashboard: ["view_patient_care"]
  },
  pharmacist: {
    patients: ["view_basic", "search_prescriptions"],
    prescriptions: ["view", "dispense", "update_status"],
    medications: ["manage", "inventory"],
    billing: ["medication_claims"],
    communications: ["view", "create"],
    dashboard: ["view_pharmacy"]
  },
  lab_technician: {
    patients: ["view_basic", "search_lab"],
    labOrders: ["view", "process", "enter_results"],
    labResults: ["create", "update", "view"],
    dashboard: ["view_lab"]
  },
  receptionist: {
    patients: ["view", "create", "update_basic", "search"],
    appointments: ["view", "create", "update", "cancel"],
    patientCheckIn: ["manage"],
    vitalSigns: ["record"],
    billing: ["view", "process_payments"],
    servicePrice: ["view", "manage"],
    dashboard: ["view_front_desk"]
  },
  billing_staff: {
    patients: ["view_billing", "search"],
    appointments: ["view"],
    billing: ["view", "create", "update", "process"],
    insuranceClaims: ["view", "create", "submit", "track"],
    servicePrice: ["view", "manage"],
    reports: ["view", "generate_financial"],
    dashboard: ["view_billing"]
  },
  tenant_admin: {
    patients: ["view", "search"],
    appointments: ["view"],
    users: ["view", "create", "update", "deactivate"],
    roles: ["assign", "modify"],
    tenantSettings: ["view", "update"],
    auditLogs: ["view"],
    reports: ["view", "generate"],
    billing: ["view", "manage"],
    servicePrice: ["view", "manage"],
    dashboard: ["view_admin"]
  }
};

const roleTooltips = {
  director: "Directors have executive-level access to view organizational metrics, strategic reports, and operational oversight but limited direct patient data access for privacy compliance.",
  physician: "Physicians have the highest level of clinical access and can view/edit all patient data, prescribe medications, and order lab tests.",
  nurse: "Nurses can access patient care information, administer medications, and update clinical notes but cannot prescribe medications.",
  pharmacist: "Pharmacists manage prescriptions, check drug interactions, and handle pharmacy inventory but have limited patient data access.",
  lab_technician: "Lab technicians process lab orders, enter test results, and manage diagnostic equipment but cannot access full patient records.",
  receptionist: "Receptionists handle front desk operations like scheduling and patient check-in but have minimal access to clinical data.",
  billing_staff: "Billing staff process insurance claims and handle financial transactions but cannot access clinical patient information.",
  tenant_admin: "Tenant admins have full administrative control over the organization including user management and system settings."
};

const roleColors = {
  director: "bg-indigo-100 text-indigo-800 border-indigo-200",
  physician: "bg-blue-100 text-blue-800 border-blue-200",
  nurse: "bg-green-100 text-green-800 border-green-200",
  pharmacist: "bg-purple-100 text-purple-800 border-purple-200",
  lab_technician: "bg-orange-100 text-orange-800 border-orange-200",
  receptionist: "bg-pink-100 text-pink-800 border-pink-200",
  billing_staff: "bg-yellow-100 text-yellow-800 border-yellow-200",
  tenant_admin: "bg-red-100 text-red-800 border-red-200"
};

export default function UserRoles() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPermissions, setShowPermissions] = useState<string | null>(null);
  
  // New user credentials state
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [newUserCredentials, setNewUserCredentials] = useState<{
    username: string;
    temporaryPassword: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null>(null);
  
  // Permission editing state
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<string>("");
  const [editingPermissions, setEditingPermissions] = useState<Record<string, boolean>>({});

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "receptionist",
      password: "",
    },
  });

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users", tenant?.id],
    enabled: !!user && !!tenant,
    queryFn: async () => {
      const response = await fetch(`/api/users/${tenant?.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Fetch actual role permissions from database
  const { data: rolePermissionsFromDB, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["/api/role-permissions", tenant?.id],
    enabled: !!user && !!tenant,
    queryFn: async () => {
      const response = await fetch(`/api/role-permissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch role permissions');
      }
      return response.json();
    }
  });

  // Convert database permissions to the format expected by the UI
  const actualRolePermissions = useMemo(() => {
    if (!rolePermissionsFromDB || !Array.isArray(rolePermissionsFromDB)) {
      return rolePermissions; // Fallback to hardcoded permissions if no data
    }

    const actualPermissions: Record<string, Record<string, string[]>> = {};
    
    rolePermissionsFromDB.forEach((perm: any) => {
      if (!actualPermissions[perm.role]) {
        actualPermissions[perm.role] = {};
      }
      actualPermissions[perm.role][perm.module] = perm.permissions;
    });

    // Merge with default permissions to ensure all modules are present
    Object.keys(rolePermissions).forEach(role => {
      if (!actualPermissions[role]) {
        actualPermissions[role] = rolePermissions[role as keyof typeof rolePermissions];
      } else {
        // Fill in missing modules with default permissions
        const roleKey = role as keyof typeof rolePermissions;
        if (rolePermissions[roleKey]) {
          Object.keys(rolePermissions[roleKey]).forEach(module => {
            if (!actualPermissions[role][module]) {
              actualPermissions[role][module] = (rolePermissions[roleKey] as Record<string, string[]>)[module];
            }
          });
        }
      }
    });

    return actualPermissions;
  }, [rolePermissionsFromDB]);

  // Initialize editing permissions when role is selected
  const initializeEditingPermissions = (role: string) => {
    const rolePermissions = actualRolePermissions[role as keyof typeof actualRolePermissions];
    if (!role || !rolePermissions) return;
    
    const initialPermissions: Record<string, boolean> = {};
    
    // Get current permissions for this role
    Object.entries(rolePermissions).forEach(([module, permissions]) => {
      (permissions as string[]).forEach((permission) => {
        const permissionKey = `${role}.${module}.${permission}`;
        initialPermissions[permissionKey] = true;
      });
    });
    
    setEditingPermissions(initialPermissions);
  };

  // Effect to initialize permissions when role selection changes
  useEffect(() => {
    if (selectedRoleForEdit) {
      initializeEditingPermissions(selectedRoleForEdit);
    }
  }, [selectedRoleForEdit, actualRolePermissions]); // eslint-disable-line react-hooks/exhaustive-deps

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await apiRequest("POST", "/api/users", data);
      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create user");
        } else {
          const errorText = await response.text();
          console.error("HTML Error Response:", errorText);
          throw new Error("Authentication failed. Please refresh and try again.");
        }
      }
      
      return response.json();
    },
    onSuccess: (responseData, formData) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", tenant?.id] });
      setIsCreateDialogOpen(false);
      form.reset();
      
      // Store credentials and show popup
      setNewUserCredentials({
        username: responseData.username || formData.username,
        temporaryPassword: responseData.temporaryPassword || "Not available",
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role
      });
      setShowCredentialsDialog(true);
      
      toast({
        title: "Success", 
        description: "User created successfully and email sent with login credentials",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserFormData> }) => {
      console.log("Updating user:", id, "with data:", data);
      const response = await apiRequest("PATCH", `/api/users/${id}`, data);
      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          throw new Error(error.message || "Failed to update user");
        } else {
          const errorText = await response.text();
          console.error("HTML Error Response:", errorText);
          throw new Error("Authentication failed. Please refresh and try again.");
        }
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", tenant?.id] });
      setEditingUser(null);
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify({ isActive })
      });
      
      if (!response.ok) {
        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          throw new Error(error.message || "Failed to update user status");
        } else {
          // Handle HTML error responses (authentication issues)
          const errorText = await response.text();
          console.error("HTML Error Response:", errorText);
          throw new Error("Authentication failed. Please check your login status and try again.");
        }
      }
      
      return response.json();
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", tenant?.id] });
      toast({
        title: "Success",
        description: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Permission management mutations
  const savePermissionsMutation = useMutation({
    mutationFn: async (role: string) => {
      const permissionsToSave = Object.entries(editingPermissions)
        .filter(([key, enabled]) => key.startsWith(`${role}.`) && enabled)
        .map(([key]) => {
          const [, module, permission] = key.split('.');
          return { module, permission };
        });

      // Group by module
      const permissionsByModule = permissionsToSave.reduce((acc, { module, permission }) => {
        if (!acc[module]) acc[module] = [];
        acc[module].push(permission);
        return acc;
      }, {} as Record<string, string[]>);

      // Create or update permissions for each module
      console.log("🔧 Saving permissions for role:", role);
      console.log("🔧 Permissions by module:", permissionsByModule);
      
      const promises = Object.entries(permissionsByModule).map(async ([module, permissions]) => {
        console.log("🔧 Processing module:", module, "with permissions:", permissions);
        
        try {
          const response = await apiRequest("POST", "/api/role-permissions", {
            role,
            module,
            permissions
          });
          
          console.log("🔧 Response status:", response.status);
          
          if (!response.ok) {
            const contentType = response.headers.get("content-type");
            console.log("🔧 Error content type:", contentType);
            
            if (contentType && contentType.includes("application/json")) {
              const error = await response.json();
              console.error("🔧 JSON Error:", error);
              throw new Error(error.message || "Failed to save permissions");
            } else {
              const errorText = await response.text();
              console.error("🔧 HTML Error Response:", errorText.substring(0, 200));
              
              if (errorText.includes("<!DOCTYPE") || errorText.includes("<html")) {
                throw new Error("Session expired - please refresh and try again");
              }
              
              throw new Error("Failed to save permissions - server error");
            }
          }
          
          const result = await response.json();
          console.log("🔧 Success result for module", module, ":", result);
          return result;
          
        } catch (error) {
          console.error("🔧 Error processing module", module, ":", error);
          throw error;
        }
      });

      await Promise.all(promises);
    },
    onSuccess: () => {
      console.log("🎉 ALL PERMISSIONS SAVED SUCCESSFULLY");
      toast({
        title: "Success",
        description: "Role permissions updated successfully",
      });
      // Invalidate and refetch role permissions with specific tenant ID
      queryClient.invalidateQueries({ queryKey: ["/api/role-permissions", tenant?.id] });
      // Force a refetch to ensure immediate UI update
      queryClient.refetchQueries({ queryKey: ["/api/role-permissions", tenant?.id] });
      
      // Clear editing state to reflect saved changes
      setEditingPermissions({});
    },
    onError: (error: Error) => {
      console.error("🚨 PERMISSIONS SAVE FAILED:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSavePermissions = (role: string) => {
    console.log("🔧 Starting save for role:", role);
    console.log("🔧 Current editingPermissions state:", editingPermissions);
    savePermissionsMutation.mutate(role);
  };

  const handleResetPermissions = (role: string) => {
    // Reset to default permissions
    const defaultPermissions = rolePermissions[role as keyof typeof rolePermissions];
    if (defaultPermissions) {
      const resetPermissions: Record<string, boolean> = {};
      Object.entries(defaultPermissions).forEach(([module, permissions]) => {
        (permissions as string[]).forEach((permission) => {
          resetPermissions[`${role}.${module}.${permission}`] = true;
        });
      });
      setEditingPermissions(resetPermissions);
      toast({
        title: "Reset",
        description: "Permissions reset to default values",
      });
    }
  };

  // Use real users data from API or empty array if loading
  const usersData = Array.isArray(users) ? users : [];
  
  // Define available roles based on user's permissions
  const getAvailableRoles = () => {
    if (user?.role === 'super_admin') {
      return ['director', 'physician', 'nurse', 'pharmacist', 'lab_technician', 'receptionist', 'billing_staff', 'tenant_admin'];
    } else if (user?.role === 'tenant_admin') {
      // Tenant admins can only create clinical and operational staff, not other admins
      return ['director', 'physician', 'nurse', 'pharmacist', 'lab_technician', 'receptionist', 'billing_staff'];
    }
    return [];
  };

  const availableRoles = getAvailableRoles();

  const filteredUsers = usersData.filter(userItem => {
    const matchesSearch = userItem.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || userItem.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && userItem.isActive) ||
                         (statusFilter === "inactive" && !userItem.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const onSubmit = (data: UserFormData) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data });
    } else {
      createUserMutation.mutate(data);
    }
  };

  const handleEdit = (userItem: User) => {
    setEditingUser(userItem);
    form.reset({
      username: userItem.username,
      email: userItem.email,
      firstName: userItem.firstName || "",
      lastName: userItem.lastName || "",
      role: userItem.role as any,
      password: "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleToggleStatus = (userItem: User) => {
    toggleUserStatusMutation.mutate({
      id: userItem.id,
      isActive: !userItem.isActive,
    });
  };





  const formatPermissionName = (permission: string) => {
    return permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPermissionColor = (permission: string) => {
    if (permission.includes('create') || permission.includes('edit') || permission.includes('update')) {
      return 'bg-green-100 text-green-800';
    }
    if (permission.includes('view') || permission.includes('search')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (permission.includes('delete') || permission.includes('cancel') || permission.includes('deactivate')) {
      return 'bg-red-100 text-red-800';
    }
    if (permission.includes('manage') || permission.includes('admin')) {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold text-gray-900">{t('user-roles')}</h1>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Manage your healthcare team members and assign appropriate roles based on their responsibilities.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-gray-600 mt-2">
{t('manage-healthcare-team-permissions')}
            </p>
          </div>
          
          {/* Show Create User button only for super admin and tenant admin */}
          {(user?.role === 'super_admin' || user?.role === 'tenant_admin') && (
            <Button 
              onClick={() => {
                setEditingUser(null);
                form.reset();
                setIsCreateDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
{t('add-user')}
            </Button>
          )}
        </div>
        
        {/* Create User Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? t('edit-user') : t('create-new-user')}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? t('update-user-info-role') : t('add-new-team-member')}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('username')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('enter-username')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('email')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={t('enter-email')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('first-name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('enter-first-name')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <FormLabel>Role</FormLabel>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Choose a role that matches the user's responsibilities. Each role has specific permissions for healthcare operations.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role.replace('_', ' ').split(' ').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {editingUser ? "New Password (leave blank to keep current)" : "Password"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder={editingUser ? "Leave blank to keep current" : "Enter password"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending}>
                    {createUserMutation.isPending || updateUserMutation.isPending ? "Saving..." : editingUser ? "Update User" : "Create User"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage healthcare team members</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex space-x-4 mb-4">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="physician">Physician</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  <SelectItem value="lab_technician">Lab Tech</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="billing_staff">Billing</SelectItem>
                  <SelectItem value="tenant_admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Grid */}
            {isLoading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : (
              <div className="grid gap-4">
                {filteredUsers.map((userItem) => (
                  <div key={userItem.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{userItem.firstName} {userItem.lastName}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge className={roleColors[userItem.role as keyof typeof roleColors]}>
                              {userItem.role.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowPermissions(showPermissions === userItem.role ? null : userItem.role)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Shield className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View detailed permissions</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Badge variant={userItem.isActive ? "default" : "secondary"}>
                            {userItem.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm">{userItem.email}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {roleDescriptions[userItem.role as keyof typeof roleDescriptions]}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(userItem)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <SimpleRoleChanger
                          userId={userItem.id}
                          currentRole={userItem.role}
                          userName={userItem.firstName || userItem.username}
                          onSuccess={() => {
                            queryClient.invalidateQueries({ queryKey: ["/api/users", tenant?.id] });
                          }}
                        />
                        {userItem.role !== 'super_admin' && (
                          <Button
                            variant={userItem.isActive ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleToggleStatus(userItem)}
                            disabled={toggleUserStatusMutation.isPending}
                          >
                            {userItem.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Permissions Display */}
                    {showPermissions === userItem.role && rolePermissions[userItem.role as keyof typeof rolePermissions] && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center space-x-2 mb-3">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <h4 className="font-semibold text-gray-900">
                            {userItem.role.replace('_', ' ').toUpperCase()} Permissions
                          </h4>
                        </div>
                        
                        <div className="grid gap-3">
                          {Object.entries(rolePermissions[userItem.role as keyof typeof rolePermissions]).map(([module, permissions]) => (
                            <div key={module} className="space-y-1">
                              <h5 className="font-medium text-gray-700 text-sm capitalize">
                                {module.replace(/([A-Z])/g, ' $1').trim()}
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {permissions.map((permission: string) => (
                                  <Badge 
                                    key={permission} 
                                    variant="outline" 
                                    className={`text-xs ${getPermissionColor(permission)}`}
                                  >
                                    {formatPermissionName(permission)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No users match your criteria</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{filteredUsers.length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {filteredUsers.filter(u => u.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {Object.keys(actualRolePermissions).length}
              </div>
              <div className="text-sm text-gray-600">Role Types</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Key className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {Object.values(actualRolePermissions).reduce((total, perms) => 
                  total + Object.values(perms).flat().length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Permissions</div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions Reference Guide */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <CardTitle>Permissions Reference Guide</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Complete overview of what each role can access and perform within your healthcare system.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription>
              Comprehensive role capabilities for your healthcare team. Click the shield icon next to any user above to see their specific permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(actualRolePermissions).map(([role, permissions]) => (
                <div key={role} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={roleColors[role as keyof typeof roleColors]}>
                      {role.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {Object.values(permissions).flat().length} permissions
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    {roleDescriptions[role as keyof typeof roleDescriptions]}
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(permissions).slice(0, 3).map(([module, modulePerms]) => (
                      <div key={module} className="text-xs">
                        <span className="font-medium text-gray-600 capitalize">
                          {module.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(modulePerms as string[]).slice(0, 4).map((perm) => (
                            <Badge 
                              key={perm} 
                              variant="outline" 
                              className={`text-xs ${getPermissionColor(perm)}`}
                            >
                              {formatPermissionName(perm)}
                            </Badge>
                          ))}
                          {(modulePerms as string[]).length > 4 && (
                            <span className="text-xs text-gray-400">
                              +{(modulePerms as string[]).length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {Object.keys(permissions).length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{Object.keys(permissions).length - 3} more modules
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Permissions Management - Only for tenant admins */}
        {user?.role === 'tenant_admin' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-green-600" />
                  <CardTitle>Customize Role Permissions</CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Customize what each role can access and perform within your organization. Changes apply to all users with the selected role.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Admin Only
                </Badge>
              </div>
              <CardDescription>
                Customize permissions for each role within your organization. Changes will apply to all users with the selected role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Select Role to Customize</div>
                  <Select 
                    value={selectedRoleForEdit} 
                    onValueChange={setSelectedRoleForEdit}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a role to customize permissions" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.filter(role => role !== 'tenant_admin').map((role) => (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center space-x-2">
                            <Badge className={roleColors[role as keyof typeof roleColors]} variant="outline">
                              {role.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <span>{role.replace('_', ' ').split(' ').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Permission Editing Interface */}
                {selectedRoleForEdit && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Permissions for {selectedRoleForEdit.replace('_', ' ').split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </h4>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPermissions(selectedRoleForEdit)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Reset to Default
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSavePermissions(selectedRoleForEdit)}
                          disabled={savePermissionsMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {savePermissionsMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>

                    {/* Permission Modules Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(actualRolePermissions[selectedRoleForEdit as keyof typeof actualRolePermissions] || {})
                        .sort(([a], [b]) => a.localeCompare(b)) // Stable alphabetical sort to prevent moving sections
                        .map(([module, permissions]) => (
                        <Card key={module} className="border-gray-200">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm capitalize">
                              {module.replace(/([A-Z])/g, ' $1').trim()}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {['view', 'create', 'update', 'delete', 'manage', 'search', 'assign', 'finalize', 'edit', 'record', 'cancel'].map((permission) => {
                              const hasPermission = (permissions as string[]).includes(permission);
                              const permissionKey = `${selectedRoleForEdit}.${module}.${permission}`;
                              
                              return (
                                <div key={permission} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={permissionKey}
                                    checked={editingPermissions[permissionKey] ?? hasPermission}
                                    onCheckedChange={(checked) => 
                                      setEditingPermissions(prev => ({
                                        ...prev,
                                        [permissionKey]: checked === true
                                      }))
                                    }
                                  />
                                  <label
                                    htmlFor={permissionKey}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center space-x-1"
                                  >
                                    <span className="capitalize">{formatPermissionName(permission)}</span>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getPermissionColor(permission)}`}
                                    >
                                      {permission}
                                    </Badge>
                                  </label>
                                </div>
                              );
                            })}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Permission Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Permission Summary</h5>
                      <div className="text-sm text-gray-600">
                        Total permissions enabled: {Object.values(editingPermissions).filter(Boolean).length}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Changes will apply to all users with the {selectedRoleForEdit.replace('_', ' ')} role
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* User Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-green-600" />
              <span>User Created Successfully!</span>
            </DialogTitle>
            <DialogDescription>
              The new user has been created and an email has been sent with login instructions.
            </DialogDescription>
          </DialogHeader>
          
          {newUserCredentials && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">Login Credentials</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name:</label>
                    <p className="text-sm font-mono bg-white border rounded px-2 py-1">
                      {newUserCredentials.firstName} {newUserCredentials.lastName}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Role:</label>
                    <p className="text-sm font-mono bg-white border rounded px-2 py-1 capitalize">
                      {newUserCredentials.role.replace('_', ' ')}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Username:</label>
                    <p className="text-sm font-mono bg-white border rounded px-2 py-1 font-semibold text-blue-800">
                      {newUserCredentials.username}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email:</label>
                    <p className="text-sm font-mono bg-white border rounded px-2 py-1">
                      {newUserCredentials.email}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Temporary Password:</label>
                    <p className="text-sm font-mono bg-white border rounded px-2 py-1 font-semibold text-red-700">
                      {newUserCredentials.temporaryPassword}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Important:</p>
                    <ul className="text-xs space-y-1">
                      <li>• User will receive an email with these credentials</li>
                      <li>• Temporary password must be changed on first login</li>
                      <li>• Email sent from info@navimedi.com</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => {
                setShowCredentialsDialog(false);
                setNewUserCredentials(null);
              }}
              className="w-full"
            >
              Got it, thanks!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}