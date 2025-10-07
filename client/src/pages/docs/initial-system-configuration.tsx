import { ArrowLeft, Clock, Users, Settings, CheckCircle, AlertTriangle, Download, Shield, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export function InitialSystemConfiguration() {
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
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Initial System Configuration</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>20 min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Administrator</span>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
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
                  <Settings className="w-5 h-5" />
                  Essential System Configuration Guide
                </CardTitle>
                <CardDescription>
                  Critical settings and configurations required for new NAVIMED installations
                </CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  Proper initial system configuration ensures optimal performance, security, and compliance for your 
                  healthcare organization. This comprehensive guide covers all essential settings that must be configured 
                  before going live with patient data.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 1: Organization Profile Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Basic Organization Information</h4>
                    <ul className="text-gray-600 text-sm mt-1 ml-4">
                      <li>• Organization name and legal entity information</li>
                      <li>• Primary contact information and addresses</li>
                      <li>• Tax ID and business registration numbers</li>
                      <li>• Healthcare provider identification (NPI, DEA numbers)</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Operational Settings</h4>
                    <ul className="text-gray-600 text-sm mt-1 ml-4">
                      <li>• Operating hours and time zones</li>
                      <li>• Emergency contact procedures</li>
                      <li>• Service areas and geographic coverage</li>
                      <li>• Specialty services and capabilities</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h5 className="font-medium text-yellow-900 mb-1">⚠️ Important</h5>
                  <p className="text-yellow-700 text-sm">
                    Ensure all regulatory and licensing information is accurate as this data is used for compliance reporting and claims processing.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 2: Department and Location Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Department Setup</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Clinical Departments</h5>
                      <ul className="text-sm text-gray-600 mt-1">
                        <li>• Emergency Department</li>
                        <li>• Internal Medicine</li>
                        <li>• Cardiology</li>
                        <li>• Radiology</li>
                        <li>• Laboratory</li>
                        <li>• Pharmacy</li>
                      </ul>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Administrative Departments</h5>
                      <ul className="text-sm text-gray-600 mt-1">
                        <li>• Registration/Admissions</li>
                        <li>• Medical Records</li>
                        <li>• Billing and Finance</li>
                        <li>• Quality Assurance</li>
                        <li>• Information Technology</li>
                        <li>• Human Resources</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Location Configuration</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Facility addresses and contact information</li>
                    <li>• Room assignments and bed capacity</li>
                    <li>• Equipment and resource allocation</li>
                    <li>• Access control and security zones</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Step 3: Security and Compliance Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">HIPAA Compliance Settings</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Enable comprehensive audit logging</li>
                    <li>• Configure data encryption settings</li>
                    <li>• Set up access controls and user permissions</li>
                    <li>• Define data retention and purge policies</li>
                    <li>• Configure breach notification procedures</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Password and Authentication Policies</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Minimum password complexity requirements</li>
                    <li>• Password expiration and history policies</li>
                    <li>• Multi-factor authentication configuration</li>
                    <li>• Session timeout and idle disconnect settings</li>
                    <li>• Failed login attempt lockout policies</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h5 className="font-medium text-red-900 mb-1">🔒 Critical Security</h5>
                  <p className="text-red-700 text-sm">
                    These security settings are mandatory for HIPAA compliance and cannot be disabled once configured. Review carefully before implementing.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 4: Clinical Workflow Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Patient Registration Workflows</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Registration form customization</li>
                    <li>• Insurance verification procedures</li>
                    <li>• Photo ID and document capture settings</li>
                    <li>• Emergency contact requirements</li>
                    <li>• Consent form management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Appointment and Scheduling</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Provider schedules and availability</li>
                    <li>• Appointment types and duration settings</li>
                    <li>• Cancellation and no-show policies</li>
                    <li>• Reminder notification preferences</li>
                    <li>• Waitlist and overflow management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Clinical Documentation</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Clinical note templates and forms</li>
                    <li>• Diagnostic code libraries (ICD-10, CPT)</li>
                    <li>• Medication databases and formularies</li>
                    <li>• Lab test catalogs and reference ranges</li>
                    <li>• Clinical decision support rules</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Step 5: Data Management and Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Electronic Health Records (EHR)</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Patient data field customization</li>
                    <li>• Medical history templates</li>
                    <li>• Allergy and adverse reaction tracking</li>
                    <li>• Family history documentation</li>
                    <li>• Immunization record management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">External System Integrations</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Laboratory information system (LIS) connections</li>
                    <li>• Radiology information system (RIS) integration</li>
                    <li>• Pharmacy management system links</li>
                    <li>• Insurance verification services</li>
                    <li>• Health information exchange (HIE) participation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Backup and Recovery</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Automated backup scheduling</li>
                    <li>• Data retention policies</li>
                    <li>• Disaster recovery procedures</li>
                    <li>• System redundancy configuration</li>
                    <li>• Recovery testing protocols</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 6: Billing and Revenue Cycle Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Billing Configuration</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Fee schedules and pricing tables</li>
                    <li>• Insurance plan configurations</li>
                    <li>• Copay and deductible handling</li>
                    <li>• Claims submission settings</li>
                    <li>• Payment processing integration</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Revenue Cycle Workflows</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Pre-authorization procedures</li>
                    <li>• Claims scrubbing and validation</li>
                    <li>• Denial management processes</li>
                    <li>• Payment posting and reconciliation</li>
                    <li>• Collections and follow-up procedures</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 7: Notification and Communication Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Email Configuration</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• SMTP server settings and authentication</li>
                    <li>• Email templates for common notifications</li>
                    <li>• Automated reminder scheduling</li>
                    <li>• Professional email signatures</li>
                    <li>• Spam and security filtering</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">SMS and Phone Integration</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• SMS gateway configuration</li>
                    <li>• Appointment reminder preferences</li>
                    <li>• Emergency notification protocols</li>
                    <li>• Voice calling system integration</li>
                    <li>• Patient communication preferences</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-1">📧 Email Setup</h5>
                  <p className="text-blue-700 text-sm">
                    Configure NAVIMED to use your organization's email settings:
                    <br />• Primary: <strong>info@navimedi.org</strong>
                    <br />• Support: <strong>support@navimedi.org</strong>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 8: System Testing and Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Pre-Production Testing</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">User Authentication Testing</h5>
                        <p className="text-gray-600 text-sm">Test login, logout, and password reset functionality</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Patient Registration Workflow</h5>
                        <p className="text-gray-600 text-sm">Complete test patient registration and verification</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Clinical Documentation</h5>
                        <p className="text-gray-600 text-sm">Test note creation, editing, and signature workflows</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Integration Testing</h5>
                        <p className="text-gray-600 text-sm">Verify all external system connections and data exchange</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-1">✅ Validation Checklist</h5>
                  <p className="text-green-700 text-sm">
                    Complete all testing phases before processing real patient data. Document all test results for compliance purposes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Configuration Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Troubleshooting Common Problems</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Email Notifications Not Working</h5>
                        <p className="text-gray-600 text-sm">Check SMTP settings, firewall rules, and email authentication</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">External Integration Failures</h5>
                        <p className="text-gray-600 text-sm">Verify network connectivity, API credentials, and data formats</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Performance Issues</h5>
                        <p className="text-gray-600 text-sm">Review system resources, database indexing, and cache settings</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Link href="/docs/troubleshooting-guide">
                    <Button variant="outline" className="gap-2">
                      Complete Troubleshooting Guide
                    </Button>
                  </Link>
                  <Button variant="outline" className="gap-2">
                    Technical Support: support@navimedi.org
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Configuration Complete</h3>
                <p className="text-gray-700 mb-4">
                  Once you've completed the initial system configuration, your NAVIMED platform is ready for 
                  patient registration and clinical operations. Continue with the first patient registration guide.
                </p>
                <div className="flex gap-3">
                  <Link href="/docs/first-patient-registration">
                    <Button className="gap-2">
                      Next: First Patient Registration
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Button>
                  </Link>
                  <Link href="/docs/system-admin-training">
                    <Button variant="outline">
                      System Admin Training
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <style>{`
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