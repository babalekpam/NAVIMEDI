import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserCheck, Users, Plus, Edit, HelpCircle, Info } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
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

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await apiRequest("POST", "/api/users", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", tenant?.id] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "User created successfully",
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
      const response = await apiRequest("PATCH", `/api/users/${id}`, data);
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
        const error = await response.json();
        throw new Error(error.message || "Failed to update user status");
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
                          <Badge className={roleColors[userItem.role as keyof typeof roleColors]}>
                            {userItem.role.replace('_', ' ').toUpperCase()}
                          </Badge>
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
        </div>
      </div>
    </TooltipProvider>
  );
}