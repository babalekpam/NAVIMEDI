import { ArrowLeft, Clock, Users, Lock, CheckCircle, Settings, Printer, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export function RoleBasedAccessSetup() {
  const handlePrint = () => {
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
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Role-Based Access Setup</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>18 min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Administrator</span>
                  </div>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    Getting Started
                  </Badge>
                </div>
              </div>
              <Button onClick={handlePrint} variant="outline" className="gap-2">
                <Printer className="w-4 h-4" />
                Print Page
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Role-Based Access Control Configuration
                </CardTitle>
                <CardDescription>
                  Complete guide to configuring permissions for doctors, nurses, and administrative staff
                </CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  Role-Based Access Control (RBAC) is essential for maintaining security, compliance, and operational 
                  efficiency in your healthcare organization. This guide provides comprehensive instructions for 
                  setting up granular permissions that align with job responsibilities and regulatory requirements.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Understanding RBAC Fundamentals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Core RBAC Concepts</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Roles</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        Job function-based collections of permissions (e.g., Physician, Nurse, Admin)
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Permissions</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        Specific actions users can perform (e.g., View Patient, Prescribe Medication)
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Resources</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        System objects being protected (e.g., Patient Records, Lab Results)
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Constraints</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        Additional restrictions (e.g., Department-only access, Time-based limits)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-1">🔒 Security Principle</h5>
                  <p className="text-blue-700 text-sm">
                    Always follow the "Principle of Least Privilege" - grant only the minimum access necessary for job functions.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 1: Access Role Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Navigate to Role Management</h4>
                    <p className="text-gray-600">Settings → Security → Role-Based Access Control</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Verify Administrative Privileges</h4>
                    <p className="text-gray-600">Ensure you have System Administrator or Security Admin role</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Review Existing Roles</h4>
                    <p className="text-gray-600">Examine default roles and current permission assignments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 2: Clinical Staff Roles Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Physician Role Permissions</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h5 className="font-medium text-green-900">Full Clinical Access</h5>
                      <ul className="text-sm text-green-700 mt-1">
                        <li>• View and edit all patient records</li>
                        <li>• Create and modify clinical notes</li>
                        <li>• Prescribe medications (all categories)</li>
                        <li>• Order laboratory and imaging studies</li>
                        <li>• Access diagnostic results and reports</li>
                        <li>• Discharge planning and referrals</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-medium text-blue-900">Administrative Functions</h5>
                      <ul className="text-sm text-blue-700 mt-1">
                        <li>• Schedule patient appointments</li>
                        <li>• Access billing and insurance information</li>
                        <li>• Generate clinical reports</li>
                        <li>• Supervise resident and student activities</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Registered Nurse Role Permissions</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <h5 className="font-medium text-purple-900">Clinical Care Activities</h5>
                      <ul className="text-sm text-purple-700 mt-1">
                        <li>• View patient records and care plans</li>
                        <li>• Document nursing assessments and interventions</li>
                        <li>• Administer medications per physician orders</li>
                        <li>• Record vital signs and clinical observations</li>
                        <li>• Access lab results relevant to patient care</li>
                        <li>• Patient education documentation</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h5 className="font-medium text-yellow-900">Restricted Functions</h5>
                      <ul className="text-sm text-yellow-700 mt-1">
                        <li>• Cannot prescribe medications (view only)</li>
                        <li>• Limited access to financial information</li>
                        <li>• Cannot modify physician orders directly</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Medical Technician Role Permissions</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Access to assigned department patients only</li>
                    <li>• Document technical procedures and results</li>
                    <li>• View relevant clinical orders and instructions</li>
                    <li>• Limited patient demographic information</li>
                    <li>• Equipment and supply management (department-specific)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 3: Administrative Staff Roles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Medical Records Clerk</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Patient registration and demographic updates</li>
                    <li>• Medical record filing and organization</li>
                    <li>• Release of information processing</li>
                    <li>• Insurance verification and authorization</li>
                    <li>• No access to clinical content or treatment details</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Billing Specialist</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Access to billing and financial information</li>
                    <li>• Insurance claims processing and submission</li>
                    <li>• Payment posting and account reconciliation</li>
                    <li>• Patient financial counseling access</li>
                    <li>• Limited clinical information (diagnosis codes only)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Quality Assurance Coordinator</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Access to quality metrics and reports</li>
                    <li>• Clinical outcome data and analytics</li>
                    <li>• Incident reporting and investigation tools</li>
                    <li>• Compliance monitoring and documentation</li>
                    <li>• De-identified patient data for research</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 4: Department-Specific Access Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Emergency Department</h4>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h5 className="font-medium text-red-900">Emergency Access Permissions</h5>
                    <ul className="text-sm text-red-700 mt-1">
                      <li>• Access to all patient records (emergency situations)</li>
                      <li>• Break-glass access for critical care scenarios</li>
                      <li>• Trauma documentation and emergency protocols</li>
                      <li>• Direct admission and transfer capabilities</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Pharmacy Department</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Medication orders and prescription management</li>
                    <li>• Drug interaction and allergy checking</li>
                    <li>• Inventory management and procurement</li>
                    <li>• Patient medication history and counseling</li>
                    <li>• Limited access to clinical notes (medication-related only)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Laboratory Department</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Laboratory orders and specimen tracking</li>
                    <li>• Test results entry and verification</li>
                    <li>• Quality control and proficiency testing</li>
                    <li>• Critical value notification protocols</li>
                    <li>• Limited patient demographic information</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Step 5: Advanced Permission Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Time-Based Access Controls</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Shift-based access (day, evening, night shifts)</li>
                    <li>• Weekend and holiday access restrictions</li>
                    <li>• Temporary access for coverage situations</li>
                    <li>• Automatic session expiration based on schedule</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Location-Based Restrictions</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• IP address-based access controls</li>
                    <li>• Facility-specific data access</li>
                    <li>• Mobile device management and restrictions</li>
                    <li>• Geographic access limitations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data Sensitivity Classifications</h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-2 border rounded text-center">
                      <h5 className="font-medium text-green-700">Public</h5>
                      <p className="text-xs text-gray-600">General information</p>
                    </div>
                    <div className="p-2 border rounded text-center">
                      <h5 className="font-medium text-yellow-700">Restricted</h5>
                      <p className="text-xs text-gray-600">Need-to-know basis</p>
                    </div>
                    <div className="p-2 border rounded text-center">
                      <h5 className="font-medium text-red-700">Confidential</h5>
                      <p className="text-xs text-gray-600">Highly sensitive PHI</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 6: Testing and Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Permission Testing Protocol</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Role Assignment Testing</h5>
                        <p className="text-gray-600 text-sm">Test each role with sample user accounts</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Access Verification</h5>
                        <p className="text-gray-600 text-sm">Verify users can access appropriate functions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Restriction Validation</h5>
                        <p className="text-gray-600 text-sm">Confirm users cannot access restricted areas</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Audit Trail Review</h5>
                        <p className="text-gray-600 text-sm">Verify all access attempts are properly logged</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h5 className="font-medium text-yellow-900 mb-1">⚠️ Testing Best Practices</h5>
                  <p className="text-yellow-700 text-sm">
                    Use test accounts and non-production data for permission testing. Never test with real patient information.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 7: Ongoing Role Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Regular Access Reviews</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• Monthly role assignment audits</li>
                    <li>• Quarterly permission validation</li>
                    <li>• Annual comprehensive security review</li>
                    <li>• Immediate review for role changes or terminations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Staff Changes and Updates</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• New hire role assignment procedures</li>
                    <li>• Promotion and department transfer protocols</li>
                    <li>• Temporary assignment management</li>
                    <li>• Employee termination access revocation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Compliance Monitoring</h4>
                  <ul className="space-y-2 text-gray-600 ml-4">
                    <li>• HIPAA compliance verification</li>
                    <li>• State and federal regulation adherence</li>
                    <li>• Professional licensing requirement tracking</li>
                    <li>• Accreditation standard compliance</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common RBAC Implementation Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Troubleshooting Access Problems</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">User Cannot Access Required Function</h5>
                        <p className="text-gray-600 text-sm">Check role assignment, permission settings, and department restrictions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Excessive Permissions Granted</h5>
                        <p className="text-gray-600 text-sm">Review role inheritance and remove unnecessary permissions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Role Conflicts and Overlaps</h5>
                        <p className="text-gray-600 text-sm">Consolidate similar roles and clarify permission boundaries</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Link href="/docs/troubleshooting-guide">
                    <Button variant="outline" className="gap-2">
                      Security Troubleshooting Guide
                    </Button>
                  </Link>
                  <Button variant="outline" className="gap-2">
                    RBAC Support: support@navimedi.org
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">RBAC Configuration Complete</h3>
                <p className="text-gray-700 mb-4">
                  You've successfully configured role-based access control for your NAVIMED platform. Your healthcare 
                  organization now has secure, compliant access controls that protect patient data while enabling 
                  efficient clinical workflows.
                </p>
                <div className="flex gap-3">
                  <Link href="/docs/comprehensive-user-training">
                    <Button className="gap-2">
                      Next: User Training Program
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Button>
                  </Link>
                  <Link href="/docs/system-admin-training">
                    <Button variant="outline">
                      Advanced Admin Training
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