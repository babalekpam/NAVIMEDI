import { useState, useEffect } from "react";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Plus, Edit, Trash2, UserCheck, UserX, Shield, Stethoscope, UserCog, Building2, Heart, Microscope, Calculator, Phone, ClipboardList } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/contexts/tenant-context-fixed";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Define hospital roles based on admin profession
const hospitalRolesByProfession = {
  'tenant_admin': [
    'director', 'physician', 'nurse', 'lab_technician', 'receptionist', 'billing_staff', 'insurance_manager'
  ],
  'director': [
    'physician', 'nurse', 'lab_technician', 'receptionist', 'billing_staff', 'insurance_manager'
  ],
  'physician': [
    'nurse', 'lab_technician', 'receptionist'
  ],
  'super_admin': [
    'tenant_admin', 'director', 'physician', 'nurse', 'lab_technician', 'receptionist', 'billing_staff', 'insurance_manager'
  ]
};

const hospitalRoleLabels = {
  'tenant_admin': 'Hospital Administrator',
  'director': 'Medical Director',
  'physician': 'Physician',
  'nurse': 'Nurse',
  'lab_technician': 'Lab Technician',
  'receptionist': 'Receptionist',
  'billing_staff': 'Billing Staff',
  'insurance_manager': 'Insurance Manager'
};

const hospitalRoleColors = {
  'tenant_admin': 'bg-purple-100 text-purple-800 border-purple-200',
  'director': 'bg-red-100 text-red-800 border-red-200',
  'physician': 'bg-blue-100 text-blue-800 border-blue-200',
  'nurse': 'bg-green-100 text-green-800 border-green-200',
  'lab_technician': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'receptionist': 'bg-pink-100 text-pink-800 border-pink-200',
  'billing_staff': 'bg-orange-100 text-orange-800 border-orange-200',
  'insurance_manager': 'bg-indigo-100 text-indigo-800 border-indigo-200'
};

const hospitalRoleDescriptions = {
  'tenant_admin': 'Complete administrative control over hospital operations, staff management, and system settings',
  'director': 'Medical leadership and oversight of clinical operations, department management',
  'physician': 'Patient care, diagnosis, treatment planning, and medical decision making',
  'nurse': 'Patient care, medication administration, vital signs monitoring, and care coordination',
  'lab_technician': 'Laboratory testing, specimen processing, result reporting, and equipment maintenance',
  'receptionist': 'Patient registration, appointment scheduling, and front desk operations',
  'billing_staff': 'Insurance processing, claims management, payment processing, and financial operations',
  'insurance_manager': 'Insurance verification, authorization management, and coverage coordination'
};

const hospitalRoleIcons = {
  'tenant_admin': Building2,
  'director': Shield,
  'physician': Stethoscope,
  'nurse': Heart,
  'lab_technician': Microscope,
  'receptionist': Phone,
  'billing_staff': Calculator,
  'insurance_manager': ClipboardList
};

interface Employee {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface NewUserCredentials {
  username: string;
  temporaryPassword: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const HospitalUserRoleManagement = () => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [newUserCredentials, setNewUserCredentials] = useState<NewUserCredentials | null>(null);

  // Get available roles based on current admin's profession
  const availableRoles = user?.role ? hospitalRolesByProfession[user.role as keyof typeof hospitalRolesByProfession] || [] : [];

