import { ArrowLeft, Clock, Users, DollarSign, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export function BillingInsurance() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Billing & Insurance</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>35 min read</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Advanced</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Comprehensive billing and insurance management for healthcare providers</CardDescription>
              </CardHeader>
              <CardContent>
                <p>NAVIMED's billing and insurance system streamlines the entire revenue cycle from service delivery to payment collection, with integrated insurance verification and claims processing.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Revenue Cycle Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Service Documentation</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Automatic charge capture from appointments</li>
                    <li>• CPT and ICD-10 code assignment</li>
                    <li>• Provider documentation requirements</li>
                    <li>• Modifier application and compliance</li>
                    <li>• Time-based billing for consultations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Billing Workflow</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Real-time eligibility verification</li>
                    <li>• Prior authorization tracking</li>
                    <li>• Claims generation and submission</li>
                    <li>• Payment posting and reconciliation</li>
                    <li>• Denial management and appeals</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Insurance Processing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Insurance Verification</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Real-time eligibility checks</li>
                    <li>• Coverage benefit analysis</li>
                    <li>• Copay and deductible calculation</li>
                    <li>• Prior authorization requirements</li>
                    <li>• Network participation verification</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Claims Management</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Electronic claims submission (EDI 837)</li>
                    <li>• Real-time adjudication processing</li>
                    <li>• Rejection and denial handling</li>
                    <li>• Secondary insurance billing</li>
                    <li>• ERA/EFT payment processing</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-1">Success Metrics</h5>
                  <p className="text-green-700 text-sm">Track first-pass claim acceptance rates, average days in A/R, and collection percentages to optimize your revenue cycle.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}