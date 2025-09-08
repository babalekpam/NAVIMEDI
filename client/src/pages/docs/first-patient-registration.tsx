import { ArrowLeft, Clock, Users, UserPlus, CheckCircle, FileText, Download, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export function FirstPatientRegistration() {
  const handleDownloadPDF = () => {
    window.print();
  };

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
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">First Patient Registration</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>12 min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Beginner</span>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Getting Started
                  </Badge>
                </div>
              </div>
              <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Complete Patient Registration Walkthrough
                </CardTitle>
                <CardDescription>
                  Step-by-step guide to registering your first patient in the NAVIMED system
                </CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  Patient registration is the foundation of your healthcare workflow in NAVIMED. This comprehensive guide 
                  walks you through the complete process of registering your first patient, ensuring all required 
                  information is captured accurately and securely.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pre-Registration Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Required Documents and Information</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• <strong>Photo Identification:</strong> Driver's license, state ID, or passport</li>
                    <li>• <strong>Insurance Cards:</strong> Primary and secondary insurance (if applicable)</li>
                    <li>• <strong>Emergency Contact Information:</strong> Name, relationship, and phone numbers</li>
                    <li>• <strong>Medical History Forms:</strong> Pre-filled if available</li>
                    <li>• <strong>List of Current Medications:</strong> Names, dosages, and frequencies</li>
                    <li>• <strong>Previous Medical Records:</strong> If transferring care</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-1">💡 Pro Tip</h5>
                  <p className="text-blue-700 text-sm">
                    Have patients complete their registration forms online before arrival to streamline the check-in process.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 1: Access Patient Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Navigate to Registration Module</h4>
                    <p className="text-gray-600">From the main dashboard, click "Patients" → "New Registration"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Verify User Permissions</h4>
                    <p className="text-gray-600">Ensure you have patient registration permissions enabled</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Select Registration Type</h4>
                    <p className="text-gray-600">Choose from: New Patient, Returning Patient, or Emergency Registration</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 2: Basic Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Personal Demographics</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Required Fields</h5>
                      <ul className="text-sm text-gray-600 mt-1">
                        <li>• First Name</li>
                        <li>• Last Name</li>
                        <li>• Date of Birth</li>
                        <li>• Social Security Number</li>
                        <li>• Gender</li>
                        <li>• Primary Phone Number</li>
                      </ul>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Optional Fields</h5>
                      <ul className="text-sm text-gray-600 mt-1">
                        <li>• Middle Name</li>
                        <li>• Preferred Name</li>
                        <li>• Email Address</li>
                        <li>• Secondary Phone</li>
                        <li>• Preferred Language</li>
                        <li>• Marital Status</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Address Information</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Street Address (including apartment/unit number)</li>
                    <li>• City, State, and ZIP Code</li>
                    <li>• Country (if international patient)</li>
                    <li>• Mailing address (if different from home address)</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h5 className="font-medium text-yellow-900 mb-1">⚠️ Data Accuracy</h5>
                  <p className="text-yellow-700 text-sm">
                    Double-check all personal information against photo ID. Incorrect data can cause insurance claim issues.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 3: Insurance Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Primary Insurance</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Insurance company name and contact information</li>
                    <li>• Policy/Member ID number</li>
                    <li>• Group number (if applicable)</li>
                    <li>• Subscriber information (if patient is not the subscriber)</li>
                    <li>• Effective dates of coverage</li>
                    <li>• Copay amounts and deductible information</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Secondary Insurance (if applicable)</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Secondary insurance details (same fields as primary)</li>
                    <li>• Coordination of benefits information</li>
                    <li>• Priority of payment determination</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Insurance Verification Process</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Real-Time Verification</h5>
                        <p className="text-gray-600 text-sm">NAVIMED automatically verifies coverage and benefits</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Eligibility Check</h5>
                        <p className="text-gray-600 text-sm">Confirm patient's coverage status and active benefits</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Copay Calculation</h5>
                        <p className="text-gray-600 text-sm">Automatically calculate patient responsibility amounts</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 4: Emergency Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Primary Emergency Contact</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Full name and relationship to patient</li>
                    <li>• Primary and secondary phone numbers</li>
                    <li>• Address (if different from patient)</li>
                    <li>• Email address for non-emergency communications</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Secondary Emergency Contact (recommended)</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Alternative contact person</li>
                    <li>• Complete contact information</li>
                    <li>• Relationship to patient</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Special Considerations</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Pediatric patients: Parent/guardian information required</li>
                    <li>• Elderly patients: Adult child or caregiver contact</li>
                    <li>• Legal guardianship: Documentation may be required</li>
                    <li>• Language barriers: Interpreter contact information</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Step 5: Medical History and Health Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Current Medical Conditions</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Active diagnoses and chronic conditions</li>
                    <li>• Date of diagnosis and treating physician</li>
                    <li>• Current treatment status and medications</li>
                    <li>• Recent hospitalizations or surgeries</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Medications and Allergies</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Current prescription medications</li>
                    <li>• Over-the-counter medications and supplements</li>
                    <li>• Known drug allergies and adverse reactions</li>
                    <li>• Food allergies and environmental sensitivities</li>
                    <li>• Previous adverse drug events</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Family Medical History</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Immediate family chronic conditions</li>
                    <li>• Genetic disorders and hereditary diseases</li>
                    <li>• Cancer history in family members</li>
                    <li>• Cardiovascular and diabetes history</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h5 className="font-medium text-red-900 mb-1">🚨 Critical Information</h5>
                  <p className="text-red-700 text-sm">
                    Always verify drug allergies and current medications. This information is crucial for patient safety and clinical decision-making.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 6: Consent Forms and Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Required Consent Forms</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">HIPAA Privacy Notice</h5>
                        <p className="text-gray-600 text-sm">Patient acknowledgment of privacy practices</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">General Treatment Consent</h5>
                        <p className="text-gray-600 text-sm">Authorization for medical care and treatment</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Financial Responsibility Agreement</h5>
                        <p className="text-gray-600 text-sm">Payment terms and insurance assignment</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Communication Preferences</h5>
                        <p className="text-gray-600 text-sm">Preferred contact methods and portal access</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Digital Signature Capture</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Electronic signature pad integration</li>
                    <li>• Timestamp and IP address logging</li>
                    <li>• Digital document storage and retrieval</li>
                    <li>• Audit trail for all signed documents</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 7: Photo ID Verification and Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Photo ID Capture Process</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Scan or Photograph ID</h5>
                        <p className="text-gray-600 text-sm">Capture both front and back of government-issued ID</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Verify Information</h5>
                        <p className="text-gray-600 text-sm">Compare ID information with registration data</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Secure Storage</h5>
                        <p className="text-gray-600 text-sm">Store ID images in encrypted, HIPAA-compliant format</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Insurance Card Documentation</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Scan or photograph all insurance cards</li>
                    <li>• Verify card information matches patient data</li>
                    <li>• Check effective dates and coverage status</li>
                    <li>• Store images with patient record</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 8: Review and Finalize Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Final Review Checklist</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Verify All Required Fields</h5>
                        <p className="text-gray-600 text-sm">Ensure no mandatory information is missing</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Confirm Insurance Verification</h5>
                        <p className="text-gray-600 text-sm">Check that insurance verification completed successfully</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Review Consent Forms</h5>
                        <p className="text-gray-600 text-sm">Confirm all required forms are signed and complete</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Generate Patient ID</h5>
                        <p className="text-gray-600 text-sm">System automatically assigns unique patient identifier</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Post-Registration Actions</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Print patient registration summary</li>
                    <li>• Provide patient portal access information</li>
                    <li>• Schedule initial appointment (if applicable)</li>
                    <li>• Create patient wristband or identification</li>
                    <li>• Send welcome email with portal credentials</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security and Compliance Considerations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">HIPAA Compliance</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• All registration activities are logged and audited</li>
                    <li>• Patient information is encrypted at rest and in transit</li>
                    <li>• Access is restricted to authorized personnel only</li>
                    <li>• Minimum necessary standard is applied to data access</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data Quality and Accuracy</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Validate patient information against external databases</li>
                    <li>• Use standardized data entry formats</li>
                    <li>• Implement duplicate patient detection algorithms</li>
                    <li>• Regular data quality audits and corrections</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Registration Complete!</h3>
                <p className="text-gray-700 mb-4">
                  Congratulations! You've successfully completed your first patient registration in NAVIMED. 
                  The patient is now ready for appointments, clinical documentation, and care coordination.
                </p>
                <div className="flex gap-3">
                  <Link href="/docs/role-based-access-setup">
                    <Button className="gap-2">
                      Next: Role-Based Access Setup
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Button>
                  </Link>
                  <Link href="/docs/workflow-training-modules">
                    <Button variant="outline">
                      Clinical Workflow Training
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        @media print {
          @page {
            margin: 1in;
            size: letter;
          }
          body {
            font-size: 12pt;
            line-height: 1.4;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}