import { LaboratoryApplicationForm } from "@/components/forms/laboratory-application-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Clock, Shield, Globe, CheckCircle } from "lucide-react";

export default function LaboratoryRegistration() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Join NAVIMED Laboratory Network</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect your laboratory to hundreds of healthcare organizations and receive lab orders seamlessly through our secure platform.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <CardTitle>Expand Your Network</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Connect with hospitals, clinics, and healthcare providers nationwide. Access a broader patient base and increase your testing volume.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Clock className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <CardTitle>Streamlined Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Receive lab orders digitally, track samples automatically, and submit results through our integrated platform. Reduce paperwork and improve efficiency.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-purple-600 mx-auto mb-2" />
              <CardTitle>HIPAA Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Built with healthcare security standards in mind. All data transmission and storage is fully HIPAA compliant with audit trails.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Platform Features for Laboratories</CardTitle>
            <CardDescription className="text-center">
              Everything you need to integrate seamlessly with healthcare organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Digital Order Management</h4>
                    <p className="text-sm text-gray-600">Receive lab orders electronically with patient demographics, test requirements, and special instructions.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">API Integration</h4>
                    <p className="text-sm text-gray-600">Connect your LIS system directly to NAVIMED for automated order processing and result reporting.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Real-time Status Updates</h4>
                    <p className="text-sm text-gray-600">Keep healthcare providers informed with automatic status updates from sample receipt to result delivery.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Quality Management</h4>
                    <p className="text-sm text-gray-600">Track turnaround times, manage quality metrics, and maintain compliance documentation.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Multi-Organization Support</h4>
                    <p className="text-sm text-gray-600">Serve multiple healthcare organizations from a single dashboard with tenant-specific configurations.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Billing Integration</h4>
                    <p className="text-sm text-gray-600">Streamlined billing processes with automatic claim generation and insurance verification.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Analytics & Reporting</h4>
                    <p className="text-sm text-gray-600">Comprehensive reporting on test volumes, turnaround times, and revenue analytics.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">24/7 Support</h4>
                    <p className="text-sm text-gray-600">Dedicated technical support and onboarding assistance to ensure smooth integration.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Registration Requirements</CardTitle>
            <CardDescription>
              Please ensure you meet these requirements before applying
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Required Documentation</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Valid laboratory license (CLIA, state, or equivalent)</li>
                  <li>• Current accreditation certificates (CAP, ISO 15189, etc.)</li>
                  <li>• Professional liability insurance</li>
                  <li>• Laboratory director credentials</li>
                  <li>• Quality management documentation</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Technical Requirements</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Laboratory Information System (LIS) with API capability</li>
                  <li>• Secure internet connection</li>
                  <li>• HIPAA-compliant data handling procedures</li>
                  <li>• Electronic result delivery capability</li>
                  <li>• Quality control and assurance protocols</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Process */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Application Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-semibold mb-2">Submit Application</h4>
                <p className="text-sm text-gray-600">Complete the registration form with your laboratory details and capabilities.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h4 className="font-semibold mb-2">Review Process</h4>
                <p className="text-sm text-gray-600">Our team reviews your application and may request additional documentation.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h4 className="font-semibold mb-2">Integration Setup</h4>
                <p className="text-sm text-gray-600">Once approved, we'll help you integrate your systems and configure your account.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">4</span>
                </div>
                <h4 className="font-semibold mb-2">Start Receiving Orders</h4>
                <p className="text-sm text-gray-600">Begin receiving lab orders from healthcare organizations in our network.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <LaboratoryApplicationForm />

        {/* Contact Information */}
        <Card className="mt-12">
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold mb-4">Questions About Registration?</h3>
            <p className="text-gray-600 mb-4">
              Our laboratory partnership team is here to help you through the registration process.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div>
                <strong>Email:</strong> info@navimedi.com
              </div>
              <div>
                <strong>Phone:</strong> 1-800-NAVIMED
              </div>
              <div>
                <strong>Hours:</strong> Mon-Fri 8AM-6PM EST
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}