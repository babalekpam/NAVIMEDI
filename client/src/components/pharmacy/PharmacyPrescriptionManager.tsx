import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Pill, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  User,
  Calendar,
  DollarSign,
  FileText,
  Phone,
  MapPin,
  CreditCard,
  Printer,
  Send,
  MessageSquare,
  Truck,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientAddress: string;
  doctorName: string;
  doctorNpi: string;
  prescriptionNumber: string;
  rxNumber: string;
  medicationName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  quantity: number;
  daysSupply: number;
  directions: string;
  refillsRemaining: number;
  originalDate: string;
  fillDate?: string;
  status: 'new' | 'insurance_verified' | 'processing' | 'ready' | 'dispensed' | 'on_hold' | 'cancelled';
  priority: 'normal' | 'urgent' | 'emergency';
  insuranceInfo: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    copay: number;
    coverage: number;
    status: 'verified' | 'pending' | 'rejected';
  };
  pricing: {
    wholeCost: number;
    insuranceAmount: number;
    patientCopay: number;
    totalDue: number;
  };
  notes: string;
  pharmacistNotes: string;
  createdAt: string;
  updatedAt: string;
}

interface InsuranceClaim {
  id: string;
  prescriptionId: string;
  claimNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  amount: number;
  copay: number;
  submittedDate: string;
  responseDate?: string;
  rejectionReason?: string;
}

