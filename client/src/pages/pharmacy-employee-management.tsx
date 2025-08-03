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
import { useAuth } from "@/contexts/auth-context";
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

const employeeFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["tenant_admin", "pharmacist", "billing_staff", "receptionist"]),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

const pharmacyRoleDescriptions = {
  tenant_admin: "Full pharmacy management including employee oversight, billing, and system configuration",
  pharmacist: "Prescription dispensing, drug interactions verification, and patient counseling",
  billing_staff: "Insurance claims processing, payment management, and financial reporting",
  receptionist: "Patient check-in, appointment scheduling, and administrative support"
};

const PharmacyEmployeeManagement = () => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
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

  // Fetch employees
  const { data: employees, isLoading } = useQuery({
    queryKey: ['/api/users', tenant?.id],
    enabled: !!tenant?.id && hasAdminAccess,
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData: EmployeeFormData) => {
      return apiRequest(`/api/users`, {
        method: 'POST',
        body: JSON.stringify(employeeData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Employee created successfully",
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

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Employee> }) => {
      return apiRequest(`/api/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setEditingEmployee(null);
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

  const onSubmit = (data: EmployeeFormData) => {
    if (editingEmployee) {
      updateEmployeeMutation.mutate({ id: editingEmployee.id, data });
    } else {
      createEmployeeMutation.mutate(data);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    form.reset({
      username: employee.username,
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      role: employee.role as any,
    });
    setIsCreateDialogOpen(true);
  };

  const handleToggleStatus = (employee: Employee) => {
    updateEmployeeMutation.mutate({
      id: employee.id,
      data: { isActive: !employee.isActive }
    });
  };

  if (!hasAdminAccess) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You need pharmacy administrator privileges to manage employees.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground">
            Manage your pharmacy staff and their roles
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Pharmacy Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {tenant?.name}
          </CardTitle>
          <CardDescription>
            Managing employees for your pharmacy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {Array.isArray(employees) ? employees.length : 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Staff</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Array.isArray(employees) ? employees.filter(e => e.isActive).length : 0}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Array.isArray(employees) ? employees.filter(e => e.role === 'pharmacist').length : 0}
              </p>
              <p className="text-sm text-muted-foreground">Pharmacists</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {Array.isArray(employees) ? employees.filter(e => e.role === 'tenant_admin').length : 0}
              </p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading employees...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(employees) && employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{employee.username}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                      <Badge variant={employee.role === 'tenant_admin' ? 'default' : 'secondary'}>
                        {employee.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.isActive ? 'success' : 'destructive'}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(employee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(employee)}
                        >
                          {employee.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Employee Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
            <DialogDescription>
              {editingEmployee 
                ? 'Update employee information and role'
                : 'Create a new employee account for your pharmacy'
              }
            </DialogDescription>
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
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tenant_admin">Pharmacy Admin</SelectItem>
                        <SelectItem value="pharmacist">Pharmacist</SelectItem>
                        <SelectItem value="billing_staff">Billing Staff</SelectItem>
                        <SelectItem value="receptionist">Receptionist</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!editingEmployee && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingEmployee(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
                >
                  {editingEmployee ? 'Update' : 'Create'} Employee
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PharmacyEmployeeManagement;