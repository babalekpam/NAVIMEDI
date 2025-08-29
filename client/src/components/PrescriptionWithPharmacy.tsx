import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PharmacySelectorTrigger } from "./PharmacySelector";
import { MapPin, Clock, CheckCircle, AlertCircle, Truck } from "lucide-react";

interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  quantity: number;
  instructions: string;
  status: string;
  prescribedDate: string;
  pharmacyTenantId?: string;
  routingNotes?: string;
}

interface Pharmacy {
  id: string;
  tenantId: string;
  name: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  deliveryService?: boolean;
}

interface PrescriptionWithPharmacyProps {
  prescription: Prescription;
}

/**
 * Component to display a prescription with pharmacy routing capabilities
 * This demonstrates how doctors can use the PharmacySelector to route prescriptions
 */
export function PrescriptionWithPharmacy({ prescription }: PrescriptionWithPharmacyProps) {
  const [currentPrescription, setCurrentPrescription] = useState(prescription);
  const [routedPharmacy, setRoutedPharmacy] = useState<Pharmacy | null>(null);

  const handlePrescriptionSent = (pharmacy: Pharmacy) => {
    setRoutedPharmacy(pharmacy);
    setCurrentPrescription(prev => ({
      ...prev,
      status: 'sent_to_pharmacy',
      pharmacyTenantId: pharmacy.tenantId
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prescribed': return 'bg-blue-100 text-blue-800';
      case 'sent_to_pharmacy': return 'bg-green-100 text-green-800';
      case 'received': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'dispensed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'prescribed': return <AlertCircle className="h-4 w-4" />;
      case 'sent_to_pharmacy': 
      case 'dispensed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatAddress = (address: Pharmacy['address']) => {
    if (!address) return '';
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold">
              {currentPrescription.medicationName}
            </CardTitle>
            <CardDescription className="mt-1">
              {currentPrescription.dosage} • {currentPrescription.frequency}
            </CardDescription>
          </div>
          
          <Badge className={`${getStatusColor(currentPrescription.status)} flex items-center gap-1`}>
            {getStatusIcon(currentPrescription.status)}
            {currentPrescription.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Prescription Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Quantity:</span>
            <p>{currentPrescription.quantity}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Prescribed:</span>
            <p>{new Date(currentPrescription.prescribedDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Instructions */}
        {currentPrescription.instructions && (
          <div>
            <span className="font-medium text-gray-600">Instructions:</span>
            <p className="text-sm mt-1 p-2 bg-gray-50 rounded-md">
              {currentPrescription.instructions}
            </p>
          </div>
        )}

        {/* Pharmacy Information */}
        {routedPharmacy && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Sent to Pharmacy
            </h4>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-green-800">{routedPharmacy.name}</p>
                  {routedPharmacy.address && (
                    <p className="text-sm text-green-700 mt-1">
                      {formatAddress(routedPharmacy.address)}
                    </p>
                  )}
                  {routedPharmacy.phone && (
                    <p className="text-sm text-green-700 mt-1">
                      📞 {routedPharmacy.phone}
                    </p>
                  )}
                  {routedPharmacy.deliveryService && (
                    <div className="flex items-center gap-1 mt-2">
                      <Truck className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-700">Delivery available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Routing Notes */}
        {currentPrescription.routingNotes && (
          <div>
            <span className="font-medium text-gray-600">Routing Notes:</span>
            <p className="text-sm mt-1 p-2 bg-blue-50 rounded-md">
              {currentPrescription.routingNotes}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t">
          {currentPrescription.status === 'prescribed' && !routedPharmacy ? (
            <PharmacySelectorTrigger
              prescriptionId={currentPrescription.id}
              onPrescriptionSent={handlePrescriptionSent}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Select Pharmacy & Send
              </div>
            </PharmacySelectorTrigger>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Prescription routing complete
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Usage Example Component
export function PrescriptionRoutingDemo() {
  const samplePrescription: Prescription = {
    id: "sample-prescription-123",
    medicationName: "Amoxicillin",
    dosage: "500mg",
    frequency: "3 times daily",
    quantity: 30,
    instructions: "Take with food. Complete the full course even if symptoms improve.",
    status: "prescribed",
    prescribedDate: new Date().toISOString()
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Prescription Routing System
        </h1>
        <p className="text-gray-600">
          Doctors can now easily route prescriptions to patient-selected pharmacies with our integrated pharmacy selector.
        </p>
      </div>

      <PrescriptionWithPharmacy prescription={samplePrescription} />

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Doctor prescribes medication to patient</li>
          <li>2. Doctor clicks "Select Pharmacy & Send" button</li>
          <li>3. System shows available pharmacies with details</li>
          <li>4. Doctor selects appropriate pharmacy and adds notes</li>
          <li>5. Prescription is instantly routed to selected pharmacy</li>
          <li>6. Patient can pick up medication from chosen location</li>
        </ul>
      </div>
    </div>
  );
}