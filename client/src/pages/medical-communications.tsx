import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MessageSquare, 
  Search, 
  Eye, 
  AlertCircle, 
  Languages,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTenant } from "@/hooks/use-tenant";
import type { MedicalCommunication, Patient, SupportedLanguage } from "@shared/schema";
import { CommunicationForm } from "@/components/forms/communication-form";
import { CommunicationViewer } from "@/components/communication/communication-viewer";
import { LanguageManager } from "@/components/communication/language-manager";

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

export default function MedicalCommunications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState<MedicalCommunication | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all-messages");

  const { user } = useAuth();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

  const { data: communications = [], isLoading } = useQuery<MedicalCommunication[]>({
    queryKey: ["/api/medical-communications"],
    enabled: !!user && !!tenant,
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: !!user && !!tenant,
  });

  const { data: supportedLanguages = [] } = useQuery<SupportedLanguage[]>({
    queryKey: ["/api/supported-languages"],
    enabled: !!user && !!tenant,
  });

  const createCommunicationMutation = useMutation({
    mutationFn: async (data: any) => {
      const { apiRequest } = await import("@/lib/queryClient");
      const response = await apiRequest("POST", "/api/medical-communications", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-communications"] });
      setIsFormOpen(false);
    }
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

  const getFilteredMessages = (messagesList: MedicalCommunication[]) => {
    return messagesList.filter(comm => {
      const patient = patients.find(p => p.id === comm.patientId);
      const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "";
      
      const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           comm.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           comm.message?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === "all" || comm.priority === priorityFilter;
      const matchesType = typeFilter === "all" || comm.type === typeFilter;
      const matchesLanguage = languageFilter === "all" || comm.originalLanguage === languageFilter;
      
      return matchesSearch && matchesPriority && matchesType && matchesLanguage;
    });
  };
  
  const filteredMessages = getFilteredMessages(communications);

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient";
  };

  const unreadCount = communications.filter(comm => !comm.isRead).length;
  const urgentCount = communications.filter(comm => 
    comm.priority === "urgent" || comm.priority === "emergency"
  ).length;

  if (!user || !tenant) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Communications</h1>
          <p className="text-gray-600 mt-1">Unified patient and provider communication interface</p>
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
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <MessageSquare className="h-4 w-4 mr-2" />
                New Communication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Medical Communication</DialogTitle>
              </DialogHeader>
              <CommunicationForm
                onSubmit={createCommunicationMutation.mutate}
                isLoading={createCommunicationMutation.isPending}
                patients={patients}
                supportedLanguages={supportedLanguages}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="inline-flex h-12 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground w-full max-w-2xl">
          <TabsTrigger value="all-messages">
            <MessageSquare className="h-4 w-4 mr-2" />
            All Messages ({filteredMessages.length})
          </TabsTrigger>
          <TabsTrigger value="languages">
            <Languages className="h-4 w-4 mr-2" />
            Language Settings
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Clock className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-messages" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search communications..."
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
                    <SelectItem value="medical_instruction">Medical Instructions</SelectItem>
                    <SelectItem value="prescription_note">Prescription Notes</SelectItem>
                    <SelectItem value="discharge_summary">Discharge Summary</SelectItem>
                    <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
                    <SelectItem value="lab_result">Lab Results</SelectItem>
                    <SelectItem value="general_message">General Message</SelectItem>
                    <SelectItem value="emergency_alert">Emergency Alert</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {supportedLanguages.map((lang) => (
                      <SelectItem key={lang.languageCode} value={lang.languageCode}>
                        {lang.languageName} ({lang.nativeName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* All Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Medical Communications
              </CardTitle>
              <p className="text-sm text-gray-600">All messages between patients and healthcare providers</p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No messages found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMessages.map((comm) => (
                    <div
                      key={comm.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedCommunication(comm);
                        setIsViewerOpen(true);
                        if (!comm.isRead) {
                          markAsReadMutation.mutate(comm.id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{getPatientName(comm.patientId)}</h3>
                            <Badge className={`text-xs ${priorityColors[comm.priority as keyof typeof priorityColors] || priorityColors.normal}`}>
                              {comm.priority}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${typeColors[comm.type as keyof typeof typeColors] || typeColors.general_message}`}>
                              {comm.type}
                            </Badge>
                            {!comm.isRead && (
                              <Badge variant="destructive" className="text-xs">New</Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {comm.senderRole === 'patient' ? 'From Patient' : 'From Staff'}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mb-1">{comm.subject}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{comm.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(comm.sentAt).toLocaleDateString()} at {new Date(comm.sentAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <Eye className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages" className="space-y-6">
          <LanguageManager supportedLanguages={supportedLanguages} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Communication Analytics
              </CardTitle>
              <p className="text-sm text-gray-600">Statistics and insights about medical communications</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{communications.length}</div>
                  <p className="text-sm text-gray-500">Total Messages</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{communications.filter(c => c.isRead).length}</div>
                  <p className="text-sm text-gray-500">Read Messages</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{unreadCount}</div>
                  <p className="text-sm text-gray-500">Unread Messages</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{urgentCount}</div>
                  <p className="text-sm text-gray-500">Urgent/Emergency</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Communication Viewer Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Communication</DialogTitle>
          </DialogHeader>
          {selectedCommunication && (
            <CommunicationViewer
              communication={selectedCommunication}
              patients={patients}
              supportedLanguages={supportedLanguages}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}