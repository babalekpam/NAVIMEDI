import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, FileText, Download, Plus, Filter, RefreshCw, Building2, Shield } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  tenantId: string;
  title: string;
  type: string;
  format: string;
  parameters: any;
  status: string;
  createdAt: Date;
  completedAt?: Date;
  fileUrl?: string;
  generatedBy: string;
}

interface Tenant {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

export default function Reports() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>("pdf");
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  
  const isSuperAdmin = user?.role === 'super_admin';

  // Download function with authentication and better error handling
  const downloadReport = async (fileUrl: string, title: string, format: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Downloading report:', fileUrl);
      
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Remove content-type header for download requests
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download error response:', errorText);
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      // Get the blob with proper content type
      const blob = await response.blob();
      console.log('Downloaded blob:', { size: blob.size, type: blob.type });
      
      // Create download URL
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9\-_\s]/g, '_')}.${format}`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      toast({
        title: "Download Completed",
        description: `${title}.${format} has been downloaded successfully.`
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Could not download the report. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Get reports for current tenant or all reports for super admin
  const { data: reports = [], isLoading: reportsLoading, refetch } = useQuery<Report[]>({
    queryKey: isSuperAdmin ? ["/api/platform/reports"] : ["/api/reports"],
    enabled: !!user && (!!tenant || isSuperAdmin),
  });

  // Get all tenants for super admin
  const { data: tenants = [], isLoading: tenantsLoading, isSuccess: tenantsSuccess, error: tenantsError } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
    enabled: !!user && isSuperAdmin,
    retry: 1,
  });

  // Debug the tenants data
  console.log('🔍 Tenants debug:', {
    isSuperAdmin,
    userRole: user?.role,
    userExists: !!user,
    queryEnabled: !!user && isSuperAdmin,
    tenantsCount: tenants.length,
    tenantsLoading,
    tenantsSuccess,
    tenantsError: tenantsError?.message,
    firstTenant: tenants[0],
    sampleTenants: tenants.slice(0, 2)
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportData: { type: string; format: string; title: string; targetTenantId?: string }) => {
      const endpoint = isSuperAdmin && reportData.targetTenantId 
        ? "/api/platform/reports/generate" 
        : "/api/reports";
      return await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(reportData)
      });
    },
    onSuccess: () => {
      toast({
        title: "Report Generated",
        description: isSuperAdmin && selectedTenant 
          ? "Cross-tenant report has been created successfully and will be available shortly."
          : "Your report has been created successfully and will be available shortly.",
      });
      queryClient.invalidateQueries({ queryKey: isSuperAdmin ? ["/api/platform/reports"] : ["/api/reports"] });
      setSelectedType("");
      setSelectedTenant("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const reportTypes = [
    { value: "clinical", label: "Patient Summary Report", description: "Overview of all patient records and demographics", key: "patient_summary" },
    { value: "operational", label: "Appointment Analytics", description: "Appointment trends, no-shows, and scheduling patterns", key: "appointment_analytics" },
    { value: "clinical", label: "Prescription Report", description: "Prescription volumes, popular medications, and pharmacy data", key: "prescription_report" },
    { value: "financial", label: "Financial Summary", description: "Revenue, billing, and insurance claim analysis", key: "financial_summary" },
    { value: "clinical", label: "Lab Results Report", description: "Laboratory testing volumes and result patterns", key: "lab_results" },
    { value: "compliance", label: "Compliance Audit", description: "HIPAA compliance and security audit trail", key: "compliance_audit" },
  ];

  const handleGenerateReport = () => {
    if (!selectedType) return;
    if (isSuperAdmin && !selectedTenant && !tenant) return;

    const reportType = reportTypes.find(type => type.value === selectedType);
    if (!reportType) return;

    const targetTenant = isSuperAdmin && selectedTenant 
      ? tenants.find(t => t.id === selectedTenant) 
      : null;

    const titleSuffix = targetTenant 
      ? ` - ${targetTenant.name} - ${new Date().toLocaleDateString()}`
      : ` - ${new Date().toLocaleDateString()}`;

    generateReportMutation.mutate({
      type: selectedType,
      format: selectedFormat,
      title: `${reportType.label}${titleSuffix}`,
      targetTenantId: isSuperAdmin ? selectedTenant : undefined
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'generating':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Generating</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>;
    }
  };

  if (!user || (!tenant && !isSuperAdmin)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
          <p className="text-gray-600">Setting up your reports workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isSuperAdmin ? "Platform Reports & Analytics" : "Reports & Analytics"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin 
              ? "Generate comprehensive reports for any healthcare organization on the platform"
              : "Generate comprehensive reports for your healthcare organization"
            }
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={reportsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${reportsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isSuperAdmin ? <Shield className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            <span>{isSuperAdmin ? "Generate Cross-Tenant Report" : "Generate New Report"}</span>
          </CardTitle>
          <CardDescription>
            {isSuperAdmin 
              ? "Create custom reports for any healthcare organization on the platform"
              : "Create custom reports for your healthcare operations and analytics"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`grid grid-cols-1 gap-4 mb-6 ${isSuperAdmin ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            {isSuperAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Organization</label>
                <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      tenantsLoading ? "Loading organizations..." : 
                      tenants.length === 0 ? "No organizations available" :
                      "Select organization"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {tenantsLoading ? (
                      <SelectItem value="loading" disabled>Loading organizations...</SelectItem>
                    ) : tenantsError ? (
                      <SelectItem value="error" disabled>Error loading organizations</SelectItem>
                    ) : !tenantsSuccess ? (
                      <SelectItem value="not-ready" disabled>Data not ready</SelectItem>
                    ) : tenants.length === 0 ? (
                      <SelectItem value="empty" disabled>No organizations found</SelectItem>
                    ) : (
                      tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name} ({tenant.type})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.key} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV Data Export</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleGenerateReport}
                disabled={!selectedType || (isSuperAdmin && !selectedTenant && !tenant) || generateReportMutation.isPending}
                className="w-full"
              >
                {generateReportMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>

          {selectedType && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-1">
                {reportTypes.find(type => type.value === selectedType)?.label}
              </h4>
              <p className="text-sm text-blue-700">
                {reportTypes.find(type => type.value === selectedType)?.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Recent Reports</span>
            </div>
            <Badge variant="outline">{reports.length} reports</Badge>
          </CardTitle>
          <CardDescription>
            View and download your previously generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
              <p className="text-gray-600 mb-4">Generate your first report to see it here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{report.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>Created {new Date(report.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="capitalize">{report.format?.toUpperCase() || 'PDF'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(report.status)}
                    {report.status === 'completed' && report.fileUrl && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadReport(report.fileUrl!, report.title, report.format)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}