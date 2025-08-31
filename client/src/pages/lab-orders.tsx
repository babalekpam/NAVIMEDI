import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TestTube, Plus, Search, Filter, MoreHorizontal, AlertCircle, CheckCircle, FileText, Calendar, User, Edit, Trash2, Copy, Download, Share } from "lucide-react";
import { LabOrder, Patient, LabResult } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { LabOrderForm } from "@/components/forms/lab-order-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const statusColors = {
  ordered: "bg-blue-100 text-blue-800",
  collected: "bg-yellow-100 text-yellow-800",
  processing: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const priorityColors = {
  routine: "bg-gray-100 text-gray-800",
  urgent: "bg-yellow-100 text-yellow-800",
  stat: "bg-red-100 text-red-800",
};

const labCompletionSchema = z.object({
  result: z.string().min(1, "Result is required"),
  normalRange: z.string().optional(),
  unit: z.string().optional(),
  abnormalFlag: z.enum(["normal", "high", "low", "critical"]).default("normal"),
  notes: z.string().optional(),
  performedBy: z.string().min(1, "Performed by is required"),
});

type LabCompletionForm = z.infer<typeof labCompletionSchema>;

export default function LabOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLabOrder, setSelectedLabOrder] = useState<LabOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [completionLabOrder, setCompletionLabOrder] = useState<LabOrder | null>(null);
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const completionForm = useForm<LabCompletionForm>({
    resolver: zodResolver(labCompletionSchema),
    defaultValues: {
      result: "",
      normalRange: "",
      unit: "",
      abnormalFlag: "normal",
      notes: "",
      performedBy: "",
    },
  });

  // Check if patient was selected from Quick Actions in medical records
  useEffect(() => {
    const selectedPatientInfo = localStorage.getItem('selectedPatientForLabOrder');
    if (selectedPatientInfo) {
      setIsFormOpen(true);
      // Clear the stored patient info after using it
      localStorage.removeItem('selectedPatientForLabOrder');
    }
  }, []);

  const { data: labOrders = [], isLoading } = useQuery<LabOrder[]>({
    queryKey: tenant?.type === 'laboratory' 
      ? ["/api/lab-orders", { forLaboratory: 'true', archived: statusFilter === 'archived' ? 'true' : 'false' }] 
      : ["/api/lab-orders", { archived: statusFilter === 'archived' ? 'true' : 'false' }],
    queryFn: async () => {
      const { apiRequest } = await import("@/lib/queryClient");
      const params = new URLSearchParams();
      if (tenant?.type === 'laboratory') {
        params.append('forLaboratory', 'true');
      }
      if (statusFilter === 'archived') {
        params.append('archived', 'true');
      }
      const url = `/api/lab-orders?${params.toString()}`;
      console.log(`[LAB ORDERS] Fetching ${statusFilter === 'archived' ? 'archived' : 'active'} orders for ${tenant?.type} using URL:`, url);
      const response = await apiRequest("GET", url);
      return response;
    },
    enabled: !!user && !!tenant,
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: !!user && !!tenant,
  });

  const { data: labResults = [] } = useQuery<LabResult[]>({
    queryKey: ["/api/lab-results"],
    enabled: !!user && !!tenant,
  });

  const createLabOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Create a single lab order (simplified)
      const order = data.orders[0];
      const labOrderData = {
        patientId: data.patientId,
        labTenantId: data.laboratoryId,
        testName: order.testName,
        testCode: order.testCode || '',
        instructions: order.instructions || '',
        priority: order.priority || 'routine',
      };

      const response = await fetch("/api/lab-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(labOrderData),
        credentials: "include",
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 100)}`);
      }

      return JSON.parse(responseText);
    },
    onSuccess: (result) => {
      console.log("Lab order(s) created successfully:", result);
      queryClient.invalidateQueries({ queryKey: ["/api/lab-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lab-order-assignments"] });
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: Array.isArray(result) 
          ? `${result.length} lab order(s) created successfully` 
          : "Lab order created successfully",
      });
    },
    onError: (error: any) => {
      console.error("Lab order creation failed:", error);
      toast({
        title: "Error",
        description: `Lab order failed: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  const handleCompleteLabOrder = (labOrder: LabOrder) => {
    setCompletionLabOrder(labOrder);
    completionForm.reset({
      result: "",
      normalRange: "",
      unit: "",
      abnormalFlag: "normal",
      notes: "",
      performedBy: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
    });
    setIsCompleteDialogOpen(true);
  };

  const completeLabMutation = useMutation({
    mutationFn: async (data: LabCompletionForm) => {
      if (!completionLabOrder) throw new Error("No lab order selected");
      
      const { apiRequest } = await import("@/lib/queryClient");
      
      const labResultData = {
        labOrderId: completionLabOrder.id,
        laboratoryId: tenant?.id, // Current laboratory tenant ID
        patientId: completionLabOrder.patientId,
        testName: completionLabOrder.testName,
        result: data.result,
        normalRange: data.normalRange || undefined,
        unit: data.unit || undefined,
        abnormalFlag: data.abnormalFlag,
        notes: data.notes || undefined,
        performedBy: data.performedBy,
        status: 'completed',
      };
      
      console.log("Completing lab order with data:", labResultData);
      
      return await apiRequest("POST", "/api/lab-results", labResultData);
    },
    onSuccess: (result) => {
      console.log("Lab order completed successfully:", result);
      
      // Check for achievement information in response
      let toastDescription = `Results posted for ${completionLabOrder?.testName}. Order status updated to completed and results are now visible in patient portal.`;
      
      if (result.achievements?.newAchievements?.length > 0) {
        const achievementTitles = result.achievements.newAchievements.map((a: any) => a.achievement.title).join(', ');
        toastDescription += ` 🏆 Achievement unlocked: ${achievementTitles}!`;
      }
      
      toast({
        title: result.achievements?.newAchievements?.length > 0 ? "Lab Completed - Achievement Unlocked!" : "Lab Completed Successfully",
        description: toastDescription,
        variant: "default",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/lab-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lab-results"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity-logs"] });
      setIsCompleteDialogOpen(false);
      setCompletionLabOrder(null);
      completionForm.reset();
    },
    onError: (error: any) => {
      console.error("Lab completion failed:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      // Try to extract more detailed error information
      let errorMessage = error.message || "Failed to complete lab order. Please try again.";
      if (error.errors && Array.isArray(error.errors)) {
        errorMessage = `Validation errors: ${error.errors.map((e: any) => `${e.path?.join('.')}: ${e.message}`).join(', ')}`;
      }
      
      toast({
        title: "Lab Completion Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const onCompleteSubmit = (data: LabCompletionForm) => {
    completeLabMutation.mutate(data);
  };

  const filteredLabOrders = labOrders.filter(labOrder => {
    const patient = patients.find(p => p.id === labOrder.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "";
    const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         labOrder.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (labOrder.testCode && labOrder.testCode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || labOrder.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || labOrder.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient ${patientId.slice(-4)}`;
  };

  const sortedLabOrders = filteredLabOrders.sort((a, b) => {
    // Sort by priority (stat > urgent > routine) then by order date
    const priorityOrder = { stat: 3, urgent: 2, routine: 1 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return new Date(b.orderedDate || '').getTime() - new Date(a.orderedDate || '').getTime();
  });

  if (!user || !tenant) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laboratory Orders</h1>
          <p className="text-gray-600 mt-1">Manage lab orders and results</p>
        </div>
        {(user.role === "physician" || user.role === "nurse") && (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Order Lab Tests
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Order Lab Tests</DialogTitle>
              </DialogHeader>
              <LabOrderForm
                onSubmit={(data) => createLabOrderMutation.mutate(data)}
                isLoading={createLabOrderMutation.isPending}
                patients={patients}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
              <Input
                placeholder="Search by patient, test name, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Active</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="archived">View Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="stat">STAT</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lab Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="h-5 w-5 mr-2" />
            Laboratory Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4 py-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedLabOrders.length === 0 ? (
            <div className="text-center py-12">
              <TestTube className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lab orders found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? "No lab orders match your search criteria" : "No lab orders have been created yet"}
              </p>
              {(user.role === "physician" || user.role === "nurse") && (
                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Order Lab Test
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-0">
              {sortedLabOrders.map((labOrder) => (
                <div 
                  key={labOrder.id}
                  className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        labOrder.status === 'completed' ? 'bg-green-50' : 
                        labOrder.priority === 'stat' ? 'bg-red-50' :
                        labOrder.priority === 'urgent' ? 'bg-yellow-50' : 
                        'bg-blue-50'
                      }`}>
                        {labOrder.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : labOrder.priority === 'stat' ? (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        ) : labOrder.priority === 'urgent' ? (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        ) : (
                          <TestTube className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {labOrder.testName}
                        </p>
                        {labOrder.testCode && (
                          <Badge variant="outline" className="text-xs">
                            {labOrder.testCode}
                          </Badge>
                        )}
                        <Badge 
                          variant="secondary"
                          className={priorityColors[labOrder.priority as keyof typeof priorityColors] || priorityColors.routine}
                        >
                          {(labOrder.priority || 'routine').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Patient: {getPatientName(labOrder.patientId)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Ordered: {new Date(labOrder.orderedDate || '').toLocaleDateString()}
                      </p>
                      {labOrder.instructions && (
                        <p className="text-xs text-gray-600 mt-1 max-w-md truncate">
                          Instructions: {labOrder.instructions}
                        </p>
                      )}
                      {labOrder.resultDate && (
                        <p className="text-xs text-green-600 mt-1">
                          Results available: {new Date(labOrder.resultDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Badge 
                        variant="secondary"
                        className={statusColors[labOrder.status as keyof typeof statusColors] || statusColors.ordered}
                      >
                        {(labOrder.status || 'ordered').replace('_', ' ')}
                      </Badge>
                      {labOrder.results && (
                        <p className="text-xs text-green-600 mt-1">
                          Results Available
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => {
                          setSelectedLabOrder(labOrder);
                          setIsDetailsOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                      {labOrder.status === 'completed' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700"
                          onClick={() => {
                            setSelectedLabOrder(labOrder);
                            setIsResultsOpen(true);
                          }}
                        >
                          View Results
                        </Button>
                      )}
                      {tenant?.type === 'laboratory' && labOrder.status !== 'completed' && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="bg-green-600 text-white hover:bg-green-700"
                          onClick={() => handleCompleteLabOrder(labOrder)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete Lab
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedLabOrder(labOrder);
                            setIsDetailsOpen(true);
                          }}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {labOrder.status === 'completed' && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedLabOrder(labOrder);
                              setIsResultsOpen(true);
                            }}>
                              <Download className="h-4 w-4 mr-2" />
                              View Results
                            </DropdownMenuItem>
                          )}
                          {(user.role === "physician" || user.role === "tenant_admin") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                // Copy lab order details to clipboard
                                const orderText = `Lab Order: ${labOrder.testName}\nPatient: ${getPatientName(labOrder.patientId)}\nStatus: ${labOrder.status}\nOrdered: ${new Date(labOrder.orderedDate || '').toLocaleDateString()}`;
                                navigator.clipboard.writeText(orderText);
                              }}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                // Share lab order
                                if (navigator.share) {
                                  navigator.share({
                                    title: `Lab Order: ${labOrder.testName}`,
                                    text: `Lab order for ${getPatientName(labOrder.patientId)} - ${labOrder.testName}`,
                                  });
                                }
                              }}>
                                <Share className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                            </>
                          )}
                          {(user.role === "physician" || user.role === "tenant_admin") && labOrder.status === 'ordered' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  if (confirm('Are you sure you want to cancel this lab order?')) {
                                    // TODO: Implement cancel lab order functionality
                                    console.log('Cancel lab order:', labOrder.id);
                                  }
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Cancel Order
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
          )}
        </CardContent>
      </Card>

      {/* Lab Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <TestTube className="h-5 w-5 mr-2" />
              Lab Order Details
            </DialogTitle>
          </DialogHeader>
          {selectedLabOrder && (
            <div className="space-y-6">
              {/* Patient Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Patient Name</p>
                    <p className="font-medium">{getPatientName(selectedLabOrder.patientId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-medium">{new Date(selectedLabOrder.orderedDate || '').toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Test Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Test Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Test Name</p>
                    <p className="font-medium text-lg">{selectedLabOrder.testName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Test Code</p>
                    <p className="font-medium">{selectedLabOrder.testCode || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <Badge 
                      variant="secondary"
                      className={`${priorityColors[selectedLabOrder.priority as keyof typeof priorityColors] || priorityColors.routine} font-medium`}
                    >
                      {(selectedLabOrder.priority || 'routine').toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge 
                      variant="secondary"
                      className={`${statusColors[selectedLabOrder.status as keyof typeof statusColors] || statusColors.ordered} font-medium`}
                    >
                      {(selectedLabOrder.status || 'ordered').replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Clinical Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Clinical Information</h3>
                <div className="space-y-3">
                  {selectedLabOrder.clinicalHistory && (
                    <div>
                      <p className="text-sm text-gray-600">Clinical History</p>
                      <p className="text-gray-700">{selectedLabOrder.clinicalHistory}</p>
                    </div>
                  )}
                  {selectedLabOrder.instructions && (
                    <div>
                      <p className="text-sm text-gray-600">Special Instructions</p>
                      <p className="text-gray-700">{selectedLabOrder.instructions}</p>
                    </div>
                  )}
                  {selectedLabOrder.diagnosis && (
                    <div>
                      <p className="text-sm text-gray-600">Provisional Diagnosis</p>
                      <p className="text-gray-700">{selectedLabOrder.diagnosis}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ordering Information */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Ordering Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Ordering Physician</p>
                    <p className="font-medium">{selectedLabOrder.orderingPhysician || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-mono text-sm text-gray-600">{selectedLabOrder.id.slice(-8)}</p>
                  </div>
                  {selectedLabOrder.expectedDate && (
                    <div>
                      <p className="text-sm text-gray-600">Expected Completion</p>
                      <p className="font-medium">{new Date(selectedLabOrder.expectedDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedLabOrder.resultDate && (
                    <div>
                      <p className="text-sm text-gray-600">Results Available</p>
                      <p className="font-medium text-green-600">{new Date(selectedLabOrder.resultDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
                {selectedLabOrder.status === 'completed' && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setIsDetailsOpen(false);
                      setIsResultsOpen(true);
                    }}
                  >
                    View Results
                  </Button>
                )}
                {user.role === "lab_technician" && selectedLabOrder.status !== 'completed' && (
                  <Button variant="outline">
                    Update Status
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lab Results Dialog */}
      <Dialog open={isResultsOpen} onOpenChange={setIsResultsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Laboratory Results - {selectedLabOrder?.testName}
            </DialogTitle>
          </DialogHeader>
          {selectedLabOrder && (
            <div className="space-y-6">
              {/* Patient & Test Header */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Patient</p>
                    <p className="font-medium">{getPatientName(selectedLabOrder.patientId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Test Ordered</p>
                    <p className="font-medium">{selectedLabOrder.testName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="font-medium">{selectedLabOrder.resultDate ? new Date(selectedLabOrder.resultDate).toLocaleDateString() : 'Pending'}</p>
                  </div>
                </div>
              </div>

              {/* Lab Results */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Test Results</h3>
                {labResults
                  .filter(result => result.labOrderId === selectedLabOrder.id)
                  .map((result, index) => (
                    <div key={result.id} className="border rounded-lg overflow-hidden">
                      <div className={`p-4 ${
                        result.abnormalFlag === 'critical' ? 'bg-red-50 border-l-4 border-l-red-500' :
                        result.abnormalFlag === 'high' ? 'bg-orange-50 border-l-4 border-l-orange-500' :
                        result.abnormalFlag === 'low' ? 'bg-yellow-50 border-l-4 border-l-yellow-500' :
                        'bg-green-50 border-l-4 border-l-green-500'
                      }`}>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Test Component</p>
                            <p className="font-medium">{result.testName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Result</p>
                            <p className={`font-bold text-lg ${
                              result.abnormalFlag === 'critical' ? 'text-red-600' :
                              result.abnormalFlag === 'high' ? 'text-orange-600' :
                              result.abnormalFlag === 'low' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {result.result} {result.unit && <span className="text-sm font-normal text-gray-600">({result.unit})</span>}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Reference Range</p>
                            <p className="font-medium text-gray-700">{result.normalRange || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Flag</p>
                            <Badge 
                              variant="secondary"
                              className={
                                result.abnormalFlag === 'critical' ? 'bg-red-100 text-red-800' :
                                result.abnormalFlag === 'high' ? 'bg-orange-100 text-orange-800' :
                                result.abnormalFlag === 'low' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }
                            >
                              {result.abnormalFlag?.toUpperCase() || 'NORMAL'}
                            </Badge>
                          </div>
                        </div>
                        {result.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">Notes</p>
                            <p className="text-gray-700">{result.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                {labResults.filter(result => result.labOrderId === selectedLabOrder.id).length === 0 && (
                  <div className="text-center py-8">
                    <TestTube className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Available</h3>
                    <p className="text-gray-600">Lab results are not yet available for this order.</p>
                  </div>
                )}
              </div>

              {/* Laboratory Information */}
              {labResults.filter(result => result.labOrderId === selectedLabOrder.id).length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Laboratory Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Performed By</p>
                      <p className="font-medium">{labResults.find(r => r.labOrderId === selectedLabOrder.id)?.performedBy || 'Lab Technician'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Completed At</p>
                      <p className="font-medium">{labResults.find(r => r.labOrderId === selectedLabOrder.id)?.completedAt ? new Date(labResults.find(r => r.labOrderId === selectedLabOrder.id)!.completedAt!).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsResultsOpen(false)}>
                  Close
                </Button>
                {labResults.filter(result => result.labOrderId === selectedLabOrder.id).length > 0 && (
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Print Report
                  </Button>
                )}
                {(user.role === "physician" || user.role === "nurse") && (
                  <Button variant="outline">
                    Add to Patient Notes
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lab Completion Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Complete Lab Order
            </DialogTitle>
          </DialogHeader>
          {completionLabOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Test Name</p>
                    <p className="font-medium">{completionLabOrder.testName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Patient</p>
                    <p className="font-medium">{getPatientName(completionLabOrder.patientId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-medium">{new Date(completionLabOrder.orderedDate || '').toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <Badge 
                      variant="secondary"
                      className={priorityColors[completionLabOrder.priority as keyof typeof priorityColors] || priorityColors.routine}
                    >
                      {(completionLabOrder.priority || 'routine').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Results Form */}
              <Form {...completionForm}>
                <form onSubmit={completionForm.handleSubmit(onCompleteSubmit)} className="space-y-4">
                  <FormField
                    control={completionForm.control}
                    name="result"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Result *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="95.5" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={completionForm.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="mg/dL" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={completionForm.control}
                      name="normalRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Normal Range</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="70-100 mg/dL" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={completionForm.control}
                    name="abnormalFlag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Result Flag</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select result flag" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={completionForm.control}
                    name="performedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Performed By *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Lab Technician Name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={completionForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinical Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Additional clinical notes or observations..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCompleteDialogOpen(false)}
                      disabled={completeLabMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-green-600 hover:bg-green-700"
                      disabled={completeLabMutation.isPending}
                    >
                      {completeLabMutation.isPending ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Completing Lab...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Lab & Post Results
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
