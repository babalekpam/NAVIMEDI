import { ArrowLeft, Clock, Users, UserPlus, CheckCircle, AlertCircle, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export function UserAccountConfiguration() {
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
                <h1 className="text-4xl font-bold text-gray-900 mb-4">User Account Configuration</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>8 min read</span>
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
                  User Account Configuration Guide
                </CardTitle>
                <CardDescription>
                  Step-by-step instructions for creating and configuring user accounts for your healthcare team members
                </CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  Proper user account configuration is essential for maintaining security, compliance, and efficient workflows 
                  in your healthcare organization. This guide covers the complete process of setting up user accounts with 
                  appropriate roles and permissions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 1: Access User Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Navigate to Admin Panel</h4>
                    <p className="text-gray-600">Log in as an administrator and go to Settings → User Management</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Review Current Users</h4>
                    <p className="text-gray-600">Review existing user accounts and their current permissions</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-1">💡 Quick Tip</h5>
                  <p className="text-blue-700 text-sm">
                    Only organization administrators can create and manage user accounts. Ensure you have the proper permissions before proceeding.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 2: Create New User Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Required Information</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• <strong>Full Name:</strong> Employee's complete legal name</li>
                    <li>• <strong>Email Address:</strong> Professional email (will be used for login)</li>
                    <li>• <strong>Employee ID:</strong> Internal identifier (if applicable)</li>
                    <li>• <strong>Department:</strong> Select from your organization's departments</li>
                    <li>• <strong>Position/Title:</strong> Job title and role description</li>
                    <li>• <strong>License Number:</strong> Professional license (for clinical staff)</li>
                    <li>• <strong>Contact Information:</strong> Phone number and emergency contact</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h5 className="font-medium text-yellow-900 mb-1">⚠️ Important</h5>
                  <p className="text-yellow-700 text-sm">
                    Ensure all email addresses are unique and belong to the intended user. Password reset and security notifications will be sent to this address.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 3: Assign User Roles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Available Roles</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Clinical Roles</h5>
                      <ul className="text-sm text-gray-600 mt-1">
                        <li>• Physician</li>
                        <li>• Registered Nurse</li>
                        <li>• Physician Assistant</li>
                        <li>• Medical Technician</li>
                        <li>• Pharmacist</li>
                        <li>• Lab Technician</li>
                      </ul>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Administrative Roles</h5>
                      <ul className="text-sm text-gray-600 mt-1">
                        <li>• System Administrator</li>
                        <li>• Department Manager</li>
                        <li>• Medical Records Clerk</li>
                        <li>• Billing Specialist</li>
                        <li>• Registration Staff</li>
                        <li>• Quality Assurance</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-1">✅ Best Practice</h5>
                  <p className="text-green-700 text-sm">
                    Follow the principle of least privilege - assign only the minimum permissions necessary for the user to perform their job functions.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 4: Configure Access Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Permission Categories</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• <strong>Patient Access:</strong> View, edit, or create patient records</li>
                    <li>• <strong>Clinical Functions:</strong> Prescribing, lab orders, clinical notes</li>
                    <li>• <strong>Administrative Tasks:</strong> Billing, reporting, system settings</li>
                    <li>• <strong>Data Export:</strong> Export patient data, reports, and analytics</li>
                    <li>• <strong>System Administration:</strong> User management, security settings</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Department-Specific Access</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Emergency Department: Access to all patient records</li>
                    <li>• Cardiology: Cardiac-specific templates and protocols</li>
                    <li>• Pharmacy: Prescription management and inventory</li>
                    <li>• Laboratory: Lab orders, results, and quality control</li>
                    <li>• Radiology: Imaging orders and results management</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 5: Security Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Multi-Factor Authentication</h4>
                    <p className="text-gray-600">Enable MFA for all users handling sensitive patient data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Password Policy</h4>
                    <p className="text-gray-600">Configure password complexity requirements and expiration</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Session Management</h4>
                    <p className="text-gray-600">Set appropriate session timeouts and concurrent login limits</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Audit Logging</h4>
                    <p className="text-gray-600">Enable comprehensive audit trails for user activities</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 6: Send User Credentials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Credential Delivery Options</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• <strong>Email Invitation:</strong> Secure email with setup instructions</li>
                    <li>• <strong>Temporary Password:</strong> System-generated secure password</li>
                    <li>• <strong>SMS Notification:</strong> Backup notification via text message</li>
                    <li>• <strong>In-Person Setup:</strong> Assisted setup for first-time users</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h5 className="font-medium text-red-900 mb-1">🔒 Security Note</h5>
                  <p className="text-red-700 text-sm">
                    Require users to change their temporary password on first login. Never send passwords via unsecured channels.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 7: User Training and Onboarding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Onboarding Checklist</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• ✅ Provide platform overview and training materials</li>
                    <li>• ✅ Schedule hands-on training session</li>
                    <li>• ✅ Review security policies and HIPAA compliance</li>
                    <li>• ✅ Test system access and functionality</li>
                    <li>• ✅ Assign mentor or support contact</li>
                    <li>• ✅ Collect feedback and address questions</li>
                  </ul>
                </div>
                <div className="flex gap-4">
                  <Link href="/docs/comprehensive-user-training">
                    <Button variant="outline" className="gap-2">
                      <FileText className="w-4 h-4" />
                      User Training Materials
                    </Button>
                  </Link>
                  <Link href="/docs/quick-reference-guide">
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Quick Reference Guide
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting Common Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Frequently Encountered Problems</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">User Can't Access Certain Features</h5>
                        <p className="text-gray-600 text-sm">Check role permissions and department access settings</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Email Invitation Not Received</h5>
                        <p className="text-gray-600 text-sm">Verify email address and check spam folder</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Login Issues</h5>
                        <p className="text-gray-600 text-sm">Reset password and verify account status</p>
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
                    Contact Support: support@navimedi.com
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Next Steps</h3>
                <p className="text-gray-700 mb-4">
                  After completing user account configuration, proceed to initial system configuration to customize 
                  your NAVIMED platform for your organization's specific workflows.
                </p>
                <div className="flex gap-3">
                  <Link href="/docs/initial-system-configuration">
                    <Button className="gap-2">
                      Next: System Configuration
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Button>
                  </Link>
                  <Link href="/support/documentation">
                    <Button variant="outline">
                      Back to Documentation Hub
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