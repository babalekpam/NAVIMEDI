import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ServicePrice, InsuranceProvider, InsurancePlanCoverage } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ServicePriceFormData {
  serviceName: string;
  serviceCode: string;
  serviceType: string;
  basePrice: string;
  serviceDescription: string;
}

const serviceCategories = [
  { value: "procedure", label: "Procedure", icon: Heart },
  { value: "consultation", label: "Consultation", icon: Stethoscope },
  { value: "diagnostic", label: "Diagnostic", icon: TestTube },
  { value: "treatment", label: "Treatment", icon: Heart },
  { value: "laboratory", label: "Laboratory", icon: TestTube },
  { value: "imaging", label: "Imaging", icon: TestTube },
  { value: "therapy", label: "Therapy", icon: Stethoscope },
  { value: "medication", label: "Medication", icon: Pill },
  { value: "emergency", label: "Emergency", icon: Building2 }
];

interface InsuranceCoverageManagerProps {
  servicePrices: ServicePrice[];
  insuranceProviders: InsuranceProvider[];
}

function InsuranceCoverageManager({ servicePrices, insuranceProviders }: InsuranceCoverageManagerProps) {
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [coverageFormData, setCoverageFormData] = useState({
    copayAmount: "",
    copayPercentage: "",
    maxCoverageAmount: "",
    preAuthRequired: false,
    deductibleApplies: false
  });
  const [isCoverageFormOpen, setIsCoverageFormOpen] = useState(false);
  const [isProviderFormOpen, setIsProviderFormOpen] = useState(false);
  const [providerFormData, setProviderFormData] = useState({
    name: "",
    type: "private",
    contactInfo: "",
    website: "",
    coverageRegions: "",
    isActive: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: coverages = [] } = useQuery<InsurancePlanCoverage[]>({
    queryKey: ["/api/insurance-plan-coverage"],
  });

  const createProviderMutation = useMutation({
    mutationFn: async (providerData: any) => {
      const response = await apiRequest("POST", "/api/insurance-providers", providerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insurance-providers"] });
      setIsProviderFormOpen(false);
      resetProviderForm();
      toast({
        title: "Success",
        description: "Insurance provider added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add insurance provider.",
        variant: "destructive",
      });
    },
  });

  const createCoverageMutation = useMutation({
    mutationFn: async (coverageData: any) => {
      const response = await apiRequest("POST", "/api/insurance-plan-coverage", coverageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insurance-plan-coverage"] });
      setIsCoverageFormOpen(false);
      resetCoverageForm();
      toast({
        title: "Success",
        description: "Insurance coverage configured successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to configure coverage.",
        variant: "destructive",
      });
    },
  });

  const deleteCoverageMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/insurance-plan-coverage/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insurance-plan-coverage"] });
      toast({
        title: "Success",
        description: "Insurance coverage deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete coverage.",
        variant: "destructive",
      });
    },
  });

  const resetCoverageForm = () => {
    setCoverageFormData({
      copayAmount: "",
      copayPercentage: "",
      maxCoverageAmount: "",
      preAuthRequired: false,
      deductibleApplies: false
    });
    setSelectedService("");
    setSelectedProvider("");
  };

  const resetProviderForm = () => {
    setProviderFormData({
      name: "",
      type: "private",
      contactInfo: "",
      website: "",
      coverageRegions: "",
      isActive: true
    });
  };

  const handleProviderSubmit = () => {
    if (!providerFormData.name.trim()) {
      toast({
        title: "Error",
        description: "Provider name is required.",
        variant: "destructive",
      });
      return;
    }

    // Create the data structure matching the database schema
    const providerData = {
      name: providerFormData.name.trim(),
      code: providerFormData.name.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, ''), // Auto-generate code from name
      type: providerFormData.type,
      contactInfo: providerFormData.contactInfo.trim() ? JSON.stringify({
        contact: providerFormData.contactInfo.trim(),
        website: providerFormData.website.trim() || null,
        coverageRegions: providerFormData.coverageRegions.trim() || null
      }) : null,
      claimsAddress: null, // Optional field not in form
      electronicSubmission: false, // Default value
      isActive: providerFormData.isActive
    };
    
    console.log("Creating insurance provider with data:", providerData);
    createProviderMutation.mutate(providerData);
  };

  const handleSubmitCoverage = () => {
    if (!selectedService || !selectedProvider) {
      toast({
        title: "Error",
        description: "Please select both a service and insurance provider.",
        variant: "destructive",
      });
      return;
    }

    if (!coverageFormData.copayAmount && !coverageFormData.copayPercentage) {
      toast({
        title: "Error",
        description: "Please specify either a copay amount or percentage.",
        variant: "destructive",
      });
      return;
    }

    const requestData = {
      servicePriceId: selectedService,
      insuranceProviderId: selectedProvider,
      copayAmount: coverageFormData.copayAmount || undefined,
      copayPercentage: coverageFormData.copayPercentage || undefined,
      maxCoverageAmount: coverageFormData.maxCoverageAmount || undefined,
      preAuthRequired: coverageFormData.preAuthRequired,
      deductibleApplies: coverageFormData.deductibleApplies
    };
    
    console.log("Sending coverage data:", requestData);
    createCoverageMutation.mutate(requestData);
  };

  const getServiceName = (servicePriceId: string) => {
    const service = servicePrices.find(s => s.id === servicePriceId);
    return service?.serviceName || "Unknown Service";
  };

  const getProviderName = (insuranceProviderId: string) => {
    const provider = insuranceProviders.find(p => p.id === insuranceProviderId);
    return provider?.name || "Unknown Provider";
  };

  const calculateCopayDisplay = (coverage: InsurancePlanCoverage, basePrice: number) => {
    if (coverage.copayAmount) {
      return `$${parseFloat(coverage.copayAmount).toFixed(2)}`;
    } else if (coverage.copayPercentage) {
      const copayAmount = basePrice * (parseFloat(coverage.copayPercentage) / 100);
      return `${coverage.copayPercentage}% ($${copayAmount.toFixed(2)})`;
    }
    return "Not configured";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Insurance Coverage Configuration
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isProviderFormOpen} onOpenChange={setIsProviderFormOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={resetProviderForm}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Add Insurance Provider
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Insurance Provider</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="providerName">Provider Name *</Label>
                      <Input
                        id="providerName"
                        value={providerFormData.name}
                        onChange={(e) => setProviderFormData({...providerFormData, name: e.target.value})}
                        placeholder="e.g., Blue Cross Blue Shield"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Provider Type</Label>
                      <Select value={providerFormData.type} onValueChange={(value) => setProviderFormData({...providerFormData, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Private Insurance</SelectItem>
                          <SelectItem value="government">Government Insurance</SelectItem>
                          <SelectItem value="employer">Employer Insurance</SelectItem>
                          <SelectItem value="medicaid">Medicaid</SelectItem>
                          <SelectItem value="medicare">Medicare</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactInfo">Contact Information</Label>
                    <Input
                      id="contactInfo"
                      value={providerFormData.contactInfo}
                      onChange={(e) => setProviderFormData({...providerFormData, contactInfo: e.target.value})}
                      placeholder="Phone number, email, or address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={providerFormData.website}
                      onChange={(e) => setProviderFormData({...providerFormData, website: e.target.value})}
                      placeholder="https://www.insuranceprovider.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coverageRegions">Coverage Regions</Label>
                    <Input
                      id="coverageRegions"
                      value={providerFormData.coverageRegions}
                      onChange={(e) => setProviderFormData({...providerFormData, coverageRegions: e.target.value})}
                      placeholder="e.g., California, Nevada, Arizona"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={providerFormData.isActive}
                      onCheckedChange={(checked) => setProviderFormData({...providerFormData, isActive: checked as boolean})}
                    />
                    <Label htmlFor="isActive">Active provider</Label>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsProviderFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleProviderSubmit} disabled={createProviderMutation.isPending}>
                      {createProviderMutation.isPending ? "Adding..." : "Add Provider"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isCoverageFormOpen} onOpenChange={setIsCoverageFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700" onClick={resetCoverageForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Coverage Rule
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Configure Insurance Coverage</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Service *</Label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {servicePrices.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.serviceName} - ${parseFloat(service.basePrice).toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Insurance Provider *</Label>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {insuranceProviders.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fixed Copay Amount ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={coverageFormData.copayAmount}
                      onChange={(e) => setCoverageFormData({...coverageFormData, copayAmount: e.target.value})}
                      placeholder="25.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>OR Copay Percentage (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={coverageFormData.copayPercentage}
                      onChange={(e) => setCoverageFormData({...coverageFormData, copayPercentage: e.target.value})}
                      placeholder="20.0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Maximum Coverage Amount ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={coverageFormData.maxCoverageAmount}
                    onChange={(e) => setCoverageFormData({...coverageFormData, maxCoverageAmount: e.target.value})}
                    placeholder="1000.00"
                  />
                  <p className="text-sm text-gray-600">Leave empty for unlimited coverage</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="preAuth"
                      checked={coverageFormData.preAuthRequired}
                      onChange={(e) => setCoverageFormData({...coverageFormData, preAuthRequired: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="preAuth">Pre-authorization required</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="deductible"
                      checked={coverageFormData.deductibleApplies}
                      onChange={(e) => setCoverageFormData({...coverageFormData, deductibleApplies: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="deductible">Deductible applies</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCoverageFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitCoverage}
                    disabled={createCoverageMutation.isPending}
                  >
                    Configure Coverage
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          Set insurance coverage rates and patient copays for each service. When patients enter their insurance 
          and the correct procedure, they'll see exactly how much they need to pay.
        </p>

        {coverages.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No coverage rules configured</h3>
            <p className="text-gray-600 mb-4">
              Start by adding insurance coverage rates for your services
            </p>
            <Button onClick={() => setIsCoverageFormOpen(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add First Coverage Rule
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {insuranceProviders.map((provider) => (
              <div key={provider.id} className="border rounded-lg p-4">
                <h4 className="font-medium text-lg mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  {provider.name}
                </h4>
                <div className="space-y-2">
                  {coverages
                    .filter(coverage => coverage.insuranceProviderId === provider.id)
                    .map((coverage) => {
                      const service = servicePrices.find(s => s.id === coverage.servicePriceId);
                      const basePrice = service ? parseFloat(service.basePrice) : 0;
                      
                      return (
                        <div key={coverage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{getServiceName(coverage.servicePriceId)}</div>
                            <div className="text-sm text-gray-600">
                              Base Price: ${basePrice.toFixed(2)} • 
                              Patient Copay: {calculateCopayDisplay(coverage, basePrice)}
                              {coverage.preAuthRequired && <Badge className="ml-2 bg-orange-100 text-orange-800">Pre-auth Required</Badge>}
                              {coverage.deductibleApplies && <Badge className="ml-2 bg-purple-100 text-purple-800">Deductible Applies</Badge>}
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteCoverageMutation.mutate(coverage.id)}
                            disabled={deleteCoverageMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  {coverages.filter(coverage => coverage.insuranceProviderId === provider.id).length === 0 && (
                    <p className="text-gray-500 italic">No coverage rules configured for this provider</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ServicePricingManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServicePrice | null>(null);
  const [formData, setFormData] = useState<ServicePriceFormData>({
    serviceName: "",
    serviceCode: "",
    serviceType: "",
    basePrice: "",
    serviceDescription: ""
  });

  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log("ServicePricingManagement render - user:", user?.username, "tenant:", tenant?.name);

  const { data: servicePrices = [], isLoading } = useQuery<ServicePrice[]>({
    queryKey: ["/api/service-prices"],
    enabled: !!user && !!tenant,
  });

  const { data: insuranceProviders = [] } = useQuery<InsuranceProvider[]>({
    queryKey: ["/api/insurance-providers"],
    enabled: !!user && !!tenant,
  });

  console.log("ServicePricingManagement data - servicePrices:", servicePrices.length, "providers:", insuranceProviders.length);

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
      serviceType: "",
      basePrice: "",
      serviceDescription: ""
    });
  };

  const handleEdit = (service: ServicePrice) => {
    setEditingService(service);
    setFormData({
      serviceName: service.serviceName,
      serviceCode: service.serviceCode || "",
      serviceType: service.serviceType || "",
      basePrice: service.basePrice,
      serviceDescription: service.serviceDescription || ""
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
    const matchesCategory = categoryFilter === "all" || service.serviceType === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (serviceType: string) => {
    const categoryInfo = serviceCategories.find(cat => cat.value === serviceType);
    const IconComponent = categoryInfo?.icon || DollarSign;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCategoryBadgeColor = (serviceType: string) => {
    const colors = {
      procedure: "bg-red-100 text-red-800",
      consultation: "bg-blue-100 text-blue-800",
      diagnostic: "bg-purple-100 text-purple-800",
      treatment: "bg-green-100 text-green-800",
      laboratory: "bg-yellow-100 text-yellow-800",
      imaging: "bg-indigo-100 text-indigo-800",
      therapy: "bg-teal-100 text-teal-800",
      medication: "bg-green-100 text-green-800",
      emergency: "bg-orange-100 text-orange-800"
    };
    return colors[serviceType as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading service pricing data...</p>
        </div>
      </div>
    );
  }

  if (!user || !tenant) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading user and tenant data...</p>
        </div>
      </div>
    );
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
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={() => {
                console.log("Add Service clicked - opening form");
                setEditingService(null);
                resetForm();
              }}
            >
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
                  <Label htmlFor="serviceType">Category</Label>
                  <Select value={formData.serviceType} onValueChange={(value) => setFormData({...formData, serviceType: value})}>
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
                <Label htmlFor="serviceDescription">Description</Label>
                <Textarea
                  id="serviceDescription"
                  value={formData.serviceDescription}
                  onChange={(e) => setFormData({...formData, serviceDescription: e.target.value})}
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
                        {service.serviceType && (
                          <Badge className={getCategoryBadgeColor(service.serviceType)}>
                            <div className="flex items-center gap-1">
                              {getCategoryIcon(service.serviceType)}
                              {serviceCategories.find(cat => cat.value === service.serviceType)?.label || service.serviceType}
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
                        {service.serviceDescription || "-"}
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

      {/* Insurance Coverage Configuration */}
      <InsuranceCoverageManager servicePrices={servicePrices} insuranceProviders={insuranceProviders} />
    </div>
  );
}