import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, FileText, Calendar as CalendarIcon, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function BiReports() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("financial");
  const [reportFormat, setReportFormat] = useState("pdf");
  const [reportSchedule, setReportSchedule] = useState("once");
  const [reportName, setReportName] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Fetch existing reports
  const { data: reports, isLoading } = useQuery({
    queryKey: ["/api/bi/reports"],
    enabled: true
  });

  // Mock data for reports
  const availableReports = [
    {
      id: "1",
      name: "Monthly Financial Summary",
      type: "financial",
      lastGenerated: new Date(2025, 9, 15),
      status: "completed",
      format: "pdf"
    },
    {
      id: "2",
      name: "Patient Outcomes Report",
      type: "clinical",
      lastGenerated: new Date(2025, 9, 20),
      status: "completed",
      format: "excel"
    },
    {
      id: "3",
      name: "Operational Efficiency",
      type: "operational",
      lastGenerated: new Date(2025, 9, 25),
      status: "completed",
      format: "pdf"
    },
    {
      id: "4",
      name: "Compliance Audit Report",
      type: "compliance",
      lastGenerated: new Date(2025, 9, 28),
      status: "generating",
      format: "html"
    }
  ];

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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
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

    generateReportMutation.mutate({
      reportName,
      reportType,
      format: reportFormat,
      schedule: reportSchedule,
      parameters: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      }
    });
  };

  const handleDownloadReport = (reportId: string, format: string) => {
    console.log(`Downloading report ${reportId} as ${format}`);
    // Would trigger actual download
    toast({
      title: "Download Started",
      description: `Downloading report in ${format.toUpperCase()} format...`
    });
  };

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
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
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
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Button */}
              <Button
                className="w-full"
                onClick={handleGenerateReport}
                disabled={generateReportMutation.isPending}
                data-testid="button-generate-report"
              >
                {generateReportMutation.isPending ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Library Tab */}
        <TabsContent value="library" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {availableReports.map((report) => (
              <Card key={report.id} data-testid={`report-card-${report.id}`}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" data-testid={`report-name-${report.id}`}>
                        {report.name}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className="capitalize">{report.type}</span>
                        <span>•</span>
                        <span>Last generated: {format(report.lastGenerated, "MMM dd, yyyy")}</span>
                        <span>•</span>
                        <span className="uppercase">{report.format}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {report.status === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : report.status === "generating" ? (
                      <Clock className="h-5 w-5 text-yellow-600 animate-spin" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    {report.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(report.id, report.format)}
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
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          <Card data-testid="card-scheduled-reports">
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Reports configured to run automatically</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4" data-testid="scheduled-report-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">Weekly Financial Summary</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Runs every Monday at 9:00 AM
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span>Next run: Monday, Nov 4, 2025</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-edit-schedule-1">
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg p-4" data-testid="scheduled-report-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">Monthly Compliance Report</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Runs on the 1st of each month at 6:00 AM
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span>Next run: Friday, Nov 1, 2025</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-edit-schedule-2">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
