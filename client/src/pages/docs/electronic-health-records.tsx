import { ArrowLeft, Clock, Users, FileText, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export function ElectronicHealthRecords() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Electronic Health Records</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>30 min read</span>
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
                <CardTitle>Comprehensive EHR Management</CardTitle>
                <CardDescription>Creating, updating, and managing patient health records</CardDescription>
              </CardHeader>
              <CardContent>
                <p>NAVIMED's Electronic Health Records system provides a complete digital patient record solution that enables healthcare providers to document, track, and analyze patient health information across all touchpoints of care.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Patient Record Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Core Demographics</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Personal identification and contact information</li>
                    <li>• Insurance details and eligibility verification</li>
                    <li>• Emergency contact information</li>
                    <li>• Preferred language and communication preferences</li>
                    <li>• Social determinants of health data</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Medical History</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Chronic conditions and diagnoses (ICD-10 coded)</li>
                    <li>• Previous surgeries and procedures</li>
                    <li>• Family medical history</li>
                    <li>• Social history (smoking, alcohol, exercise)</li>
                    <li>• Immunization records and vaccine history</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Clinical Data</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Vital signs trends and monitoring</li>
                    <li>• Laboratory results and reference ranges</li>
                    <li>• Imaging studies and radiology reports</li>
                    <li>• Medication lists with dosages and interactions</li>
                    <li>• Allergy and adverse reaction documentation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Clinical Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Visit Documentation</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Chief complaint and history of present illness</li>
                    <li>• Physical examination findings</li>
                    <li>• Assessment and plan documentation</li>
                    <li>• Provider digital signatures and timestamps</li>
                    <li>• Follow-up instructions and care plans</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Clinical Decision Support</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Drug interaction alerts and warnings</li>
                    <li>• Clinical guideline recommendations</li>
                    <li>• Preventive care reminders</li>
                    <li>• Critical value notifications</li>
                    <li>• Quality measure tracking</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-1">Data Integration</h5>
                  <p className="text-green-700 text-sm">All EHR data automatically integrates with billing, scheduling, and clinical workflows to ensure comprehensive patient care coordination.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}