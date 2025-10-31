import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Edit, Eye, FileText, Printer, Download, Save, CheckCircle, Filter
} from "lucide-react";
import { format } from "date-fns";

// Mock Reports Data
const mockReports = [
  {
    id: "report-1",
    studyId: "study-1",
    patientName: "John Doe",
    patientId: "PT001",
    studyDescription: "CT Chest with Contrast",
    reportDate: "2025-01-15T14:30:00",
    reportedBy: "Dr. Sarah Smith",
    status: "final",
    priority: "routine",
    clinicalIndication: "Persistent cough and chest pain",
    technique: "CT chest performed with IV contrast using helical technique",
    findings: "The lungs are clear without focal consolidation, mass, or nodule. No pleural effusion or pneumothorax. The heart size is normal. No mediastinal or hilar lymphadenopathy. The visualized upper abdomen is unremarkable.",
    impression: "Normal chest CT. No acute cardiopulmonary abnormality.",
    recommendations: "Clinical correlation recommended. Follow-up as clinically indicated.",
    keyImages: ["Image 1/125", "Image 45/125", "Image 89/125"]
  },
  {
    id: "report-2",
    studyId: "study-2",
    patientName: "Jane Smith",
    patientId: "PT002",
    studyDescription: "MRI Brain without Contrast",
    reportDate: "2025-01-14T16:45:00",
    reportedBy: "Dr. Michael Johnson",
    status: "preliminary",
    priority: "urgent",
    clinicalIndication: "Headache and dizziness",
    technique: "MRI brain performed without contrast using standard sequences",
    findings: "Brain parenchyma demonstrates normal signal intensity. No abnormal enhancement. Ventricles and sulci are normal in size and configuration. No mass effect or midline shift. Posterior fossa structures are unremarkable.",
    impression: "Normal MRI brain. No acute intracranial abnormality.",
    recommendations: "Recommend clinical correlation and follow-up imaging in 6 months if symptoms persist.",
    keyImages: ["Image 12/180", "Image 90/180"]
  },
  {
    id: "report-3",
    studyId: "study-3",
    patientName: "Robert Johnson",
    patientId: "PT003",
    studyDescription: "X-Ray Chest PA and Lateral",
    reportDate: "2025-01-13T10:15:00",
    reportedBy: "Dr. Sarah Smith",
    status: "final",
    priority: "routine",
    clinicalIndication: "Pre-operative evaluation",
    technique: "PA and lateral chest radiographs",
    findings: "The heart size is within normal limits. The lungs are clear. No pleural effusion. No pneumothorax. Osseous structures are intact.",
    impression: "Normal chest radiograph.",
    recommendations: "No further imaging needed at this time.",
    keyImages: ["Image 1/2", "Image 2/2"]
  },
  {
    id: "report-4",
    studyId: "study-4",
    patientName: "Emily Davis",
    patientId: "PT004",
    studyDescription: "Ultrasound Abdomen Complete",
    reportDate: "2025-01-12T11:30:00",
    reportedBy: "Dr. Robert Lee",
    status: "draft",
    priority: "routine",
    clinicalIndication: "Abdominal pain",
    technique: "Transabdominal ultrasound examination",
    findings: "The liver demonstrates normal echogenicity and size. No focal hepatic lesion. The gallbladder is normal without stones or wall thickening. The common bile duct measures 4mm. The pancreas is partially visualized and appears normal. Both kidneys are normal in size and echogenicity.",
    impression: "Normal abdominal ultrasound.",
    recommendations: "Clinical correlation recommended.",
    keyImages: ["Image 10/35", "Image 20/35"]
  },
  {
    id: "report-5",
    studyId: "study-5",
    patientName: "Michael Brown",
    patientId: "PT005",
    studyDescription: "CT Abdomen and Pelvis with Contrast",
    reportDate: "2025-01-11T15:00:00",
    reportedBy: "Dr. Sarah Smith",
    status: "final",
    priority: "stat",
    clinicalIndication: "Acute abdominal pain",
    technique: "CT abdomen and pelvis with IV contrast using arterial, portal venous, and delayed phases",
    findings: "The liver, spleen, pancreas, and adrenal glands are unremarkable. Both kidneys enhance symmetrically. No hydronephrosis or nephrolithiasis. The appendix is normal. No free fluid or free air. Bowel loops are normal.",
    impression: "No acute abdominal or pelvic abnormality.",
    recommendations: "Clinical correlation. Consider alternative diagnoses for abdominal pain.",
    keyImages: ["Image 50/220", "Image 100/220", "Image 150/220"]
  },
  {
    id: "report-6",
    studyId: "study-6",
    patientName: "Sarah Wilson",
    patientId: "PT006",
    studyDescription: "MRI Lumbar Spine",
    reportDate: "2025-01-10T09:20:00",
    reportedBy: "Dr. Michael Johnson",
    status: "preliminary",
    priority: "routine",
    clinicalIndication: "Lower back pain",
    technique: "MRI lumbar spine without contrast",
    findings: "The vertebral body heights are maintained. The conus medullaris terminates at L1-L2. Mild disc desiccation at L4-L5 and L5-S1 without significant disc bulge or herniation. No spinal canal stenosis. Facet joints are unremarkable.",
    impression: "Mild degenerative disc disease at L4-L5 and L5-S1. No significant disc herniation or stenosis.",
    recommendations: "Conservative management. Physical therapy as clinically indicated.",
    keyImages: ["Image 15/90", "Image 45/90"]
  },
  {
    id: "report-7",
    studyId: "study-8",
    patientName: "Lisa Anderson",
    patientId: "PT008",
    studyDescription: "CT Head without Contrast",
    reportDate: "2025-01-08T20:10:00",
    reportedBy: "Dr. Robert Lee",
    status: "final",
    priority: "stat",
    clinicalIndication: "Fall with head trauma",
    technique: "Non-contrast CT head",
    findings: "No acute intracranial hemorrhage. No mass effect or midline shift. The ventricles and sulci are normal. The gray-white differentiation is preserved. No fracture identified.",
    impression: "No acute intracranial abnormality.",
    recommendations: "Clinical correlation. Observation per standard head trauma protocol.",
    keyImages: ["Image 10/85", "Image 40/85"]
  },
  {
    id: "report-8",
    studyId: "study-7",
    patientName: "David Martinez",
    patientId: "PT007",
    studyDescription: "X-Ray Knee AP and Lateral",
    reportDate: "2025-01-09T13:45:00",
    reportedBy: "Dr. Sarah Smith",
    status: "draft",
    priority: "routine",
    clinicalIndication: "Knee pain after injury",
    technique: "AP and lateral radiographs of the knee",
    findings: "The bones are intact without fracture. Joint space is preserved. No significant joint effusion. Soft tissues are unremarkable.",
    impression: "No acute fracture or dislocation.",
    recommendations: "Consider MRI if symptoms persist to evaluate for ligamentous or meniscal injury.",
    keyImages: ["Image 1/2"]
  }
];

