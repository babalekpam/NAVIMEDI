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
import { useTenant } from "@/contexts/tenant-context-fixed";
import { useTranslation } from "@/contexts/translation-context";
import { useToast } from "@/hooks/use-toast";
import { Activity, Users, DollarSign, Package, Clock, AlertTriangle, CheckCircle, XCircle, Search, FileText, Download, Pill, Plus } from 'lucide-react';

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

  // Fetch prescriptions for current tenant (hospital or pharmacy)
  const { data: prescriptions = [], isLoading } = useQuery<Prescription[]>({
    queryKey: ['/api/prescriptions', tenant?.id],
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
      queryClient.invalidateQueries({ queryKey: ['/api/pharmacy/prescriptions'] });
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

  // Filter out dispensed prescriptions for active processing (like pharmacy dashboard)
  const activePrescriptions = prescriptions.filter((prescription) => prescription.status !== 'dispensed');
  
  // Apply search and status filters to active prescriptions
  const filteredPrescriptions = activePrescriptions.filter((prescription) => {
    const matchesSearch = prescription.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || prescription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prescribed':
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'dispensed':
        return 'bg-gray-100 text-gray-800';
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
    setSelectedPrescription(prescription);
    setIsProcessingModalOpen(true);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prescription Management</h1>
          <p className="text-gray-600 mt-1">
            Manage and track prescriptions across the healthcare network
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Prescription
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePrescriptions.length}</div>
            <p className="text-xs text-muted-foreground">
              Active prescriptions in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Prescriptions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {activePrescriptions.filter((p) => ['prescribed', 'new'].includes(p.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {activePrescriptions.filter((p) => p.status === 'processing').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently being filled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Pickup</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activePrescriptions.filter((p) => p.status === 'ready').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for dispensing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Prescription Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Prescriptions</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by medication or patient name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="prescribed">Prescribed</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="dispensed">Dispensed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prescription List</CardTitle>
          <CardDescription>
            {filteredPrescriptions.length} active prescription(s) found (archived prescriptions excluded)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prescribed Date</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell className="font-medium">
                    {prescription.patientName}
                  </TableCell>
                  <TableCell>{prescription.medication}</TableCell>
                  <TableCell>{prescription.dosage}</TableCell>
                  <TableCell>{prescription.quantity}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(prescription.status)}>
                      {prescription.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(prescription.prescribedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{prescription.providerName || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleProcessPrescription(prescription)}
                      >
                        Process
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Processing Modal */}
      <Dialog open={isProcessingModalOpen} onOpenChange={setIsProcessingModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Process Prescription</DialogTitle>
            <DialogDescription>
              Update the status for {selectedPrescription?.medication}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Patient:</Label>
                  <p>{selectedPrescription.patientName}</p>
                </div>
                <div>
                  <Label className="font-medium">Current Status:</Label>
                  <Badge className={getStatusColor(selectedPrescription.status)}>
                    {selectedPrescription.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="font-medium">Medication Details:</Label>
                <div className="bg-gray-50 p-3 rounded mt-1">
                  <p><strong>Medication:</strong> {selectedPrescription.medication}</p>
                  <p><strong>Dosage:</strong> {selectedPrescription.dosage}</p>
                  <p><strong>Frequency:</strong> {selectedPrescription.frequency}</p>
                  <p><strong>Quantity:</strong> {selectedPrescription.quantity}</p>
                  <p><strong>Refills:</strong> {selectedPrescription.refills}</p>
                  {selectedPrescription.instructions && (
                    <p><strong>Instructions:</strong> {selectedPrescription.instructions}</p>
                  )}
                  {selectedPrescription.insuranceProvider && (
                    <p><strong>Insurance:</strong> {selectedPrescription.insuranceProvider}</p>
                  )}
                  {selectedPrescription.insuranceCopay && (
                    <p><strong>Copay:</strong> ${selectedPrescription.insuranceCopay}</p>
                  )}
                </div>
              </div>
              
              {/* Insurance & Coverage Information */}
              {(selectedPrescription.status === 'received' || selectedPrescription.status === 'processing') && (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="insurance-provider">Insurance Provider</Label>
                      <Input
                        id="insurance-provider"
                        placeholder="e.g., Blue Cross Blue Shield"
                        defaultValue={selectedPrescription.insuranceProvider || ''}
                      />
                    </div>
                    <InsuranceCoverageCalculator
                      initialValues={{
                        totalCost: selectedPrescription.totalCost || 85,
                        coveragePercentage: selectedPrescription.insuranceCoveragePercentage || 80
                      }}
                      onCoverageChange={(coverage) => {
                        console.log('Coverage updated:', coverage);
                        // This would be used to update the prescription data
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div>
                <Label className="font-medium">Update Status:</Label>
                <div className="flex gap-2 mt-2">
                  {selectedPrescription.status === 'prescribed' && (
                    <Button onClick={() => handleStatusUpdate('sent_to_pharmacy')} size="sm">
                      Send to Pharmacy
                    </Button>
                  )}
                  {selectedPrescription.status === 'sent_to_pharmacy' && (
                    <Button onClick={() => handleStatusUpdate('received')} size="sm">
                      Mark as Received
                    </Button>
                  )}
                  {selectedPrescription.status === 'received' && (
                    <Button onClick={() => handleStatusUpdate('processing')} size="sm">
                      Start Processing
                    </Button>
                  )}
                  {selectedPrescription.status === 'processing' && (
                    <Button onClick={() => handleStatusUpdate('ready')} size="sm">
                      Mark Ready
                    </Button>
                  )}
                  {selectedPrescription.status === 'ready' && (
                    <Button onClick={() => handleStatusUpdate('dispensed')} size="sm">
                      Mark Dispensed
                    </Button>
                  )}
                  <Button 
                    onClick={() => handleStatusUpdate('cancelled')} 
                    size="sm" 
                    variant="destructive"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Processing Notes:</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about processing this prescription..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}