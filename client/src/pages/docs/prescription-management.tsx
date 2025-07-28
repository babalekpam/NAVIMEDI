import { ArrowLeft, Clock, Users, Pill, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export function PrescriptionManagement() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <Link href="/support/documentation">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Documentation
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Prescription Management</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>22 min read</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Intermediate</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Digital Prescription System</CardTitle>
                <CardDescription>Digital prescription creation, routing, and pharmacy integration</CardDescription>
              </CardHeader>
              <CardContent>
                <p>NAVIMED's prescription management system streamlines the entire medication ordering process from physician prescribing through pharmacy dispensing, ensuring patient safety and regulatory compliance.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Prescription Creation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Medication Selection</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Comprehensive drug database with NDC codes</li>
                    <li>• Generic and brand name medication options</li>
                    <li>• Dosage form selection (tablets, capsules, liquids)</li>
                    <li>• Strength and concentration specifications</li>
                    <li>• Route of administration options</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Dosing and Instructions</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Precise dosing calculations and conversions</li>
                    <li>• Frequency and timing specifications</li>
                    <li>• Duration of therapy and quantity dispensed</li>
                    <li>• Patient-specific instructions and warnings</li>
                    <li>• Refill authorization and limitations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Safety Checks</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Drug-drug interaction screening</li>
                    <li>• Allergy and contraindication alerts</li>
                    <li>• Duplicate therapy warnings</li>
                    <li>• Age and weight-based dosing validation</li>
                    <li>• Pregnancy and lactation safety checks</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Pharmacy Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Electronic Transmission</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Direct pharmacy routing and selection</li>
                    <li>• Real-time prescription status tracking</li>
                    <li>• Automatic confirmation and receipt acknowledgment</li>
                    <li>• Secure HIPAA-compliant transmission</li>
                    <li>• Backup print and fax capabilities</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Pharmacy Communication</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Medication availability verification</li>
                    <li>• Insurance coverage and prior authorization</li>
                    <li>• Therapeutic substitution requests</li>
                    <li>• Refill renewal management</li>
                    <li>• Dispensing notifications and alerts</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-1">Medication Management</h5>
                  <p className="text-blue-700 text-sm">The system maintains a complete medication history for each patient, including current medications, discontinued drugs, and adherence tracking.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}