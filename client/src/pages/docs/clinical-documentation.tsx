import { ArrowLeft, Clock, Users, FileText, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export function ClinicalDocumentation() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Clinical Documentation</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>28 min read</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Advanced</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Note Management</CardTitle>
                <CardDescription>Best practices for clinical notes, consultation records, and care documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <p>NAVIMED's clinical documentation system enables comprehensive patient care documentation with structured templates, voice recognition, and integrated clinical decision support to improve care quality and regulatory compliance.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documentation Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Progress Notes</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• SOAP note templates (Subjective, Objective, Assessment, Plan)</li>
                    <li>• Specialty-specific documentation templates</li>
                    <li>• Problem-oriented medical records (POMR)</li>
                    <li>• Interval history and follow-up documentation</li>
                    <li>• Provider authentication and timestamps</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Consultation Notes</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Referral reason and clinical question</li>
                    <li>• Comprehensive history and examination</li>
                    <li>• Specialist recommendations and treatment plans</li>
                    <li>• Diagnostic impressions and differential diagnosis</li>
                    <li>• Follow-up instructions and care coordination</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Procedure Documentation</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Pre-procedure assessment and consent</li>
                    <li>• Intraoperative notes and findings</li>
                    <li>• Post-procedure monitoring and complications</li>
                    <li>• Specimen collection and pathology requests</li>
                    <li>• Discharge instructions and follow-up care</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Documentation Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Smart Templates</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Customizable note templates by specialty</li>
                    <li>• Auto-population from previous visits</li>
                    <li>• Smart phrases and abbreviation expansion</li>
                    <li>• Clinical decision support integration</li>
                    <li>• Quality measure documentation prompts</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Voice Recognition</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Real-time speech-to-text conversion</li>
                    <li>• Medical vocabulary optimization</li>
                    <li>• Voice command navigation</li>
                    <li>• Hands-free documentation workflow</li>
                    <li>• Integration with mobile devices</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h5 className="font-medium text-purple-900 mb-1">Compliance Features</h5>
                  <p className="text-purple-700 text-sm">Built-in compliance checking ensures documentation meets regulatory requirements with automated alerts for missing elements and quality measures.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}