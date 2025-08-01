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
import { DollarSign, Plus, Search, Filter, FileText, Calendar, Receipt, Eye, Edit, TrendingUp, Download, Printer, RefreshCw, Pill, Users, Package, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const pharmacyBillSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  prescriptionId: z.string().optional(),
  medicationName: z.string().min(1, "Medication name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0.01, "Unit price must be greater than 0"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  insuranceCoverageRate: z.number().min(0).max(100, "Coverage rate must be between 0 and 100"),
  insuranceAmount: z.number().min(0),
  patientAmount: z.number().min(0),
  claimNumber: z.string().optional(),
  ndcNumber: z.string().optional(),
  lotNumber: z.string().optional(),
  expirationDate: z.string().optional(),
  notes: z.string().optional(),
});

type PharmacyBillForm = z.infer<typeof pharmacyBillSchema>;

interface PharmacyBill {
  id: string;
  patientId: string;
  medicationName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  description: string;
  status: string;
  prescriptionId?: string;
  ndcNumber?: string;
  lotNumber?: string;
  notes?: string;
  generatedBy: string;
  createdAt: string;
  updatedAt: string;
  // Enriched fields
  patientFirstName?: string;
  patientLastName?: string;
  patientMrn?: string;
}

export default function PharmacyBilling() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<PharmacyBill | null>(null);
  const [activeTab, setActiveTab] = useState("billing");
  
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Analytics queries
  const { data: analyticsData = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/pharmacy/analytics"],
    enabled: !!user && !!tenant,
    staleTime: 0,
    cacheTime: 0,
    refetchInterval: 5000,
  });

  // Bills data with auto-refresh
  const { data: bills = [], isLoading: billsLoading, refetch: refetchBills } = useQuery({
    queryKey: ["/api/pharmacy/billing"],
    enabled: !!user && !!tenant,
    staleTime: 0,
    cacheTime: 0,
    refetchInterval: 5000,
  });

  // Download report function
  const downloadReport = async (fileUrl: string, title: string, format: string) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileExtension = format === 'excel' ? 'xlsx' : format === 'csv' ? 'csv' : 'pdf';
      link.download = `${title.replace(/\s+/g, '_')}.${fileExtension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: `${title} has been downloaded successfully.`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const form = useForm<PharmacyBillForm>({
    resolver: zodResolver(pharmacyBillSchema),
    defaultValues: {
      patientId: "",
      medicationName: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      description: "",
      insuranceCoverageRate: 0,
      insuranceAmount: 0,
      patientAmount: 0,
      claimNumber: "",
      ndcNumber: "",
      lotNumber: "",
      expirationDate: "",
      notes: "",
    },
  });

  // Watch quantity and unit price to calculate amount
  const watchedQuantity = form.watch("quantity");
  const watchedUnitPrice = form.watch("unitPrice");

  useEffect(() => {
    const amount = watchedQuantity * watchedUnitPrice;
    form.setValue("amount", amount);
  }, [watchedQuantity, watchedUnitPrice, form]);

  // Create bill mutation
  const createBillMutation = useMutation({
    mutationFn: async (data: PharmacyBillForm) => {
      return await apiRequest("POST", "/api/pharmacy/billing", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pharmacy bill created successfully.",
      });
      form.reset();
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/pharmacy/billing"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pharmacy/analytics"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to create bill.",
        variant: "destructive",
      });
    },
  });

  // Update bill mutation
  const updateBillMutation = useMutation({
    mutationFn: async (data: Partial<PharmacyBillForm> & { id: string }) => {
      return await apiRequest("PUT", `/api/pharmacy/billing/${data.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pharmacy bill updated successfully.",
      });
      setIsEditDialogOpen(false);
      setSelectedBill(null);
      queryClient.invalidateQueries({ queryKey: ["/api/pharmacy/billing"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pharmacy/analytics"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to update bill.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PharmacyBillForm) => {
    if (selectedBill) {
      updateBillMutation.mutate({ ...data, id: selectedBill.id });
    } else {
      createBillMutation.mutate(data);
    }
  };

  const handleEditBill = (bill: PharmacyBill) => {
    setSelectedBill(bill);
    form.reset({
      patientId: bill.patientId,
      medicationName: bill.medicationName,
      quantity: bill.quantity,
      unitPrice: bill.unitPrice,
      amount: bill.amount,
      description: bill.description,
      prescriptionId: bill.prescriptionId || "",
      ndcNumber: bill.ndcNumber || "",
      lotNumber: bill.lotNumber || "",
      notes: bill.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  // Filter bills
  const filteredBills = bills.filter((bill: PharmacyBill) => {
    const matchesSearch = searchQuery === "" || 
      bill.patientFirstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.patientLastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.patientMrn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.medicationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "processed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processed</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Pill className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pharmacy Billing Management</h1>
              <p className="text-gray-600">Comprehensive billing system for pharmacy services and medication dispensing</p>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center space-x-2">
            <Pill className="h-4 w-4" />
            <span>{tenant?.name || "Pharmacy"}</span>
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="billing" className="mt-6">
          <div className="space-y-6">
            {/* Billing Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-1 gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search patients, medications, or MRNs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => refetchBills()}
                  disabled={billsLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${billsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Bill
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Pharmacy Bill</DialogTitle>
                      <DialogDescription>
                        Create a new billing entry for pharmacy services
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
                                <FormLabel>Patient ID</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter patient ID" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="medicationName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Medication Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter medication name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe the pharmacy service provided..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    placeholder="1"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="unitPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit Price ($)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total Amount ($)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    readOnly
                                  />
                                </FormControl>
                                <FormDescription>Automatically calculated from quantity × unit price</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="insuranceCoverageRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Insurance Coverage (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  placeholder="0"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="ndcNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>NDC Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="National Drug Code" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lotNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Lot Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Medication lot number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Notes</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Any additional billing notes..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createBillMutation.isPending}>
                            {createBillMutation.isPending ? "Creating..." : "Create Bill"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Bills Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Bills</p>
                      <p className="text-3xl font-bold text-gray-900">{bills.length}</p>
                      <p className="text-xs text-purple-600 mt-1">Active billing records</p>
                    </div>
                    <Receipt className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Bills</p>
                      <p className="text-3xl font-bold text-yellow-600">
                        {bills.filter((b: PharmacyBill) => b.status === 'pending').length}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">Awaiting processing</p>
                    </div>
                    <Package className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed Bills</p>
                      <p className="text-3xl font-bold text-green-600">
                        {bills.filter((b: PharmacyBill) => b.status === 'completed').length}
                      </p>
                      <p className="text-xs text-green-600 mt-1">Successfully processed</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-purple-600">
                        ${bills.reduce((sum: number, bill: PharmacyBill) => sum + bill.amount, 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">Pharmacy billing revenue</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bills Table */}
            <Card>
              <CardHeader>
                <CardTitle>Pharmacy Bills</CardTitle>
                <CardDescription>Manage and track all pharmacy billing records</CardDescription>
              </CardHeader>
              <CardContent>
                {billsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
                      <p>Loading pharmacy bills...</p>
                    </div>
                  </div>
                ) : filteredBills.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery || statusFilter !== "all" 
                        ? "No bills match your current filters." 
                        : "Create your first pharmacy bill to get started."}
                    </p>
                    {!searchQuery && statusFilter === "all" && (
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Bill
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Patient</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Medication</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Quantity</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBills.map((bill: PharmacyBill) => (
                          <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {bill.patientFirstName} {bill.patientLastName}
                                </div>
                                <div className="text-sm text-gray-600">MRN: {bill.patientMrn}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-gray-900">{bill.medicationName}</div>
                                <div className="text-sm text-gray-600 max-w-xs truncate">{bill.description}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900">{bill.quantity}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900">${bill.amount.toFixed(2)}</div>
                            </td>
                            <td className="py-4 px-4">
                              {getStatusBadge(bill.status)}
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm text-gray-600">
                                {new Date(bill.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditBill(bill)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Pharmacy Bill</DialogTitle>
                  <DialogDescription>
                    Update the pharmacy billing information
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
                            <FormLabel>Patient ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter patient ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="medicationName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medication Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter medication name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe the pharmacy service provided..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="1"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="unitPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit Price ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Amount ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                readOnly
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Any additional billing notes..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditDialogOpen(false);
                          setSelectedBill(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateBillMutation.isPending}>
                        {updateBillMutation.isPending ? "Updating..." : "Update Bill"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Bills</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.totalBills || 0}</p>
                  </div>
                  <Receipt className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-600">${analyticsData.totalRevenue || 0}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-3xl font-bold text-purple-600">{analyticsData.completionRate || 0}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
                    <p className="text-3xl font-bold text-orange-600">{analyticsData.avgProcessingTime || 0}h</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pharmacy Billing Analytics</CardTitle>
              <CardDescription>Comprehensive view of your pharmacy's billing performance</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
                    <p>Loading analytics...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Pharmacy Analytics Dashboard</h3>
                    <p className="text-gray-600">Detailed billing analytics and insights for your pharmacy operations.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pharmacy Billing Reports</CardTitle>
              <CardDescription>Generate and download comprehensive pharmacy billing reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Pharmacy Reports</h3>
                <p className="text-gray-600 mb-4">Generate detailed billing reports for your pharmacy operations</p>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pharmacy Billing Trends</CardTitle>
              <CardDescription>Track billing trends and patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Billing Trend Analysis</h3>
                <p className="text-gray-600">Analyze billing patterns and revenue trends for strategic insights</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}