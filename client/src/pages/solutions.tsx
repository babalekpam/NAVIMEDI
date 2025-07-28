import { PublicHeader } from "@/components/layout/public-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Building2, 
  Stethoscope, 
  Pill, 
  TestTube, 
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Activity,
  FileText,
  Calendar,
  Heart
} from "lucide-react";

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/30">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-8 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Tailored Healthcare Solutions
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Solutions Built
              </span>
              <br />
              <span className="text-slate-900">for Every Healthcare Setting</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              From small clinics to large health systems, NAVIMED adapts to your unique needs with specialized workflows and features.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Hospitals */}
            <Card className="border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-10 h-10 text-emerald-600" />
                </div>
                <CardTitle className="text-3xl mb-4">Hospitals</CardTitle>
                <p className="text-slate-600 text-lg">
                  Comprehensive hospital management with advanced clinical workflows and multi-departmental coordination.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Multi-Department Management</h4>
                      <p className="text-sm text-slate-600">Coordinate care across emergency, surgery, ICU, and specialty departments</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Advanced Clinical Workflows</h4>
                      <p className="text-sm text-slate-600">Streamlined patient flow from admission to discharge</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Resource Management</h4>
                      <p className="text-sm text-slate-600">Optimize bed allocation, staff scheduling, and equipment usage</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Quality Metrics & Reporting</h4>
                      <p className="text-sm text-slate-600">Track patient outcomes and regulatory compliance</p>
                    </div>
                  </div>
                </div>
                <Link href="/register">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Start Hospital Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Clinics */}
            <Card className="border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Stethoscope className="w-10 h-10 text-blue-600" />
                </div>
                <CardTitle className="text-3xl mb-4">Clinics</CardTitle>
                <p className="text-slate-600 text-lg">
                  Streamlined clinic operations with focus on patient care and practice efficiency.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Appointment Management</h4>
                      <p className="text-sm text-slate-600">Online booking, automated reminders, and waitlist management</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Patient Records & History</h4>
                      <p className="text-sm text-slate-600">Complete medical records with easy access and updates</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Billing & Insurance</h4>
                      <p className="text-sm text-slate-600">Automated claims processing and payment tracking</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Practice Analytics</h4>
                      <p className="text-sm text-slate-600">Revenue insights and patient flow optimization</p>
                    </div>
                  </div>
                </div>
                <Link href="/register">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Start Clinic Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pharmacies */}
            <Card className="border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Pill className="w-10 h-10 text-purple-600" />
                </div>
                <CardTitle className="text-3xl mb-4">Pharmacies</CardTitle>
                <p className="text-slate-600 text-lg">
                  Complete pharmacy management with prescription processing and inventory control.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">E-Prescription Processing</h4>
                      <p className="text-sm text-slate-600">Receive and process digital prescriptions from healthcare providers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Inventory Management</h4>
                      <p className="text-sm text-slate-600">Track stock levels, expiration dates, and automated reordering</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Insurance Claims</h4>
                      <p className="text-sm text-slate-600">Automated claim submission and adjudication</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Patient Communication</h4>
                      <p className="text-sm text-slate-600">Automated notifications and medication counseling tools</p>
                    </div>
                  </div>
                </div>
                <Link href="/register">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Start Pharmacy Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Laboratories */}
            <Card className="border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TestTube className="w-10 h-10 text-green-600" />
                </div>
                <CardTitle className="text-3xl mb-4">Laboratories</CardTitle>
                <p className="text-slate-600 text-lg">
                  Advanced laboratory information system with quality control and result management.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Order Management</h4>
                      <p className="text-sm text-slate-600">Receive and track lab orders from multiple healthcare providers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Result Processing</h4>
                      <p className="text-sm text-slate-600">Automated result entry with quality control and validation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Critical Value Alerts</h4>
                      <p className="text-sm text-slate-600">Immediate notification system for urgent results</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Compliance Tracking</h4>
                      <p className="text-sm text-slate-600">Quality assurance and regulatory compliance monitoring</p>
                    </div>
                  </div>
                </div>
                <Link href="/register">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Start Laboratory Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 via-blue-600 to-emerald-700">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold mb-8 text-white">
              Ready to Transform Your Organization?
            </h2>
            <p className="text-xl text-emerald-50 mb-12 leading-relaxed">
              Join thousands of healthcare organizations already using NAVIMED to improve patient care and operational efficiency.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl px-8 py-4 text-lg font-semibold">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 text-lg font-semibold">
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}