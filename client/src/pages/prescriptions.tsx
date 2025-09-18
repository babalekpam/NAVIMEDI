import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsuranceCoverageCalculator } from "@/components/forms/insurance-coverage-calculator";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { useToast } from "@/hooks/use-toast";
import { PrescriptionForm } from "@/components/forms/prescription-form";
import { Activity, Users, DollarSign, Package, Clock, AlertTriangle, CheckCircle, XCircle, Search, FileText, Download, Pill, Plus, RefreshCw, ArrowLeftRight } from 'lucide-react';

interface Prescription {
  id: string;
  patientName: string;
  patientId: string;
  medication: string;
  dosage: string;
  frequency: string;
  quantity: number;
  refills: number;
  instructions: string;
  status: string;
  prescribedDate: string;
  expiryDate: string;
  providerId: string;
  providerName: string;
  insuranceProvider?: string;
  insuranceCopay?: number;
  insuranceCoveragePercentage?: number;
  totalCost?: number;
  pharmacyNotes?: string;
}

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("new"); // For prescription tabs
  const [showSimpleModal, setShowSimpleModal] = useState(false);
  const [modalContent, setModalContent] = useState("");

  // Fetch prescriptions for current tenant (hospital or pharmacy)
  const { data: prescriptions = [], isLoading } = useQuery<Prescription[]>({
    queryKey: ['/api/prescriptions'],
    enabled: !!tenant?.id,
  });

  // Fetch patients for prescription creation
  const { data: patients = [] } = useQuery({
    queryKey: ['/api/patients'],
    enabled: !!tenant?.id,
  });

  // Status update mutation using general API
  const statusUpdateMutation = useMutation({
    mutationFn: async ({ prescriptionId, status }: { prescriptionId: string; status: string }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/prescriptions/${prescriptionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update prescription status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions'] });
      toast({
        title: "Success",
        description: "Prescription status updated successfully",
      });
      setIsProcessingModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update prescription status",
        variant: "destructive",
      });
    },
  });

  // Create prescription mutation
  const createPrescriptionMutation = useMutation({
    mutationFn: async (prescriptionData: any) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(prescriptionData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create prescription');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions'] });
      toast({
        title: "Success",
        description: "Prescription created successfully",
      });
      setIsCreateModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create prescription",
        variant: "destructive",
      });
    },
  });

  // Filter out dispensed prescriptions for active processing (like pharmacy dashboard)
  const activePrescriptions = prescriptions.filter((prescription) => prescription.status !== 'dispensed');
  
  // Apply search and status filters to active prescriptions
  const filteredPrescriptions = activePrescriptions.filter((prescription) => {
    const matchesSearch = (prescription.medication || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (prescription.patientName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || prescription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prescribed':
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'sent_to_pharmacy':
        return 'bg-green-100 text-green-800';
      case 'received':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      case 'dispensed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = (status: string) => {
    if (selectedPrescription) {
      statusUpdateMutation.mutate({
        prescriptionId: selectedPrescription.id,
        status,
      });
    }
  };

  const handleProcessPrescription = (prescription: Prescription) => {
    console.log('🔧 Process prescription:', prescription.patientName, prescription.medication);
    setSelectedPrescription(prescription);
    setIsProcessingModalOpen(true);
    console.log('✅ Process modal opened');
  };

  const handleViewDetails = (prescription: Prescription) => {
    console.log('👁️ View details for:', prescription.patientName, prescription.medication);
    setSelectedPrescription(prescription);
    setIsViewDetailsModalOpen(true);
    console.log('✅ View Details modal opened');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-teal-100">
      <div className="space-y-8 p-6">
        {/* Modern Page Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Pill className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Prescription Management</h1>
                    <div className="h-1 w-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mt-2"></div>
                  </div>
                </div>
                <p className="text-emerald-100 text-lg font-medium max-w-md">
                  {tenant?.type === 'pharmacy' 
                    ? 'Receive and process prescriptions from hospitals and doctors'
                    : 'Manage and track prescriptions across the healthcare network'
                  }
                </p>
                <div className="flex items-center space-x-4 text-sm text-emerald-200">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Live Updates</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              {/* Only doctors/physicians from hospitals can create prescriptions - pharmacies receive prescriptions */}
              {(user?.role === 'doctor' || user?.role === 'physician' || user?.role === 'nurse' || user?.role === 'tenant_admin' || user?.role === 'director' || (user?.role === 'super_admin' && tenant?.type !== 'pharmacy')) && tenant?.type !== 'pharmacy' && (
                <Button 
                  onClick={() => {
                    // Force close any other modals that might be open
                    setIsProcessingModalOpen(false);
                    setIsViewDetailsModalOpen(false);
                    setShowSimpleModal(false);
                    // Then open the create modal
                    setIsCreateModalOpen(true);
                  }} 
                  data-testid="button-create-prescription"
                  className="bg-white/90 hover:bg-white text-emerald-700 hover:text-emerald-800 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl border border-white/20 backdrop-blur-sm"
                >
                  <Plus className="h-5 w-5 mr-3" />
                  New Prescription
                </Button>
              )}
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/10 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-yellow-400/20 to-transparent rounded-full transform -translate-x-12 translate-y-12"></div>
        </div>

        {/* Modern Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-blue-100 text-sm font-medium tracking-wide">Total Prescriptions</p>
                  <div className="text-3xl font-bold text-white" data-testid="text-total-prescriptions">
                    {activePrescriptions.length}
                  </div>
                  <p className="text-blue-200 text-xs">
                    Active prescriptions in system
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Activity className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-emerald-100 text-sm font-medium tracking-wide">New Prescriptions</p>
                  <div className="text-3xl font-bold text-white" data-testid="text-new-prescriptions">
                    {activePrescriptions.filter((p) => ['prescribed', 'new'].includes(p.status)).length}
                  </div>
                  <p className="text-emerald-200 text-xs">
                    Awaiting processing
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Package className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-amber-100 text-sm font-medium tracking-wide">Processing</p>
                  <div className="text-3xl font-bold text-white" data-testid="text-processing-prescriptions">
                    {activePrescriptions.filter((p) => p.status === 'processing').length}
                  </div>
                  <p className="text-amber-200 text-xs">
                    Currently being filled
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Clock className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-purple-100 text-sm font-medium tracking-wide">Ready for Pickup</p>
                  <div className="text-3xl font-bold text-white" data-testid="text-ready-prescriptions">
                    {activePrescriptions.filter((p) => p.status === 'ready').length}
                  </div>
                  <p className="text-purple-200 text-xs">
                    Ready for dispensing
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Prescription Management Tabs */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <Pill className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Prescription Management</h3>
                </div>
              </div>
              
            </CardContent>
          </div>
        </Card>

        {/* Tab Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="inline-flex h-14 items-center justify-start rounded-2xl bg-gradient-to-r from-white/80 to-emerald-50/80 backdrop-blur-sm p-2 shadow-lg border border-emerald-200/30 w-full mb-6">
            <TabsTrigger 
              value="new" 
              className="flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-white/90 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-emerald-700 text-slate-600"
            >
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <Package className="h-4 w-4" />
              </div>
              New Prescriptions
            </TabsTrigger>
            <TabsTrigger 
              value="active" 
              className="flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-white/90 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-700 text-slate-600"
            >
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Pill className="h-4 w-4" />
              </div>
              Active Prescriptions
            </TabsTrigger>
            <TabsTrigger 
              value="refills" 
              className="flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-white/90 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-orange-700 text-slate-600"
            >
              <div className="p-1.5 bg-orange-100 rounded-lg">
                <RefreshCw className="h-4 w-4" />
              </div>
              Prescription Refills
            </TabsTrigger>
            <TabsTrigger 
              value="transfers" 
              className="flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-white/90 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-purple-700 text-slate-600"
            >
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <ArrowLeftRight className="h-4 w-4" />
              </div>
              Prescription Transfers
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="new" className="space-y-6">

          {/* Modern New Prescriptions Table */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-b border-emerald-200/50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/80 rounded-xl shadow-sm">
                    <Package className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">New Prescriptions</h2>
                    <p className="text-sm text-slate-600 mt-1">Recently received prescriptions awaiting processing</p>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {(() => {
                const newPrescriptions = prescriptions.filter((p) => 
                  ['prescribed', 'new', 'sent_to_pharmacy', 'received'].includes(p.status)
                );
                
                return newPrescriptions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gradient-to-r from-slate-50 to-emerald-50">
                        <TableRow className="border-b border-emerald-200/30">
                          <TableHead className="font-semibold text-slate-700 py-4">Patient</TableHead>
                          <TableHead className="font-semibold text-slate-700">Medication</TableHead>
                          <TableHead className="font-semibold text-slate-700">Dosage</TableHead>
                          <TableHead className="font-semibold text-slate-700">Quantity</TableHead>
                          <TableHead className="font-semibold text-slate-700">Status</TableHead>
                          <TableHead className="font-semibold text-slate-700">Prescribed Date</TableHead>
                          <TableHead className="font-semibold text-slate-700">Provider</TableHead>
                          <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newPrescriptions.map((prescription, index) => (
                          <TableRow 
                            key={prescription.id}
                            className={`border-b border-slate-200/50 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 transition-all duration-200 ${
                              index % 2 === 0 ? 'bg-white/70' : 'bg-emerald-50/20'
                            }`}
                          >
                            <TableCell className="font-medium text-slate-800 py-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span>{prescription.patientName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-700 font-medium">{prescription.medication}</TableCell>
                            <TableCell className="text-slate-600">{prescription.dosage}</TableCell>
                            <TableCell className="text-slate-600">{prescription.quantity}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(prescription.status)} border-0 shadow-sm font-medium px-3 py-1 rounded-lg transition-all duration-200`}>
                                {prescription.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {new Date(prescription.prescribedDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-slate-600">{prescription.providerName || 'N/A'}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleProcessPrescription(prescription)}
                                  data-testid={`button-process-${prescription.id}`}
                                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-4 py-2 text-xs font-medium"
                                >
                                  Process
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetails(prescription)}
                                  data-testid={`button-view-${prescription.id}`}
                                  className="border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg px-4 py-2 text-xs font-medium"
                                >
                                  View Details
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-emerald-50 m-6 rounded-2xl border border-emerald-200/50">
                    <div className="mx-auto mb-6 p-4 bg-white/80 rounded-2xl shadow-lg w-fit">
                      <Package className="h-20 w-20 text-slate-400 mx-auto" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">No new prescriptions</h3>
                    <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                      New prescriptions will appear here when received from healthcare providers.
                    </p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          {/* Modern Filters Section */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Search className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Search & Filter Prescriptions</h3>
                  </div>
                  <Badge variant="outline" className="bg-white/50 text-slate-600 border-slate-300">
                    {filteredPrescriptions.length} results
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Search Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                      <Search className="h-4 w-4 text-blue-500" />
                      <span>Search Prescriptions</span>
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="search"
                        data-testid="input-search-prescriptions"
                        placeholder="Search by medication or patient name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/80 border-slate-200 hover:border-blue-300 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>Status</span>
                    </Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="select-status-filter">
                      <SelectTrigger className="w-full bg-white/80 border-slate-200 hover:border-green-300 focus:border-green-500 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-0 shadow-2xl">
                        <SelectItem value="all" className="rounded-lg">All Statuses</SelectItem>
                        <SelectItem value="prescribed" className="rounded-lg">Prescribed</SelectItem>
                        <SelectItem value="new" className="rounded-lg">New</SelectItem>
                        <SelectItem value="processing" className="rounded-lg">Processing</SelectItem>
                        <SelectItem value="ready" className="rounded-lg">Ready</SelectItem>
                        <SelectItem value="dispensed" className="rounded-lg">Dispensed</SelectItem>
                        <SelectItem value="cancelled" className="rounded-lg">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-purple-500" />
                      <span>Quick Actions</span>
                    </Label>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("new");
                        }}
                        className="flex-1 bg-white/80 border-slate-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:shadow-md"
                      >
                        New Only
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                        }}
                        className="flex-1 bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all duration-200 hover:shadow-md"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Modern Prescriptions Table */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 via-blue-50 to-teal-50 border-b border-emerald-200/50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/80 rounded-xl shadow-sm">
                    <Pill className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Active Prescriptions</h2>
                    <p className="text-sm text-slate-600 mt-1">Manage and track active prescriptions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg px-4 py-2 text-sm font-medium">
                    {filteredPrescriptions.length} prescription{filteredPrescriptions.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredPrescriptions.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-emerald-50 m-6 rounded-2xl border border-emerald-200/50">
                  <div className="mx-auto mb-6 p-4 bg-white/80 rounded-2xl shadow-lg w-fit">
                    <Pill className="h-20 w-20 text-slate-400 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">No prescriptions found</h3>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                    No active prescriptions match your current filters. Adjust your search criteria or check back later.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-slate-50 to-emerald-50">
                      <TableRow className="border-b border-emerald-200/30">
                        <TableHead className="font-semibold text-slate-700 py-4">Patient</TableHead>
                        <TableHead className="font-semibold text-slate-700">Medication</TableHead>
                        <TableHead className="font-semibold text-slate-700">Dosage</TableHead>
                        <TableHead className="font-semibold text-slate-700">Quantity</TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                        <TableHead className="font-semibold text-slate-700">Prescribed Date</TableHead>
                        <TableHead className="font-semibold text-slate-700">Provider</TableHead>
                        <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrescriptions.map((prescription, index) => (
                        <TableRow 
                          key={prescription.id}
                          className={`border-b border-slate-200/50 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-blue-50/50 transition-all duration-200 ${
                            index % 2 === 0 ? 'bg-white/70' : 'bg-slate-50/30'
                          }`}
                        >
                          <TableCell className="font-medium text-slate-800 py-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <span>{prescription.patientName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-700 font-medium">{prescription.medication}</TableCell>
                          <TableCell className="text-slate-600">{prescription.dosage}</TableCell>
                          <TableCell className="text-slate-600">{prescription.quantity}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(prescription.status)} border-0 shadow-sm font-medium px-3 py-1 rounded-lg`}>
                              {prescription.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {new Date(prescription.prescribedDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-slate-600">{prescription.providerName || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleProcessPrescription(prescription)}
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-4 py-2 text-xs font-medium"
                              >
                                Process
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewDetails(prescription)}
                                data-testid={`button-view-details-${prescription.id}`}
                                className="border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg px-4 py-2 text-xs font-medium"
                              >
                                View Details
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

        </TabsContent>

        <TabsContent value="refills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Prescription Refills
              </CardTitle>
              <CardDescription>
                Prescriptions eligible for refills (refills remaining &gt; 0)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const refillablePrescriptions = prescriptions.filter((p) => 
                  p.refills > 0 && ['dispensed', 'sent_to_pharmacy', 'received', 'processing', 'ready'].includes(p.status)
                );
                
                return refillablePrescriptions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Medication</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Refills Remaining</TableHead>
                        <TableHead>Last Filled</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {refillablePrescriptions.map((prescription) => (
                        <TableRow key={prescription.id}>
                          <TableCell className="font-medium">
                            {prescription.patientName}
                          </TableCell>
                          <TableCell>{prescription.medication}</TableCell>
                          <TableCell>{prescription.dosage}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                              {prescription.refills} remaining
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(prescription.prescribedDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(prescription.status)}>
                              {prescription.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{prescription.providerName || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  console.log('🔧 Process Refill clicked:', prescription.patientName, prescription.medication);
                                  // Direct refill processing - simpler approach
                                  statusUpdateMutation.mutate({
                                    prescriptionId: prescription.id,
                                    status: 'processing',
                                  });
                                  toast({
                                    title: "Refill Processing",
                                    description: `Started processing refill for ${prescription.medication}`,
                                  });
                                }}
                              >
                                Process Refill
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  console.log('👁️ View Details clicked:', prescription.patientName, prescription.medication);
                                  // Force close other modals and open details
                                  setIsProcessingModalOpen(false);
                                  setIsCreateModalOpen(false);
                                  setShowSimpleModal(false);
                                  setSelectedPrescription(prescription);
                                  setIsViewDetailsModalOpen(true);
                                  console.log('✅ View Details modal state set to:', true);
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <RefreshCw className="mx-auto h-8 w-8 mb-2" />
                    <p>No prescriptions eligible for refills</p>
                    <p className="text-sm">Prescriptions with remaining refills will appear here</p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5" />
                Prescription Transfers
              </CardTitle>
              <CardDescription>
                Handle prescription transfers between pharmacies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <ArrowLeftRight className="mx-auto h-8 w-8 mb-2" />
                <p>No transfer requests at this time</p>
                <p className="text-sm">Prescription transfer requests will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Prescription Modal - MOVED OUTSIDE TABS */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} data-testid="dialog-create">
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ zIndex: 99999, position: 'fixed' }}>
          <DialogHeader>
            <DialogTitle>Create New Prescription</DialogTitle>
            <DialogDescription>
              Fill out the prescription details below. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <PrescriptionForm
            onSubmit={(data) => createPrescriptionMutation.mutate(data)}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={createPrescriptionMutation.isPending}
            patients={(patients as any) || []}
          />
        </DialogContent>
      </Dialog>

      {/* Processing Dialog */}
      <Dialog open={isProcessingModalOpen} onOpenChange={setIsProcessingModalOpen} data-testid="dialog-processing">
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600" />
              Process Prescription
            </DialogTitle>
            <DialogDescription>
              Update the status and process this prescription
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-6">
              {/* Prescription Details Summary */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
                <h3 className="font-semibold text-emerald-800 mb-2">Prescription Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-600">Patient:</span>
                    <span className="ml-2 text-slate-800" data-testid="text-patient-name">{selectedPrescription.patientName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Medication:</span>
                    <span className="ml-2 text-slate-800" data-testid="text-medication">{selectedPrescription.medication}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Dosage:</span>
                    <span className="ml-2 text-slate-800">{selectedPrescription.dosage}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Quantity:</span>
                    <span className="ml-2 text-slate-800">{selectedPrescription.quantity}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Current Status:</span>
                    <Badge className={`ml-2 ${getStatusColor(selectedPrescription.status)}`}>
                      {selectedPrescription.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Provider:</span>
                    <span className="ml-2 text-slate-800">{selectedPrescription.providerName || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800">Update Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleStatusUpdate('received')}
                    disabled={statusUpdateMutation.isPending}
                    data-testid="button-status-received"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Mark as Received
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate('processing')}
                    disabled={statusUpdateMutation.isPending}
                    data-testid="button-status-processing"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Start Processing
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate('ready')}
                    disabled={statusUpdateMutation.isPending}
                    data-testid="button-status-ready"
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    Mark Ready
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate('dispensed')}
                    disabled={statusUpdateMutation.isPending}
                    data-testid="button-status-dispensed"
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Mark Dispensed
                  </Button>
                </div>
              </div>

              {/* Insurance Coverage Calculator Integration */}
              {selectedPrescription.insuranceProvider && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800">Insurance Coverage</h3>
                  <InsuranceCoverageCalculator
                    prescription={selectedPrescription}
                    onCalculationComplete={(result) => {
                      console.log('Insurance calculation completed:', result);
                    }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => setIsProcessingModalOpen(false)}
                  data-testid="button-cancel-processing"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setIsProcessingModalOpen(false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  data-testid="button-close-processing"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsModalOpen} onOpenChange={setIsViewDetailsModalOpen} data-testid="dialog-view">
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Prescription Details
            </DialogTitle>
            <DialogDescription>
              Complete prescription information and history
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-6">
              {/* Patient Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-600">Patient Name:</span>
                    <span className="ml-2 text-slate-800" data-testid="text-details-patient-name">{selectedPrescription.patientName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Patient ID:</span>
                    <span className="ml-2 text-slate-800">{selectedPrescription.patientId}</span>
                  </div>
                </div>
              </div>

              {/* Prescription Information */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
                <h3 className="font-semibold text-emerald-800 mb-3">Prescription Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-600">Medication:</span>
                    <span className="ml-2 text-slate-800 font-medium" data-testid="text-details-medication">{selectedPrescription.medication}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Dosage:</span>
                    <span className="ml-2 text-slate-800">{selectedPrescription.dosage}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Frequency:</span>
                    <span className="ml-2 text-slate-800">{selectedPrescription.frequency}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Quantity:</span>
                    <span className="ml-2 text-slate-800">{selectedPrescription.quantity}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Refills:</span>
                    <span className="ml-2 text-slate-800">{selectedPrescription.refills}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Status:</span>
                    <Badge className={`ml-2 ${getStatusColor(selectedPrescription.status)}`} data-testid="badge-details-status">
                      {selectedPrescription.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                {selectedPrescription.instructions && (
                  <div className="mt-4">
                    <span className="font-medium text-slate-600">Instructions:</span>
                    <div className="mt-2 p-3 bg-white rounded border text-slate-800" data-testid="text-instructions">
                      {selectedPrescription.instructions}
                    </div>
                  </div>
                )}
              </div>

              {/* Provider Information */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-3">Provider Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-600">Provider:</span>
                    <span className="ml-2 text-slate-800">{selectedPrescription.providerName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Provider ID:</span>
                    <span className="ml-2 text-slate-800">{selectedPrescription.providerId}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Prescribed Date:</span>
                    <span className="ml-2 text-slate-800">{new Date(selectedPrescription.prescribedDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Expiry Date:</span>
                    <span className="ml-2 text-slate-800">{new Date(selectedPrescription.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Insurance Information */}
              {selectedPrescription.insuranceProvider && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-800 mb-3">Insurance Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-600">Insurance Provider:</span>
                      <span className="ml-2 text-slate-800">{selectedPrescription.insuranceProvider}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Copay:</span>
                      <span className="ml-2 text-slate-800">${selectedPrescription.insuranceCopay || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Coverage:</span>
                      <span className="ml-2 text-slate-800">{selectedPrescription.insuranceCoveragePercentage || 'N/A'}%</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Total Cost:</span>
                      <span className="ml-2 text-slate-800">${selectedPrescription.totalCost || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pharmacy Notes */}
              {selectedPrescription.pharmacyNotes && (
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-slate-800 mb-3">Pharmacy Notes</h3>
                  <div className="p-3 bg-white rounded border text-slate-800">
                    {selectedPrescription.pharmacyNotes}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDetailsModalOpen(false)}
                  data-testid="button-close-details"
                >
                  Close
                </Button>
                {tenant?.type === 'pharmacy' && (
                  <Button
                    onClick={() => {
                      setIsViewDetailsModalOpen(false);
                      handleProcessPrescription(selectedPrescription);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    data-testid="button-process-from-details"
                  >
                    Process Prescription
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Simple Custom Modal */}
      {showSimpleModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setShowSimpleModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '10px',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '2px solid #3b82f6',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <pre style={{ fontFamily: 'system-ui', fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
              {modalContent}
            </pre>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}