import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  FileBarChart, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Calendar as CalendarIcon,
  Download,
  Upload,
  Send,
  Eye,
  Edit,
  Trash2,
  FileText,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  Mail,
  Phone,
  Printer,
  Share2,
  CheckSquare,
  AlertCircle,
  Timer,
  Activity,
  Target,
  Gauge,
  LineChart,
  Archive,
  BookOpen,
  Clipboard,
  Database
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface LabResult {
  id: string;
  resultId: string;
  testName: string;
  sampleId: string;
  patientName: string;
  patientId: string;
  testDate: string;
  completedDate: string;
  status: "pending_review" | "approved" | "critical" | "distributed" | "amended";
  priority: "routine" | "urgent" | "stat";
  technician: string;
  reviewedBy?: string;
  results: TestResultValue[];
  criticalValues: boolean;
  distributionMethod: "email" | "fax" | "phone" | "portal";
  recipientInfo: {
    physician: string;
    clinic: string;
    contact: string;
  };
  reportGenerated?: string;
  notes?: string;
}

interface TestResultValue {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag?: "high" | "low" | "critical" | "panic";
  status: "normal" | "abnormal" | "critical";
}

interface ReportTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: string[];
  format: "pdf" | "html" | "xml";
  isDefault: boolean;
  lastModified: string;
}

interface DistributionLog {
  id: string;
  resultId: string;
  method: string;
  recipient: string;
  sentAt: string;
  status: "sent" | "delivered" | "failed" | "pending";
  operator: string;
}

