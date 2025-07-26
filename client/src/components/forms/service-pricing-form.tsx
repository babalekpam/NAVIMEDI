import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Plus, Trash2 } from "lucide-react";
import { ServicePrice, PatientInsurance, InsuranceProvider } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ServicePricingFormProps {
  patientInsuranceId: string;
  onServicesChange: (services: ServiceLineItem[]) => void;
  selectedServices: ServiceLineItem[];
}

export interface ServiceLineItem {
  servicePriceId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  copayAmount: number;
  insuranceAmount: number;
  notes?: string;
}

export function ServicePricingForm({ patientInsuranceId, onServicesChange, selectedServices }: ServicePricingFormProps) {
  const [serviceFormData, setServiceFormData] = useState({
    servicePriceId: "",
    quantity: "1",
    notes: ""
  });
  const [calculatedPricing, setCalculatedPricing] = useState<{
    unitPrice: number;
    copayAmount: number;
    insuranceAmount: number;
    deductibleAmount: number;
  } | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: servicePrices = [] } = useQuery<ServicePrice[]>({
    queryKey: ["/api/service-prices"],
  });

  const { data: patientInsurance = [] } = useQuery<PatientInsurance[]>({
    queryKey: ["/api/patient-insurance", patientInsuranceId?.split('-')[0]], // Extract patient ID from insurance ID
    enabled: !!patientInsuranceId,
  });

  const calculatePricingMutation = useMutation({
    mutationFn: async ({ servicePriceId, patientInsuranceId }: { servicePriceId: string; patientInsuranceId: string }) => {
      const selectedInsurance = patientInsurance.find(pi => pi.id === patientInsuranceId);
      if (!selectedInsurance) throw new Error("Patient insurance not found");

      const response = await apiRequest("POST", "/api/calculate-pricing", {
        servicePriceId,
        insuranceProviderId: selectedInsurance.insuranceProviderId,
        patientInsuranceId
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCalculatedPricing(data);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate pricing.",
        variant: "destructive",
      });
    },
  });

  const handleCalculatePricing = () => {
    if (serviceFormData.servicePriceId && patientInsuranceId) {
      calculatePricingMutation.mutate({
        servicePriceId: serviceFormData.servicePriceId,
        patientInsuranceId
      });
    }
  };

  // Auto-calculate pricing when service changes
  useEffect(() => {
    if (serviceFormData.servicePriceId && patientInsuranceId) {
      handleCalculatePricing();
    }
  }, [serviceFormData.servicePriceId, patientInsuranceId]);

  const handleAddService = () => {
    if (!calculatedPricing) {
      toast({
        title: "Error",
        description: "Please calculate pricing first.",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(serviceFormData.quantity);
    const totalPrice = calculatedPricing.unitPrice * quantity;
    const totalCopay = calculatedPricing.copayAmount * quantity;
    const totalInsurance = calculatedPricing.insuranceAmount * quantity;

    const newService: ServiceLineItem = {
      servicePriceId: serviceFormData.servicePriceId,
      quantity,
      unitPrice: calculatedPricing.unitPrice,
      totalPrice,
      copayAmount: totalCopay,
      insuranceAmount: totalInsurance,
      notes: serviceFormData.notes
    };

    const updatedServices = [...selectedServices, newService];
    onServicesChange(updatedServices);

    // Reset form
    setServiceFormData({
      servicePriceId: "",
      quantity: "1",
      notes: ""
    });
    setCalculatedPricing(null);

    toast({
      title: "Service Added",
      description: "Service has been added to the claim.",
    });
  };

  const removeService = (index: number) => {
    const updatedServices = selectedServices.filter((_, i) => i !== index);
    onServicesChange(updatedServices);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Service/Procedure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="servicePriceId">Service/Procedure *</Label>
              <Select
                value={serviceFormData.servicePriceId}
                onValueChange={(value) => setServiceFormData({...serviceFormData, servicePriceId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {servicePrices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.serviceCode} - {service.serviceName} (${parseFloat(service.basePrice).toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={serviceFormData.quantity}
                onChange={(e) => setServiceFormData({...serviceFormData, quantity: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleCalculatePricing}
              disabled={!serviceFormData.servicePriceId || !patientInsuranceId || calculatePricingMutation.isPending}
            >
              <Calculator className="h-4 w-4 mr-2" />
              {calculatePricingMutation.isPending ? 'Calculating...' : 'Calculate Pricing'}
            </Button>

            <Button
              type="button"
              onClick={handleAddService}
              disabled={!calculatedPricing}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Claim
            </Button>
          </div>

          {calculatedPricing && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-blue-900">Pricing Breakdown</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="font-semibold ml-2">${calculatedPricing.unitPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Patient Copay:</span>
                  <span className="font-semibold ml-2 text-orange-600">${calculatedPricing.copayAmount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Insurance Covers:</span>
                  <span className="font-semibold ml-2 text-green-600">${calculatedPricing.insuranceAmount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total (Qty {serviceFormData.quantity}):</span>
                  <span className="font-semibold ml-2">${(calculatedPricing.unitPrice * parseInt(serviceFormData.quantity)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="serviceNotes">Notes (Optional)</Label>
            <Textarea
              id="serviceNotes"
              placeholder="Additional notes for this service..."
              value={serviceFormData.notes}
              onChange={(e) => setServiceFormData({...serviceFormData, notes: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Services Table */}
      {selectedServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Patient Copay</TableHead>
                    <TableHead>Insurance</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedServices.map((item, index) => {
                    const service = servicePrices.find(s => s.id === item.servicePriceId);
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{service?.serviceName}</div>
                            <div className="text-sm text-gray-500">{service?.serviceCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-orange-600 font-semibold">
                          ${item.copayAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          ${item.insuranceAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${item.totalPrice.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeService(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {/* Totals */}
              <div className="border-t bg-gray-50 p-4">
                <div className="flex justify-end space-x-8">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Total Patient Copay</div>
                    <div className="text-lg font-semibold text-orange-600">
                      ${selectedServices.reduce((sum, item) => sum + item.copayAmount, 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Total Insurance Amount</div>
                    <div className="text-lg font-semibold text-green-600">
                      ${selectedServices.reduce((sum, item) => sum + item.insuranceAmount, 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Grand Total</div>
                    <div className="text-xl font-bold">
                      ${selectedServices.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedServices.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          No services selected yet. Add services above to see pricing breakdown.
        </div>
      )}
    </div>
  );
}