  // User form schema with available roles
  const userFormSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    role: z.enum(availableRoles as [string, ...string[]], {
      errorMap: () => ({ message: "Please select a valid role" })
    }),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
  });

  type UserFormData = z.infer<typeof userFormSchema>;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      role: availableRoles[0] as any,
      password: "",
    },
  });

  // Fetch users for this tenant
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!tenant?.id,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      return apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          ...userData,
          tenantId: tenant?.id,
        }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Employee Created",
        description: "Hospital staff member has been created successfully.",
      });
      setNewUserCredentials(data.user);
      setShowCredentialsDialog(true);
      setIsCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create hospital staff member.",
        variant: "destructive",
      });
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      return apiRequest(`/api/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Role Updated",
        description: "Staff member role has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update staff member role.",
        variant: "destructive",
      });
    },
  });

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      return apiRequest(`/api/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Status Updated",
        description: `Staff member has been ${variables.isActive ? 'activated' : 'deactivated'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update staff member status.",
        variant: "destructive",
      });
    },
  });

  const updateUserRole = (userId: string, newRole: string) => {
    // Check if the user has permission to assign this role
    if (!availableRoles.includes(newRole)) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to assign this role.",
        variant: "destructive",
      });
      return;
    }
    updateRoleMutation.mutate({ userId, newRole });
  };

  const toggleUserStatus = (userId: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ userId, isActive: !currentStatus });
  };

  const onSubmit = (data: UserFormData) => {
    createUserMutation.mutate(data);
  };

  if (!tenant || tenant.type !== 'hospital') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Hospital role management is only available for hospital organizations.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (availableRoles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Role Management Access</CardTitle>
          <CardDescription>You don't have permission to manage staff roles in this hospital.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="hospital-role-management">
      {/* Role Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCog className="h-5 w-5 mr-2" />
            Hospital Role Management
          </CardTitle>
          <CardDescription>
            Manage staff roles and permissions for {tenant?.name}. As a {hospitalRoleLabels[user?.role as keyof typeof hospitalRoleLabels] || user?.role}, 
            you can assign the following roles:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableRoles.map((roleKey) => {
              const Icon = hospitalRoleIcons[roleKey as keyof typeof hospitalRoleIcons] || Users;
              return (
                <div key={roleKey} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center mb-2">
                    <Icon className="h-4 w-4 mr-2" />
                    <Badge className={hospitalRoleColors[roleKey as keyof typeof hospitalRoleColors]}>
                      {hospitalRoleLabels[roleKey as keyof typeof hospitalRoleLabels]}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {hospitalRoleDescriptions[roleKey as keyof typeof hospitalRoleDescriptions]}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Staff Management Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Hospital Staff Management
              </CardTitle>
              <CardDescription>Manage roles and status for all hospital staff members</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-staff">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff Member
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading hospital staff...</div>
          ) : Array.isArray(users) && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(users as Employee[]).filter(employee => employee.role !== 'patient').map((employee: Employee) => {
                  const canManageRole = availableRoles.includes(employee.role);
                  const Icon = hospitalRoleIcons[employee.role as keyof typeof hospitalRoleIcons] || Users;
                  
                  return (
                    <TableRow key={employee.id} data-testid={`row-staff-${employee.id}`}>
                      <TableCell>
                        <div className="flex items-center">
                          <Icon className="h-4 w-4 mr-2 text-gray-600" />
                          <div>
                            <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                            <p className="text-sm text-gray-500">{employee.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>
                        {canManageRole ? (
                          <Select 
                            value={employee.role}
                            onValueChange={(newRole) => updateUserRole(employee.id, newRole)}
                            data-testid={`select-role-${employee.id}`}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRoles.map((roleKey) => (
                                <SelectItem key={roleKey} value={roleKey}>
                                  {hospitalRoleLabels[roleKey as keyof typeof hospitalRoleLabels]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={hospitalRoleColors[employee.role as keyof typeof hospitalRoleColors] || 'bg-gray-100 text-gray-800'}>
                            {hospitalRoleLabels[employee.role as keyof typeof hospitalRoleLabels] || employee.role}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={employee.isActive ? "default" : "secondary"}>
                          {employee.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {canManageRole && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  data-testid={`button-toggle-status-${employee.id}`}
                                >
                                  {employee.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {employee.isActive ? "Deactivate" : "Activate"} Staff Member
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to {employee.isActive ? "deactivate" : "activate"} {employee.firstName} {employee.lastName}? 
                                    This will {employee.isActive ? "prevent them from accessing" : "allow them to access"} the system.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => toggleUserStatus(employee.id, employee.isActive)}>
                                    {employee.isActive ? "Deactivate" : "Activate"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hospital staff members found</p>
              <p className="text-sm">Add your first staff member to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Staff Dialog */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Hospital Staff Member</DialogTitle>
          <DialogDescription>Create a new staff member account for your hospital</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} data-testid="input-firstname" />
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
                      <Input placeholder="Doe" {...field} data-testid="input-lastname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe" {...field} data-testid="input-username" />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@hospital.com" {...field} data-testid="input-email" />
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
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-role">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.map((roleKey) => {
                        const Icon = hospitalRoleIcons[roleKey as keyof typeof hospitalRoleIcons] || Users;
                        return (
                          <SelectItem key={roleKey} value={roleKey}>
                            <div className="flex items-center">
                              <Icon className="h-4 w-4 mr-2" />
                              {hospitalRoleLabels[roleKey as keyof typeof hospitalRoleLabels]}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending} data-testid="button-submit-staff">
                {createUserMutation.isPending ? "Creating..." : "Create Staff Member"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {/* Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Staff Member Created Successfully</DialogTitle>
            <DialogDescription>Login credentials for the new staff member</DialogDescription>
          </DialogHeader>
          {newUserCredentials && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <p><strong>Name:</strong> {newUserCredentials.firstName} {newUserCredentials.lastName}</p>
                <p><strong>Username:</strong> {newUserCredentials.username}</p>
                <p><strong>Temporary Password:</strong> {newUserCredentials.temporaryPassword}</p>
                <p><strong>Email:</strong> {newUserCredentials.email}</p>
                <p><strong>Role:</strong> {hospitalRoleLabels[newUserCredentials.role as keyof typeof hospitalRoleLabels]}</p>
              </div>
              <p className="text-sm text-gray-600">
                Please share these credentials with the new staff member. They should change their password upon first login.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowCredentialsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HospitalUserRoleManagement;