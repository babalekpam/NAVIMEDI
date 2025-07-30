import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TestTube, Clock, CheckCircle, AlertTriangle, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const labResultSchema = z.object({
  testName: z.string().min(1, "Test name is required"),
  result: z.string().min(1, "Result is required"),
  normalRange: z.string().optional(),
  unit: z.string().optional(),
  abnormalFlag: z.enum(["normal", "high", "low", "critical"]).optional(),
  notes: z.string().optional(),
  performedBy: z.string().min(1, "Performed by is required"),
});

type LabResultForm = z.infer<typeof labResultSchema>;

export default function PostLabResults() {
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get pending lab orders for this laboratory
  const { data: labOrders = [], isLoading } = useQuery({
    queryKey: ["/api/lab-orders/laboratory"],
    enabled: true,
  });

  // Get selected order details
  const { data: selectedOrder } = useQuery({
    queryKey: ["/api/lab-orders", selectedOrderId],
    enabled: !!selectedOrderId,
  });

  const form = useForm<LabResultForm>({
    resolver: zodResolver(labResultSchema),
    defaultValues: {
      testName: "",
      result: "",
      normalRange: "",
      unit: "",
      abnormalFlag: "normal",
      notes: "",
      performedBy: "",
    },
  });

  // Auto-fill test name when order is selected
  useEffect(() => {
    if (selectedOrder) {
      form.setValue("testName", selectedOrder.testName || "");
    }
  }, [selectedOrder, form]);

  const postResultMutation = useMutation({
    mutationFn: async (data: LabResultForm & { labOrderId: string; patientId: string }) => {
      return apiRequest(`/api/lab-results`, {
        method: "POST",
        body: JSON.stringify({
          ...data,
          status: "completed",
          completedAt: new Date().toISOString(),
          reportedAt: new Date().toISOString(),
        }),
      });
    },
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Lab result posted successfully! Order status automatically updated to completed and results sent to patient's medical record.",
      });
      form.reset();
      setSelectedOrderId("");
      queryClient.invalidateQueries({ queryKey: ["/api/lab-orders/laboratory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lab-results"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lab-orders"] });
      console.log("Lab result posted:", response);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post lab result. Please try again.",
        variant: "destructive",
      });
      console.error("Error posting lab result:", error);
    },
  });

  const onSubmit = (data: LabResultForm) => {
    if (!selectedOrder) {
      toast({
        title: "Error",
        description: "Please select a lab order first",
        variant: "destructive",
      });
      return;
    }

    postResultMutation.mutate({
      ...data,
      labOrderId: selectedOrder.id,
      patientId: selectedOrder.patientId,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ordered: { color: "bg-blue-100 text-blue-800", icon: Clock },
      collected: { color: "bg-yellow-100 text-yellow-800", icon: TestTube },
      processing: { color: "bg-orange-100 text-orange-800", icon: TestTube },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ordered;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <TestTube className="h-12 w-12 mx-auto text-gray-400 animate-pulse" />
            <p className="mt-2 text-gray-500">Loading lab orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Post Lab Results</h1>
        <p className="text-gray-600">Complete tests and post results to patient medical records</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lab Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TestTube className="h-5 w-5 mr-2" />
              Pending Lab Orders
            </CardTitle>
            <CardDescription>
              Select a lab order to post results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {labOrders.length === 0 ? (
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="mt-2 text-gray-500">No pending lab orders</p>
                </div>
              ) : (
                labOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedOrderId === order.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{order.testName}</h3>
                        <p className="text-sm text-gray-600">
                          <User className="inline h-4 w-4 mr-1" />
                          {order.patientFirstName} {order.patientLastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          MRN: {order.patientMrn}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <p className="text-xs text-gray-500 mt-1">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {new Date(order.orderedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>Hospital:</strong> {order.originatingHospital}</p>
                      {order.instructions && (
                        <p><strong>Instructions:</strong> {order.instructions}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Result Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>Enter Lab Results</CardTitle>
            <CardDescription>
              {selectedOrder 
                ? `Posting results for: ${selectedOrder.testName} - ${selectedOrder.patientFirstName} ${selectedOrder.patientLastName}`
                : "Select a lab order to enter results"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedOrder ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="testName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Blood glucose test" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="result"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Result *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="95" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="mg/dL" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="normalRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Normal Range</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="70-100 mg/dL" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="abnormalFlag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Result Flag</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select result flag" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="performedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Performed By *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Lab Technician Name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Additional notes or observations..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={postResultMutation.isPending}
                  >
                    {postResultMutation.isPending ? (
                      <>
                        <TestTube className="h-4 w-4 mr-2 animate-spin" />
                        Posting Results...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Post Results to Patient Record
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="text-center py-8">
                <TestTube className="h-12 w-12 mx-auto text-gray-300" />
                <p className="mt-2 text-gray-500">Select a lab order to enter results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}