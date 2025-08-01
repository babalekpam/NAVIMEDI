import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  FileText, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  DollarSign,
  Pill,
  Users,
  BarChart3,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface PharmacyReportTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  reportType: string;
  dataFields: any;
  groupBy?: string[];
  orderBy?: string[];
  layoutConfig?: any;
  filters?: any;
  isScheduled?: boolean;
  scheduleFrequency?: string;
  scheduleTime?: string;
  lastGenerated?: string;
  isActive: boolean;
  isDefault?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface GeneratedReport {
  id: string;
  title: string;
  type: string;
  generatedAt: string;
  data: any;
}

const reportTypes = [
  { value: "sales", label: "Sales Report", icon: DollarSign, description: "Daily, weekly, monthly sales summaries" },
  { value: "prescription", label: "Prescription Report", icon: Pill, description: "Dispensed prescriptions and medications" },
  { value: "inventory", label: "Inventory Report", icon: BarChart3, description: "Stock levels and medication usage" },
  { value: "patient", label: "Patient Report", icon: Users, description: "Patient demographics and visit patterns" },
  { value: "insurance", label: "Insurance Report", icon: FileText, description: "Insurance claims and coverage analysis" },
];

export default function PharmacyReports() {
  const [selectedReportType, setSelectedReportType] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PharmacyReportTemplate | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for report templates
  const { data: templates = [], isLoading: templatesLoading, error: templatesError } = useQuery({
    queryKey: ["/api/pharmacy-report-templates"],
    retry: false,
  });

  // Query for active templates
  const { data: activeTemplates = [], error: activeTemplatesError } = useQuery({
    queryKey: ["/api/pharmacy-report-templates/active"],
    retry: false,
  });

  // Mutation to create/update report template
  const saveTemplateMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingTemplate) {
        return apiRequest(`/api/pharmacy-report-templates/${editingTemplate.id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      } else {
        return apiRequest("/api/pharmacy-report-templates", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pharmacy-report-templates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pharmacy-report-templates/active"] });
      setShowTemplateDialog(false);
      setEditingTemplate(null);
      toast({ 
        title: editingTemplate 
          ? "Report template updated successfully" 
          : "Report template created successfully" 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save report template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate report function
  const generateReport = async () => {
    if (!selectedReportType) {
      toast({
        title: "Report type required",
        description: "Please select a report type",
        variant: "destructive",
      });
      return;
    }

    setGeneratingReport(true);
    try {
      // This would call your report generation API
      const reportData = await apiRequest("/api/reports/generate", {
        method: "POST",
        body: JSON.stringify({
          type: selectedReportType,
          dateRange,
          templateId: activeTemplates.find(t => t.reportType === selectedReportType)?.id,
        }),
      });

      const newReport: GeneratedReport = {
        id: Date.now().toString(),
        title: `${reportTypes.find(t => t.value === selectedReportType)?.label} - ${format(new Date(), "PPP")}`,
        type: selectedReportType,
        generatedAt: new Date().toISOString(),
        data: reportData,
      };

      setGeneratedReports(prev => [newReport, ...prev]);
      
      toast({
        title: "Report generated successfully",
        description: "Your report is ready for viewing or download",
      });
    } catch (error: any) {
      toast({
        title: "Failed to generate report",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleSaveTemplate = (formData: FormData) => {
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      reportType: formData.get("reportType"),
      dataFields: JSON.parse(formData.get("dataFields") as string || "{}"),
      layoutConfig: JSON.parse(formData.get("layoutConfig") as string || "{}"),
      filters: JSON.parse(formData.get("filters") as string || "{}"),
      isActive: formData.get("isActive") === "true",
    };

    saveTemplateMutation.mutate(data);
  };

  const downloadReport = (report: GeneratedReport) => {
    // Convert report data to CSV or PDF format
    const csvContent = convertToCSV(report.data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${report.title.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (data: any) => {
    if (!data || !Array.isArray(data)) return "";
    
    const headers = Object.keys(data[0] || {}).join(",");
    const rows = data.map(row => Object.values(row).join(",")).join("\n");
    return `${headers}\n${rows}`;
  };

  // Check for permission errors
  const hasPermissionError = (templatesError as any)?.message?.includes("Insufficient permissions") || 
                             (activeTemplatesError as any)?.message?.includes("Insufficient permissions");

  if (hasPermissionError) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Pharmacy Reports</h1>
        
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-red-500">
                <FileText className="h-16 w-16 mx-auto mb-4" />
              </div>
              <h2 className="text-xl font-semibold">Access Restricted</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Pharmacy reports are only available to pharmacy staff. Please log in with a pharmacy account 
                (pharmacist, billing staff, or pharmacy admin) to access this feature.
              </p>
              <Button onClick={() => window.location.href = '/login'} className="mt-4">
                Switch to Pharmacy Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pharmacy Reports</h1>
        <Button onClick={() => setShowTemplateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Report Generation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Generate New Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedReportType === type.value
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedReportType(type.value)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">{type.label}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
            <Button 
              onClick={generateReport}
              disabled={generatingReport || !selectedReportType}
              className="px-8"
            >
              {generatingReport ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Reports */}
      {generatedReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generated Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generatedReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{report.title}</h3>
                    <p className="text-sm text-gray-600">
                      Generated: {format(new Date(report.generatedAt), "PPp")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" onClick={() => downloadReport(report)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {templatesLoading ? (
            <div>Loading templates...</div>
          ) : templates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template: PharmacyReportTemplate) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {reportTypes.find(t => t.value === template.reportType)?.label || template.reportType}
                      </Badge>
                    </TableCell>
                    <TableCell>{template.description || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={template.isActive ? "default" : "secondary"}>
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(template.createdAt), "PPp")}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingTemplate(template);
                            setShowTemplateDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-600">
              No report templates found. Create your first template to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit" : "Create"} Report Template
            </DialogTitle>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveTemplate(new FormData(e.currentTarget));
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Template Name*</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingTemplate?.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="templateType">Report Type*</Label>
                <Select name="templateType" defaultValue={editingTemplate?.templateType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                defaultValue={editingTemplate?.description}
                placeholder="Brief description of this report template"
              />
            </div>

            <div>
              <Label htmlFor="fields">Report Fields (JSON)*</Label>
              <Textarea
                id="fields"
                name="fields"
                defaultValue={editingTemplate?.fields ? JSON.stringify(editingTemplate.fields, null, 2) : '{\n  "columns": ["date", "amount", "patient", "medication"],\n  "groupBy": "date",\n  "aggregations": ["sum", "count"]\n}'}
                rows={6}
                placeholder="Define report fields in JSON format"
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="layoutConfig">Layout Configuration (JSON)</Label>
              <Textarea
                id="layoutConfig"
                name="layoutConfig"
                defaultValue={editingTemplate?.layoutConfig ? JSON.stringify(editingTemplate.layoutConfig, null, 2) : '{\n  "orientation": "portrait",\n  "fontSize": 12,\n  "margins": {"top": 20, "bottom": 20, "left": 20, "right": 20}\n}'}
                rows={4}
                placeholder="Layout settings in JSON format"
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="filters">Default Filters (JSON)</Label>
              <Textarea
                id="filters"
                name="filters"
                defaultValue={editingTemplate?.filters ? JSON.stringify(editingTemplate.filters, null, 2) : '{\n  "dateRange": "last30days",\n  "status": "completed",\n  "minAmount": 0\n}'}
                rows={4}
                placeholder="Default filter settings in JSON format"
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="isActive">Status</Label>
              <Select name="isActive" defaultValue={editingTemplate?.isActive !== false ? "true" : "false"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveTemplateMutation.isPending}>
                {saveTemplateMutation.isPending ? "Saving..." : "Save Template"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}