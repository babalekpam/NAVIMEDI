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
import { AlertTriangle, CheckCircle, Clock, XCircle, Users, FileText } from 'lucide-react';
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
        body: JSON.stringify({
          ...data,
          accessGrantedUntil: accessGrantedUntil.toISOString()
        })
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
        body: JSON.stringify(data)
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
                <div>
                  <Label htmlFor="patient">Patient *</Label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName} (MRN: {patient.mrn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="doctor">Target Physician (Optional)</Label>
                  <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target physician" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.firstName} {doctor.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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