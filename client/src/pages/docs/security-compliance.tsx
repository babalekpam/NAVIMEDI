import { ArrowLeft, Clock, Users, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export function SecurityCompliance() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Security & Compliance</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>40 min read</span>
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
                <CardTitle>Overview</CardTitle>
                <CardDescription>HIPAA compliance and enterprise security for healthcare data</CardDescription>
              </CardHeader>
              <CardContent>
                <p>NAVIMED implements comprehensive security measures and maintains strict HIPAA compliance to protect sensitive healthcare information while enabling efficient clinical workflows.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  HIPAA Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Administrative Safeguards</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Security Officer designation and responsibilities</li>
                    <li>• Workforce training and access management</li>
                    <li>• Information access management protocols</li>
                    <li>• Security awareness and training programs</li>
                    <li>• Incident response procedures</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Physical Safeguards</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Facility access controls and monitoring</li>
                    <li>• Workstation security and positioning</li>
                    <li>• Device and media controls</li>
                    <li>• Automatic logoff and screen locks</li>
                    <li>• Secure disposal of PHI-containing media</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Technical Safeguards</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Access control and unique user identification</li>
                    <li>• Audit controls and logging</li>
                    <li>• Data integrity controls</li>
                    <li>• Transmission security and encryption</li>
                    <li>• Emergency access procedures</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Encryption Standards</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• AES-256 encryption for data at rest</li>
                    <li>• TLS 1.3 for data in transit</li>
                    <li>• End-to-end encryption for API communications</li>
                    <li>• Encrypted database storage</li>
                    <li>• Secure key management (HSM)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Access Controls</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Role-based access control (RBAC)</li>
                    <li>• Multi-factor authentication (MFA)</li>
                    <li>• Single sign-on (SSO) integration</li>
                    <li>• Session management and timeouts</li>
                    <li>• Principle of least privilege</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h5 className="font-medium text-red-900 mb-1">Security Alert</h5>
                  <p className="text-red-700 text-sm">All security incidents must be reported within 1 hour of discovery. Enable breach detection monitoring and maintain incident response procedures.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}