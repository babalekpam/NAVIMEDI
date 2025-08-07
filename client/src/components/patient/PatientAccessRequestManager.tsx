import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle, Clock, XCircle, Users, FileText, Search, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { PatientAccessRequest, Patient, User } from '@/../../shared/schema';

interface PatientAccessRequestManagerProps {
  userRole: string;
}

export function PatientAccessRequestManager({ userRole }: PatientAccessRequestManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [accessType, setAccessType] = useState('read');
  const [accessDuration, setAccessDuration] = useState('24'); // Hours
  const [accessContext, setAccessContext] = useState('routine');
  const [patientSensitivityLevel, setPatientSensitivityLevel] = useState('standard');
  const [dataCategories, setDataCategories] = useState<string[]>([]);
  
  // Search states
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [showDoctorResults, setShowDoctorResults] = useState(false);
  
  // Quick lookup states
  const [quickSearchTerm, setQuickSearchTerm] = useState('');
  const [showQuickResults, setShowQuickResults] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch patient access requests
  const { data: accessRequests = [], isLoading: requestsLoading } = useQuery<PatientAccessRequest[]>({
    queryKey: ['/api/patient-access-requests'],
    enabled: ['physician', 'tenant_admin', 'director', 'super_admin'].includes(userRole)
  });

  // Fetch patients for selection
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
    enabled: userRole === 'physician'
  });

  // Fetch doctors for selection
  const { data: doctors = [] } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'physician' }],
    enabled: userRole === 'physician'
  });

  // Create access request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const accessGrantedUntil = new Date();
      accessGrantedUntil.setHours(accessGrantedUntil.getHours() + parseInt(accessDuration));
      
      return apiRequest('/api/patient-access-requests', {
        method: 'POST',
        body: {
          ...data,
          accessGrantedUntil: accessGrantedUntil.toISOString(),
          accessContext,
          patientSensitivityLevel,
          dataCategories
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patient-access-requests'] });
      toast({
        title: "Access Request Created",
        description: "Your patient access request has been submitted successfully."
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to create access request",
        variant: "destructive"
      });
    }
  });

  // Update request status mutation
  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest(`/api/patient-access-requests/${id}`, {
        method: 'PUT',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patient-access-requests'] });
      toast({
        title: "Request Updated",
        description: "Access request has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update access request",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setSelectedPatientId('');
    setSelectedDoctorId('');
    setReason('');
    setUrgency('normal');
    setAccessType('read');
    setAccessDuration('24');
    setPatientSearchTerm('');
    setDoctorSearchTerm('');
    setShowPatientResults(false);
    setShowDoctorResults(false);
  };

  // Filter patients based on search term (name or MRN)
  const filteredPatients = patients.filter(patient => {
    if (!patientSearchTerm) return false;
    const searchLower = patientSearchTerm.toLowerCase();
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const mrn = patient.mrn?.toLowerCase() || '';
    return fullName.includes(searchLower) || mrn.includes(searchLower);
  });

  // Filter doctors based on search term (name or ID)
  const filteredDoctors = doctors.filter(doctor => {
    if (!doctorSearchTerm) return false;
    const searchLower = doctorSearchTerm.toLowerCase();
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
    const email = doctor.email.toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower) || doctor.id.includes(searchLower);
  });

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setPatientSearchTerm(`${patient.firstName} ${patient.lastName} (MRN: ${patient.mrn})`);
    setShowPatientResults(false);
  };

  const handleDoctorSelect = (doctor: User) => {
    setSelectedDoctorId(doctor.id);
    setDoctorSearchTerm(`${doctor.firstName} ${doctor.lastName}`);
    setShowDoctorResults(false);
  };

  // Filter patients for quick lookup (name or MRN)
  const quickFilteredPatients = patients.filter(patient => {
    if (!quickSearchTerm) return false;
    const searchLower = quickSearchTerm.toLowerCase();
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const mrn = patient.mrn?.toLowerCase() || '';
    return fullName.includes(searchLower) || mrn.includes(searchLower);
  });

  const handleQuickPatientAccess = (patient: Patient) => {
    // Navigate to patient medical records
    window.open(`/patient-medical-records?patientId=${patient.id}`, '_blank');
  };

  const handleCreateRequest = () => {
    if (!selectedPatientId || !reason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a patient and provide a reason for access.",
        variant: "destructive"
      });
      return;
    }

    createRequestMutation.mutate({
      patientId: selectedPatientId,
      targetPhysicianId: selectedDoctorId || null,
      reason: reason.trim(),
      urgency,
      accessType,
      requestType: 'access'
    });
  };

  const handleUpdateRequestStatus = (requestId: string, status: string, reviewNotes?: string) => {
    const updateData: any = {
      status,
      reviewedDate: new Date().toISOString()
    };

    if (reviewNotes) {
      updateData.reviewNotes = reviewNotes;
    }

    updateRequestMutation.mutate({ id: requestId, data: updateData });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      denied: { color: 'bg-red-100 text-red-800', icon: XCircle },
      expired: { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig = {
      low: 'bg-blue-100 text-blue-800',
      normal: 'bg-gray-100 text-gray-800',
      high: 'bg-orange-100 text-orange-800',
      emergency: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={urgencyConfig[urgency as keyof typeof urgencyConfig] || urgencyConfig.normal}>
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
      </Badge>
    );
  };

  if (!['physician', 'tenant_admin', 'director', 'super_admin'].includes(userRole)) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Access denied. Patient access management is restricted to authorized personnel only.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Patient Access Management</h2>
          <p className="text-gray-600">Manage patient data access requests for multi-doctor separation</p>
        </div>
        
        {userRole === 'physician' && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Request Access
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Request Patient Access</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Label htmlFor="patient">Patient * (Search by name or MRN)</Label>
                  <Input
                    value={patientSearchTerm}
                    onChange={(e) => {
                      setPatientSearchTerm(e.target.value);
                      setShowPatientResults(e.target.value.length > 0);
                      if (!e.target.value) {
                        setSelectedPatientId('');
                      }
                    }}
                    placeholder="Type patient name or MRN..."
                    className="w-full"
                  />
                  {showPatientResults && filteredPatients.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredPatients.map((patient) => (
                        <div
                          key={patient.id}
                          onClick={() => handlePatientSelect(patient)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                          <div className="text-sm text-gray-500">MRN: {patient.mrn}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {showPatientResults && patientSearchTerm && filteredPatients.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4">
                      <div className="text-sm text-gray-500">No patients found matching "{patientSearchTerm}"</div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Label htmlFor="doctor">Target Physician (Optional - Search by name or ID)</Label>
                  <Input
                    value={doctorSearchTerm}
                    onChange={(e) => {
                      setDoctorSearchTerm(e.target.value);
                      setShowDoctorResults(e.target.value.length > 0);
                      if (!e.target.value) {
                        setSelectedDoctorId('');
                      }
                    }}
                    placeholder="Type doctor name or ID..."
                    className="w-full"
                  />
                  {showDoctorResults && filteredDoctors.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredDoctors.map((doctor) => (
                        <div
                          key={doctor.id}
                          onClick={() => handleDoctorSelect(doctor)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">Dr. {doctor.firstName} {doctor.lastName}</div>
                          <div className="text-sm text-gray-500">{doctor.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {showDoctorResults && doctorSearchTerm && filteredDoctors.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4">
                      <div className="text-sm text-gray-500">No doctors found matching "{doctorSearchTerm}"</div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="accessType">Access Type</Label>
                  <Select value={accessType} onValueChange={setAccessType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read Only</SelectItem>
                      <SelectItem value="write">Read & Write</SelectItem>
                      <SelectItem value="full">Full Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Access Duration (Hours)</Label>
                  <Select value={accessDuration} onValueChange={setAccessDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Hour</SelectItem>
                      <SelectItem value="4">4 Hours</SelectItem>
                      <SelectItem value="8">8 Hours</SelectItem>
                      <SelectItem value="24">24 Hours</SelectItem>
                      <SelectItem value="72">72 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Access Context */}
                <div>
                  <Label htmlFor="context">Access Context</Label>
                  <Select value={accessContext} onValueChange={setAccessContext}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select access context" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine Care</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="legal">Legal/Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Patient Sensitivity Level */}
                <div>
                  <Label htmlFor="sensitivity">Patient Sensitivity Level</Label>
                  <Select value={patientSensitivityLevel} onValueChange={setPatientSensitivityLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient sensitivity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="sensitive">Sensitive</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Data Categories */}
                <div className="space-y-2">
                  <Label>Data Categories Needed</Label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      'medical_records',
                      'billing', 
                      'sensitive_notes',
                      'mental_health',
                      'genetic_data',
                      'lab_results'
                    ].map((category) => (
                      <label key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={dataCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDataCategories([...dataCategories, category]);
                            } else {
                              setDataCategories(dataCategories.filter(c => c !== category));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">
                          {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason">Reason for Access *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please provide a detailed reason for requesting access to this patient's data..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateRequest}
                    disabled={createRequestMutation.isPending}
                    className="min-w-[100px]"
                  >
                    {createRequestMutation.isPending ? "Creating..." : "Submit Request"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Quick Patient Lookup for Doctors */}
      {userRole === 'physician' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Quick Patient Lookup
            </CardTitle>
            <p className="text-sm text-gray-600">Search for patients by name or MRN to access their health records</p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                value={quickSearchTerm}
                onChange={(e) => {
                  setQuickSearchTerm(e.target.value);
                  setShowQuickResults(e.target.value.length > 0);
                }}
                placeholder="Search patient by name or MRN..."
                className="w-full"
              />
              {showQuickResults && quickFilteredPatients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {quickFilteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                        <div className="text-sm text-gray-500">MRN: {patient.mrn}</div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleQuickPatientAccess(patient)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View Records
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {showQuickResults && quickSearchTerm && quickFilteredPatients.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4">
                  <div className="text-sm text-gray-500">No patients found matching "{quickSearchTerm}"</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Access Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Patient Access Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requestsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading access requests...</p>
            </div>
          ) : accessRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No patient access requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accessRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(request.status)}
                      {getUrgencyBadge(request.urgency)}
                      <Badge variant="outline">{request.accessType}</Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.requestedDate ? new Date(request.requestedDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Patient</p>
                      <p className="text-sm">Patient ID: {request.patientId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Request Type</p>
                      <p className="text-sm capitalize">{request.requestType}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Reason</p>
                    <p className="text-sm text-gray-600">{request.reason}</p>
                  </div>

                  {request.reviewNotes && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Review Notes</p>
                      <p className="text-sm text-gray-600">{request.reviewNotes}</p>
                    </div>
                  )}

                  {['tenant_admin', 'director', 'super_admin'].includes(userRole) && request.status === 'pending' && (
                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateRequestStatus(request.id, 'approved')}
                        disabled={updateRequestMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateRequestStatus(request.id, 'denied', 'Request denied by administrator')}
                        disabled={updateRequestMutation.isPending}
                      >
                        Deny
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}