// Report templates
const reportTemplates = {
  ct_chest: {
    clinicalIndication: "Please specify clinical indication",
    technique: "CT chest performed with/without IV contrast using helical technique",
    findings: "The lungs... The heart... The mediastinum... The pleural spaces...",
    impression: "",
    recommendations: "Clinical correlation recommended."
  },
  mri_brain: {
    clinicalIndication: "Please specify clinical indication",
    technique: "MRI brain performed with/without contrast using standard sequences",
    findings: "Brain parenchyma... Ventricles... Posterior fossa...",
    impression: "",
    recommendations: "Clinical correlation recommended."
  },
  xray_chest: {
    clinicalIndication: "Please specify clinical indication",
    technique: "PA and lateral chest radiographs",
    findings: "The heart size... The lungs... The pleural spaces... Osseous structures...",
    impression: "",
    recommendations: "No further imaging needed at this time."
  }
};

export default function RadiologyReports() {
  const { toast } = useToast();
  const [reports, setReports] = useState(mockReports);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);

  const [reportForm, setReportForm] = useState({
    clinicalIndication: "",
    technique: "",
    findings: "",
    impression: "",
    recommendations: ""
  });

  const filteredReports = reports.filter(report => {
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || report.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const handleCreateReport = () => {
    setEditingReport(null);
    setReportForm({
      clinicalIndication: "",
      technique: "",
      findings: "",
      impression: "",
      recommendations: ""
    });
    setIsEditorOpen(true);
  };

  const handleEditReport = (report: any) => {
    setEditingReport(report);
    setReportForm({
      clinicalIndication: report.clinicalIndication,
      technique: report.technique,
      findings: report.findings,
      impression: report.impression,
      recommendations: report.recommendations
    });
    setIsEditorOpen(true);
  };

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setIsViewerOpen(true);
  };

  const handleApplyTemplate = (templateKey: string) => {
    const template = reportTemplates[templateKey as keyof typeof reportTemplates];
    if (template) {
      setReportForm({
        ...reportForm,
        ...template
      });
      toast({
        title: "Template Applied",
        description: "Report template has been loaded.",
      });
    }
  };

  const handleSaveDraft = () => {
    if (editingReport) {
      setReports(reports.map(r => 
        r.id === editingReport.id 
          ? { ...r, ...reportForm, status: "draft" }
          : r
      ));
      toast({
        title: "Draft Saved",
        description: "Report has been saved as draft.",
      });
    } else {
      const newReport = {
        id: `report-${Date.now()}`,
        studyId: `study-${Date.now()}`,
        patientName: "New Patient",
        patientId: "PT999",
        studyDescription: "New Study",
        reportDate: new Date().toISOString(),
        reportedBy: "Current User",
        status: "draft",
        priority: "routine",
        keyImages: [],
        ...reportForm
      };
      setReports([...reports, newReport]);
      toast({
        title: "Report Created",
        description: "New report has been saved as draft.",
      });
    }
    setIsEditorOpen(false);
  };

  const handleFinalizeReport = () => {
    if (editingReport) {
      setReports(reports.map(r => 
        r.id === editingReport.id 
          ? { ...r, ...reportForm, status: "final" }
          : r
      ));
      toast({
        title: "Report Finalized",
        description: "Report has been finalized and signed.",
      });
      setIsEditorOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-500";
      case "preliminary": return "bg-yellow-500";
      case "final": return "bg-green-600";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "routine": return "bg-blue-500";
      case "urgent": return "bg-orange-500";
      case "stat": return "bg-red-600";
      default: return "bg-blue-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Radiology Reports</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage radiology reports</p>
          </div>
          <Button data-testid="button-create-report" onClick={handleCreateReport}>
            <Plus className="mr-2 h-4 w-4" />
            Create Report
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter" data-testid="select-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="preliminary">Preliminary</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority-filter">Priority</Label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger id="priority-filter" data-testid="select-priority-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="stat">STAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  data-testid="button-clear-filters" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setStatusFilter("all");
                    setPriorityFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Reports ({filteredReports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table data-testid="table-reports">
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Study</TableHead>
                    <TableHead>Report Date</TableHead>
                    <TableHead>Radiologist</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id} data-testid={`row-report-${report.id}`}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{report.patientName}</div>
                          <div className="text-xs text-gray-500">{report.patientId}</div>
                        </div>
                      </TableCell>
                      <TableCell>{report.studyDescription}</TableCell>
                      <TableCell>{format(new Date(report.reportDate), "MMM dd, yyyy HH:mm")}</TableCell>
                      <TableCell>{report.reportedBy}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(report.priority)}>
                          {report.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            data-testid={`button-view-${report.id}`}
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {report.status !== "final" && (
                            <Button
                              data-testid={`button-edit-${report.id}`}
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditReport(report)}
                            >
                              <Edit className="h-4 w-4" />
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

        {/* Report Editor Dialog */}
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent 
            data-testid="dialog-report-editor" 
            className="max-w-6xl max-h-[90vh] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle>
                {editingReport ? "Edit Report" : "Create New Report"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Study Images (Left Side) */}
              <div className="lg:col-span-1">
                <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Study Images</h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((idx) => (
                    <div key={idx} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <div className="text-gray-400 dark:text-gray-500 text-center">
                        <div className="text-3xl mb-1">🖼️</div>
                        <div className="text-xs">Image {idx}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Report Form (Right Side) */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <Label htmlFor="template">Quick Template</Label>
                  <Select onValueChange={handleApplyTemplate}>
                    <SelectTrigger id="template" data-testid="select-template">
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ct_chest">CT Chest Template</SelectItem>
                      <SelectItem value="mri_brain">MRI Brain Template</SelectItem>
                      <SelectItem value="xray_chest">X-Ray Chest Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="clinical-indication">Clinical Indication</Label>
                  <Textarea
                    id="clinical-indication"
                    data-testid="textarea-clinical-indication"
                    placeholder="Enter clinical indication..."
                    value={reportForm.clinicalIndication}
                    onChange={(e) => setReportForm({ ...reportForm, clinicalIndication: e.target.value })}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="technique">Technique</Label>
                  <Textarea
                    id="technique"
                    data-testid="textarea-technique"
                    placeholder="Enter technique..."
                    value={reportForm.technique}
                    onChange={(e) => setReportForm({ ...reportForm, technique: e.target.value })}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="findings">Findings</Label>
                  <Textarea
                    id="findings"
                    data-testid="textarea-findings"
                    placeholder="Enter findings..."
                    value={reportForm.findings}
                    onChange={(e) => setReportForm({ ...reportForm, findings: e.target.value })}
                    rows={6}
                  />
                </div>

                <div>
                  <Label htmlFor="impression">Impression</Label>
                  <Textarea
                    id="impression"
                    data-testid="textarea-impression"
                    placeholder="Enter impression..."
                    value={reportForm.impression}
                    onChange={(e) => setReportForm({ ...reportForm, impression: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="recommendations">Recommendations</Label>
                  <Textarea
                    id="recommendations"
                    data-testid="textarea-recommendations"
                    placeholder="Enter recommendations..."
                    value={reportForm.recommendations}
                    onChange={(e) => setReportForm({ ...reportForm, recommendations: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                data-testid="button-save-draft" 
                variant="outline" 
                onClick={handleSaveDraft}
              >
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
              <Button 
                data-testid="button-finalize-report" 
                onClick={handleFinalizeReport}
                disabled={!editingReport}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Finalize Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report Viewer Dialog */}
        <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
          <DialogContent 
            data-testid="dialog-report-viewer" 
            className="max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle>Radiology Report</DialogTitle>
            </DialogHeader>

            {selectedReport && (
              <div className="space-y-6">
                {/* Header Information */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Patient Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedReport.patientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Patient ID</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedReport.patientId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Study</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedReport.studyDescription}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Report Date</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {format(new Date(selectedReport.reportDate), "MMM dd, yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Images */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Key Images</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedReport.keyImages.map((img: string, idx: number) => (
                      <div key={idx} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <div className="text-gray-400 dark:text-gray-500 text-center">
                          <div className="text-2xl mb-1">🖼️</div>
                          <div className="text-xs">{img}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Report Sections */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">CLINICAL INDICATION:</h3>
                    <p className="text-gray-700 dark:text-gray-300">{selectedReport.clinicalIndication}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">TECHNIQUE:</h3>
                    <p className="text-gray-700 dark:text-gray-300">{selectedReport.technique}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">FINDINGS:</h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{selectedReport.findings}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">IMPRESSION:</h3>
                    <p className="text-gray-700 dark:text-gray-300">{selectedReport.impression}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">RECOMMENDATIONS:</h3>
                    <p className="text-gray-700 dark:text-gray-300">{selectedReport.recommendations}</p>
                  </div>
                </div>

                <Separator />

                {/* Signature */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Electronically signed by:</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedReport.reportedBy}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {format(new Date(selectedReport.reportDate), "MMMM dd, yyyy 'at' HH:mm")}
                  </p>
                  <div className="mt-2">
                    <Badge className={getStatusColor(selectedReport.status)}>
                      {selectedReport.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <Button data-testid="button-print-report" variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button data-testid="button-export-pdf" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export to PDF
                  </Button>
                  <Button data-testid="button-close-viewer" onClick={() => setIsViewerOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