export function PharmacyPrescriptionManager() {
  const [activeTab, setActiveTab] = useState('queue');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [isInsuranceDialogOpen, setIsInsuranceDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [processingNotes, setProcessingNotes] = useState('');
  const [insuranceData, setInsuranceData] = useState({
    provider: '',
    policyNumber: '',
    groupNumber: '',
    copay: 0,
    coverage: 80
  });

  // Fetch prescriptions
  const { data: prescriptions = [], isLoading } = useQuery<Prescription[]>({
    queryKey: ['/api/pharmacy/prescriptions'],
    initialData: [
      {
        id: '1',
        patientId: 'p1',
        patientName: 'Sarah Johnson',
        patientPhone: '(555) 123-4567',
        patientEmail: 'sarah.johnson@email.com',
        patientAddress: '123 Main St, New York, NY 10001',
        doctorName: 'Dr. Michael Smith',
        doctorNpi: '1234567890',
        prescriptionNumber: 'RX001-2025',
        rxNumber: 'RX001',
        medicationName: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        strength: '500mg',
        dosageForm: 'Tablet',
        quantity: 90,
        daysSupply: 30,
        directions: 'Take 1 tablet by mouth twice daily with meals',
        refillsRemaining: 5,
        originalDate: '2025-08-01T10:00:00Z',
        status: 'new',
        priority: 'normal',
        insuranceInfo: {
          provider: 'Blue Cross Blue Shield',
          policyNumber: 'BC123456789',
          groupNumber: 'GRP001',
          copay: 10,
          coverage: 80,
          status: 'pending'
        },
        pricing: {
          wholeCost: 45.99,
          insuranceAmount: 36.79,
          patientCopay: 10.00,
          totalDue: 10.00
        },
        notes: 'Patient requested brand name if available',
        pharmacistNotes: '',
        createdAt: '2025-08-01T10:00:00Z',
        updatedAt: '2025-08-01T10:00:00Z'
      },
      {
        id: '2',
        patientId: 'p2',
        patientName: 'Michael Brown',
        patientPhone: '(555) 987-6543',
        patientEmail: 'michael.brown@email.com',
        patientAddress: '456 Oak Ave, Los Angeles, CA 90210',
        doctorName: 'Dr. Emily Wilson',
        doctorNpi: '0987654321',
        prescriptionNumber: 'RX002-2025',
        rxNumber: 'RX002',
        medicationName: 'Lisinopril',
        genericName: 'Lisinopril',
        strength: '10mg',
        dosageForm: 'Tablet',
        quantity: 30,
        daysSupply: 30,
        directions: 'Take 1 tablet by mouth once daily',
        refillsRemaining: 2,
        originalDate: '2025-08-01T14:30:00Z',
        fillDate: '2025-08-02T09:15:00Z',
        status: 'processing',
        priority: 'urgent',
        insuranceInfo: {
          provider: 'Aetna',
          policyNumber: 'AET987654321',
          groupNumber: 'GRP002',
          copay: 15,
          coverage: 85,
          status: 'verified'
        },
        pricing: {
          wholeCost: 28.50,
          insuranceAmount: 24.23,
          patientCopay: 15.00,
          totalDue: 15.00
        },
        notes: 'Patient has hypertension, monitor BP regularly',
        pharmacistNotes: 'Counseled on proper administration and side effects',
        createdAt: '2025-08-01T14:30:00Z',
        updatedAt: '2025-08-02T09:15:00Z'
      }
    ]
  });

  // Fetch insurance claims
  const { data: claims = [] } = useQuery<InsuranceClaim[]>({
    queryKey: ['/api/pharmacy/insurance-claims']
  });

  // Update prescription status mutation
  const updatePrescriptionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest(`/api/pharmacy/prescriptions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pharmacy/prescriptions'] });
      toast({
        title: "Prescription Updated",
        description: "Prescription status has been updated successfully."
      });
      setIsProcessDialogOpen(false);
      setSelectedPrescription(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update prescription",
        variant: "destructive"
      });
    }
  });

  // Verify insurance mutation
  const verifyInsuranceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest(`/api/pharmacy/prescriptions/${id}/verify-insurance`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pharmacy/prescriptions'] });
      toast({
        title: "Insurance Verified",
        description: "Insurance information has been verified and updated."
      });
      setIsInsuranceDialogOpen(false);
      setSelectedPrescription(null);
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify insurance",
        variant: "destructive"
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800', label: 'New', icon: FileText },
      insurance_verified: { color: 'bg-purple-100 text-purple-800', label: 'Insurance Verified', icon: CreditCard },
      processing: { color: 'bg-yellow-100 text-yellow-800', label: 'Processing', icon: Clock },
      ready: { color: 'bg-green-100 text-green-800', label: 'Ready', icon: CheckCircle },
      dispensed: { color: 'bg-gray-100 text-gray-800', label: 'Dispensed', icon: Package },
      on_hold: { color: 'bg-red-100 text-red-800', label: 'On Hold', icon: AlertTriangle },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      normal: { color: 'bg-gray-100 text-gray-800', label: 'Normal' },
      urgent: { color: 'bg-orange-100 text-orange-800', label: 'Urgent' },
      emergency: { color: 'bg-red-100 text-red-800', label: 'Emergency' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normal;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleStatusUpdate = (prescriptionId: string, newStatus: string) => {
    const updateData = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
      ...(processingNotes && { pharmacistNotes: processingNotes })
    };
    
    if (newStatus === 'dispensed') {
      updateData.fillDate = new Date().toISOString();
    }
    
    updatePrescriptionMutation.mutate({ id: prescriptionId, data: updateData });
  };

  const handleInsuranceVerification = (prescriptionId: string) => {
    verifyInsuranceMutation.mutate({ 
      id: prescriptionId, 
      data: insuranceData 
    });
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = 
      prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.rxNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || prescription.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const prescriptionsByStatus = {
    new: prescriptions.filter(p => p.status === 'new').length,
    processing: prescriptions.filter(p => p.status === 'processing').length,
    ready: prescriptions.filter(p => p.status === 'ready').length,
    dispensed: prescriptions.filter(p => p.status === 'dispensed').length,
    on_hold: prescriptions.filter(p => p.status === 'on_hold').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Prescription Management</h2>
          <p className="text-gray-600">Process prescriptions, verify insurance, and manage dispensing workflow</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print Queue
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send to Insurance
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{prescriptionsByStatus.new}</p>
              <p className="text-sm text-gray-600">New</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{prescriptionsByStatus.processing}</p>
              <p className="text-sm text-gray-600">Processing</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{prescriptionsByStatus.ready}</p>
              <p className="text-sm text-gray-600">Ready</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{prescriptionsByStatus.dispensed}</p>
              <p className="text-sm text-gray-600">Dispensed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{prescriptionsByStatus.on_hold}</p>
              <p className="text-sm text-gray-600">On Hold</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by patient, medication, or Rx number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="insurance_verified">Insurance Verified</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="dispensed">Dispensed</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Prescription Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Prescription Queue ({filteredPrescriptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading prescriptions...</p>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No prescriptions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrescriptions.map((prescription) => (
                <div key={prescription.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{prescription.patientName}</h3>
                        {getStatusBadge(prescription.status)}
                        {getPriorityBadge(prescription.priority)}
                      </div>
                      <p className="text-gray-600 font-medium">{prescription.medicationName} {prescription.strength}</p>
                      <p className="text-sm text-gray-500">
                        Rx #{prescription.rxNumber} | Prescribed by {prescription.doctorName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(prescription.originalDate).toLocaleDateString()}
                      </p>
                      <p className="font-semibold text-green-600">
                        ${prescription.pricing.totalDue.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Patient Info</p>
                      <p className="text-sm">{prescription.patientPhone}</p>
                      <p className="text-sm text-gray-600">{prescription.patientEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Medication Details</p>
                      <p className="text-sm">Qty: {prescription.quantity} | {prescription.daysSupply} days</p>
                      <p className="text-sm text-gray-600">Refills: {prescription.refillsRemaining}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Insurance</p>
                      <p className="text-sm">{prescription.insuranceInfo.provider}</p>
                      <Badge className={
                        prescription.insuranceInfo.status === 'verified' ? 'bg-green-100 text-green-800' :
                        prescription.insuranceInfo.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {prescription.insuranceInfo.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Directions</p>
                    <p className="text-sm">{prescription.directions}</p>
                  </div>

                  {prescription.notes && (
                    <div className="mb-4 p-3 bg-blue-50 rounded">
                      <p className="text-xs font-medium text-blue-700 uppercase mb-1">Notes</p>
                      <p className="text-sm text-blue-800">{prescription.notes}</p>
                    </div>
                  )}

                  {prescription.pharmacistNotes && (
                    <div className="mb-4 p-3 bg-green-50 rounded">
                      <p className="text-xs font-medium text-green-700 uppercase mb-1">Pharmacist Notes</p>
                      <p className="text-sm text-green-800">{prescription.pharmacistNotes}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    
                    {prescription.status === 'new' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedPrescription(prescription);
                            setIsInsuranceDialogOpen(true);
                          }}
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Verify Insurance
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleStatusUpdate(prescription.id, 'processing')}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Start Processing
                        </Button>
                      </>
                    )}

                    {prescription.status === 'processing' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedPrescription(prescription);
                            setIsProcessDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Add Notes
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleStatusUpdate(prescription.id, 'ready')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Ready
                        </Button>
                      </>
                    )}

                    {prescription.status === 'ready' && (
                      <>
                        <Button size="sm" variant="outline">
                          <Phone className="w-4 h-4 mr-1" />
                          Call Patient
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleStatusUpdate(prescription.id, 'dispensed')}
                        >
                          <Truck className="w-4 h-4 mr-1" />
                          Dispense
                        </Button>
                      </>
                    )}

                    {(prescription.status === 'new' || prescription.status === 'processing') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusUpdate(prescription.id, 'on_hold')}
                      >
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Hold
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Processing Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Pharmacist Notes</Label>
              <Textarea
                id="notes"
                value={processingNotes}
                onChange={(e) => setProcessingNotes(e.target.value)}
                placeholder="Enter any notes about processing this prescription..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                if (selectedPrescription) {
                  handleStatusUpdate(selectedPrescription.id, selectedPrescription.status);
                }
              }}>
                Save Notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Insurance Verification Dialog */}
      <Dialog open={isInsuranceDialogOpen} onOpenChange={setIsInsuranceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Insurance Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider">Insurance Provider</Label>
              <Input
                id="provider"
                value={insuranceData.provider}
                onChange={(e) => setInsuranceData({...insuranceData, provider: e.target.value})}
                placeholder="Enter insurance provider"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input
                  id="policyNumber"
                  value={insuranceData.policyNumber}
                  onChange={(e) => setInsuranceData({...insuranceData, policyNumber: e.target.value})}
                  placeholder="Enter policy number"
                />
              </div>
              <div>
                <Label htmlFor="groupNumber">Group Number</Label>
                <Input
                  id="groupNumber"
                  value={insuranceData.groupNumber}
                  onChange={(e) => setInsuranceData({...insuranceData, groupNumber: e.target.value})}
                  placeholder="Enter group number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="copay">Copay ($)</Label>
                <Input
                  id="copay"
                  type="number"
                  step="0.01"
                  value={insuranceData.copay}
                  onChange={(e) => setInsuranceData({...insuranceData, copay: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="coverage">Coverage (%)</Label>
                <Input
                  id="coverage"
                  type="number"
                  min="0"
                  max="100"
                  value={insuranceData.coverage}
                  onChange={(e) => setInsuranceData({...insuranceData, coverage: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsInsuranceDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                if (selectedPrescription) {
                  handleInsuranceVerification(selectedPrescription.id);
                }
              }}>
                Verify Insurance
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}