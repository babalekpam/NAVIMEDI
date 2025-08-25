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
import { 
  TestTube, 
  Plus, 
  Search, 
  Filter, 
  QrCode, 
  Thermometer, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  BarChart3,
  FileText,
  Users,
  Package,
  ScanLine,
  Calendar,
  Timer,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  ShieldCheck,
  Layers
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/contexts/tenant-context-fixed";
import { useTranslation } from "@/contexts/translation-context";
import { cn } from "@/lib/utils";

interface Sample {
  id: string;
  sampleId: string;
  patientId: string;
  patientName: string;
  sampleType: string;
  collectionDate: string;
  collectionTime: string;
  status: "received" | "processing" | "tested" | "completed" | "rejected";
  priority: "routine" | "urgent" | "stat";
  location: string;
  temperature: string;
  batchId?: string;
  testRequested: string[];
  collectedBy: string;
  notes?: string;
}

interface BatchProcess {
  id: string;
  batchId: string;
  testType: string;
  samplesCount: number;
  status: "pending" | "in_progress" | "completed";
  startedAt?: string;
  completedAt?: string;
  operator: string;
}

export default function LabSampleManagement() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [isNewSampleOpen, setIsNewSampleOpen] = useState(false);

  // Mock data for demonstration
  const mockSamples: Sample[] = [
    {
      id: "1",
      sampleId: "LAB-2025-001",
      patientId: "P001",
      patientName: "Sarah Johnson",
      sampleType: "Blood - Serum",
      collectionDate: "2025-08-25",
      collectionTime: "09:30",
      status: "received",
      priority: "routine",
      location: "Fridge A-1-3",
      temperature: "4°C",
      testRequested: ["CBC", "BMP", "Lipid Panel"],
      collectedBy: "Dr. Smith",
      notes: "Fasting sample"
    },
    {
      id: "2",
      sampleId: "LAB-2025-002",
      patientId: "P002",
      patientName: "Michael Davis",
      sampleType: "Urine",
      collectionDate: "2025-08-25",
      collectionTime: "10:15",
      status: "processing",
      priority: "urgent",
      location: "Room Temp R-2-7",
      temperature: "22°C",
      batchId: "BATCH-001",
      testRequested: ["Urinalysis", "Culture"],
      collectedBy: "Nurse Johnson"
    },
    {
      id: "3",
      sampleId: "LAB-2025-003",
      patientId: "P003",
      patientName: "Emily Chen",
      sampleType: "Blood - Plasma",
      collectionDate: "2025-08-25",
      collectionTime: "11:00",
      status: "tested",
      priority: "stat",
      location: "Freezer F-1-1",
      temperature: "-20°C",
      batchId: "BATCH-002",
      testRequested: ["PT/INR", "PTT"],
      collectedBy: "Dr. Wilson"
    }
  ];

  const mockBatches: BatchProcess[] = [
    {
      id: "1",
      batchId: "BATCH-001",
      testType: "Urinalysis",
      samplesCount: 15,
      status: "in_progress",
      startedAt: "2025-08-25 08:00",
      operator: "Tech Williams"
    },
    {
      id: "2",
      batchId: "BATCH-002",
      testType: "Coagulation",
      samplesCount: 8,
      status: "completed",
      startedAt: "2025-08-25 07:30",
      completedAt: "2025-08-25 10:45",
      operator: "Tech Brown"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received": return "bg-blue-100 text-blue-800";
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "tested": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
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

  const filteredSamples = mockSamples.filter(sample => {
    const matchesSearch = sample.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sample.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || sample.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6" data-testid="lab-sample-management">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <TestTube className="h-8 w-8 mr-3 text-purple-600" />
            Sample Management
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive sample tracking and management system
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsNewSampleOpen(true)}
            data-testid="button-new-sample"
          >
            <Plus className="h-4 w-4 mr-2" />
            Register Sample
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Samples</p>
                <p className="text-3xl font-bold text-gray-900">1,247</p>
                <p className="text-xs text-green-600 mt-1">+23 today</p>
              </div>
              <TestTube className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Processing</p>
                <p className="text-3xl font-bold text-yellow-600">47</p>
                <p className="text-xs text-yellow-600 mt-1">5 urgent</p>
              </div>
              <RefreshCw className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-3xl font-bold text-green-600">89</p>
                <p className="text-xs text-green-600 mt-1">Above target</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage Capacity</p>
                <p className="text-3xl font-bold text-blue-600">78%</p>
                <p className="text-xs text-blue-600 mt-1">348/450 slots</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="samples" className="space-y-6">
        <TabsList>
          <TabsTrigger value="samples" className="flex items-center">
            <TestTube className="w-4 h-4 mr-2" />
            Sample Registry
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center">
            <ScanLine className="w-4 h-4 mr-2" />
            Sample Tracking
          </TabsTrigger>
          <TabsTrigger value="batches" className="flex items-center">
            <Layers className="w-4 h-4 mr-2" />
            Batch Processing
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Storage Locations
          </TabsTrigger>
          <TabsTrigger value="custody" className="flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Chain of Custody
          </TabsTrigger>
        </TabsList>

        {/* Sample Registry Tab */}
        <TabsContent value="samples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sample Registry</CardTitle>
              <CardDescription>View and manage all laboratory samples</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by Sample ID or Patient Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-samples"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="tested">Tested</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sample Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sample ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Sample Type</TableHead>
                      <TableHead>Collection</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSamples.map((sample) => (
                      <TableRow key={sample.id} data-testid={`row-sample-${sample.id}`}>
                        <TableCell className="font-medium">{sample.sampleId}</TableCell>
                        <TableCell>{sample.patientName}</TableCell>
                        <TableCell>{sample.sampleType}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{sample.collectionDate}</div>
                            <div className="text-gray-500">{sample.collectionTime}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(sample.status)}>
                            {sample.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(sample.priority)}>
                            {sample.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {sample.location}
                            </div>
                            <div className="flex items-center text-gray-500">
                              <Thermometer className="h-3 w-3 mr-1" />
                              {sample.temperature}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedSample(sample)}
                              data-testid={`button-view-${sample.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-edit-${sample.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-qr-${sample.id}`}
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
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

        {/* Sample Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Sample Tracking</CardTitle>
              <CardDescription>Track sample location and status in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* QR Code Scanner */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">QR Code Scanner</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Scan sample QR code to track location</p>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <ScanLine className="h-4 w-4 mr-2" />
                      Start Scanning
                    </Button>
                  </div>
                </div>

                {/* Recent Tracking Events */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Tracking Events</h3>
                  <div className="space-y-3">
                    {[
                      { time: "2:30 PM", event: "Sample LAB-2025-001 moved to Fridge A-1-3", operator: "Tech Johnson" },
                      { time: "2:15 PM", event: "Sample LAB-2025-002 started processing", operator: "Tech Williams" },
                      { time: "1:45 PM", event: "Sample LAB-2025-003 testing completed", operator: "Tech Brown" }
                    ].map((event, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{event.event}</div>
                          <div className="text-xs text-gray-500">{event.time} • {event.operator}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batch Processing Tab */}
        <TabsContent value="batches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Processing</CardTitle>
              <CardDescription>Manage and monitor batch processing operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Create New Batch */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Active Batches</h3>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Batch
                  </Button>
                </div>

                {/* Batch List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mockBatches.map((batch) => (
                    <Card key={batch.id} className="border-l-4 border-purple-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg">{batch.batchId}</h4>
                            <p className="text-gray-600">{batch.testType}</p>
                          </div>
                          <Badge className={batch.status === "completed" ? "bg-green-100 text-green-800" : 
                                          batch.status === "in_progress" ? "bg-blue-100 text-blue-800" : 
                                          "bg-gray-100 text-gray-800"}>
                            {batch.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Samples:</span>
                            <span className="font-medium">{batch.samplesCount}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Operator:</span>
                            <span className="font-medium">{batch.operator}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Started:</span>
                            <span className="font-medium">{batch.startedAt}</span>
                          </div>
                          {batch.completedAt && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Completed:</span>
                              <span className="font-medium">{batch.completedAt}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {batch.status === "in_progress" && (
                            <Button variant="outline" size="sm">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Locations Tab */}
        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Location Management</CardTitle>
              <CardDescription>Monitor and manage sample storage locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Refrigerated Storage */}
                <Card className="border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Thermometer className="h-5 w-5 mr-2 text-blue-600" />
                      Refrigerated (2-8°C)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Capacity:</span>
                        <span className="font-medium">156/200</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: "78%"}}></div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600">Available Sections:</div>
                        <div className="text-xs">Fridge A: 23/50 • Fridge B: 31/50</div>
                        <div className="text-xs">Fridge C: 44/50 • Fridge D: 58/50</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Frozen Storage */}
                <Card className="border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Thermometer className="h-5 w-5 mr-2 text-purple-600" />
                      Frozen (-20°C)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Capacity:</span>
                        <span className="font-medium">89/150</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: "59%"}}></div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600">Available Sections:</div>
                        <div className="text-xs">Freezer F-1: 23/50 • Freezer F-2: 31/50</div>
                        <div className="text-xs">Freezer F-3: 35/50</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Room Temperature */}
                <Card className="border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Thermometer className="h-5 w-5 mr-2 text-green-600" />
                      Room Temp (18-25°C)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Capacity:</span>
                        <span className="font-medium">67/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: "67%"}}></div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600">Available Sections:</div>
                        <div className="text-xs">Room R-1: 23/50 • Room R-2: 44/50</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chain of Custody Tab */}
        <TabsContent value="custody" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chain of Custody</CardTitle>
              <CardDescription>Complete audit trail for sample handling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Search Sample */}
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter Sample ID to view custody chain..."
                      className="w-full"
                    />
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>

                {/* Sample Custody Timeline */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Custody Chain: LAB-2025-001</h3>
                  <div className="space-y-4">
                    {[
                      { 
                        time: "Aug 25, 2025 - 9:30 AM", 
                        action: "Sample Collected", 
                        person: "Dr. Smith", 
                        location: "Collection Room A",
                        signature: "✓ Verified"
                      },
                      { 
                        time: "Aug 25, 2025 - 9:45 AM", 
                        action: "Sample Received", 
                        person: "Tech Johnson", 
                        location: "Lab Reception",
                        signature: "✓ Verified"
                      },
                      { 
                        time: "Aug 25, 2025 - 10:00 AM", 
                        action: "Sample Processed", 
                        person: "Tech Williams", 
                        location: "Processing Station 3",
                        signature: "✓ Verified"
                      },
                      { 
                        time: "Aug 25, 2025 - 10:30 AM", 
                        action: "Sample Stored", 
                        person: "Tech Johnson", 
                        location: "Fridge A-1-3",
                        signature: "✓ Verified"
                      }
                    ].map((event, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-lg border">
                        <div className="flex-shrink-0">
                          <div className="w-3 h-3 bg-purple-600 rounded-full mt-2"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{event.action}</h4>
                              <p className="text-sm text-gray-600">{event.time}</p>
                              <p className="text-sm text-gray-600">
                                {event.person} • {event.location}
                              </p>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                              {event.signature}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sample Details Dialog */}
      <Dialog open={!!selectedSample} onOpenChange={() => setSelectedSample(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sample Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedSample?.sampleId}
            </DialogDescription>
          </DialogHeader>
          {selectedSample && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Sample ID</Label>
                  <p className="text-sm text-gray-900">{selectedSample.sampleId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Patient</Label>
                  <p className="text-sm text-gray-900">{selectedSample.patientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Sample Type</Label>
                  <p className="text-sm text-gray-900">{selectedSample.sampleType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Collection Date</Label>
                  <p className="text-sm text-gray-900">{selectedSample.collectionDate} at {selectedSample.collectionTime}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedSample.status)}>
                    {selectedSample.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={getPriorityColor(selectedSample.priority)}>
                    {selectedSample.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Storage Location</Label>
                  <p className="text-sm text-gray-900">{selectedSample.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Temperature</Label>
                  <p className="text-sm text-gray-900">{selectedSample.temperature}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Tests Requested</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedSample.testRequested.map((test, index) => (
                    <Badge key={index} variant="outline">{test}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Collected By</Label>
                <p className="text-sm text-gray-900">{selectedSample.collectedBy}</p>
              </div>
              {selectedSample.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-gray-900">{selectedSample.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSample(null)}>
              Close
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Edit Sample
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Sample Registration Dialog */}
      <Dialog open={isNewSampleOpen} onOpenChange={setIsNewSampleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Register New Sample</DialogTitle>
            <DialogDescription>
              Enter sample information for registration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient-name">Patient Name</Label>
                <Input id="patient-name" placeholder="Enter patient name" />
              </div>
              <div>
                <Label htmlFor="patient-id">Patient ID</Label>
                <Input id="patient-id" placeholder="Enter patient ID" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sample-type">Sample Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sample type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blood-serum">Blood - Serum</SelectItem>
                    <SelectItem value="blood-plasma">Blood - Plasma</SelectItem>
                    <SelectItem value="urine">Urine</SelectItem>
                    <SelectItem value="stool">Stool</SelectItem>
                    <SelectItem value="saliva">Saliva</SelectItem>
                    <SelectItem value="swab">Swab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="stat">STAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="tests">Tests Requested</Label>
              <Textarea id="tests" placeholder="Enter requested tests (one per line)" />
            </div>
            <div>
              <Label htmlFor="notes">Collection Notes</Label>
              <Textarea id="notes" placeholder="Enter any special notes or instructions" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewSampleOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Register Sample
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}