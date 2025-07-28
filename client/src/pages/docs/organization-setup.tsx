import { ArrowLeft, Clock, Users, Building, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export function OrganizationSetup() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Organization Setup</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>15 min read</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Beginner</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Initial Organization Registration</CardTitle>
                <CardDescription>Step-by-step guide to setting up your healthcare organization</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Setting up your healthcare organization in NAVIMED is the first step toward digital transformation. This guide walks you through the complete registration and configuration process.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Registration Process
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Organization Type Selection</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• <strong>Hospital:</strong> Large medical facilities with multiple departments</li>
                    <li>• <strong>Clinic:</strong> Outpatient care facilities and medical practices</li>
                    <li>• <strong>Pharmacy:</strong> Prescription dispensing and medication management</li>
                    <li>• <strong>Laboratory:</strong> Diagnostic testing and pathology services</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Organization Details</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Organization name and legal business name</li>
                    <li>• Primary contact information and address</li>
                    <li>• Tax identification and license numbers</li>
                    <li>• Subdomain selection for your platform URL</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3. Administrator Account Creation</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Primary administrator email and secure password</li>
                    <li>• Multi-factor authentication setup</li>
                    <li>• Emergency contact designation</li>
                    <li>• Security question configuration</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Initial Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Feature Selection</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Electronic Health Records (EHR)</li>
                    <li>• Laboratory Information System (LIS)</li>
                    <li>• Billing and Insurance Processing</li>
                    <li>• Pharmacy Management System</li>
                    <li>• Telemedicine Capabilities</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Branding Customization</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Organization logo upload and positioning</li>
                    <li>• Brand color scheme configuration</li>
                    <li>• Custom domain setup (optional)</li>
                    <li>• Email template customization</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-1">Getting Started</h5>
                  <p className="text-blue-700 text-sm">After completing the setup, you'll receive a confirmation email with your login credentials and next steps for team member onboarding.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}