import React, { useState } from "react";
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
import { 
  FlaskConical, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  PlayCircle, 
  PauseCircle, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Calendar,
  Timer,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  FileText,
  Target,
  Gauge,
  Activity,
  Users,
  CalendarClock,
  BarChart3,
  TrendingUp,
  Settings,
  Beaker,
  Microscope,
  Zap,
  ShieldCheck,
  AlertCircle,
  CheckSquare,
  Hourglass,
  FastForward
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/contexts/tenant-context-fixed";
import { useTranslation } from "@/contexts/translation-context";
import { cn } from "@/lib/utils";

interface Test {
  id: string;
  testId: string;
  testName: string;
  sampleId: string;
  patientName: string;
  priority: "routine" | "urgent" | "stat";
  status: "queued" | "in_progress" | "quality_check" | "completed" | "failed";
  assignedTo: string;
  protocol: string;
  startTime?: string;
  estimatedCompletion?: string;
  actualCompletion?: string;
  progress: number;
  qcStatus?: "pending" | "passed" | "failed";
  instrument?: string;
  method: string;
  requiredReagents: string[];
  notes?: string;
}

interface TestProtocol {
  id: string;
  name: string;
  category: string;
  description: string;
  steps: string[];
  estimatedTime: number; // in minutes
  requiredEquipment: string[];
  requiredReagents: string[];
  qualityControls: string[];
  sampleTypes: string[];
  methodology: string;
  lastUpdated: string;
  version: string;
  isActive: boolean;
}

interface QualityControl {
  id: string;
  testType: string;
  controlLevel: "low" | "normal" | "high";
  expectedResult: string;
  actualResult?: string;
  tolerance: string;
  status: "pending" | "in_range" | "out_of_range";
  runDate: string;
  operator: string;
  instrument: string;
  batchId?: string;
}

export default function LabTestManagement() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<TestProtocol | null>(null);

  // Mock data for demonstration
  const mockTests: Test[] = [
    {
      id: "1",
      testId: "TEST-2025-001",
      testName: "Complete Blood Count",
      sampleId: "LAB-2025-001",
      patientName: "Sarah Johnson",
      priority: "routine",
      status: "in_progress",
      assignedTo: "Tech Williams",
      protocol: "CBC-PROTOCOL-V2.1",
      startTime: "2025-08-25 09:00",
      estimatedCompletion: "2025-08-25 10:30",
      progress: 65,
      instrument: "Hematology Analyzer HA-1",
      method: "Flow Cytometry",
      requiredReagents: ["CBC Reagent Pack", "Diluent", "Lysing Solution"]
    },
    {
      id: "2",
      testId: "TEST-2025-002",
      testName: "Liver Function Panel",
      sampleId: "LAB-2025-002",
      patientName: "Michael Davis",
      priority: "urgent",
      status: "quality_check",
      assignedTo: "Tech Brown",
      protocol: "LFT-PROTOCOL-V1.8",
      startTime: "2025-08-25 08:30",
      actualCompletion: "2025-08-25 09:45",
      progress: 100,
      qcStatus: "pending",
      instrument: "Chemistry Analyzer CA-2",
      method: "Photometric Analysis",
      requiredReagents: ["ALT Reagent", "AST Reagent", "Bilirubin Reagent"]
    },
    {
      id: "3",
      testId: "TEST-2025-003",
      testName: "Urinalysis",
      sampleId: "LAB-2025-003",
      patientName: "Emily Chen",
      priority: "stat",
      status: "queued",
      assignedTo: "Tech Johnson",
      protocol: "UA-PROTOCOL-V3.0",
      progress: 0,
      instrument: "Urinalysis Analyzer UA-1",
      method: "Dipstick + Microscopy",
      requiredReagents: ["Urine Dipsticks", "Microscopy Stain"]
    }
  ];

  const mockProtocols: TestProtocol[] = [
    {
      id: "1",
      name: "Complete Blood Count (CBC)",
      category: "Hematology",
      description: "Comprehensive blood cell analysis including RBC, WBC, platelet count and differential",
      steps: [
        "Sample preparation and mixing",
        "Load sample into analyzer",
        "Run automated analysis",
        "Review results and flags",
        "Perform manual differential if needed",
        "Quality control verification",
        "Result validation and release"
      ],
      estimatedTime: 90,
      requiredEquipment: ["Hematology Analyzer", "Microscope", "Centrifuge"],
      requiredReagents: ["CBC Reagent Pack", "Diluent", "Lysing Solution", "Control Materials"],
      qualityControls: ["Low Control", "Normal Control", "High Control"],
      sampleTypes: ["Whole Blood - EDTA"],
      methodology: "Flow Cytometry with Impedance Technology",
      lastUpdated: "2025-08-20",
      version: "2.1",
      isActive: true
    },
    {
      id: "2",
      name: "Comprehensive Metabolic Panel",
      category: "Clinical Chemistry",
      description: "14-parameter chemistry panel including glucose, electrolytes, kidney and liver function",
      steps: [
        "Centrifuge sample to separate serum",
        "Load serum into chemistry analyzer",
        "Run automated chemistry panel",
        "Monitor reaction kinetics",
        "Review critical values",
        "Perform dilutions if needed",
        "Quality control verification",
        "Result review and validation"
      ],
      estimatedTime: 45,
      requiredEquipment: ["Chemistry Analyzer", "Centrifuge", "Pipettes"],
      requiredReagents: ["CMP Reagent Kit", "Calibrators", "Controls"],
      qualityControls: ["Level 1 Control", "Level 2 Control"],
      sampleTypes: ["Serum", "Plasma - Li Heparin"],
      methodology: "Photometric and ISE Analysis",
      lastUpdated: "2025-08-18",
      version: "1.8",
      isActive: true
    }
  ];

  const mockQualityControls: QualityControl[] = [
    {
      id: "1",
      testType: "Complete Blood Count",
      controlLevel: "normal",
      expectedResult: "WBC: 7.5 K/uL, RBC: 4.5 M/uL, Hgb: 14.0 g/dL",
      actualResult: "WBC: 7.2 K/uL, RBC: 4.6 M/uL, Hgb: 14.2 g/dL",
      tolerance: "±10%",
      status: "in_range",
      runDate: "2025-08-25 08:00",
      operator: "Tech Williams",
      instrument: "Hematology Analyzer HA-1"
    },
    {
      id: "2",
      testType: "Chemistry Panel",
      controlLevel: "high",
      expectedResult: "Glucose: 250 mg/dL, Creatinine: 2.0 mg/dL",
      actualResult: "Glucose: 248 mg/dL, Creatinine: 2.1 mg/dL",
      tolerance: "±5%",
      status: "in_range",
      runDate: "2025-08-25 07:30",
      operator: "Tech Brown",
      instrument: "Chemistry Analyzer CA-2"
    },
    {
      id: "3",
      testType: "Lipid Panel",
      controlLevel: "low",
      expectedResult: "Total Chol: 150 mg/dL, HDL: 35 mg/dL",
      tolerance: "±8%",
      status: "pending",
      runDate: "2025-08-25 09:15",
      operator: "Tech Johnson",
      instrument: "Chemistry Analyzer CA-1"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "queued": return "bg-gray-100 text-gray-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "quality_check": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "failed": return "bg-red-100 text-red-800";
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

  const getQcStatusColor = (status: string) => {
    switch (status) {
      case "in_range": return "bg-green-100 text-green-800";
      case "out_of_range": return "bg-red-100 text-red-800";
      case "pending": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTests = mockTests.filter(test => {
    const matchesSearch = test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || test.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6" data-testid="lab-test-management">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FlaskConical className="h-8 w-8 mr-3 text-blue-600" />
            Test Management
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive test processing and quality management system
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-new-test"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Test
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tests</p>
                <p className="text-3xl font-bold text-blue-600">23</p>
                <p className="text-xs text-blue-600 mt-1">8 in progress</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Queue</p>
                <p className="text-3xl font-bold text-orange-600">15</p>
                <p className="text-xs text-orange-600 mt-1">3 urgent</p>
              </div>
              <Hourglass className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">QC Pending</p>
                <p className="text-3xl font-bold text-yellow-600">7</p>
                <p className="text-xs text-yellow-600 mt-1">2 out of range</p>
              </div>
              <Target className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-3xl font-bold text-green-600">142</p>
                <p className="text-xs text-green-600 mt-1">+12% vs yesterday</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active" className="flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Active Tests
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center">
            <CalendarClock className="w-4 h-4 mr-2" />
            Test Queue
          </TabsTrigger>
          <TabsTrigger value="protocols" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Protocols
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Quality Control
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Validation
          </TabsTrigger>
        </TabsList>

        {/* Active Tests Tab */}
        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tests in Progress</CardTitle>
              <CardDescription>Monitor and manage active test processing</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search tests, samples, or patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-tests"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="queued">Queued</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="quality_check">Quality Check</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Test Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTests.map((test) => (
                  <Card key={test.id} className="border-l-4 border-blue-500" data-testid={`card-test-${test.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{test.testName}</h4>
                          <p className="text-gray-600">{test.sampleId} • {test.patientName}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getStatusColor(test.status)}>
                            {test.status}
                          </Badge>
                          <Badge className={getPriorityColor(test.priority)}>
                            {test.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      {test.status === "in_progress" && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm font-medium">{test.progress}%</span>
                          </div>
                          <Progress value={test.progress} className="h-2" />
                        </div>
                      )}
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Assigned to:</span>
                          <span className="font-medium">{test.assignedTo}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Instrument:</span>
                          <span className="font-medium">{test.instrument}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Method:</span>
                          <span className="font-medium">{test.method}</span>
                        </div>
                        {test.startTime && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Started:</span>
                            <span className="font-medium">{test.startTime}</span>
                          </div>
                        )}
                        {test.estimatedCompletion && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Est. Completion:</span>
                            <span className="font-medium">{test.estimatedCompletion}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTest(test)}
                          data-testid={`button-view-${test.id}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {test.status === "in_progress" && (
                          <Button variant="outline" size="sm">
                            <PauseCircle className="h-4 w-4 mr-2" />
                            Pause
                          </Button>
                        )}
                        {test.status === "queued" && (
                          <Button variant="outline" size="sm">
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Start
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Queue Tab */}
        <TabsContent value="queue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Queue & Scheduling</CardTitle>
              <CardDescription>Prioritize and schedule pending tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Queue Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600">STAT Tests</p>
                        <p className="text-2xl font-bold text-red-700">3</p>
                      </div>
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-600">Urgent Tests</p>
                        <p className="text-2xl font-bold text-orange-700">8</p>
                      </div>
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">Routine Tests</p>
                        <p className="text-2xl font-bold text-green-700">12</p>
                      </div>
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Queue Management */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Priority</TableHead>
                        <TableHead>Test</TableHead>
                        <TableHead>Sample</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Est. Duration</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTests.filter(t => t.status === "queued").map((test) => (
                        <TableRow key={test.id}>
                          <TableCell>
                            <Badge className={getPriorityColor(test.priority)}>
                              {test.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{test.testName}</TableCell>
                          <TableCell>{test.sampleId}</TableCell>
                          <TableCell>{test.patientName}</TableCell>
                          <TableCell>45 min</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Start
                              </Button>
                              <Button variant="outline" size="sm">
                                <FastForward className="h-4 w-4 mr-2" />
                                Priority
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Protocols Tab */}
        <TabsContent value="protocols" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Protocols & Methods</CardTitle>
              <CardDescription>Standardized testing procedures and protocols</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Protocol List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mockProtocols.map((protocol) => (
                    <Card key={protocol.id} className="border-l-4 border-green-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg">{protocol.name}</h4>
                            <p className="text-gray-600">{protocol.category} • Version {protocol.version}</p>
                          </div>
                          <Badge className={protocol.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {protocol.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-4">{protocol.description}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Methodology:</span>
                            <span className="font-medium">{protocol.methodology}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Est. Time:</span>
                            <span className="font-medium">{protocol.estimatedTime} min</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Steps:</span>
                            <span className="font-medium">{protocol.steps.length} steps</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Last Updated:</span>
                            <span className="font-medium">{protocol.lastUpdated}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedProtocol(protocol)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Protocol
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Control Tab */}
        <TabsContent value="quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Control Results</CardTitle>
              <CardDescription>Monitor and manage quality control testing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* QC Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">In Range</p>
                        <p className="text-2xl font-bold text-green-700">18</p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600">Out of Range</p>
                        <p className="text-2xl font-bold text-red-700">2</p>
                      </div>
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-gray-700">5</p>
                      </div>
                      <Hourglass className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                </div>

                {/* QC Results Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Type</TableHead>
                        <TableHead>Control Level</TableHead>
                        <TableHead>Expected</TableHead>
                        <TableHead>Actual</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Operator</TableHead>
                        <TableHead>Run Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockQualityControls.map((qc) => (
                        <TableRow key={qc.id}>
                          <TableCell className="font-medium">{qc.testType}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{qc.controlLevel}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{qc.expectedResult}</TableCell>
                          <TableCell className="text-sm">{qc.actualResult || "Pending"}</TableCell>
                          <TableCell>
                            <Badge className={getQcStatusColor(qc.status)}>
                              {qc.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{qc.operator}</TableCell>
                          <TableCell>{qc.runDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Validation Status</CardTitle>
              <CardDescription>Review and validate completed test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Validation Queue */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-yellow-800">7 Tests Pending Validation</h3>
                      <p className="text-sm text-yellow-700">Review and approve test results before release</p>
                    </div>
                  </div>
                </div>

                {/* Validation List */}
                <div className="space-y-4">
                  {mockTests.filter(t => t.status === "quality_check").map((test) => (
                    <Card key={test.id} className="border-l-4 border-yellow-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{test.testName}</h4>
                            <p className="text-sm text-gray-600">{test.sampleId} • {test.patientName}</p>
                            <p className="text-xs text-gray-500">Completed: {test.actualCompletion}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Pending Validation
                            </Badge>
                            <Button variant="outline" size="sm">
                              <CheckSquare className="h-4 w-4 mr-2" />
                              Validate
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Details Dialog */}
      <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Test Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedTest?.testName}
            </DialogDescription>
          </DialogHeader>
          {selectedTest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Test ID</Label>
                  <p className="text-sm text-gray-900">{selectedTest.testId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Test Name</Label>
                  <p className="text-sm text-gray-900">{selectedTest.testName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Sample ID</Label>
                  <p className="text-sm text-gray-900">{selectedTest.sampleId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Patient</Label>
                  <p className="text-sm text-gray-900">{selectedTest.patientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedTest.status)}>
                    {selectedTest.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={getPriorityColor(selectedTest.priority)}>
                    {selectedTest.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <p className="text-sm text-gray-900">{selectedTest.assignedTo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Instrument</Label>
                  <p className="text-sm text-gray-900">{selectedTest.instrument}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Required Reagents</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedTest.requiredReagents.map((reagent, index) => (
                    <Badge key={index} variant="outline">{reagent}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTest(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Protocol Details Dialog */}
      <Dialog open={!!selectedProtocol} onOpenChange={() => setSelectedProtocol(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Protocol Details</DialogTitle>
            <DialogDescription>
              {selectedProtocol?.name} - Version {selectedProtocol?.version}
            </DialogDescription>
          </DialogHeader>
          {selectedProtocol && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm text-gray-900">{selectedProtocol.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Methodology</Label>
                  <p className="text-sm text-gray-900">{selectedProtocol.methodology}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estimated Time</Label>
                  <p className="text-sm text-gray-900">{selectedProtocol.estimatedTime} minutes</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-gray-900">{selectedProtocol.lastUpdated}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-gray-700 mt-1">{selectedProtocol.description}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Protocol Steps</Label>
                <ol className="list-decimal list-inside space-y-2 mt-2">
                  {selectedProtocol.steps.map((step, index) => (
                    <li key={index} className="text-sm text-gray-700">{step}</li>
                  ))}
                </ol>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Required Equipment</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedProtocol.requiredEquipment.map((equipment, index) => (
                      <Badge key={index} variant="outline">{equipment}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Required Reagents</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedProtocol.requiredReagents.map((reagent, index) => (
                      <Badge key={index} variant="outline">{reagent}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProtocol(null)}>
              Close
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Use Protocol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}