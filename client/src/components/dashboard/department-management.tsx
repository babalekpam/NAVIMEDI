import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Users, Clock, MapPin, Phone, Mail, DollarSign } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
  icon: z.string().default("Building"),
  color: z.string().default("#6366f1"),
  staffCount: z.number().int().min(0).default(0),
  operatingHours: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  budget: z.number().optional(),
  specializations: z.array(z.string()).default([]),
  equipment: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  headOfDepartment: z.string().optional(),
  isActive: z.boolean().default(true),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface Department {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  staffCount?: number;
  operatingHours?: string;
  location?: string;
  phone?: string;
  email?: string;
  budget?: number;
  specializations?: string[];
  equipment?: string[];
  certifications?: string[];
  headOfDepartment?: string;
  headOfDepartmentName?: string;
  isActive: boolean;
  settings?: any;
  metrics?: any;
  createdAt: string;
  updatedAt: string;
}

const iconOptions = [
  "Building", "Activity", "Heart", "Brain", "Baby", "Users", "Stethoscope", 
  "TestTube", "Scan", "Pill", "Bone", "Eye", "Ear", "Scissors", "Shield"
];

const colorOptions = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Red", value: "#ef4444" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Orange", value: "#f59e0b" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
];

export function DepartmentManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [newSpecialization, setNewSpecialization] = useState("");
  const [newEquipment, setNewEquipment] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "Building",
      color: "#6366f1",
      staffCount: 0,
      operatingHours: "",
      location: "",
      phone: "",
      email: "",
      budget: 0,
      specializations: [],
      equipment: [],
      certifications: [],
      headOfDepartment: "none",
      isActive: true,
    },
  });

  // Fetch departments
  const { data: departments, isLoading } = useQuery({
    queryKey: ['/api/departments'],
  });

  // Fetch users for head of department selection
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  // Create department mutation
  const createMutation = useMutation({
    mutationFn: (data: DepartmentFormData) => 
      apiRequest('POST', '/api/departments', data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({ title: "Success", description: "Department created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create department",
        variant: "destructive" 
      });
    },
  });

  // Update department mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DepartmentFormData> }) => 
      apiRequest('PUT', `/api/departments/${id}`, data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({ title: "Success", description: "Department updated successfully" });
      setIsDialogOpen(false);
      setEditingDepartment(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update department",
        variant: "destructive" 
      });
    },
  });

  // Delete department mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest('DELETE', `/api/departments/${id}`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({ title: "Success", description: "Department deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete department",
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (data: DepartmentFormData) => {
    // Convert "none" back to null for headOfDepartment and budget to string
    const processedData = {
      ...data,
      headOfDepartment: data.headOfDepartment === "none" ? undefined : data.headOfDepartment,
      budget: data.budget.toString(), // Convert number to string for decimal field
    };
    
    if (editingDepartment) {
      updateMutation.mutate({ id: editingDepartment.id, data: processedData });
    } else {
      createMutation.mutate(processedData);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    form.reset({
      name: department.name,
      description: department.description || "",
      icon: department.icon || "Building",
      color: department.color || "#6366f1",
      staffCount: department.staffCount || 0,
      operatingHours: department.operatingHours || "",
      location: department.location || "",
      phone: department.phone || "",
      email: department.email || "",
      budget: department.budget ? parseFloat(department.budget) : 0,
      specializations: department.specializations || [],
      equipment: department.equipment || [],
      certifications: department.certifications || [],
      headOfDepartment: department.headOfDepartment || "none",
      isActive: department.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this department?")) {
      deleteMutation.mutate(id);
    }
  };

  const addArrayItem = (field: 'specializations' | 'equipment' | 'certifications', value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      const currentValues = form.getValues(field);
      form.setValue(field, [...currentValues, value.trim()]);
      setter("");
    }
  };

  const removeArrayItem = (field: 'specializations' | 'equipment' | 'certifications', index: number) => {
    const currentValues = form.getValues(field);
    form.setValue(field, currentValues.filter((_, i) => i !== index));
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Building;
    return IconComponent;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading departments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Department Management</h2>
          <p className="text-muted-foreground">Manage hospital departments and their configurations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingDepartment(null);
              form.reset();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDepartment ? 'Edit Department' : 'Create New Department'}
              </DialogTitle>
              <DialogDescription>
                {editingDepartment ? 'Update department information and settings' : 'Add a new department to your hospital'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Cardiology" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an icon" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {iconOptions.map((icon) => {
                              const IconComponent = getIcon(icon);
                              return (
                                <SelectItem key={icon} value={icon}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4" />
                                    {icon}
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
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the department's role and services"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Theme</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {colorOptions.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-4 h-4 rounded" 
                                    style={{ backgroundColor: color.value }}
                                  />
                                  {color.name}
                                </div>
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
                    name="staffCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff Count</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Budget ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="operatingHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Operating Hours</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Mon-Fri 8:00 AM - 5:00 PM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 3rd Floor, West Wing" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
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
                          <Input placeholder="department@hospital.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {users && Array.isArray(users) && (
                  <FormField
                    control={form.control}
                    name="headOfDepartment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Head of Department</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department head" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No head assigned</SelectItem>
                            {users.filter((user: any) => user.role === 'physician' || user.role === 'director' || user.role === 'tenant_admin').map((user: any) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.fullName || `${user.firstName} ${user.lastName}`} ({user.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Specializations */}
                <div>
                  <Label>Specializations</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add specialization"
                      value={newSpecialization}
                      onChange={(e) => setNewSpecialization(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('specializations', newSpecialization, setNewSpecialization);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => addArrayItem('specializations', newSpecialization, setNewSpecialization)}
                      variant="outline"
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.watch('specializations').map((spec, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {spec}
                        <button
                          type="button"
                          onClick={() => removeArrayItem('specializations', index)}
                          className="ml-2 text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div>
                  <Label>Equipment</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add equipment"
                      value={newEquipment}
                      onChange={(e) => setNewEquipment(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('equipment', newEquipment, setNewEquipment);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => addArrayItem('equipment', newEquipment, setNewEquipment)}
                      variant="outline"
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.watch('equipment').map((equip, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {equip}
                        <button
                          type="button"
                          onClick={() => removeArrayItem('equipment', index)}
                          className="ml-2 text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <Label>Certifications</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add certification"
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('certifications', newCertification, setNewCertification);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => addArrayItem('certifications', newCertification, setNewCertification)}
                      variant="outline"
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.watch('certifications').map((cert, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {cert}
                        <button
                          type="button"
                          onClick={() => removeArrayItem('certifications', index)}
                          className="ml-2 text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      'Saving...'
                    ) : editingDepartment ? (
                      'Update Department'
                    ) : (
                      'Create Department'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments && Array.isArray(departments) && departments.map((department: Department) => {
          const IconComponent = getIcon(department.icon || 'Building');
          return (
            <Card key={department.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${department.color}15`, border: `1px solid ${department.color}30` }}
                    >
                      <IconComponent 
                        className="h-5 w-5" 
                        style={{ color: department.color }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{department.name}</CardTitle>
                      <Badge variant={department.isActive ? "default" : "secondary"}>
                        {department.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(department)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(department.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {department.description && (
                  <CardDescription className="text-sm">
                    {department.description}
                  </CardDescription>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {department.staffCount !== undefined && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{department.staffCount} staff</span>
                    </div>
                  )}
                  
                  {department.operatingHours && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{department.operatingHours}</span>
                    </div>
                  )}
                  
                  {department.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{department.location}</span>
                    </div>
                  )}
                  
                  {department.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{department.phone}</span>
                    </div>
                  )}
                  
                  {department.email && (
                    <div className="flex items-center space-x-2 col-span-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{department.email}</span>
                    </div>
                  )}
                  
                  {department.budget && (
                    <div className="flex items-center space-x-2 col-span-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${department.budget.toLocaleString()} annual budget</span>
                    </div>
                  )}
                </div>

                {department.headOfDepartmentName && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      Head: <span className="font-medium">{department.headOfDepartmentName}</span>
                    </p>
                  </div>
                )}

                {department.specializations && department.specializations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Specializations:</p>
                    <div className="flex flex-wrap gap-1">
                      {department.specializations.slice(0, 3).map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {department.specializations.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{department.specializations.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}