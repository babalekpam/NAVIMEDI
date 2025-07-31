import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, Plus, Search, Filter, FileText, Calendar, User, TestTube, Receipt, Eye, Edit } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const labBillSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  labOrderId: z.string().optional(),
  testName: z.string().optional(),
  notes: z.string().optional(),
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
  const [selectedBill, setSelectedBill] = useState<LabBill | null>(null);
  
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LabBillForm>({
    resolver: zodResolver(labBillSchema),
    defaultValues: {
      patientId: "",
      amount: 0,
      description: "",
      labOrderId: "",
      testName: "",
      notes: "",
    },
  });

  // Fetch laboratory bills
  const { data: bills = [], isLoading } = useQuery<LabBill[]>({
    queryKey: ["/api/laboratory/billing"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/laboratory/billing");
      return response.json();
    },
    enabled: !!user && !!tenant,
  });

  // Fetch patients for laboratory billing (cross-tenant access)
  const { data: patients = [], isLoading: patientsLoading, error: patientsError } = useQuery({
    queryKey: ["/api/laboratory/billing-patients"],
    queryFn: async () => {
      console.log("Fetching lab billing patients...");
      const response = await apiRequest("GET", "/api/laboratory/billing-patients");
      const data = await response.json();
      console.log("Lab billing patients data:", data);
      return data;
    },
    enabled: !!user && !!tenant && isCreateDialogOpen,
  });

  // Fetch completed lab orders for billing
  const { data: completedLabOrders = [] } = useQuery({
    queryKey: ["/api/lab-orders", { status: "completed" }],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/lab-orders?status=completed");
      return response.json();
    },
    enabled: !!user && !!tenant,
  });

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

  const onSubmit = (data: LabBillForm) => {
    createLabBillMutation.mutate(data);
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
        <h1 className="text-3xl font-bold text-gray-900">Laboratory Billing</h1>
        <p className="text-gray-600">
          Manage billing for laboratory services and tests
        </p>
      </div>

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
            console.log("Opening dialog, patients loading:", patientsLoading, "patients:", patients);
          }
          setIsCreateDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Lab Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Laboratory Bill</DialogTitle>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a patient" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {patientsLoading ? (
                              <div className="p-2 text-center text-gray-500">Loading patients...</div>
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
                        <FormLabel>Amount</FormLabel>
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
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Blood test analysis, CBC with differential" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="labOrderId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related Lab Order (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select lab order" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {completedLabOrders.map((order: any) => (
                              <SelectItem key={order.id} value={order.id}>
                                {order.testName} - {order.patientFirstName} {order.patientLastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="testName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Complete Blood Count" {...field} />
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
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional billing notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLabBillMutation.isPending}>
                    {createLabBillMutation.isPending ? "Creating..." : "Create Bill"}
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
                        ${bill.amount.toFixed(2)}
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
                    <Button size="sm" variant="outline">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="w-3 h-3 mr-1" />
                      Invoice
                    </Button>
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