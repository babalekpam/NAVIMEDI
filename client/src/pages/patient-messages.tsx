import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Search, AlertCircle, Clock, Reply, Eye } from "lucide-react";
import { MedicalCommunication, Patient } from "@shared/schema";

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  normal: "bg-blue-100 text-blue-800", 
  high: "bg-yellow-100 text-yellow-800",
  urgent: "bg-orange-100 text-orange-800",
  emergency: "bg-red-100 text-red-800",
};

const typeColors = {
  medical_instruction: "bg-green-100 text-green-800",
  prescription_note: "bg-purple-100 text-purple-800",
  discharge_summary: "bg-indigo-100 text-indigo-800",
  appointment_reminder: "bg-cyan-100 text-cyan-800",
  lab_result: "bg-orange-100 text-orange-800",
  general_message: "bg-gray-100 text-gray-800",
  emergency_alert: "bg-red-100 text-red-800",
};

export default function PatientMessages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<MedicalCommunication | null>(null);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: communications = [], isLoading } = useQuery<MedicalCommunication[]>({
    queryKey: ["/api/medical-communications"],
    enabled: !!user,
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { apiRequest } = await import("@/lib/queryClient");
      const response = await apiRequest("PATCH", `/api/medical-communications/${id}`, { isRead: true });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-communications"] });
    }
  });

  // Filter only messages from patients
  const patientMessages = communications.filter(comm => comm.isFromPatient === true);

  const filteredMessages = patientMessages.filter(comm => {
    const patient = patients.find(p => p.id === comm.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "";
    
    const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comm.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comm.message?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "all" || comm.priority === priorityFilter;
    const matchesType = typeFilter === "all" || comm.type === typeFilter;
    
    return matchesSearch && matchesPriority && matchesType;
  });

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient ${patientId.slice(-4)}`;
  };

  const getPatientInfo = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient;
  };

  const unreadCount = patientMessages.filter(c => !c.isRead).length;
  const urgentCount = patientMessages.filter(c => c.priority === 'urgent' || c.priority === 'emergency').length;

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Messages</h1>
          <p className="text-gray-600 mt-1">Messages received from patients to their care team</p>
        </div>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {unreadCount} unread
            </Badge>
          )}
          {urgentCount > 0 && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              {urgentCount} urgent
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientMessages.length}</div>
            <p className="text-xs text-muted-foreground">From patients</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Messages</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search patient messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general_message">General Message</SelectItem>
                <SelectItem value="prescription_note">Prescription Question</SelectItem>
                <SelectItem value="appointment_reminder">Appointment Related</SelectItem>
                <SelectItem value="lab_result">Lab Results Question</SelectItem>
                <SelectItem value="medical_instruction">Medical Question</SelectItem>
                <SelectItem value="emergency_alert">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Patient Messages ({filteredMessages.length})
          </CardTitle>
          <p className="text-sm text-gray-600">Messages sent from patients - only visible to nurses and primary care doctors</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No patient messages found</p>
              <p className="text-sm text-gray-400 mt-2">
                {patientMessages.length === 0 
                  ? "No messages have been received from patients yet." 
                  : "No messages match your current filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((message) => {
                const patient = getPatientInfo(message.patientId);
                return (
                  <div
                    key={message.id}
                    className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !message.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                    }`}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.isRead) {
                        markAsReadMutation.mutate(message.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{getPatientName(message.patientId)}</h3>
                          {patient && (
                            <span className="text-xs text-gray-500">
                              ({patient.email})
                            </span>
                          )}
                          <Badge className={`text-xs ${priorityColors[message.priority as keyof typeof priorityColors] || priorityColors.normal}`}>
                            {message.priority}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${typeColors[message.type as keyof typeof typeColors] || typeColors.general_message}`}>
                            {message.type.replace('_', ' ')}
                          </Badge>
                          {!message.isRead && (
                            <Badge variant="destructive" className="text-xs">NEW</Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium mb-1">{message.subject}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                        <div className="flex items-center text-xs text-gray-400 gap-4 mt-2">
                          <span>{new Date(message.sentAt).toLocaleDateString()} at {new Date(message.sentAt).toLocaleTimeString()}</span>
                          {patient && patient.mrn && (
                            <span>MRN: {patient.mrn}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Reply className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                        <Eye className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Modal/Dialog would go here */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Message Details</h2>
                <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                  Close
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">From Patient:</label>
                  <p className="text-lg">{getPatientName(selectedMessage.patientId)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Subject:</label>
                  <p>{selectedMessage.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Message:</label>
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Priority:</label>
                    <Badge className={priorityColors[selectedMessage.priority as keyof typeof priorityColors]}>
                      {selectedMessage.priority}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Type:</label>
                    <Badge variant="outline" className={typeColors[selectedMessage.type as keyof typeof typeColors]}>
                      {selectedMessage.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Sent:</label>
                  <p>{new Date(selectedMessage.sentAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}