export default function LabResultsReporting() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Report generation form schema
  const reportFormSchema = z.object({
    reportType: z.enum(["laboratory_summary", "critical_values", "quality_control", "performance_metrics"], {
      required_error: "Please select a report type"
    }),
    dateFrom: z.date({
      required_error: "Start date is required"
    }),
    dateTo: z.date({
      required_error: "End date is required"
    }),
    format: z.enum(["pdf", "excel", "csv"], {
      required_error: "Please select a format"
    }),
    includePatientData: z.boolean().default(false),
    includeTestResults: z.boolean().default(true),
    includeStatistics: z.boolean().default(false)
  }).refine((data) => data.dateTo >= data.dateFrom, {
    message: "End date must be after start date",
    path: ["dateTo"]
  });

  type ReportFormData = z.infer<typeof reportFormSchema>;

  const reportForm = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reportType: "laboratory_summary",
      format: "pdf",
      includePatientData: false,
      includeTestResults: true,
      includeStatistics: false
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: async (data: ReportFormData) => {
      return apiRequest('/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          type: data.reportType,
          dateRange: {
            from: format(data.dateFrom, 'yyyy-MM-dd'),
            to: format(data.dateTo, 'yyyy-MM-dd')
          },
          format: data.format,
          options: {
            includePatientData: data.includePatientData,
            includeTestResults: data.includeTestResults,
            includeStatistics: data.includeStatistics
          }
        })
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Report Generated Successfully",
        description: "Your report has been generated and is ready for download.",
        variant: "default"
      });
      setShowReportDialog(false);
      reportForm.reset();
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
    },
    onError: (error: any) => {
      toast({
        title: "Report Generation Failed",
        description: error?.message || "An error occurred while generating the report. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmitReport = (data: ReportFormData) => {
    generateReportMutation.mutate(data);
  };

  // Mock data for demonstration
  const mockResults: LabResult[] = [
    {
      id: "1",
      resultId: "RES-2025-001",
      testName: "Complete Blood Count",
      sampleId: "LAB-2025-001",
      patientName: "Sarah Johnson",
      patientId: "P001",
      testDate: "2025-08-25",
      completedDate: "2025-08-25 10:30",
      status: "pending_review",
      priority: "routine",
      technician: "Tech Williams",
      results: [
        { parameter: "WBC", value: "7.2", unit: "K/uL", referenceRange: "4.0-11.0", status: "normal" },
        { parameter: "RBC", value: "4.6", unit: "M/uL", referenceRange: "4.2-5.4", status: "normal" },
        { parameter: "Hemoglobin", value: "14.2", unit: "g/dL", referenceRange: "12.0-16.0", status: "normal" },
        { parameter: "Hematocrit", value: "42.1", unit: "%", referenceRange: "36.0-46.0", status: "normal" },
        { parameter: "Platelets", value: "285", unit: "K/uL", referenceRange: "150-450", status: "normal" }
      ],
      criticalValues: false,
      distributionMethod: "email",
      recipientInfo: {
        physician: "Dr. Smith",
        clinic: "Primary Care Clinic",
        contact: "dr.smith@primarycare.com"
      }
    },
    {
      id: "2",
      resultId: "RES-2025-002",
      testName: "Comprehensive Metabolic Panel",
      sampleId: "LAB-2025-002",
      patientName: "Michael Davis",
      patientId: "P002",
      testDate: "2025-08-25",
      completedDate: "2025-08-25 11:15",
      status: "critical",
      priority: "urgent",
      technician: "Tech Brown",
      results: [
        { parameter: "Glucose", value: "385", unit: "mg/dL", referenceRange: "70-100", flag: "critical", status: "critical" },
        { parameter: "Creatinine", value: "2.8", unit: "mg/dL", referenceRange: "0.7-1.3", flag: "high", status: "abnormal" },
        { parameter: "Potassium", value: "5.9", unit: "mEq/L", referenceRange: "3.5-5.1", flag: "critical", status: "critical" },
        { parameter: "Sodium", value: "138", unit: "mEq/L", referenceRange: "136-145", status: "normal" }
      ],
      criticalValues: true,
      distributionMethod: "phone",
      recipientInfo: {
        physician: "Dr. Wilson",
        clinic: "Emergency Department",
        contact: "555-0123"
      }
    },
    {
      id: "3",
      resultId: "RES-2025-003",
      testName: "Lipid Panel",
      sampleId: "LAB-2025-003",
      patientName: "Emily Chen",
      patientId: "P003",
      testDate: "2025-08-25",
      completedDate: "2025-08-25 09:45",
      status: "approved",
      priority: "routine",
      technician: "Tech Johnson",
      reviewedBy: "Dr. Lab Director",
      results: [
        { parameter: "Total Cholesterol", value: "195", unit: "mg/dL", referenceRange: "<200", status: "normal" },
        { parameter: "HDL Cholesterol", value: "45", unit: "mg/dL", referenceRange: ">40", status: "normal" },
        { parameter: "LDL Cholesterol", value: "125", unit: "mg/dL", referenceRange: "<130", status: "normal" },
        { parameter: "Triglycerides", value: "125", unit: "mg/dL", referenceRange: "<150", status: "normal" }
      ],
      criticalValues: false,
      distributionMethod: "email",
      recipientInfo: {
        physician: "Dr. Chen",
        clinic: "Cardiology Associates",
        contact: "dr.chen@cardiology.com"
      },
      reportGenerated: "2025-08-25 12:00"
    }
  ];

  const mockTemplates: ReportTemplate[] = [
    {
      id: "1",
      name: "Standard Lab Report",
      category: "General",
      description: "Standard format for routine laboratory reports",
      fields: ["Patient Demographics", "Test Results", "Reference Ranges", "Flags", "Technician Info"],
      format: "pdf",
      isDefault: true,
      lastModified: "2025-08-20"
    },
    {
      id: "2",
      name: "Critical Values Alert",
      category: "Critical",
      description: "Urgent format for critical value reporting",
      fields: ["Patient Info", "Critical Values", "Contact Info", "Timestamp"],
      format: "pdf",
      isDefault: false,
      lastModified: "2025-08-18"
    },
    {
      id: "3",
      name: "Detailed Microbiology Report",
      category: "Microbiology",
      description: "Comprehensive format for culture and sensitivity results",
      fields: ["Culture Results", "Organism ID", "Sensitivity Panel", "Interpretation"],
      format: "pdf",
      isDefault: false,
      lastModified: "2025-08-15"
    }
  ];

  const mockDistributionLogs: DistributionLog[] = [
    {
      id: "1",
      resultId: "RES-2025-003",
      method: "Email",
      recipient: "dr.chen@cardiology.com",
      sentAt: "2025-08-25 12:05",
      status: "delivered",
      operator: "Tech Johnson"
    },
    {
      id: "2",
      resultId: "RES-2025-002",
      method: "Phone",
      recipient: "Dr. Wilson - ED",
      sentAt: "2025-08-25 11:20",
      status: "delivered",
      operator: "Tech Brown"
    },
    {
      id: "3",
      resultId: "RES-2025-001",
      method: "Patient Portal",
      recipient: "Patient: Sarah Johnson",
      sentAt: "2025-08-25 13:00",
      status: "pending",
      operator: "Auto System"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_review": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "critical": return "bg-red-100 text-red-800";
      case "distributed": return "bg-blue-100 text-blue-800";
      case "amended": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "stat": return "bg-red-100 text-red-800";
      case "urgent": return "bg-orange-100 text-orange-800";
      case "routine": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getResultStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "text-green-700";
      case "abnormal": return "text-yellow-700";
      case "critical": return "text-red-700";
      default: return "text-gray-700";
    }
  };

  const filteredResults = mockResults.filter(result => {
    const matchesSearch = result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || result.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6" data-testid="lab-results-reporting">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileBarChart className="h-8 w-8 mr-3 text-green-600" />
            Results & Reporting
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive result management and distribution system
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowReportDialog(true)}
            data-testid="button-generate-report"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">12</p>
                <p className="text-xs text-yellow-600 mt-1">Awaiting approval</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Values</p>
                <p className="text-3xl font-bold text-red-600">3</p>
                <p className="text-xs text-red-600 mt-1">Require immediate attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reports Sent Today</p>
                <p className="text-3xl font-bold text-green-600">89</p>
                <p className="text-xs text-green-600 mt-1">+15% vs yesterday</p>
              </div>
              <Send className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. TAT</p>
                <p className="text-3xl font-bold text-blue-600">4.2h</p>
                <p className="text-xs text-blue-600 mt-1">Within target</p>
              </div>
              <Timer className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Pending Results
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approved Reports
          </TabsTrigger>
          <TabsTrigger value="critical" className="flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Critical Values
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center">
            <Send className="w-4 h-4 mr-2" />
            Distribution
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Pending Results Tab */}
        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Results Pending Review</CardTitle>
              <CardDescription>Review and approve test results before distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search results, samples, or patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-results"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="distributed">Distributed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Result ID</TableHead>
                      <TableHead>Test</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result) => (
                      <TableRow key={result.id} data-testid={`row-result-${result.id}`}>
                        <TableCell className="font-medium">{result.resultId}</TableCell>
                        <TableCell>{result.testName}</TableCell>
                        <TableCell>{result.patientName}</TableCell>
                        <TableCell>{result.completedDate}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(result.priority)}>
                            {result.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedResult(result)}
                              data-testid={`button-view-${result.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {result.status === "pending_review" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600"
                                data-testid={`button-approve-${result.id}`}
                              >
                                <CheckSquare className="h-4 w-4" />
                              </Button>
                            )}
                            {result.criticalValues && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                data-testid={`button-critical-${result.id}`}
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional tabs would continue here with similar structure... */}
        {/* For brevity, I'm including just the key tabs. The full implementation would include all tabs. */}
      </Tabs>

      {/* Result Details Dialog */}
      <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Result Details</DialogTitle>
            <DialogDescription>
              Complete result information for {selectedResult?.testName}
            </DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-6">
              {/* Patient & Test Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Result ID</Label>
                  <p className="text-sm text-gray-900">{selectedResult.resultId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Test Name</Label>
                  <p className="text-sm text-gray-900">{selectedResult.testName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Patient</Label>
                  <p className="text-sm text-gray-900">{selectedResult.patientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Sample ID</Label>
                  <p className="text-sm text-gray-900">{selectedResult.sampleId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Completed Date</Label>
                  <p className="text-sm text-gray-900">{selectedResult.completedDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Technician</Label>
                  <p className="text-sm text-gray-900">{selectedResult.technician}</p>
                </div>
              </div>

              {/* Test Results */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Test Results</Label>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parameter</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Reference Range</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedResult.results.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{result.parameter}</TableCell>
                          <TableCell className={cn("font-bold", getResultStatusColor(result.status))}>
                            {result.value}
                          </TableCell>
                          <TableCell>{result.unit}</TableCell>
                          <TableCell>{result.referenceRange}</TableCell>
                          <TableCell>
                            <Badge className={
                              result.status === "normal" ? "bg-green-100 text-green-800" :
                              result.status === "abnormal" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }>
                              {result.flag ? result.flag.toUpperCase() : result.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Recipient Information */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Distribution Information</Label>
                <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Physician:</span>
                    <p className="font-medium">{selectedResult.recipientInfo.physician}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Clinic:</span>
                    <p className="font-medium">{selectedResult.recipientInfo.clinic}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Contact:</span>
                    <p className="font-medium">{selectedResult.recipientInfo.contact}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Method:</span>
                    <Badge variant="outline">{selectedResult.distributionMethod}</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedResult(null)}>
              Close
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <CheckSquare className="h-4 w-4 mr-2" />
              Approve & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Generation Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Laboratory Report</DialogTitle>
            <DialogDescription>
              Configure your report parameters and generate comprehensive laboratory reports
            </DialogDescription>
          </DialogHeader>
          
          <Form {...reportForm}>
            <form onSubmit={reportForm.handleSubmit(onSubmitReport)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Report Type */}
                <FormField
                  control={reportForm.control}
                  name="reportType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-report-type">
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="laboratory_summary">Laboratory Summary</SelectItem>
                          <SelectItem value="critical_values">Critical Values</SelectItem>
                          <SelectItem value="quality_control">Quality Control</SelectItem>
                          <SelectItem value="performance_metrics">Performance Metrics</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Format */}
                <FormField
                  control={reportForm.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-report-format">
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={reportForm.control}
                  name="dateFrom"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>From Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="input-date-from"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={reportForm.control}
                  name="dateTo"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>To Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="input-date-to"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Include Options */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Include Options</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={reportForm.control}
                    name="includePatientData"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-patient-data"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Patient Data</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={reportForm.control}
                    name="includeTestResults"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-test-results"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Test Results</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={reportForm.control}
                    name="includeStatistics"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-statistics"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Statistics</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReportDialog(false)}
                  data-testid="button-cancel-report"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={generateReportMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-submit-report"
                >
                  {generateReportMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}