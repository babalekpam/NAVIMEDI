import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Plus, Search, Shield, Pill, FileText, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/hooks/use-toast";
import MedicationCopayForm from "@/components/forms/medication-copay-form";
import { type MedicationCopay, type Patient, type InsuranceProvider } from "@shared/schema";

export default function MedicationCopaysPage() {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCopayForm, setShowCopayForm] = useState(false);
  const [selectedCopay, setSelectedCopay] = useState<MedicationCopay | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();

  // Fetch medication copays for the pharmacy
  const { data: copays = [], isLoading: copayscLoading, refetch: refetchCopays } = useQuery<MedicationCopay[]>({
    queryKey: ["/api/medication-copays"],
    enabled: !!user && !!tenant
  });

  // Fetch patients for filtering
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: !!user && !!tenant
  });

  // Fetch insurance providers for display
  const { data: insuranceProviders = [] } = useQuery<InsuranceProvider[]>({
    queryKey: ["/api/insurance-providers"],
    enabled: !!user && !!tenant
  });

  // Filter copays based on search and filters
  const filteredCopays = copays.filter(copay => {
    const matchesSearch = searchTerm === "" || 
      copay.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      copay.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      copay.ndcNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPatient = selectedPatient === "" || copay.patientId === selectedPatient;
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && copay.isActive) ||
      (filterStatus === "inactive" && !copay.isActive);
    
    return matchesSearch && matchesPatient && matchesStatus;
  });

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient";
  };

  const getFormularyTierBadge = (tier: string) => {
    const tierColors = {
      tier_1: "bg-green-100 text-green-800",
      tier_2: "bg-blue-100 text-blue-800", 
      tier_3: "bg-yellow-100 text-yellow-800",
      tier_4: "bg-red-100 text-red-800",
      not_covered: "bg-gray-100 text-gray-800"
    };
    
    const tierLabels = {
      tier_1: "Tier 1",
      tier_2: "Tier 2",
      tier_3: "Tier 3", 
      tier_4: "Tier 4",
      not_covered: "Not Covered"
    };
    
    return (
      <Badge className={tierColors[tier as keyof typeof tierColors] || "bg-gray-100 text-gray-800"}>
        {tierLabels[tier as keyof typeof tierLabels] || tier}
      </Badge>
    );
  };

  const handleCopaySuccess = () => {
    setShowCopayForm(false);
    refetchCopays();
    toast({
      title: "Success",
      description: "Medication copay has been successfully defined."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Medication Copays
          </h1>
          <p className="text-muted-foreground">
            Define and manage patient copays based on insurance coverage
          </p>
        </div>
        
        <Dialog open={showCopayForm} onOpenChange={setShowCopayForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Define New Copay
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Define Medication Copay</DialogTitle>
            </DialogHeader>
            <MedicationCopayForm
              onSuccess={handleCopaySuccess}
              onCancel={() => setShowCopayForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Copays</p>
                <p className="text-2xl font-bold">{copays.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Copays</p>
                <p className="text-2xl font-bold">{copays.filter(c => c.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Patient Copay</p>
                <p className="text-2xl font-bold">
                  ${copays.length > 0 ? 
                    (copays.reduce((sum, c) => sum + c.patientCopay, 0) / copays.length).toFixed(2) : 
                    '0.00'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patients Covered</p>
                <p className="text-2xl font-bold">
                  {new Set(copays.map(c => c.patientId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter Copays
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Medications</label>
              <Input
                placeholder="Search by medication name, generic name, or NDC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Patient</label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="All patients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All patients</SelectItem>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} - MRN: {patient.mrn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All copays</SelectItem>
                  <SelectItem value="active">Active only</SelectItem>
                  <SelectItem value="inactive">Inactive only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Copays Table */}
      <Card>
        <CardHeader>
          <CardTitle>Defined Medication Copays</CardTitle>
          <p className="text-sm text-muted-foreground">
            Showing {filteredCopays.length} of {copays.length} copays
          </p>
        </CardHeader>
        <CardContent>
          {copayscLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Loading copays...</div>
            </div>
          ) : filteredCopays.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No medication copays found</p>
              <p className="mb-4">
                {searchTerm || selectedPatient || filterStatus !== "all" 
                  ? "Try adjusting your filters or search terms."
                  : "Start by defining your first medication copay."
                }
              </p>
              {!searchTerm && !selectedPatient && filterStatus === "all" && (
                <Button onClick={() => setShowCopayForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Define First Copay
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Full Price</TableHead>
                  <TableHead>Insurance Coverage</TableHead>
                  <TableHead>Patient Copay</TableHead>
                  <TableHead>Formulary Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCopays.map((copay) => (
                  <TableRow key={copay.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{copay.medicationName}</div>
                        {copay.genericName && (
                          <div className="text-sm text-muted-foreground">
                            Generic: {copay.genericName}
                          </div>
                        )}
                        {copay.strength && (
                          <div className="text-sm text-muted-foreground">
                            {copay.strength} {copay.dosageForm}
                          </div>
                        )}
                        {copay.ndcNumber && (
                          <div className="text-xs text-muted-foreground">
                            NDC: {copay.ndcNumber}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {getPatientName(copay.patientId)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${copay.fullPrice.toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">
                        ${copay.insuranceCoverage.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-lg">
                        ${copay.patientCopay.toFixed(2)}
                      </div>
                      {copay.copayPercentage && (
                        <div className="text-sm text-muted-foreground">
                          {copay.copayPercentage}%
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getFormularyTierBadge(copay.formularyTier)}
                      {copay.priorAuthRequired && (
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            Prior Auth Required
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={copay.isActive ? "default" : "secondary"}>
                        {copay.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(copay.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCopay(copay)}
                        >
                          View Details
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

      {/* Copay Details Dialog */}
      {selectedCopay && (
        <Dialog open={!!selectedCopay} onOpenChange={() => setSelectedCopay(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Medication Copay Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Medication Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Medication Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Brand Name</label>
                      <p className="font-medium">{selectedCopay.medicationName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Generic Name</label>
                      <p className="font-medium">{selectedCopay.genericName || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Strength</label>
                      <p className="font-medium">{selectedCopay.strength || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Dosage Form</label>
                      <p className="font-medium">{selectedCopay.dosageForm}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">NDC Number</label>
                      <p className="font-medium">{selectedCopay.ndcNumber || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pricing & Coverage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Price</label>
                      <p className="text-lg font-bold">${selectedCopay.fullPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Insurance Coverage</label>
                      <p className="text-lg font-bold text-green-600">${selectedCopay.insuranceCoverage.toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Patient Copay</label>
                      <p className="text-xl font-bold text-blue-600">${selectedCopay.patientCopay.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insurance Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Insurance Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Formulary Tier</label>
                      <div className="mt-1">
                        {getFormularyTierBadge(selectedCopay.formularyTier)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Prior Authorization</label>
                      <p className="font-medium">
                        {selectedCopay.priorAuthRequired ? "Required" : "Not Required"}
                      </p>
                    </div>
                    {selectedCopay.quantityLimit && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Quantity Limit</label>
                        <p className="font-medium">{selectedCopay.quantityLimit} per fill</p>
                      </div>
                    )}
                    {selectedCopay.daySupplyLimit && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Day Supply Limit</label>
                        <p className="font-medium">{selectedCopay.daySupplyLimit} days</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedCopay.pharmacyNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pharmacy Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedCopay.pharmacyNotes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}