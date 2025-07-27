import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Shield, 
  Calculator,
  Search,
  Building2,
  Heart,
  Stethoscope,
  TestTube,
  Pill
} from "lucide-react";
import { ServicePrice, InsuranceProvider } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ServicePriceFormData {
  serviceName: string;
  serviceCode: string;
  category: string;
  basePrice: string;
  description: string;
}

const serviceCategories = [
  { value: "consultation", label: "Consultation", icon: Stethoscope },
  { value: "surgery", label: "Surgery", icon: Heart },
  { value: "diagnostic", label: "Diagnostic", icon: TestTube },
  { value: "medication", label: "Medication", icon: Pill },
  { value: "emergency", label: "Emergency", icon: Building2 },
  { value: "other", label: "Other", icon: DollarSign }
];

export default function ServicePricingManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServicePrice | null>(null);
  const [formData, setFormData] = useState<ServicePriceFormData>({
    serviceName: "",
    serviceCode: "",
    category: "",
    basePrice: "",
    description: ""
  });

  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: servicePrices = [], isLoading } = useQuery<ServicePrice[]>({
    queryKey: ["/api/service-prices"],
    enabled: !!user && !!tenant,
  });

  const { data: insuranceProviders = [] } = useQuery<InsuranceProvider[]>({
    queryKey: ["/api/insurance-providers"],
    enabled: !!user && !!tenant,
  });

  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: ServicePriceFormData) => {
      const response = await apiRequest("POST", "/api/service-prices", {
        ...serviceData,
        basePrice: parseFloat(serviceData.basePrice).toFixed(2)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-prices"] });
      setIsFormOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Service price created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create service price.",
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, serviceData }: { id: string; serviceData: ServicePriceFormData }) => {
      const response = await apiRequest("PATCH", `/api/service-prices/${id}`, {
        ...serviceData,
        basePrice: parseFloat(serviceData.basePrice).toFixed(2)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-prices"] });
      setIsFormOpen(false);
      setEditingService(null);
      resetForm();
      toast({
        title: "Success",
        description: "Service price updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update service price.",
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/service-prices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-prices"] });
      toast({
        title: "Success",
        description: "Service price deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete service price.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      serviceName: "",
      serviceCode: "",
      category: "",
      basePrice: "",
      description: ""
    });
  };

  const handleEdit = (service: ServicePrice) => {
    setEditingService(service);
    setFormData({
      serviceName: service.serviceName,
      serviceCode: service.serviceCode || "",
      category: service.category || "",
      basePrice: service.basePrice,
      description: service.description || ""
    });
    setIsFormOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.serviceName || !formData.basePrice) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, serviceData: formData });
    } else {
      createServiceMutation.mutate(formData);
    }
  };

  const filteredServices = servicePrices.filter(service => {
    const matchesSearch = service.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (service.serviceCode && service.serviceCode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    const categoryInfo = serviceCategories.find(cat => cat.value === category);
    const IconComponent = categoryInfo?.icon || DollarSign;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      consultation: "bg-blue-100 text-blue-800",
      surgery: "bg-red-100 text-red-800",
      diagnostic: "bg-purple-100 text-purple-800",
      medication: "bg-green-100 text-green-800",
      emergency: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800"
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  if (!user || !tenant) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Pricing Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your hospital's service rates, insurance coverage, and patient copays
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
              setEditingService(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Edit Service Price" : "Add New Service Price"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceName">Service Name *</Label>
                  <Input
                    id="serviceName"
                    value={formData.serviceName}
                    onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                    placeholder="e.g., General Consultation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceCode">Service Code</Label>
                  <Input
                    id="serviceCode"
                    value={formData.serviceCode}
                    onChange={(e) => setFormData({...formData, serviceCode: e.target.value})}
                    placeholder="e.g., CONS001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <category.icon className="h-4 w-4" />
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price ($) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the service..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                >
                  {editingService ? "Update Service" : "Create Service"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {serviceCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Hospital Services ({filteredServices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || categoryFilter !== "all" 
                  ? "No services match your search criteria" 
                  : "Get started by adding your first service"
                }
              </p>
              {!searchQuery && categoryFilter === "all" && (
                <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Service
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.serviceName}</TableCell>
                      <TableCell>
                        {service.serviceCode && (
                          <Badge variant="outline">{service.serviceCode}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {service.category && (
                          <Badge className={getCategoryBadgeColor(service.category)}>
                            <div className="flex items-center gap-1">
                              {getCategoryIcon(service.category)}
                              {serviceCategories.find(cat => cat.value === service.category)?.label || service.category}
                            </div>
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{parseFloat(service.basePrice).toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {service.description || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteServiceMutation.mutate(service.id)}
                            disabled={deleteServiceMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insurance Coverage Note */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Insurance Coverage Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            After setting up your service prices, you can configure specific insurance coverage rates 
            and patient copays for each insurance provider. This allows for accurate billing calculations 
            based on individual insurance plans and coverage agreements.
          </p>
          <div className="mt-4">
            <Button variant="outline" className="mr-2">
              <Calculator className="h-4 w-4 mr-2" />
              Configure Insurance Coverage
            </Button>
            <Button variant="outline">
              <TestTube className="h-4 w-4 mr-2" />
              Test Pricing Calculations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}