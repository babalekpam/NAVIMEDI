import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Shield, 
  Users, 
  Zap, 
  Globe, 
  Building2, 
  Stethoscope, 
  Pill, 
  TestTube, 
  FileText,
  Lock,
  Languages,
  Activity,
  Calendar,
  UserCheck,
  Database,
  CheckCircle,
  ArrowRight,
  Star
} from "lucide-react";
// Using direct path until assets alias is configured
const navimedLogo = "/src/assets/navimed-logo.jpg";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-blue-900 dark:to-emerald-900">
      {/* Header */}
      <header className="border-b border-white/20 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={navimedLogo} alt="NAVIMED" className="h-12 w-12 rounded-lg" />
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              NAVIMED
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-slate-600 hover:text-emerald-600 transition-colors">Features</a>
            <Link href="/pricing" className="text-slate-600 hover:text-emerald-600 transition-colors">Pricing</Link>
            <a href="#solutions" className="text-slate-600 hover:text-emerald-600 transition-colors">Solutions</a>
            <a href="#security" className="text-slate-600 hover:text-emerald-600 transition-colors">Security</a>
            <Link href="/login">
              <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-100">
            <Globe className="w-4 h-4 mr-2" />
            Multi-Tenant Healthcare Platform
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-emerald-700 to-blue-700 bg-clip-text text-transparent dark:from-slate-100 dark:via-emerald-300 dark:to-blue-300">
            Next-Generation Healthcare Management
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Comprehensive EHR/EMR/CRM platform with instant multilingual translation, 
            strict tenant isolation, and HIPAA-compliant workflows for modern healthcare organizations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 px-8">
                <Star className="w-5 h-5 mr-2" />
                View Pricing Plans
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <Building2 className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-emerald-600">50+</div>
              <div className="text-slate-600 dark:text-slate-400">Languages</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">99.9%</div>
              <div className="text-slate-600 dark:text-slate-400">Uptime</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-emerald-600">HIPAA</div>
              <div className="text-slate-600 dark:text-slate-400">Compliant</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-slate-600 dark:text-slate-400">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-20 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Intelligent Healthcare Solutions
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Advanced features designed for modern healthcare organizations with complete tenant isolation and instant translation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                    <Languages className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Instant Translation</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Real-time multilingual support with instant translation for patient records, prescriptions, and communications in 50+ languages.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Strict Tenant Isolation</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Complete data separation between healthcare organizations with database-level isolation. Only super admins can access all tenant data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                    <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">HIPAA Compliance</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Full HIPAA compliance with audit trails, encryption, and secure access controls meeting 2025 healthcare standards.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Complete EHR/EMR</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Comprehensive electronic health records with patient management, appointment scheduling, and clinical workflows.
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                    <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Smart Scheduling</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Intelligent appointment scheduling with provider management, automated reminders, and real-time availability.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Real-time Analytics</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Live dashboard with healthcare metrics, patient insights, and operational analytics for data-driven decisions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Healthcare Solutions */}
      <section id="solutions" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Comprehensive Healthcare Ecosystem
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Supporting all healthcare organizations with specialized workflows and integrations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-8 h-8 text-emerald-600" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Hospitals & Clinics</h3>
                </div>
                <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Patient Management System
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Electronic Health Records
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Appointment Scheduling
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Clinical Workflows
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Pill className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Pharmacies</h3>
                </div>
                <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Prescription Management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Inventory Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Drug Interaction Checking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Insurance Integration
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TestTube className="w-8 h-8 text-emerald-600" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Laboratories</h3>
                </div>
                <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Lab Order Management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Results Processing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Quality Control
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    LIMS Integration
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section id="security" className="py-20 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Enterprise-Grade Security
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Built with security-first architecture and comprehensive compliance standards
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">End-to-End Encryption</h3>
              <p className="text-slate-600 dark:text-slate-300">256-bit AES encryption for all data at rest and in transit</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Role-Based Access</h3>
              <p className="text-slate-600 dark:text-slate-300">Granular permissions and healthcare-specific role management</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Audit Trails</h3>
              <p className="text-slate-600 dark:text-slate-300">Complete activity logging for HIPAA compliance and forensics</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Compliance Ready</h3>
              <p className="text-slate-600 dark:text-slate-300">HIPAA, HITECH, and international healthcare standards</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Ready to Transform Your Healthcare Organization?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-3xl mx-auto">
            Join leading healthcare organizations using NAVIMED to deliver better patient care 
            with secure, multilingual, and compliant healthcare management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 px-8">
                <Heart className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Users className="w-5 h-5 mr-2" />
              Schedule Demo
            </Button>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-emerald-100">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>Trusted by 500+ Healthcare Organizations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-300" />
              <span>SOC 2 Type II Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-300" />
              <span>HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Independent Organizations Registration */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-green-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Register as Independent Organization
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Join the NAVIMED network as an independent healthcare service provider and expand your reach
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                    <TestTube className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Laboratory Services</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  Join as an independent diagnostic laboratory with comprehensive testing capabilities and seamless result integration with healthcare providers across the network.
                </p>
                <div className="mb-6">
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Receive lab orders from multiple healthcare providers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Automated result reporting and integration
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Quality control and compliance tracking
                    </li>
                  </ul>
                </div>
                <Link href="/laboratory-registration">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Register Laboratory
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                    <Pill className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pharmacy Services</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  Register as an independent pharmacy to receive prescriptions from healthcare providers and manage patient medication needs with complete insurance processing and delivery management.
                </p>
                <div className="mb-6">
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      Receive prescriptions from multiple healthcare providers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      Insurance claim processing and approval workflow
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      Delivery management and patient communication
                    </li>
                  </ul>
                </div>
                <Link href="/pharmacy-registration">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Register Pharmacy
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={navimedLogo} alt="NAVIMED" className="h-8 w-8 rounded-lg" />
                <span className="text-xl font-bold text-white">NAVIMED</span>
              </div>
              <p className="text-slate-400">
                Next-generation healthcare management platform with multilingual support and enterprise security.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">API Docs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Solutions</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Hospitals</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Clinics</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Pharmacies</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Laboratories</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 NAVIMED. All rights reserved. Built for healthcare organizations worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}