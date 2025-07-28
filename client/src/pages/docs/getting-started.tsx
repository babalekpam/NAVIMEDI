import { ArrowLeft, CheckCircle, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export function GettingStarted() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Getting Started with NAVIMED</h1>
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
                <CardTitle>Welcome to NAVIMED</CardTitle>
                <CardDescription>Your comprehensive healthcare management platform</CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>NAVIMED is a comprehensive healthcare management platform designed to streamline operations for hospitals, clinics, and pharmacies. This guide will walk you through the essential steps to get your organization up and running.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 1: Account Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Create Your Organization</h4>
                    <p className="text-gray-600">Register your hospital, clinic, or pharmacy with basic information including name, type, and contact details.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Verify Your Account</h4>
                    <p className="text-gray-600">Complete email verification and set up your administrator account with secure credentials.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Choose Your Plan</h4>
                    <p className="text-gray-600">Select from our Starter, Professional, Enterprise, or White Label plans based on your organization's needs.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 2: System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Configure Organization Settings</h4>
                    <p className="text-gray-600">Set up departments, specialties, and operational hours specific to your healthcare facility.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Define User Roles</h4>
                    <p className="text-gray-600">Create custom roles for physicians, nurses, administrators, and support staff with appropriate permissions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Set Up Integration</h4>
                    <p className="text-gray-600">Connect with existing laboratory systems, pharmacy networks, and insurance providers.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 3: Team Onboarding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Add Team Members</h4>
                    <p className="text-gray-600">Invite healthcare professionals and staff members to join your NAVIMED workspace.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Provide Training</h4>
                    <p className="text-gray-600">Use our comprehensive video tutorials and documentation to train your team on platform features.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Test Workflows</h4>
                    <p className="text-gray-600">Run through patient registration, appointment scheduling, and billing processes with sample data.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link href="/docs/patient-management">
                    <Button variant="outline" className="w-full justify-start">
                      Learn Patient Management
                    </Button>
                  </Link>
                  <Link href="/docs/appointment-scheduling">
                    <Button variant="outline" className="w-full justify-start">
                      Master Appointment Scheduling
                    </Button>
                  </Link>
                  <Link href="/docs/billing-insurance">
                    <Button variant="outline" className="w-full justify-start">
                      Set Up Billing & Insurance
                    </Button>
                  </Link>
                  <Link href="/docs/security-compliance">
                    <Button variant="outline" className="w-full justify-start">
                      Review Security & Compliance
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}