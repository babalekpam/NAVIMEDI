import { ArrowLeft, Clock, Users, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export function PlatformOverview() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Platform Overview</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>10 min read</span>
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
                <CardDescription>Complete introduction to our healthcare platform</CardDescription>
              </CardHeader>
              <CardContent>
                <p>NAVIMED is a comprehensive multi-tenant healthcare management platform designed to streamline operations for hospitals, clinics, and pharmacies. Our platform integrates patient care, administrative workflows, and business operations into a unified digital ecosystem.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Core Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Patient Management</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Comprehensive electronic health records (EHR)</li>
                    <li>• Patient registration and demographic management</li>
                    <li>• Medical history tracking and clinical notes</li>
                    <li>• Allergy and medication management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Clinical Operations</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Advanced appointment scheduling and calendar management</li>
                    <li>• Digital prescription creation and pharmacy routing</li>
                    <li>• Laboratory order processing and result tracking</li>
                    <li>• Clinical documentation and visit summaries</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Business Management</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Insurance claims processing and billing</li>
                    <li>• Revenue cycle management</li>
                    <li>• Multi-language support (English, Spanish, French)</li>
                    <li>• Role-based access control and permissions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">HIPAA Compliance</h4>
                  <p className="text-gray-600">Full HIPAA compliance with comprehensive audit trails, data encryption, and secure access controls to protect patient health information.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data Security</h4>
                  <p className="text-gray-600">Enterprise-grade security with AES-256 encryption, TLS 1.3 communications, and multi-factor authentication for all user accounts.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}