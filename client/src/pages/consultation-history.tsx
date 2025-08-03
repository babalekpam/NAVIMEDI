import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  Search, 
  FileText, 
  User, 
  Clock, 
  Stethoscope,
  Eye,
  Filter 
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context-fixed";
import { useTranslation } from "@/contexts/translation-context";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VisitSummary {
  id: string;
  patientId: string;
  appointmentId: string;
  providerId: string;
  chiefComplaint: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  assessment?: string;
  clinicalImpression?: string;
  treatmentPlan?: string;
  patientInstructions?: string;
  followUpInstructions?: string;
  returnVisitRecommended: boolean;
  returnVisitTimeframe?: string;
  providerNotes?: string;
  status: "draft" | "finalized";
  visitDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  mrn: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email?: string;
}

interface Appointment {
  id: string;
  appointmentDate: string;
  type: string;
  duration: number;
  status: string;
}

export default function ConsultationHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedConsultation, setSelectedConsultation] = useState<VisitSummary | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();

  // Fetch visit summaries for current provider
  const { data: visitSummaries = [], isLoading } = useQuery<VisitSummary[]>({
    queryKey: ["/api/visit-summaries/provider", user?.id],
    enabled: !!user?.id && !!tenant,
  });

  // Fetch all patients to get patient details
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: !!user && !!tenant,
  });

  // Fetch all appointments to get appointment details
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: !!user && !!tenant,
  });

  const getPatientDetails = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

  const getAppointmentDetails = (appointmentId: string) => {
    return appointments.find(a => a.id === appointmentId);
  };

  const filteredConsultations = visitSummaries.filter(consultation => {
    const patient = getPatientDetails(consultation.patientId);
    const matchesSearch = !searchTerm || 
      patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || consultation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (consultation: VisitSummary) => {
    setSelectedConsultation(consultation);
    setIsDetailDialogOpen(true);
  };

  const statusColors = {
    draft: "bg-yellow-100 text-yellow-800",
    finalized: "bg-green-100 text-green-800",
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultation History</h1>
          <p className="text-gray-600">Review your completed consultations and visit summaries</p>
        </div>
        <div className="flex items-center space-x-2">
          <Stethoscope className="h-8 w-8 text-blue-600" />
          <Badge variant="outline" className="text-sm">
            {filteredConsultations.length} consultations
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by patient name, MRN, or complaint..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="finalized">Finalized</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Consultation List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Recent Consultations
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
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConsultations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" 
                  ? "No consultations match your current filters."
                  : "You haven't completed any consultations yet."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredConsultations.map((consultation) => {
                const patient = getPatientDetails(consultation.patientId);
                const appointment = getAppointmentDetails(consultation.appointmentId);
                
                return (
                  <div 
                    key={consultation.id}
                    className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {patient ? `${patient.firstName[0]}${patient.lastName[0]}` : "P"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {patient?.mrn || 'No MRN'}
                          </Badge>
                          <Badge 
                            className={`text-xs ${statusColors[consultation.status]}`}
                          >
                            {consultation.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-500">
                          <strong>Chief Complaint:</strong> {consultation.chiefComplaint}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-600 mt-1">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {appointment ? formatDate(appointment.appointmentDate) : formatDate(consultation.createdAt)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {appointment?.type || 'Consultation'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleViewDetails(consultation)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consultation Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Consultation Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedConsultation && (
            <div className="space-y-6">
              {(() => {
                const patient = getPatientDetails(selectedConsultation.patientId);
                const appointment = getAppointmentDetails(selectedConsultation.appointmentId);
                
                return (
                  <>
                    {/* Patient Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-blue-900 mb-2">Patient Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-700">Patient:</span>
                          <p className="font-medium">
                            {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-700">MRN:</span>
                          <p className="font-medium">{patient?.mrn || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-700">Date:</span>
                          <p className="font-medium">
                            {appointment ? formatDate(appointment.appointmentDate) : formatDate(selectedConsultation.createdAt)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-700">Status:</span>
                          <Badge className={`text-xs ${statusColors[selectedConsultation.status]}`}>
                            {selectedConsultation.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Clinical Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Chief Complaint</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            {selectedConsultation.chiefComplaint}
                          </p>
                        </div>
                        
                        {selectedConsultation.historyOfPresentIllness && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">History of Present Illness</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                              {selectedConsultation.historyOfPresentIllness}
                            </p>
                          </div>
                        )}
                        
                        {selectedConsultation.physicalExamination && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Physical Examination</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                              {selectedConsultation.physicalExamination}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {selectedConsultation.assessment && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Assessment</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                              {selectedConsultation.assessment}
                            </p>
                          </div>
                        )}
                        
                        {selectedConsultation.clinicalImpression && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Clinical Impression</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                              {selectedConsultation.clinicalImpression}
                            </p>
                          </div>
                        )}
                        
                        {selectedConsultation.treatmentPlan && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Treatment Plan</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                              {selectedConsultation.treatmentPlan}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Instructions and Follow-up */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedConsultation.patientInstructions && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Patient Instructions</h4>
                          <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded whitespace-pre-wrap">
                            {selectedConsultation.patientInstructions}
                          </p>
                        </div>
                      )}
                      
                      {selectedConsultation.followUpInstructions && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Follow-up Instructions</h4>
                          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded whitespace-pre-wrap">
                            {selectedConsultation.followUpInstructions}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Return Visit */}
                    {selectedConsultation.returnVisitRecommended && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Return Visit Recommended</h4>
                        <p className="text-sm text-green-700">
                          <strong>Timeframe:</strong> {selectedConsultation.returnVisitTimeframe || 'As needed'}
                        </p>
                      </div>
                    )}

                    {/* Provider Notes */}
                    {selectedConsultation.providerNotes && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Provider Notes</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                          {selectedConsultation.providerNotes}
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}