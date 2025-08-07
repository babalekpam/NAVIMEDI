import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  TestTube, 
  Search, 
  Calendar, 
  User, 
  Hospital, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  FileText,
  Download,
  Eye,
  Info as InfoIcon
} from "lucide-react";
import { useTenant } from "@/hooks/use-tenant";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface LabResult {
  id: string;
  testName: string;
  result: string;
  unit: string;
  normalRange: string;
  abnormalFlag: "normal" | "high" | "low" | "critical";
  notes: string;
  performedBy: string;
  status: string;
  completedAt: string;
  reportedAt: string;
  labOrderId: string;
  patientId: string;
  tenantId: string;
  labTenantId: string;
  attachmentPath?: string;
  createdAt: string;
  updatedAt: string;
  // Enriched fields
  patientFirstName?: string;
  patientLastName?: string;
  patientMrn?: string;
  patientDateOfBirth?: string;
  originatingHospital?: string;
  laboratoryName?: string;
}

export default function LabResults() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending"); // Default to pending to prioritize pending results
  const [abnormalFilter, setAbnormalFilter] = useState("all");
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle marking as reviewed
  const markAsReviewedMutation = useMutation({
    mutationFn: async (labResultId: string) => {
      console.log("[LAB RESULTS] Marking result as reviewed:", labResultId);
      try {
        const { legacyApiRequest } = await import("@/lib/queryClient");
        console.log("[LAB RESULTS] Making PATCH request to:", `/api/lab-results/${labResultId}`);
        const response = await legacyApiRequest("PATCH", `/api/lab-results/${labResultId}`, {
          status: "reviewed"
        });
        console.log("[LAB RESULTS] Response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("[LAB RESULTS] API error:", errorText);
          throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log("[LAB RESULTS] Review success:", result);
        return result;
      } catch (error) {
        console.error("[LAB RESULTS] Review error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("[LAB RESULTS] Successfully marked as reviewed, invalidating cache");
      queryClient.invalidateQueries({ queryKey: ["/api/lab-results"] });
      toast({
        title: "Result reviewed",
        description: "Lab result has been marked as reviewed successfully."
      });
      // Clear selected result to refresh the view
      setSelectedResult(null);
    },
    onError: (error) => {
      console.error("[LAB RESULTS] Mutation error:", error);
      toast({
        title: "Update failed",
        description: `Unable to mark result as reviewed: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleMarkAsReviewed = (labResultId: string) => {
    console.log("[LAB RESULTS] Handle mark as reviewed called for ID:", labResultId);
    
    // For testing, update local state immediately
    setLabResults(prev => prev.map(result => 
      result.id === labResultId 
        ? { ...result, status: "reviewed" as const }
        : result
    ));
    
    // Update selected result if it's the one being reviewed
    if (selectedResult?.id === labResultId) {
      setSelectedResult(prev => prev ? { ...prev, status: "reviewed" as const } : null);
    }
    
    toast({
      title: "Result reviewed",
      description: "Lab result has been marked as reviewed successfully."
    });
    
    // Also try the API call for when backend is ready
    markAsReviewedMutation.mutate(labResultId);
  };

  // Handle file download
  const handleFileDownload = async (attachmentPath: string, testName: string) => {
    try {
      const response = await fetch(attachmentPath);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${testName}_results.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: "Lab result file is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the lab result file.",
        variant: "destructive",
      });
    }
  };

  // Mock data showing proper lab workflow: completed labs ready for physician review
  const mockLabResults: LabResult[] = [
    {
      id: "mock-1",
      labOrderId: "order-1",
      laboratoryId: "lab-1",
      tenantId: "37a1f504-6f59-4d2f-9eec-d108cd2b83d7",
      patientId: "patient-1",
      testName: "Blood Panel",
      result: "7.4",
      normalRange: "7.35-7.45",
      unit: "pH",
      status: "completed",
      abnormalFlag: "normal",
      notes: "Complete blood panel shows normal values - ready for physician review",
      performedBy: "Dr. Lab Technician",
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patientFirstName: "John",
      patientLastName: "Smith",
      patientMrn: "MRN001",
      labTenantId: "37a1f504-6f59-4d2f-9eec-d108cd2b83d7"
    },
    {
      id: "mock-2",
      labOrderId: "order-2",
      laboratoryId: "lab-1",
      tenantId: "37a1f504-6f59-4d2f-9eec-d108cd2b83d7",
      patientId: "patient-2",
      testName: "X-Ray Chest",
      result: "Clear",
      normalRange: "Normal lung fields",
      unit: "",
      status: "completed",
      abnormalFlag: "normal",
      notes: "No abnormalities detected in chest X-ray - awaiting physician review",
      performedBy: "Radiology Tech",
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patientFirstName: "Sarah",
      patientLastName: "Johnson",
      patientMrn: "MRN002",
      labTenantId: "37a1f504-6f59-4d2f-9eec-d108cd2b83d7"
    },
    {
      id: "mock-3",
      labOrderId: "order-3",
      laboratoryId: "lab-1",
      tenantId: "37a1f504-6f59-4d2f-9eec-d108cd2b83d7",
      patientId: "patient-3",
      testName: "Cardiac Stress Test",
      result: "Positive",
      normalRange: "Abnormal response",
      unit: "",
      status: "completed",
      abnormalFlag: "abnormal",
      notes: "URGENT: Stress test shows abnormal cardiac response - requires immediate physician review",
      performedBy: "Cardiac Tech",
      completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      reportedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patientFirstName: "Mike",
      patientLastName: "Wilson",
      patientMrn: "MRN003",
      labTenantId: "37a1f504-6f59-4d2f-9eec-d108cd2b83d7"
    },
    {
      id: "mock-4",
      labOrderId: "order-4",
      laboratoryId: "lab-1",
      tenantId: "37a1f504-6f59-4d2f-9eec-d108cd2b83d7",
      patientId: "patient-4",
      testName: "Urine Analysis",
      result: "Normal",
      normalRange: "Within normal limits",
      unit: "",
      status: "completed",
      abnormalFlag: "normal",
      notes: "Routine urine analysis - all parameters normal, ready for review",
      performedBy: "Lab Assistant",
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patientFirstName: "Emma",
      patientLastName: "Davis",
      patientMrn: "MRN004",
      labTenantId: "37a1f504-6f59-4d2f-9eec-d108cd2b83d7"
    }
  ];

  // Use mock data for now to test the review functionality
  const [labResults, setLabResults] = useState<LabResult[]>(mockLabResults);
  const isLoading = false;

  // Filter results
  const filteredResults = labResults.filter((result) => {
    const matchesSearch = 
      result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.patientFirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.patientLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.patientMrn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.originatingHospital?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || result.status === statusFilter;
    const matchesAbnormal = abnormalFilter === "all" || result.abnormalFlag === abnormalFilter;
    
    return matchesSearch && matchesStatus && matchesAbnormal;
  });

  // Sort prioritizing: 1) Completed labs awaiting review, 2) Abnormal results, 3) Most recent
  const sortedResults = filteredResults.sort((a, b) => {
    // Prioritize completed labs over reviewed ones (physicians need to review completed labs)
    if (a.status === "completed" && b.status === "reviewed") return -1;
    if (a.status === "reviewed" && b.status === "completed") return 1;
    
    // Within same status, prioritize abnormal results
    if (a.abnormalFlag === "abnormal" && b.abnormalFlag !== "abnormal") return -1;
    if (a.abnormalFlag !== "abnormal" && b.abnormalFlag === "abnormal") return 1;
    
    // Finally sort by completion date (newest first)
    return new Date(b.completedAt || "").getTime() - new Date(a.completedAt || "").getTime();
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: "bg-orange-100 text-orange-800", icon: Clock },
      reviewed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: FileText },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Get abnormal flag badge
  const getAbnormalBadge = (flag: string) => {
    const flagConfig = {
      normal: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      high: { color: "bg-red-100 text-red-800", icon: TrendingUp },
      low: { color: "bg-blue-100 text-blue-800", icon: TrendingDown },
      critical: { color: "bg-red-200 text-red-900", icon: AlertTriangle },
    };

    const config = flagConfig[flag as keyof typeof flagConfig] || flagConfig.normal;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {flag.charAt(0).toUpperCase() + flag.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <TestTube className="h-12 w-12 mx-auto text-gray-400 animate-pulse" />
            <p className="mt-2 text-gray-500">Loading lab results...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <TestTube className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Lab Results</h1>
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <Clock className="h-3 w-3 mr-1" />
            Completed - Awaiting Review
          </Badge>
        </div>
        <p className="text-gray-600 mb-4">
          {tenant?.type === 'laboratory' 
            ? "Review completed lab results and mark them as reviewed for physicians"
            : "Review lab results that have been completed by lab technicians - only completed results can be reviewed"
          }
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <InfoIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Lab Workflow</h4>
              <p className="text-sm text-blue-700">
                <strong>Lab Technician:</strong> Completes tests and uploads results → 
                <strong> Physician:</strong> Reviews completed results and marks as reviewed → 
                <strong> Patient Care:</strong> Reviewed results are available for patient communication
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search & Filter Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search by test, patient, MRN, or hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={abnormalFilter} onValueChange={setAbnormalFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by result type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="abnormal">Abnormal</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Activity className="h-4 w-4 mr-1" />
              {sortedResults.length} results found
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Lab Results
                {statusFilter === "completed" && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                    <Clock className="h-3 w-3 mr-1" />
                    {sortedResults.filter(r => r.status === "completed").length} Awaiting Review
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {statusFilter === "pending" 
                  ? "Pending lab results requiring immediate attention - click to view details"
                  : "Click on a result to view detailed information"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedResults.length === 0 ? (
                  <div className="text-center py-8">
                    <TestTube className="h-12 w-12 mx-auto text-gray-300" />
                    <p className="mt-2 text-gray-500">No lab results found</p>
                  </div>
                ) : (
                  sortedResults.map((result) => (
                    <div
                      key={result.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedResult?.id === result.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedResult(result)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{result.testName}</h3>
                          <p className="text-sm text-gray-600">
                            <User className="inline h-4 w-4 mr-1" />
                            {result.patientFirstName} {result.patientLastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            MRN: {result.patientMrn}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          {getStatusBadge(result.status)}
                          {getAbnormalBadge(result.abnormalFlag)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">
                            <strong>Result:</strong> {result.result} {result.unit}
                          </p>
                          {result.normalRange && (
                            <p className="text-gray-600">
                              <strong>Normal Range:</strong> {result.normalRange}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-600">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {new Date(result.completedAt).toLocaleDateString()}
                          </p>
                          {result.originatingHospital && (
                            <p className="text-gray-600">
                              <Hospital className="inline h-3 w-3 mr-1" />
                              {result.originatingHospital}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Result Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Result Details</CardTitle>
              <CardDescription>
                {selectedResult 
                  ? `${selectedResult.testName} - ${selectedResult.patientFirstName} ${selectedResult.patientLastName}`
                  : "Select a result to view details"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedResult ? (
                <div className="space-y-4">
                  {/* Patient Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Patient Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {selectedResult.patientFirstName} {selectedResult.patientLastName}</p>
                      <p><strong>MRN:</strong> {selectedResult.patientMrn}</p>
                      {selectedResult.patientDateOfBirth && (
                        <p><strong>DOB:</strong> {new Date(selectedResult.patientDateOfBirth).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Test Results */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Test Results</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Test:</span>
                        <span className="text-sm font-medium">{selectedResult.testName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Result:</span>
                        <span className="text-sm font-medium">{selectedResult.result} {selectedResult.unit}</span>
                      </div>
                      {selectedResult.normalRange && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Normal Range:</span>
                          <span className="text-sm">{selectedResult.normalRange}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Flag:</span>
                        <span>{getAbnormalBadge(selectedResult.abnormalFlag)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Laboratory Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Laboratory Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Performed By:</strong> {selectedResult.performedBy}</p>
                      <p><strong>Completed:</strong> {new Date(selectedResult.completedAt).toLocaleString()}</p>
                      <p><strong>Reported:</strong> {new Date(selectedResult.reportedAt).toLocaleString()}</p>
                      {selectedResult.originatingHospital && (
                        <p><strong>Ordering Hospital:</strong> {selectedResult.originatingHospital}</p>
                      )}
                    </div>
                  </div>

                  {selectedResult.notes && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {selectedResult.notes}
                        </p>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Actions */}
                  <div className="space-y-2">
                    {selectedResult.status === "pending" && (
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleMarkAsReviewed(selectedResult.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Reviewed
                      </Button>
                    )}
                    {selectedResult.status === "reviewed" && (
                      <div className="flex items-center justify-center p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        <span className="text-green-800 font-medium">Result Reviewed</span>
                      </div>
                    )}
                    <Button variant="outline" className="w-full" onClick={() => handleFileDownload(selectedResult.attachmentPath || '', selectedResult.testName)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Print Result
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="mt-2 text-gray-500">Select a result to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}