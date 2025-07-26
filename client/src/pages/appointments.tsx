import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, Plus, Search, Filter, MoreHorizontal, Eye, Edit, Phone, Mail, User as UserIcon, Activity, FileText } from "lucide-react";
import { Appointment, Patient, User } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { AppointmentForm } from "@/components/forms/appointment-form";
import { VitalSignsForm } from "@/components/forms/vital-signs-form";
import { VisitSummaryForm } from "@/components/forms/visit-summary-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const statusColors = {
  scheduled: "bg-gray-100 text-gray-800",
  confirmed: "bg-green-100 text-green-800",
  checked_in: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-red-100 text-red-800",
};

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isVitalSignsFormOpen, setIsVitalSignsFormOpen] = useState(false);
  const [isVisitSummaryFormOpen, setIsVisitSummaryFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [statusNotes, setStatusNotes] = useState<string>("");
  const { user } = useAuth();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all appointments if "all" is selected, otherwise filter by date
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: selectedDate === "all" ? ["/api/appointments"] : ["/api/appointments", selectedDate],
    enabled: !!user && !!tenant,
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: !!user && !!tenant,
  });

  const { data: providers = [] } = useQuery<User[]>({
    queryKey: ["/api/users?role=physician"],
    enabled: !!user && !!tenant,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(appointmentData)
      });
      if (!response.ok) throw new Error("Failed to create appointment");
      return response.json();
    },
    onSuccess: (newAppointment) => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      // Update selected date to the appointment date to show the new appointment
      const appointmentDate = new Date(newAppointment.appointmentDate);
      setSelectedDate(appointmentDate.toISOString().split('T')[0]);
      setIsFormOpen(false);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const response = await apiRequest("PATCH", `/api/appointments/${id}`, {
        status,
        notes: notes || undefined
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsStatusDialogOpen(false);
      setSelectedAppointment(null);
      setNewStatus("");
      setStatusNotes("");
      toast({
        title: "Status Updated",
        description: "The appointment status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update appointment status.",
        variant: "destructive",
      });
    },
  });

  const filteredAppointments = appointments.filter(appointment => 
    statusFilter === "all" || appointment.status === statusFilter
  );

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNewStatus(appointment.status || "");
    setStatusNotes("");
    setIsStatusDialogOpen(true);
  };

  const handleStatusSubmit = () => {
    if (!selectedAppointment || !newStatus) return;
    
    updateStatusMutation.mutate({
      id: selectedAppointment.id,
      status: newStatus,
      notes: statusNotes
    });
  };

  const handleVitalSigns = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsVitalSignsFormOpen(true);
  };

  const handleVisitSummary = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsVisitSummaryFormOpen(true);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient ${patientId.slice(-4)}`;
  };

  const getProviderName = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    return provider ? `Dr. ${provider.firstName} ${provider.lastName}` : `Provider ${providerId.slice(-4)}`;
  };

  if (!user || !tenant) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage patient appointments and scheduling</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
            </DialogHeader>
            <AppointmentForm
              onSubmit={(data) => createAppointmentMutation.mutate(data)}
              isLoading={createAppointmentMutation.isPending}
              patients={patients}
              providers={providers}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Appointments</SelectItem>
                  <SelectItem value={new Date().toISOString().split('T')[0]}>Today</SelectItem>
                  <SelectItem value={new Date(Date.now() + 86400000).toISOString().split('T')[0]}>Tomorrow</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="custom">Custom Date</SelectItem>
                </SelectContent>
              </Select>
              {selectedDate === "custom" && (
                <input
                  type="date"
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {selectedDate === "all" 
                ? "All Appointments" 
                : selectedDate === "this_week" 
                ? "This Week's Appointments"
                : `Appointments for ${new Date(selectedDate).toLocaleDateString()}`
              }
            </div>
            <Badge variant="outline" className="text-xs">
              {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
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
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600 mb-4">
                No appointments scheduled for the selected date and filters.
              </p>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredAppointments.map((appointment) => (
                <div 
                  key={appointment.id}
                  className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {getPatientName(appointment.patientId)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {appointment.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Provider: {getProviderName(appointment.providerId)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(appointment.appointmentDate).toLocaleDateString()} • Duration: {appointment.duration} minutes
                      </p>
                      {appointment.chiefComplaint && (
                        <p className="text-xs text-blue-600 mt-1">
                          <strong>Chief Complaint:</strong> {appointment.chiefComplaint}
                        </p>
                      )}
                      {appointment.notes && (
                        <p className="text-xs text-gray-500 mt-1">
                          <strong>Notes:</strong> {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatTime(appointment.appointmentDate.toString())}
                      </p>
                      <Badge 
                        className={`text-xs ${statusColors[appointment.status as keyof typeof statusColors] || statusColors.scheduled}`}
                      >
                        {appointment.status?.replace('_', ' ').toUpperCase() || 'SCHEDULED'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleViewDetails(appointment)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {(user?.role === "receptionist" || user?.role === "nurse" || user?.role === "tenant_admin" || user?.role === "super_admin") && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleVitalSigns(appointment)}
                        >
                          <Activity className="h-4 w-4 mr-1" />
                          Vital Signs
                        </Button>
                      )}
                      {(user?.role === "doctor" || user?.role === "physician" || user?.role === "nurse" || user?.role === "tenant_admin" || user?.role === "super_admin") && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-purple-600 hover:text-purple-700"
                          onClick={() => handleVisitSummary(appointment)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Visit Summary
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-teal-600 hover:text-teal-700"
                        onClick={() => handleUpdateStatus(appointment)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Update Status
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Appointment Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Appointment Details
            </DialogTitle>
            <DialogDescription>
              Complete information for this appointment
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-6">
              {/* Patient Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-blue-700">Patient Name</Label>
                    <p className="font-medium">{getPatientName(selectedAppointment.patientId)}</p>
                  </div>
                  <div>
                    <Label className="text-blue-700">Patient ID</Label>
                    <p className="font-mono text-xs">{selectedAppointment.patientId.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
              </div>

              {/* Appointment Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Appointment Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-700">Date & Time</Label>
                    <p className="font-medium">
                      {new Date(selectedAppointment.appointmentDate).toLocaleDateString()} at {formatTime(selectedAppointment.appointmentDate.toString())}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-700">Duration</Label>
                    <p className="font-medium">{selectedAppointment.duration} minutes</p>
                  </div>
                  <div>
                    <Label className="text-gray-700">Appointment Type</Label>
                    <p className="font-medium capitalize">{selectedAppointment.type}</p>
                  </div>
                  <div>
                    <Label className="text-gray-700">Status</Label>
                    <Badge className={`${statusColors[selectedAppointment.status as keyof typeof statusColors] || statusColors.scheduled} mt-1`}>
                      {selectedAppointment.status?.replace('_', ' ').toUpperCase() || 'SCHEDULED'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Provider Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Provider Information
                </h3>
                <div className="text-sm">
                  <Label className="text-green-700">Attending Provider</Label>
                  <p className="font-medium">{getProviderName(selectedAppointment.providerId)}</p>
                </div>
              </div>

              {/* Clinical Information */}
              {(selectedAppointment.chiefComplaint || selectedAppointment.notes) && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-3">
                    Clinical Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    {selectedAppointment.chiefComplaint && (
                      <div>
                        <Label className="text-yellow-700">Chief Complaint</Label>
                        <p className="font-medium">{selectedAppointment.chiefComplaint}</p>
                      </div>
                    )}
                    {selectedAppointment.notes && (
                      <div>
                        <Label className="text-yellow-700">Additional Notes</Label>
                        <p className="font-medium">{selectedAppointment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2" />
              Update Appointment Status
            </DialogTitle>
            <DialogDescription>
              Update the status for {selectedAppointment && getPatientName(selectedAppointment.patientId)}'s appointment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">Status Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about the status change..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsStatusDialogOpen(false)}
                disabled={updateStatusMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleStatusSubmit}
                disabled={!newStatus || updateStatusMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vital Signs Form */}
      {selectedAppointment && (
        <VitalSignsForm
          isOpen={isVitalSignsFormOpen}
          onClose={() => setIsVitalSignsFormOpen(false)}
          patientId={selectedAppointment.patientId}
          patientName={getPatientName(selectedAppointment.patientId)}
          appointmentId={selectedAppointment.id}
        />
      )}

      {/* Visit Summary Form */}
      {selectedAppointment && (
        <VisitSummaryForm
          isOpen={isVisitSummaryFormOpen}
          onClose={() => setIsVisitSummaryFormOpen(false)}
          patientId={selectedAppointment.patientId}
          patientName={getPatientName(selectedAppointment.patientId)}
          appointmentId={selectedAppointment.id}
        />
      )}
    </div>
  );
}
