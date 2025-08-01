import { useState, useEffect } from "react";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Plus, Search, Filter, FileText, Calendar, Receipt, Eye, Edit, TrendingUp, Download, Printer, RefreshCw, BarChart3, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const labBillSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  labOrderId: z.string().min(1, "Lab order is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  insuranceCoverageRate: z.number().min(0).max(100, "Coverage rate must be between 0 and 100"),
  insuranceAmount: z.number().min(0),
  patientAmount: z.number().min(0),
  claimNumber: z.string().optional(),
  labCodes: z.string().optional(),
  diagnosisCodes: z.string().optional(),
  labNotes: z.string().optional(),
  testName: z.string().optional(),
});

type LabBillForm = z.infer<typeof labBillSchema>;

interface LabBill {
  id: string;
  patientId: string;
  amount: number;
  description: string;
  status: string;
  serviceType: string;
  labOrderId?: string;
  testName?: string;
  notes?: string;
  generatedBy: string;
  createdAt: string;
  updatedAt: string;
  // Enriched fields
  patientFirstName?: string;
  patientLastName?: string;
  patientMrn?: string;
}

export default function LaboratoryBilling() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<LabBill | null>(null);
  const [activeTab, setActiveTab] = useState("billing");
  
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Analytics queries
  const { data: analyticsData = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/laboratory/analytics"],
    enabled: !!user && !!tenant,
    staleTime: 0,
    cacheTime: 0,
    refetchInterval: 5000,
  });

  const { data: reportsData = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/reports"],
    enabled: !!user && !!tenant,
    staleTime: 0,
    cacheTime: 0,
    refetchInterval: 5000,
  });



  // Download report function
  const downloadReport = async (fileUrl: string, title: string, format: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Started",
        description: `${title} is downloading...`
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the report. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Print report function  
  const printReport = async (bill: LabBill) => {
    try {
      const printContent = `
        <html>
          <head>
            <title>Laboratory Bill - ${bill.patientFirstName} ${bill.patientLastName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .bill-info { margin: 20px 0; }
              .amount { font-size: 24px; font-weight: bold; color: #10b981; }
              .status { padding: 4px 8px; border-radius: 4px; }
              .completed { background-color: #dcfce7; color: #15803d; }
              .pending { background-color: #fef3c7; color: #d97706; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>JOY Laboratory</h1>
              <h2>Laboratory Bill Receipt</h2>
            </div>
            <div class="bill-info">
              <p><strong>Patient:</strong> ${bill.patientFirstName} ${bill.patientLastName}</p>
              <p><strong>MRN:</strong> ${bill.patientMrn}</p>
              <p><strong>Test:</strong> ${bill.testName || 'N/A'}</p>
              <p><strong>Description:</strong> ${bill.description}</p>
              <p><strong>Amount:</strong> <span class="amount">$${parseFloat(bill.amount.toString()).toFixed(2)}</span></p>
              <p><strong>Status:</strong> <span class="status ${bill.status}">${bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}</span></p>
              <p><strong>Date:</strong> ${new Date(bill.createdAt).toLocaleDateString()}</p>
              ${bill.notes ? `<p><strong>Notes:</strong> ${bill.notes}</p>` : ''}
            </div>
            <div style="margin-top: 40px; text-align: center; color: #666;">
              <p>Thank you for using JOY Laboratory services</p>
            </div>
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        
        toast({
          title: "Print Started",
          description: "Laboratory bill is being printed..."
        });
      }
    } catch (error) {
      toast({
        title: "Print Failed",
        description: "Could not print the report. Please try again.",
        variant: "destructive"
      });
    }
  };



  const form = useForm<LabBillForm>({
    resolver: zodResolver(labBillSchema),
    defaultValues: {
      patientId: "",
      labOrderId: "",
      amount: 0,
      description: "",
      insuranceCoverageRate: 80,
      insuranceAmount: 0,
      patientAmount: 0,
      claimNumber: "",
      labCodes: "",
      diagnosisCodes: "",
      labNotes: "",
      testName: "",
    },
  });

  const editForm = useForm<LabBillForm>({
    resolver: zodResolver(labBillSchema),
    defaultValues: {
      patientId: "",
      labOrderId: "",
      amount: 0,
      description: "",
      insuranceCoverageRate: 80,
      insuranceAmount: 0,
      patientAmount: 0,
      claimNumber: "",
      labCodes: "",
      diagnosisCodes: "",
      labNotes: "",
      testName: "",
    },
  });

  // Fetch laboratory bills
  const { data: bills = [], isLoading, refetch: refetchBills } = useQuery<LabBill[]>({
    queryKey: ["/api/laboratory/billing"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/laboratory/billing");
      const data = await response.json();
      console.log("Laboratory bills API response:", data);
      return data;
    },
    enabled: !!user && !!tenant,
    refetchInterval: 5000, // Reduced to 5 seconds for faster updates
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Don't cache data
  });

  // Fetch patients for laboratory billing (cross-tenant access)
  const { data: patients = [], isLoading: patientsLoading, error: patientsError } = useQuery({
    queryKey: ["/api/laboratory/billing-patients"],
    queryFn: async () => {
      console.log("Fetching lab billing patients... User:", user?.id, "Tenant:", tenant?.id);
      try {
        const response = await apiRequest("GET", "/api/laboratory/billing-patients");
        if (!response.ok) {
          console.error("Failed to fetch patients:", response.status, response.statusText);
          throw new Error(`Failed to fetch patients: ${response.status}`);
        }
        const data = await response.json();
        console.log("Lab billing patients data:", data);
        return data;
      } catch (error) {
        console.error("Error fetching lab billing patients:", error);
        throw error;
      }
    },
    enabled: !!user && !!tenant && isCreateDialogOpen,
    retry: 1,
  });

  // Fetch completed lab orders for billing - orders sent TO this laboratory
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const { data: completedLabOrders = [], isLoading: labOrdersLoading } = useQuery({
    queryKey: ["/api/lab-orders", "laboratory", { status: "completed" }],
    queryFn: async () => {
      console.log("Fetching completed lab orders sent to laboratory...");
      const response = await apiRequest("GET", "/api/lab-orders/laboratory?status=completed");
      const data = await response.json();
      console.log("Completed lab orders sent to laboratory:", data);
      return data;
    },
    enabled: !!user && !!tenant,
  });

  // Filter lab orders for selected patient
  const patientLabOrders = React.useMemo(() => {
    if (!selectedPatientId) {
      console.log("No patient selected, returning empty array");
      return [];
    }
    
    console.log("Filtering lab orders for patient:", selectedPatientId);
    console.log("Available completed lab orders:", completedLabOrders);
    
    const filtered = completedLabOrders.filter((order: any) => {
      console.log(`Checking order ${order.id}: patientId=${order.patientId} vs selectedPatientId=${selectedPatientId}`);
      return order.patientId === selectedPatientId;
    });
    
    console.log("Filtered lab orders for patient:", filtered);
    return filtered;
  }, [selectedPatientId, completedLabOrders]);

  // Create lab bill mutation
  const createLabBillMutation = useMutation({
    mutationFn: async (data: LabBillForm) => {
      const response = await apiRequest("POST", "/api/laboratory/billing", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Laboratory bill created",
        description: "The laboratory bill has been created successfully.",
      });
      form.reset();
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/laboratory/billing"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating bill",
        description: error.message || "Failed to create laboratory bill.",
        variant: "destructive",
      });
    },
  });

  // Update lab bill mutation
  const updateLabBillMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LabBillForm> }) => {
      const response = await apiRequest("PATCH", `/api/laboratory/billing/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bill updated",
        description: "Laboratory bill has been updated successfully.",
      });
      editForm.reset();
      setIsEditDialogOpen(false);
      setSelectedBill(null);
      queryClient.invalidateQueries({ queryKey: ["/api/laboratory/billing"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating bill",
        description: error.message || "Failed to update laboratory bill.",
        variant: "destructive",
      });
    },
  });

  // Handle edit bill
  const handleEditBill = (bill: LabBill) => {
    setSelectedBill(bill);
    editForm.reset({
      patientId: bill.patientId,
      labOrderId: bill.labOrderId || "",
      amount: parseFloat(bill.amount.toString()),
      description: bill.description,
      insuranceCoverageRate: 80,
      insuranceAmount: 0,
      patientAmount: 0,
      claimNumber: "",
      labCodes: "",
      diagnosisCodes: "",
      labNotes: bill.notes || "",
      testName: bill.testName || "",
    });
    setIsEditDialogOpen(true);
  };

  // Handle edit form submission
  const handleEditSubmit = (data: LabBillForm) => {
    if (!selectedBill) return;
    
    updateLabBillMutation.mutate({
      id: selectedBill.id,
      data: {
        amount: data.amount,
        description: data.description,
        labNotes: data.labNotes,
        testName: data.testName,
      }
    });
  };

  // Receipt handling functions
  const handleViewReceipt = async (billId: string) => {
    try {
      const response = await apiRequest("GET", `/api/laboratory/billing/${billId}/receipt`);
      const receipt = await response.json();
      
      // Create a printable receipt view
      const receiptWindow = window.open('', '_blank');
      if (receiptWindow) {
        receiptWindow.document.write(`
          <html>
            <head>
              <title>Laboratory Receipt - ${receipt.receiptNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                .receipt-info { margin-bottom: 20px; }
                .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
                .details { margin: 10px 0; }
                .print-btn { background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
                @media print { .print-btn { display: none; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${receipt.tenantName} Laboratory</h1>
                <h2>Laboratory Service Receipt</h2>
                <p><strong>Receipt #:</strong> ${receipt.receiptNumber}</p>
              </div>
              
              <div class="receipt-info">
                <div class="details"><strong>Patient:</strong> ${receipt.patientName}</div>
                <div class="details"><strong>MRN:</strong> ${receipt.patientMrn}</div>
                <div class="details"><strong>Test:</strong> ${receipt.testName || 'N/A'}</div>
                <div class="details"><strong>Description:</strong> ${receipt.description}</div>
                <div class="details"><strong>Service Type:</strong> ${receipt.serviceType}</div>
                <div class="details"><strong>Date:</strong> ${new Date(receipt.createdAt).toLocaleDateString()}</div>
                <div class="details"><strong>Status:</strong> ${receipt.status.toUpperCase()}</div>
                ${receipt.notes ? `<div class="details"><strong>Notes:</strong> ${receipt.notes}</div>` : ''}
              </div>
              
              <div class="amount">
                <p><strong>Total Amount: $${parseFloat(receipt.amount).toFixed(2)}</strong></p>
              </div>
              
              <div style="margin-top: 30px; text-align: center;">
                <button class="print-btn" onclick="window.print()">Print Receipt</button>
                <button class="print-btn" onclick="window.close()" style="background: #6b7280; margin-left: 10px;">Close</button>
              </div>
              
              <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280;">
                <p>This is an official laboratory service receipt.</p>
                <p>For questions, please contact ${receipt.tenantName} Laboratory.</p>
              </div>
            </body>
          </html>
        `);
        receiptWindow.document.close();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate receipt",
        variant: "destructive",
      });
    }
  };

  const handlePrintInvoice = (billId: string) => {
    const bill = labBills?.find(b => b.id === billId);
    if (bill) {
      printReport(bill);
    } else {
      toast({
        title: "Error",
        description: "Bill not found",
        variant: "destructive"
      });
    }
  };

  // Filter bills
  const filteredBills = bills.filter((bill) => {
    const matchesSearch = 
      bill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.patientFirstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.patientLastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.patientMrn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.testName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle patient selection change
  const handlePatientChange = (patientId: string) => {
    console.log("Patient selection changed to:", patientId);
    setSelectedPatientId(patientId);
    form.setValue("patientId", patientId);
    form.setValue("labOrderId", "");
    form.setValue("testName", "");
    form.setValue("labCodes", "");
  };

  // Handle lab order selection change
  const handleLabOrderChange = (labOrderId: string) => {
    console.log("Lab order selection changed to:", labOrderId);
    console.log("Available lab orders for current patient:", patientLabOrders);
    
    const selectedOrder = patientLabOrders.find((order: any) => order.id === labOrderId);
    console.log("Selected lab order:", selectedOrder);
    
    if (selectedOrder) {
      form.setValue("labOrderId", labOrderId);
      form.setValue("testName", selectedOrder.testName || selectedOrder.testCode || "");
      form.setValue("labCodes", selectedOrder.testCode || "");
      // Set description based on test name
      const description = `Laboratory test: ${selectedOrder.testName || selectedOrder.testCode}`;
      form.setValue("description", description);
      console.log("Updated form with test name:", selectedOrder.testName);
    } else {
      console.log("No matching lab order found for ID:", labOrderId);
    }
  };

  // Calculate insurance amounts based on coverage rate
  const calculateInsuranceAmounts = (amount: number, coverageRate: number) => {
    const insuranceAmount = (amount * coverageRate) / 100;
    const patientAmount = amount - insuranceAmount;
    
    form.setValue("insuranceAmount", Number(insuranceAmount.toFixed(2)));
    form.setValue("patientAmount", Number(patientAmount.toFixed(2)));
  };

  // Watch form values for automatic calculations
  const watchedAmount = form.watch("amount");
  const watchedCoverageRate = form.watch("insuranceCoverageRate");

  // Auto-calculate insurance amounts when amount or coverage rate changes
  React.useEffect(() => {
    if (watchedAmount && watchedCoverageRate !== undefined) {
      calculateInsuranceAmounts(watchedAmount, watchedCoverageRate);
    }
  }, [watchedAmount, watchedCoverageRate]);

  const onSubmit = (data: LabBillForm) => {
    // Convert numeric fields to strings for backend compatibility
    const formattedData = {
      ...data,
      amount: data.amount.toString(),
      notes: data.labNotes || undefined,
    };
    createLabBillMutation.mutate(formattedData);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      paid: { color: "bg-green-100 text-green-800", label: "Paid" },
      overdue: { color: "bg-red-100 text-red-800", label: "Overdue" },
      cancelled: { color: "bg-gray-100 text-gray-800", label: "Cancelled" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Laboratory Billing Management</h1>
        <p className="text-gray-600">
          Comprehensive billing, analytics, and reporting system for laboratory services
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="billing">
            <DollarSign className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="w-4 h-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="billing" className="mt-6">
          <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
              placeholder="Search bills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          console.log("Dialog state changing to:", open);
          if (open) {
            console.log("Opening dialog, patients loading:", patientsLoading, "patients:", patients, "error:", patientsError);
          }
          setIsCreateDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Lab Insurance Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Lab Insurance Claim</DialogTitle>
              <DialogDescription>
                Create a new insurance claim for lab services. Enter the lab cost and patient information.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient</FormLabel>
                        <Select onValueChange={handlePatientChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a patient" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {patientsLoading ? (
                              <div className="p-2 text-center text-gray-500">Loading patients...</div>
                            ) : patientsError ? (
                              <div className="p-2 text-center text-red-500">
                                Error loading patients: {(patientsError as Error).message}
                              </div>
                            ) : patients.length === 0 ? (
                              <div className="p-2 text-center text-gray-500">No patients found for billing</div>
                            ) : (
                              patients.map((patient: any) => (
                                <SelectItem key={patient.id} value={patient.id}>
                                  {patient.firstName} {patient.lastName} (MRN: {patient.mrn})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lab Cost *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter total cost of lab services"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Total lab cost (patient copay will be calculated automatically)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description Field */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Input placeholder="Description of lab services" {...field} />
                      </FormControl>
                      <FormDescription>
                        Brief description of the laboratory services provided
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Claim Number Field */}
                <FormField
                  control={form.control}
                  name="claimNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Claim Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Auto-generated on submit" {...field} />
                      </FormControl>
                      <FormDescription>
                        Claim numbers are automatically generated. You can override by typing a custom number.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Lab Codes Field */}
                <FormField
                  control={form.control}
                  name="labCodes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NDC/Lab Codes (comma-separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 0069-2587-68, LAB001" {...field} />
                      </FormControl>
                      <FormDescription>
                        Laboratory test codes or reference numbers for this service
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Diagnosis Codes Field */}
                <FormField
                  control={form.control}
                  name="diagnosisCodes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosis Codes (comma-separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., I10, E11.9, M79.3" {...field} />
                      </FormControl>
                      <FormDescription>
                        ICD-10 diagnosis codes from the prescribing physician
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Lab Notes Field */}
                <FormField
                  control={form.control}
                  name="labNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lab Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Complete Blood Count, Fasting blood draw required, ordered by Dr. Smith"
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Laboratory test details, special instructions, and ordering physician information
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Lab Order Selection Row */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="labOrderId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related Lab Order *</FormLabel>
                        <Select onValueChange={handleLabOrderChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select lab order" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {labOrdersLoading ? (
                              <div className="p-2 text-center text-gray-500">Loading lab orders...</div>
                            ) : !selectedPatientId ? (
                              <div className="p-2 text-center text-gray-500">Select a patient first</div>
                            ) : patientLabOrders.length === 0 ? (
                              <div className="p-2 text-center text-gray-500">
                                No completed lab orders for this patient
                                {completedLabOrders.length > 0 && (
                                  <div className="text-xs mt-1">
                                    ({completedLabOrders.length} total lab orders found)
                                  </div>
                                )}
                              </div>
                            ) : (
                              patientLabOrders.map((order: any) => (
                                <SelectItem key={order.id} value={order.id}>
                                  {order.testName || order.testCode || "Unknown Test"} - ID: {order.id.slice(-8)}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the lab order this billing claim is for
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="testName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Auto-populated from lab order" {...field} readOnly />
                        </FormControl>
                        <FormDescription>
                          Test name is automatically filled when lab order is selected
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Insurance Coverage Row */}
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="insuranceCoverageRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Coverage Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            placeholder="80"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Percentage covered by insurance (0-100%)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="insuranceAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Auto-calculated"
                            {...field}
                            readOnly
                          />
                        </FormControl>
                        <FormDescription>
                          Amount covered by insurance
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="patientAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Auto-calculated"
                            {...field}
                            readOnly
                          />
                        </FormControl>
                        <FormDescription>
                          Amount patient is responsible for
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>



                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLabBillMutation.isPending}>
                    {createLabBillMutation.isPending ? "Creating..." : "Create Claim"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Laboratory Bill Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Laboratory Bill</DialogTitle>
              <DialogDescription>
                Update the laboratory bill details.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="testName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter test name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="labNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lab Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter any additional notes..." 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateLabBillMutation.isPending}>
                    {updateLabBillMutation.isPending ? "Updating..." : "Update Bill"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bills List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Laboratory Bills
          </CardTitle>
          <CardDescription>
            {filteredBills.length} bills found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-gray-400 animate-pulse" />
              <p className="mt-2 text-gray-500">Loading bills...</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 mx-auto text-gray-300" />
              <p className="mt-2 text-gray-500">No laboratory bills found</p>
              <p className="text-sm text-gray-400">Create your first bill to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBills.map((bill) => (
                <div
                  key={bill.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{bill.description}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {bill.patientFirstName} {bill.patientLastName}
                        </span>
                        <span>MRN: {bill.patientMrn}</span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(bill.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {bill.testName && (
                        <p className="text-sm text-gray-600 mt-1">
                          <TestTube className="inline w-3 h-3 mr-1" />
                          Test: {bill.testName}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ${parseFloat(bill.amount).toFixed(2)}
                      </div>
                      {getStatusBadge(bill.status)}
                    </div>
                  </div>
                  
                  {bill.notes && (
                    <div className="text-sm text-gray-600 mb-3">
                      <strong>Notes:</strong> {bill.notes}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewReceipt(bill.id)}>
                      <Receipt className="w-3 h-3 mr-1" />
                      Receipt
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditBill(bill)}>
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handlePrintInvoice(bill.id)}>
                      <FileText className="w-3 h-3 mr-1" />
                      Print Invoice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
            </CardContent>
          </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalBills || 0}</div>
                  <p className="text-xs text-gray-600">Laboratory bills</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analyticsData.totalRevenue || 0}</div>
                  <p className="text-xs text-gray-600">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.pendingBills || 0}</div>
                  <p className="text-xs text-gray-600">Awaiting payment</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.completionRate || 0}%</div>
                  <p className="text-xs text-gray-600">Bills completed</p>
                </CardContent>
              </Card>
            </div>


          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generated Reports</CardTitle>
                <CardDescription>Download and manage your laboratory billing reports</CardDescription>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : reportsData.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No reports generated yet</p>
                    <p className="text-sm">Use the Analytics tab to generate reports</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reportsData.map((report: any) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <FileText className="w-8 h-8 text-blue-500" />
                          <div>
                            <h3 className="font-medium">{report.title}</h3>
                            <p className="text-sm text-gray-600">
                              {report.format.toUpperCase()} • {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                            <Badge className={report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {report.status}
                            </Badge>
                          </div>
                        </div>
                        {report.status === 'completed' && report.fileUrl && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadReport(report.fileUrl, report.title, report.format)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(report.fileUrl, '_blank')}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Trends & Insights</CardTitle>
                <CardDescription>Visual analytics for laboratory billing performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Revenue Trends</h3>
                    <div className="h-48 flex items-center justify-center border rounded-lg bg-gray-50">
                      <p className="text-gray-500">Revenue chart will be displayed here</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium">Test Volume Analysis</h3>
                    <div className="h-48 flex items-center justify-center border rounded-lg bg-gray-50">
                      <p className="text-gray-500">Test volume chart will be displayed here</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-4">Key Performance Indicators</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Average Bill Amount</span>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold mt-2">${analyticsData.averageBillAmount || 0}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Bills This Month</span>
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="text-2xl font-bold mt-2">{analyticsData.billsThisMonth || 0}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Processing Time</span>
                        <Calendar className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="text-2xl font-bold mt-2">{analyticsData.avgProcessingTime || 0}h</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}