import { ArrowLeft, Clock, Users, TestTube, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export function LaboratoryOrderProcessing() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Laboratory Order Processing</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>18 min read</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Intermediate</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Laboratory Information System</CardTitle>
                <CardDescription>Ordering lab tests, tracking results, and clinical decision support</CardDescription>
              </CardHeader>
              <CardContent>
                <p>NAVIMED's Laboratory Information System (LIS) streamlines the entire laboratory workflow from order creation through result reporting, ensuring accurate diagnostic testing and timely clinical decision-making.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Test Ordering
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Order Creation</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Comprehensive test catalog with CPT codes</li>
                    <li>• Clinical indication and diagnosis coding</li>
                    <li>• Specimen collection requirements</li>
                    <li>• Priority level assignment (routine, urgent, stat)</li>
                    <li>• Physician ordering and authorization</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Collection Management</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Specimen collection scheduling</li>
                    <li>• Barcode labeling and tracking</li>
                    <li>• Chain of custody documentation</li>
                    <li>• Sample integrity verification</li>
                    <li>• Transportation logistics</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Result Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Result Processing</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Automated instrument interfaces</li>
                    <li>• Quality control and validation</li>
                    <li>• Reference range verification</li>
                    <li>• Critical value notifications</li>
                    <li>• Technical and clinical review</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Reporting and Distribution</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Automated result delivery to providers</li>
                    <li>• Patient portal result access</li>
                    <li>• Critical value communication protocols</li>
                    <li>• Cumulative and trend reporting</li>
                    <li>• Integration with EHR systems</li>
                  </ul>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h5 className="font-medium text-orange-900 mb-1">Quality Assurance</h5>
                  <p className="text-orange-700 text-sm">Comprehensive quality control measures ensure accurate results with automated calibration, proficiency testing, and continuous monitoring protocols.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}