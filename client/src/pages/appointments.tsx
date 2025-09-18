import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, Plus, Search, Filter, MoreHorizontal, Eye, Edit, Phone, Mail, User as UserIcon, Activity, FileText, Trash2, Copy, Share, CheckCircle } from "lucide-react";
import { Appointment, Patient, User, VitalSigns } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { AppointmentForm } from "@/components/forms/appointment-form";
import { VitalSignsForm } from "@/components/forms/vital-signs-form";
import { VisitSummaryForm } from "@/components/forms/visit-summary-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const statusColors = {
  scheduled: "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border border-slate-300",
  confirmed: "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300",
  checked_in: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300",
  in_progress: "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300",
  completed: "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300",
  cancelled: "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300",
  no_show: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300",
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check URL parameters to auto-open appointment booking form
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'book') {
      setIsFormOpen(true);
    }
    
    // Check if patient was selected from Quick Actions in medical records
    const selectedPatientInfo = localStorage.getItem('selectedPatientForAppointment');
    if (selectedPatientInfo) {
      setIsFormOpen(true);
      // Clear the stored patient info after using it
      localStorage.removeItem('selectedPatientForAppointment');
    }
  }, []);

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

  // Get all vital signs to check which appointments have them
  const { data: allVitalSigns = [] } = useQuery<VitalSigns[]>({
    queryKey: ["/api/vital-signs"],
    enabled: !!user && !!tenant,
  });

  // Get existing visit summary for selected appointment
  const { data: existingVisitSummary } = useQuery({
    queryKey: ["/api/visit-summaries/appointment", selectedAppointment?.id],
    enabled: !!selectedAppointment?.id && isVisitSummaryFormOpen,
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
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle role restriction errors with user-friendly messages
        if (errorData.error === "ROLE_RESTRICTION_SCHEDULING") {
          throw new Error("You don't have permission to schedule appointments. Please contact reception staff or request scheduling permissions from your administrator.");
        }
        
        throw new Error(errorData.message || "Failed to create appointment");
      }
      return response.json();
    },
    onSuccess: (newAppointment) => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      // Update selected date to the appointment date to show the new appointment
      const appointmentDate = new Date(newAppointment.appointmentDate);
      setSelectedDate(appointmentDate.toISOString().split('T')[0]);
      setIsFormOpen(false);
      toast({
        title: "Appointment Created",
        description: "The appointment has been successfully scheduled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      try {
        return await apiRequest(`/api/appointments/${id}`, {
          method: "PATCH",
          body: {
            status,
            notes: notes || undefined
          }
        });
      } catch (error: any) {
        // Handle role restriction errors for appointment confirmation
        if (error.message.includes("ROLE_RESTRICTION_CONFIRMATION")) {
          throw new Error("You don't have permission to confirm appointments. Please contact reception staff or request confirmation permissions from your administrator.");
        }
        throw error;
      }
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

  const filteredAppointments = appointments.filter(appointment => {
    // Status filter
    if (statusFilter !== "all" && appointment.status !== statusFilter) {
      return false;
    }
    
    // Date filter
    if (selectedDate === "all") {
      return true;
    }
    
    const appointmentDate = new Date(appointment.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate === "today") {
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);
      return appointmentDate >= today && appointmentDate <= todayEnd;
    }
    
    if (selectedDate === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(23, 59, 59, 999);
      return appointmentDate >= tomorrow && appointmentDate <= tomorrowEnd;
    }
    
    if (selectedDate === "this_week") {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return appointmentDate >= today && appointmentDate <= weekEnd;
    }
    
    // Custom date
    if (selectedDate && selectedDate !== "custom") {
      const selectedDateObj = new Date(selectedDate);
      selectedDateObj.setHours(0, 0, 0, 0);
      const selectedDateEnd = new Date(selectedDateObj);
      selectedDateEnd.setHours(23, 59, 59, 999);
      return appointmentDate >= selectedDateObj && appointmentDate <= selectedDateEnd;
    }
    
    return true;
  });

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

  const getVitalSignsForAppointment = (appointmentId: string) => {
    return allVitalSigns.find(vs => vs.appointmentId === appointmentId);
  };

  if (!user || !tenant) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="space-y-8 p-6">
        {/* Modern Page Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">{t('appointments')}</h1>
                    <div className="h-1 w-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mt-2"></div>
                  </div>
                </div>
                <p className="text-blue-100 text-lg font-medium max-w-md">{t('schedule-manage-appointments')}</p>
                <div className="flex items-center space-x-4 text-sm text-blue-200">
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
              {(user.role === "receptionist" || user.role === "tenant_admin" || user.role === "director" || user.role === "super_admin") && (
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-white/90 hover:bg-white text-blue-700 hover:text-blue-800 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl border border-white/20 backdrop-blur-sm">
                      <Plus className="h-5 w-5 mr-3" />
                      {t('schedule-appointment')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl border-0 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Schedule New Appointment</DialogTitle>
                    </DialogHeader>
                    <AppointmentForm
                      onSubmit={(data) => createAppointmentMutation.mutate(data)}
                      isLoading={createAppointmentMutation.isPending}
                      patients={patients}
                      providers={providers}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/10 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-yellow-400/20 to-transparent rounded-full transform -translate-x-12 translate-y-12"></div>
        </div>

        {/* Modern Filters Section */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Filter className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Filter Appointments</h3>
                </div>
                <Badge variant="outline" className="bg-white/50 text-slate-600 border-slate-300">
                  {filteredAppointments.length} results
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Date Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>Date Range</span>
                  </Label>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger className="w-full bg-white/80 border-slate-200 hover:border-blue-300 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0 shadow-2xl">
                      <SelectItem value="all" className="rounded-lg">All Appointments</SelectItem>
                      <SelectItem value={new Date().toISOString().split('T')[0]} className="rounded-lg">Today</SelectItem>
                      <SelectItem value={new Date(Date.now() + 86400000).toISOString().split('T')[0]} className="rounded-lg">Tomorrow</SelectItem>
                      <SelectItem value="this_week" className="rounded-lg">This Week</SelectItem>
                      <SelectItem value="custom" className="rounded-lg">Custom Date</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedDate === "custom" && (
                    <input
                      type="date"
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full border border-slate-200 bg-white/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:shadow-md"
                    />
                  )}
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span>Status</span>
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full bg-white/80 border-slate-200 hover:border-green-300 focus:border-green-500 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0 shadow-2xl">
                      <SelectItem value="all" className="rounded-lg">All Statuses</SelectItem>
                      <SelectItem value="scheduled" className="rounded-lg">Scheduled</SelectItem>
                      <SelectItem value="confirmed" className="rounded-lg">Confirmed</SelectItem>
                      <SelectItem value="checked_in" className="rounded-lg">Checked In</SelectItem>
                      <SelectItem value="in_progress" className="rounded-lg">In Progress</SelectItem>
                      <SelectItem value="completed" className="rounded-lg">Completed</SelectItem>
                      <SelectItem value="cancelled" className="rounded-lg">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <Search className="h-4 w-4 text-purple-500" />
                    <span>Quick Actions</span>
                  </Label>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDate(new Date().toISOString().split('T')[0]);
                        setStatusFilter("all");
                      }}
                      className="flex-1 bg-white/80 border-slate-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:shadow-md"
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDate("all");
                        setStatusFilter("all");
                      }}
                      className="flex-1 bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all duration-200 hover:shadow-md"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Modern Appointments List */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-slate-200/50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/80 rounded-xl shadow-sm">
                  <Calendar className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {selectedDate === "all" 
                      ? "All Appointments" 
                      : selectedDate === "this_week" 
                      ? "This Week's Appointments"
                      : `Appointments for ${new Date(selectedDate).toLocaleDateString()}`
                    }
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">Manage and track patient appointments</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-lg px-4 py-2 text-sm font-medium">
                  {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl p-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 bg-slate-300 rounded-2xl"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-slate-300 rounded-lg w-1/3"></div>
                        <div className="h-4 bg-slate-300 rounded-lg w-1/2"></div>
                        <div className="h-3 bg-slate-300 rounded-lg w-1/4"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-6 w-24 bg-slate-300 rounded-lg"></div>
                        <div className="h-4 w-16 bg-slate-300 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50 m-6 rounded-2xl border border-slate-200/50">
                <div className="mx-auto mb-6 p-4 bg-white/80 rounded-2xl shadow-lg w-fit">
                  <Calendar className="h-20 w-20 text-slate-400 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">No appointments found</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                  No appointments scheduled for the selected date and filters. Create a new appointment to get started.
                </p>
                {(user.role === "receptionist" || user.role === "tenant_admin" || user.role === "director" || user.role === "super_admin") && (
                  <Button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
                  >
                    <Plus className="h-5 w-5 mr-3" />
                    Schedule New Appointment
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {filteredAppointments.map((appointment) => (
                  <div 
                    key={appointment.id}
                    className="group bg-gradient-to-r from-white via-blue-50/30 to-white border border-slate-200/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Clock className="h-8 w-8 text-white" />
                          </div>
                          <div className="absolute -top-2 -right-2">
                            <div className={`px-2 py-1 rounded-lg text-xs font-semibold shadow-lg ${statusColors[appointment.status as keyof typeof statusColors] || statusColors.scheduled}`}>
                              {appointment.status?.replace('_', ' ').toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-slate-800 mb-1">
                                {getPatientName(appointment.patientId)}
                              </h3>
                              <p className="text-slate-600 font-medium">
                                {getProviderName(appointment.providerId)}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center text-slate-700">
                              <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
                              <span className="font-medium">{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-slate-700">
                              <Clock className="h-4 w-4 mr-2 text-indigo-600" />
                              <span className="font-medium">{formatTime(appointment.appointmentDate.toString())}</span>
                            </div>
                            <div className="flex items-center text-slate-700">
                              <UserIcon className="h-4 w-4 mr-2 text-indigo-600" />
                              <span>{appointment.type || 'General Consultation'}</span>
                            </div>
                            {getVitalSignsForAppointment(appointment.id) && (
                              <div className="flex items-center text-emerald-700">
                                <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                                <span className="font-medium">Vitals Recorded</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {(user?.role === "doctor" || user?.role === "physician" || user?.role === "nurse" || user?.role === "tenant_admin" || user?.role === "super_admin") && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleViewDetails(appointment)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                        {(user?.role === "nurse" || user?.role === "receptionist" || user?.role === "tenant_admin" || user?.role === "super_admin") && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                            onClick={() => handleUpdateStatus(appointment)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Update
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                            <DropdownMenuItem onClick={() => handleViewDetails(appointment)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(appointment)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Update Status
                            </DropdownMenuItem>
                            {(user?.role === "receptionist" || user?.role === "nurse" || user?.role === "tenant_admin" || user?.role === "super_admin") && (
                              <DropdownMenuItem onClick={() => handleVitalSigns(appointment)}>
                                <Activity className="h-4 w-4 mr-2" />
                                Record Vital Signs
                              </DropdownMenuItem>
                            )}
                            {(user?.role === "doctor" || user?.role === "physician" || user?.role === "nurse" || user?.role === "tenant_admin" || user?.role === "super_admin") && (
                              <DropdownMenuItem onClick={() => handleVisitSummary(appointment)}>
                                <FileText className="h-4 w-4 mr-2" />
                                {appointment.status === "checked_in" || appointment.status === "in_progress" 
                                  ? "Complete Consultation" 
                                  : "Visit Summary"
                                }
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                              const appointmentText = `Appointment: ${getPatientName(appointment.patientId)}\nProvider: ${getProviderName(appointment.providerId)}\nDate: ${new Date(appointment.appointmentDate).toLocaleDateString()}\nTime: ${formatTime(appointment.appointmentDate.toString())}\nType: ${appointment.type}\nStatus: ${appointment.status}`;
                              navigator.clipboard.writeText(appointmentText);
                              toast({
                                title: "Copied to clipboard",
                                description: "Appointment details copied successfully"
                              });
                            }}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Details
                            </DropdownMenuItem>
                            {(user?.role === "tenant_admin" || user?.role === "super_admin") && appointment.status === 'scheduled' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => {
                                    if (confirm('Are you sure you want to cancel this appointment?')) {
                                      console.log('Cancel appointment:', appointment.id);
                                      toast({
                                        title: "Appointment cancelled",
                                        description: "The appointment has been cancelled successfully"
                                      });
                                    }
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Cancel Appointment
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
        }
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

              {/* Vital Signs Information */}
              {(() => {
                const vitalSigns = getVitalSignsForAppointment(selectedAppointment.id);
                return vitalSigns ? (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      Vital Signs
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {vitalSigns.systolicBp && vitalSigns.diastolicBp && (
                        <div>
                          <Label className="text-green-700">Blood Pressure</Label>
                          <p className="font-medium">{vitalSigns.systolicBp}/{vitalSigns.diastolicBp} mmHg</p>
                        </div>
                      )}
                      {vitalSigns.heartRate && (
                        <div>
                          <Label className="text-green-700">Heart Rate</Label>
                          <p className="font-medium">{vitalSigns.heartRate} bpm</p>
                        </div>
                      )}
                      {vitalSigns.temperature && (
                        <div>
                          <Label className="text-green-700">Temperature</Label>
                          <p className="font-medium">{vitalSigns.temperature}°F</p>
                        </div>
                      )}
                      {vitalSigns.oxygenSaturation && (
                        <div>
                          <Label className="text-green-700">Oxygen Saturation</Label>
                          <p className="font-medium">{vitalSigns.oxygenSaturation}%</p>
                        </div>
                      )}
                      {vitalSigns.weight && (
                        <div>
                          <Label className="text-green-700">Weight</Label>
                          <p className="font-medium">{vitalSigns.weight} kg</p>
                        </div>
                      )}
                      {vitalSigns.height && (
                        <div>
                          <Label className="text-green-700">Height</Label>
                          <p className="font-medium">{vitalSigns.height} cm</p>
                        </div>
                      )}
                      {vitalSigns.weight && vitalSigns.height && (
                        <div>
                          <Label className="text-green-700">BMI</Label>
                          <p className="font-medium">
                            {(() => {
                              const weightKg = parseFloat(vitalSigns.weight);
                              const heightM = parseFloat(vitalSigns.height) / 100;
                              const bmi = weightKg / (heightM * heightM);
                              return Math.round(bmi * 10) / 10;
                            })()}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-xs text-green-600">
                      Recorded on {vitalSigns.recordedAt ? new Date(vitalSigns.recordedAt).toLocaleString() : 'Unknown'}
                    </div>
                  </div>
                ) : null;
              })()}

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
          vitalSignsId={getVitalSignsForAppointment(selectedAppointment.id)?.id}
          existingVisitSummary={existingVisitSummary}
        />
      )}
      </div>
    </div>
  );
}
