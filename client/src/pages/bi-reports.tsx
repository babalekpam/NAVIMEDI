import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar as CalendarIcon, Plus, Clock, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function BiReports() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [reportType, setReportType] = useState("financial");
  const [reportFormat, setReportFormat] = useState("json");
  const [reportSchedule, setReportSchedule] = useState("once");
  const [reportName, setReportName] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Fetch existing reports
  const { data: reportsData, isLoading } = useQuery<{ reports: any[] }>({
    queryKey: ["/api/bi/reports"],
    enabled: !!user && !authLoading
  });

  // Fetch scheduled reports
  const { data: scheduledReportsData, isLoading: scheduledLoading } = useQuery<{ reports: any[] }>({
    queryKey: ["/api/bi/reports/scheduled"],
    enabled: !!user && !authLoading
  });

  // Extract reports from API response
  const reports = reportsData?.reports || [];
  const scheduledReports = scheduledReportsData?.reports || [];

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/bi/reports/generate", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Report Generation Started",
        description: "Your report is being generated and will be available shortly."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bi/reports"] });
      setReportName("");
      setStartDate(undefined);
      setEndDate(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Schedule report mutation
  const scheduleReportMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/bi/reports/schedule", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Report Scheduled",
        description: "Your report has been scheduled successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bi/reports/scheduled"] });
      setReportName("");
      setStartDate(undefined);
      setEndDate(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule report. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleGenerateReport = () => {
    if (!reportName) {
      toast({
        title: "Validation Error",
        description: "Please enter a report name.",
        variant: "destructive"
      });
      return;
    }

    if (reportSchedule === "once") {
      // Generate one-time report
      generateReportMutation.mutate({
        reportName,
        reportType,
        format: reportFormat,
        parameters: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString()
        }
      });
    } else {
      // Schedule recurring report
      scheduleReportMutation.mutate({
        reportName,
        reportType,
        schedule: reportSchedule,
        parameters: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString()
        },
        recipients: []
      });
    }
  };

  const handleDownloadReport = (reportId: string) => {
    // Open download URL in new tab
    window.open(`/api/bi/reports/${reportId}/download`, '_blank');
    toast({
      title: "Download Started",
      description: "Your report download has started."
    });
  };

  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="auth-loading">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Show loading while reports are being fetched
  if (isLoading || scheduledLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="data-loading">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="bi-reports-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="page-title">
          Business Intelligence Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Generate, schedule, and manage comprehensive business reports
        </p>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList data-testid="tabs-list">
          <TabsTrigger value="builder" data-testid="tab-builder">Report Builder</TabsTrigger>
          <TabsTrigger value="library" data-testid="tab-library">Report Library</TabsTrigger>
          <TabsTrigger value="scheduled" data-testid="tab-scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        {/* Report Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          <Card data-testid="card-report-builder">
            <CardHeader>
              <CardTitle>Build Custom Report</CardTitle>
              <CardDescription>
                Create a new report with custom parameters and scheduling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Name */}
              <div className="space-y-2">
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  placeholder="Enter report name..."
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  data-testid="input-report-name"
                />
              </div>

              {/* Report Type */}
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="report-type" data-testid="select-report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="clinical">Clinical</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                        data-testid="button-start-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                        data-testid="button-end-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Format and Schedule */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-format">Output Format</Label>
                  <Select value={reportFormat} onValueChange={setReportFormat}>
                    <SelectTrigger id="report-format" data-testid="select-report-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-schedule">Schedule</Label>
                  <Select value={reportSchedule} onValueChange={setReportSchedule}>
                    <SelectTrigger id="report-schedule" data-testid="select-report-schedule">
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">One-time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Button */}
              <Button
                className="w-full"
                onClick={handleGenerateReport}
                disabled={generateReportMutation.isPending || scheduleReportMutation.isPending}
                data-testid="button-generate-report"
              >
                {(generateReportMutation.isPending || scheduleReportMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {reportSchedule === "once" ? "Generating..." : "Scheduling..."}
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    {reportSchedule === "once" ? "Generate Report" : "Schedule Report"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Library Tab */}
        <TabsContent value="library" className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </CardContent>
            </Card>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No reports yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Generate your first report to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {reports.map((report: any) => (
                <Card key={report.id} data-testid={`report-card-${report.id}`}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white" data-testid={`report-name-${report.id}`}>
                          {report.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span className="capitalize">{report.type}</span>
                          <span>•</span>
                          <span>Created: {format(new Date(report.createdAt), "MMM dd, yyyy")}</span>
                          <span>•</span>
                          <span className="uppercase">{report.format || 'JSON'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={report.status === "completed" ? "default" : report.status === "generating" ? "secondary" : "destructive"}
                        className="capitalize"
                      >
                        {report.status === "completed" ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : report.status === "generating" ? (
                          <Clock className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {report.status}
                      </Badge>
                      {report.status === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(report.id)}
                          data-testid={`button-download-${report.id}`}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          <Card data-testid="card-scheduled-reports">
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Reports configured to run automatically</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledLoading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : scheduledReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No scheduled reports
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Schedule a report to receive it automatically
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledReports.map((report: any, index: number) => (
                    <div key={report.id} className="border rounded-lg p-4" data-testid={`scheduled-report-${index + 1}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{report.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {report.schedule && `Runs ${report.schedule}`}
                          </p>
                          <div className="flex items-center mt-2">
                            <Badge variant="secondary" className="capitalize">
                              {report.type}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" data-testid={`button-edit-schedule-${index + 1}`}>
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
