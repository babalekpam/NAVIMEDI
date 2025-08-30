import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  Search, 
  Filter,
  Plus,
  Eye,
  Edit,
  Send,
  User,
  Building
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import InsuranceClaimForm from "@/components/forms/InsuranceClaimForm";

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  patientId: string;
  appointmentId: string;
  visitSummaryId?: string;
  providerId: string;
  medicalSpecialty: string;
  primaryDiagnosisCode: string;
  primaryDiagnosisDescription: string;
  secondaryDiagnosisCodes: Array<{
    code: string;
    description: string;
  }>;
  procedureCodes: Array<{
    code: string;
    description: string;
    amount: number;
  }>;
  clinicalFindings: string;
  treatmentProvided: string;
  medicalNecessity: string;
  totalAmount: string;
  totalPatientCopay: string;
  totalInsuranceAmount: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  submittedDate?: string;
  processedDate?: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  mrn: string;
}

interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function InsuranceClaimManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const { toast } = useToast();

  // Fetch insurance claims
  const { data: claims = [], isLoading } = useQuery<InsuranceClaim[]>({
    queryKey: ["/api/insurance-claims"],
    enabled: !!user && !!tenant,
  });

  // Fetch patients for claim details
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: !!user && !!tenant,
  });

  // Fetch providers for claim details
  const { data: providers = [] } = useQuery<Provider[]>({
    queryKey: ["/api/users"],
    enabled: !!user && !!tenant,
  });

  // Submit insurance claim mutation
  const submitClaimMutation = useMutation({
    mutationFn: async (claimId: string) => {
      return await apiRequest(`/api/insurance-claims/${claimId}/submit`, {
        method: "POST"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insurance-claims"] });
      toast({
        title: "Claim Submitted",
        description: "Insurance claim has been submitted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit insurance claim.",
        variant: "destructive",
      });
    },
  });

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient ${patientId.slice(-4)}`;
  };

  const getProviderName = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    return provider ? `Dr. ${provider.firstName} ${provider.lastName}` : `Provider ${providerId.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredClaims = claims.filter(claim => {
    const patient = patients.find(p => p.id === claim.patientId);
    const matchesSearch = !searchTerm || 
      claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.mrn.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
    const matchesSpecialty = specialtyFilter === "all" || claim.medicalSpecialty === specialtyFilter;
    
    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount) || 0);
  };

  const handleViewClaim = (claim: InsuranceClaim) => {
    setSelectedClaim(claim);
    setIsViewDialogOpen(true);
  };

  const handleSubmitClaim = (claimId: string) => {
    submitClaimMutation.mutate(claimId);
  };

  const canCreateClaims = user?.role && ['doctor', 'physician', 'tenant_admin', 'director'].includes(user.role);
  const canSubmitClaims = user?.role && ['doctor', 'physician', 'tenant_admin', 'director', 'billing_staff'].includes(user.role);

  if (!user || !tenant) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Insurance Claims</h1>
          <p className="text-gray-600 mt-1">Manage specialty-specific insurance claims and medical coding</p>
        </div>
        {canCreateClaims && (
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-create-claim"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Claim
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by claim number, patient name, or MRN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-claims"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-48" data-testid="select-specialty-filter">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="family_medicine">Family Medicine</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="dermatology">Dermatology</SelectItem>
                  <SelectItem value="internal_medicine">Internal Medicine</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="oncology">Oncology</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Insurance Claims
            </div>
            <Badge variant="outline" className="text-xs">
              {filteredClaims.length} claim{filteredClaims.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4 py-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
              <p className="text-gray-600 mb-4">
                No insurance claims match your current filters.
              </p>
              {canCreateClaims && (
                <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-claim">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Claim
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClaims.map((claim) => (
                <div key={claim.id} className="border rounded-lg p-4 space-y-3" data-testid={`claim-card-${claim.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{claim.claimNumber}</h3>
                        <p className="text-sm text-gray-600">
                          {getPatientName(claim.patientId)} • {getProviderName(claim.providerId)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(claim.status)}>
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewClaim(claim)}
                          data-testid={`button-view-claim-${claim.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canSubmitClaims && claim.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSubmitClaim(claim.id)}
                            disabled={submitClaimMutation.isPending}
                            data-testid={`button-submit-claim-${claim.id}`}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Specialty:</span>
                      <p className="font-medium capitalize">{claim.medicalSpecialty.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Primary Diagnosis:</span>
                      <p className="font-medium">{claim.primaryDiagnosisCode}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Amount:</span>
                      <p className="font-medium text-green-600">{formatCurrency(claim.totalAmount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <p className="font-medium">{formatDate(claim.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Claim Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Insurance Claim Details - {selectedClaim?.claimNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="space-y-6">
              {/* Claim Header */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Patient:</span>
                  <p className="font-medium">{getPatientName(selectedClaim.patientId)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Provider:</span>
                  <p className="font-medium">{getProviderName(selectedClaim.providerId)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Specialty:</span>
                  <p className="font-medium capitalize">{selectedClaim.medicalSpecialty.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <Badge className={getStatusColor(selectedClaim.status)}>
                    {selectedClaim.status.charAt(0).toUpperCase() + selectedClaim.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Diagnosis Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Diagnosis Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Primary Diagnosis:</span>
                    <p className="text-sm">{selectedClaim.primaryDiagnosisCode} - {selectedClaim.primaryDiagnosisDescription}</p>
                  </div>
                  {selectedClaim.secondaryDiagnosisCodes.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Secondary Diagnoses:</span>
                      <ul className="text-sm space-y-1">
                        {selectedClaim.secondaryDiagnosisCodes.map((diagnosis, index) => (
                          <li key={index}>{diagnosis.code} - {diagnosis.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Procedures */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Procedures & Services</h3>
                <div className="space-y-2">
                  {selectedClaim.procedureCodes.map((procedure, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{procedure.code}</span>
                        <p className="text-sm text-gray-600">{procedure.description}</p>
                      </div>
                      <span className="font-medium text-green-600">{formatCurrency(procedure.amount.toString())}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Clinical Information</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Clinical Findings:</span>
                    <p className="text-sm bg-gray-50 p-3 rounded mt-1">{selectedClaim.clinicalFindings}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Treatment Provided:</span>
                    <p className="text-sm bg-gray-50 p-3 rounded mt-1">{selectedClaim.treatmentProvided}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Medical Necessity:</span>
                    <p className="text-sm bg-gray-50 p-3 rounded mt-1">{selectedClaim.medicalNecessity}</p>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Financial Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(selectedClaim.totalAmount)}</div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedClaim.totalInsuranceAmount)}</div>
                    <div className="text-sm text-gray-600">Insurance Coverage</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{formatCurrency(selectedClaim.totalPatientCopay)}</div>
                    <div className="text-sm text-gray-600">Patient Copay</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Claim Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Insurance Claim</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-600">
              To create an insurance claim, please go to the Appointments page and select "Create Insurance Claim" 
              from the appointment actions menu during or after a patient visit.
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(false)}
              className="mt-4"
            >
              Go to Appointments
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}