import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Users, Edit, Trash2, Eye, EyeOff, Shield, UserCheck, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTenant } from "@/contexts/tenant-context-fixed";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  tenantId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
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
  role: z.enum(["tenant_admin", "pharmacist", "billing_staff", "receptionist"]),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

const pharmacyRoleLabels = {
  tenant_admin: "Pharmacy Administrator",
  pharmacist: "Pharmacist", 
  billing_staff: "Billing Staff",
  receptionist: "Receptionist"
};

const pharmacyRoleColors = {
  tenant_admin: "bg-red-100 text-red-800",
  pharmacist: "bg-blue-100 text-blue-800", 
  billing_staff: "bg-green-100 text-green-800",
  receptionist: "bg-yellow-100 text-yellow-800"
};

const pharmacyRoleDescriptions = {
  tenant_admin: "Full pharmacy management including employee oversight, billing, and system configuration",
  pharmacist: "Prescription dispensing, drug interactions verification, and patient counseling",
  billing_staff: "Insurance claims processing, payment management, and financial reporting",
  receptionist: "Patient check-in, appointment scheduling, and administrative support"
};

const UserRolesManagement = () => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Employee | null>(null);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [newUserCredentials, setNewUserCredentials] = useState<any>(null);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "pharmacist",
    },
  });

  // Check if user has admin permissions
  const hasAdminAccess = user?.role === 'tenant_admin' || user?.role === 'super_admin';

  // Fetch employees/users
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/users', tenant?.id],
    enabled: !!tenant?.id && hasAdminAccess,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      return await apiRequest('/api/users', {
        method: 'POST',
        body: {
          ...userData,
          password: userData.password || 'TempPass123!' // Default temporary password
        }
      });
    },
    onSuccess: (responseData, formData) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsCreateDialogOpen(false);
      form.reset();
      
      // Store credentials and show popup
      setNewUserCredentials({
        username: responseData?.username || formData.username,
        temporaryPassword: responseData?.temporaryPassword || "TempPass123!",
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role
      });
      setShowCredentialsDialog(true);
      
      toast({
        title: "Success",
        description: "Employee created successfully with login credentials",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create employee",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Employee> }) => {
      return await apiRequest(`/api/users/${id}`, {
        method: 'PATCH',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setEditingUser(null);
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      });
    },
  });

  // Toggle user active status
  const toggleUserStatus = (user: Employee) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { isActive: !user.isActive }
    });
  };

  // Update user role
  const updateUserRole = (userId: string, newRole: string) => {
    updateUserMutation.mutate({
      id: userId,
      data: { role: newRole }
    });
  };

  const onSubmit = (data: UserFormData) => {
    createUserMutation.mutate(data);
  };

  if (!hasAdminAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600">Only pharmacy administrators can manage employee roles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">User Role Management</h2>
          <p className="text-gray-600">Manage pharmacy staff roles and permissions</p>
        </div>
        <Badge variant="outline" className="flex items-center">
          <Building2 className="h-4 w-4 mr-2" />
          {tenant?.name}
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{Array.isArray(users) ? users.length : 0}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Available Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">4</div>
            <p className="text-xs text-muted-foreground">Role types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="w-full"
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Available Roles Information */}
      <Card>
        <CardHeader>
          <CardTitle>Available Pharmacy Roles</CardTitle>
          <CardDescription>Role descriptions and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(pharmacyRoleDescriptions).map(([roleKey, description]) => (
              <div key={roleKey} className="p-3 border rounded-lg">
                <div className="flex items-center mb-2">
                  <Badge className={pharmacyRoleColors[roleKey as keyof typeof pharmacyRoleColors]}>
                    {pharmacyRoleLabels[roleKey as keyof typeof pharmacyRoleLabels]}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employee Management Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Employee Role Management
          </CardTitle>
          <CardDescription>Manage roles and status for all pharmacy staff</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading employees...</div>
          ) : Array.isArray(users) && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(users as Employee[]).map((employee: Employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                        <p className="text-sm text-gray-500">{employee.username}</p>
                      </div>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                      <Select 
                        value={employee.role}
                        onValueChange={(newRole) => updateUserRole(employee.id, newRole)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(pharmacyRoleLabels).map(([roleKey, roleLabel]) => (
                            <SelectItem key={roleKey} value={roleKey}>
                              {roleLabel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge className={employee.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {employee.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleUserStatus(employee)}
                          disabled={employee.id === user?.id} // Can't deactivate self
                        >
                          {employee.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No employees found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Employee Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>Create a new pharmacy staff member account</DialogDescription>
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
                        <Input {...field} />
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
                        <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} type="email" />
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
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(pharmacyRoleLabels).map(([roleKey, roleLabel]) => (
                          <SelectItem key={roleKey} value={roleKey}>
                            {roleLabel}
                          </SelectItem>
                        ))}
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
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Creating..." : "Create Employee"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Employee Created Successfully</DialogTitle>
            <DialogDescription>Login credentials for the new employee</DialogDescription>
          </DialogHeader>
          {newUserCredentials && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <p><strong>Name:</strong> {newUserCredentials.firstName} {newUserCredentials.lastName}</p>
                <p><strong>Username:</strong> {newUserCredentials.username}</p>
                <p><strong>Temporary Password:</strong> {newUserCredentials.temporaryPassword}</p>
                <p><strong>Email:</strong> {newUserCredentials.email}</p>
                <p><strong>Role:</strong> {pharmacyRoleLabels[newUserCredentials.role as keyof typeof pharmacyRoleLabels]}</p>
              </div>
              <p className="text-sm text-gray-600">
                Please share these credentials with the new employee. They should change their password upon first login.
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

export default UserRolesManagement;