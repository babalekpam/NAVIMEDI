import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  Download
} from "lucide-react";
import { useTenant } from "@/hooks/use-tenant";
import { useAuth } from "@/hooks/use-auth";

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [abnormalFilter, setAbnormalFilter] = useState("all");
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  
  const { user } = useAuth();
  const { tenant } = useTenant();

  // Fetch lab results based on user type
  const { data: labResults = [], isLoading } = useQuery<LabResult[]>({
    queryKey: ["/api/lab-results"],
    queryFn: async () => {
      const { apiRequest } = await import("@/lib/queryClient");
      const response = await apiRequest("GET", "/api/lab-results");
      return response.json();
    },
    enabled: !!user && !!tenant,
  });

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

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      reviewed: { color: "bg-blue-100 text-blue-800", icon: FileText },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
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
        <h1 className="text-3xl font-bold text-gray-900">Lab Results</h1>
        <p className="text-gray-600">
          {tenant?.type === 'laboratory' 
            ? "View and manage all lab results from your laboratory"
            : "View lab results for your organization's patients"
          }
        </p>
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
              {filteredResults.length} results found
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lab Results</CardTitle>
              <CardDescription>
                Click on a result to view detailed information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredResults.length === 0 ? (
                  <div className="text-center py-8">
                    <TestTube className="h-12 w-12 mx-auto text-gray-300" />
                    <p className="mt-2 text-gray-500">No lab results found</p>
                  </div>
                ) : (
                  filteredResults.map((result) => (
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
                    <Button variant="outline" className="w-full">
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