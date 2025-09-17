import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Phone, Clock, Truck, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRoutePrescriptionMutation } from "@/lib/enhanced-mutations";

interface Pharmacy {
  id: string;
  tenantId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  licenseNumber?: string;
  npiNumber?: string;
  acceptsInsurance: boolean;
  deliveryService: boolean;
  operatingHours?: {
    [key: string]: { open: string; close: string };
  };
  specializations: string[];
  websiteUrl?: string;
}

interface PharmacySelectorProps {
  prescriptionId: string;
  onPrescriptionSent?: (pharmacy: Pharmacy) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function PharmacySelector({ prescriptionId, onPrescriptionSent, isOpen, onClose }: PharmacySelectorProps) {
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [routingNotes, setRoutingNotes] = useState("");
  const { toast } = useToast();

  const { data: pharmacies = [], isLoading } = useQuery({
    queryKey: ["/api/pharmacies"],
    enabled: isOpen
  });

  // Enhanced prescription routing with real-time dashboard updates  
  const sendPrescriptionMutation = useRoutePrescriptionMutation();
  
  // Override success handler to include local component logic
  const originalMutate = sendPrescriptionMutation.mutate;
  sendPrescriptionMutation.mutate = (data) => {
    return originalMutate(data, {
      onSuccess: (response) => {
        onPrescriptionSent?.(selectedPharmacy!);
        onClose();
        queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      }
    });
  };

  const handleSendPrescription = () => {
    if (!selectedPharmacy) {
      toast({
        title: "No pharmacy selected",
        description: "Please select a pharmacy to send the prescription to",
        variant: "destructive"
      });
      return;
    }

    sendPrescriptionMutation.mutate({
      prescriptionId,
      pharmacyTenantId: selectedPharmacy.tenantId,
      routingNotes: routingNotes
    });
  };

  const formatAddress = (address: Pharmacy['address']) => {
    if (!address) return "Address not available";
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  const formatOperatingHours = (hours: Pharmacy['operatingHours']) => {
    if (!hours) return "Hours not available";
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = hours[today];
    if (todayHours) {
      return `Today: ${todayHours.open} - ${todayHours.close}`;
    }
    return "Hours vary";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Pharmacy for Prescription</DialogTitle>
          <DialogDescription>
            Choose a pharmacy to send this prescription to. The patient will be able to pick up their medication from the selected location.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading pharmacies...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pharmacy Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {pharmacies.map((pharmacy: Pharmacy) => (
                <Card 
                  key={pharmacy.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPharmacy?.id === pharmacy.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                      : ''
                  }`}
                  onClick={() => setSelectedPharmacy(pharmacy)}
                  data-testid={`pharmacy-card-${pharmacy.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold">
                          {pharmacy.name}
                          {selectedPharmacy?.id === pharmacy.id && (
                            <CheckCircle className="inline-block ml-2 h-5 w-5 text-green-600" />
                          )}
                        </CardTitle>
                        {pharmacy.licenseNumber && (
                          <CardDescription className="text-sm text-gray-600">
                            License: {pharmacy.licenseNumber}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Address */}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {formatAddress(pharmacy.address)}
                      </span>
                    </div>

                    {/* Phone */}
                    {pharmacy.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {pharmacy.phone}
                        </span>
                      </div>
                    )}

                    {/* Operating Hours */}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {formatOperatingHours(pharmacy.operatingHours)}
                      </span>
                    </div>

                    {/* Services & Features */}
                    <div className="flex flex-wrap gap-2">
                      {pharmacy.acceptsInsurance && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Insurance
                        </Badge>
                      )}
                      {pharmacy.deliveryService && (
                        <Badge variant="secondary" className="text-xs">
                          <Truck className="h-3 w-3 mr-1" />
                          Delivery
                        </Badge>
                      )}
                      {pharmacy.specializations.map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {pharmacies.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No pharmacies available</p>
                <p className="text-sm">No active pharmacies found in the system.</p>
              </div>
            )}

            {/* Routing Notes */}
            {selectedPharmacy && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Routing Notes (Optional)</h3>
                <Textarea
                  placeholder="Add any special instructions or notes for the pharmacy..."
                  value={routingNotes}
                  onChange={(e) => setRoutingNotes(e.target.value)}
                  className="min-h-20"
                  data-testid="routing-notes-input"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} data-testid="cancel-button">
                Cancel
              </Button>
              <Button 
                onClick={handleSendPrescription}
                disabled={!selectedPharmacy || sendPrescriptionMutation.isPending}
                data-testid="send-prescription-button"
              >
                {sendPrescriptionMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  `Send to ${selectedPharmacy?.name || 'Selected Pharmacy'}`
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Trigger Button Component
interface PharmacySelectorTriggerProps {
  prescriptionId: string;
  onPrescriptionSent?: (pharmacy: Pharmacy) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function PharmacySelectorTrigger({ 
  prescriptionId, 
  onPrescriptionSent, 
  disabled = false,
  children 
}: PharmacySelectorTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        data-testid="select-pharmacy-trigger"
      >
        {children || "Select Pharmacy"}
      </Button>
      
      <PharmacySelector
        prescriptionId={prescriptionId}
        onPrescriptionSent={onPrescriptionSent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}