import { ArrowLeft, Clock, Users, UserPlus, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export function PatientManagement() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Patient Management</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>20 min read</span>
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
                <CardTitle>Overview</CardTitle>
                <CardDescription>Comprehensive patient data management for healthcare providers</CardDescription>
              </CardHeader>
              <CardContent>
                <p>NAVIMED's patient management system provides a centralized platform for maintaining complete patient records, medical histories, and care coordination across your healthcare organization.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Patient Registration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Basic Information Collection</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Full name, date of birth, and gender</li>
                    <li>• Contact information (phone, email, address)</li>
                    <li>• Emergency contact details</li>
                    <li>• Insurance provider and policy information</li>
                    <li>• Preferred language and communication method</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Medical History Intake</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Previous medical conditions and diagnoses</li>
                    <li>• Current medications and dosages</li>
                    <li>• Known allergies and adverse reactions</li>
                    <li>• Family medical history</li>
                    <li>• Surgical history and procedures</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-1">Pro Tip</h5>
                  <p className="text-blue-700 text-sm">Use the Quick Registration feature for emergency situations to capture essential information first, then complete the full profile later.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Patient Search & Lookup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Search Methods</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Name-based search with partial matching</li>
                    <li>• Medical Record Number (MRN) lookup</li>
                    <li>• Phone number and email search</li>
                    <li>• Date of birth verification</li>
                    <li>• Insurance ID cross-reference</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Advanced Filtering</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Filter by medical conditions</li>
                    <li>• Search by assigned physician</li>
                    <li>• Filter by insurance provider</li>
                    <li>• Sort by recent visit date</li>
                    <li>• Risk level categorization</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Medical Records Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Electronic Health Records (EHR)</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Comprehensive medical timeline view</li>
                    <li>• Visit summaries and clinical notes</li>
                    <li>• Diagnostic test results and imaging</li>
                    <li>• Treatment plans and progress notes</li>
                    <li>• Medication history and interactions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Document Management</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Upload and store medical documents</li>
                    <li>• Scan and attach insurance cards</li>
                    <li>• Link external lab reports</li>
                    <li>• Version control for updated documents</li>
                    <li>• Secure document sharing with providers</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-1">HIPAA Compliance</h5>
                  <p className="text-green-700 text-sm">All patient data is encrypted and access is logged for full HIPAA compliance. Only authorized healthcare professionals can view sensitive medical information.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Data Quality</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Verify patient identity before updating records</li>
                    <li>• Use standardized medical terminology</li>
                    <li>• Regular data validation and cleanup</li>
                    <li>• Prompt recording of all patient interactions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Security & Privacy</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Follow minimum necessary access principles</li>
                    <li>• Log out of shared workstations</li>
                    <li>• Report any suspected data breaches immediately</li>
                    <li>• Regular password updates and strong authentication</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}