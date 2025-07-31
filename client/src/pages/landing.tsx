import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader } from "@/components/layout/public-header";
import navimedLogo from "@assets/JPG_1753663321927.jpg";
import { 
  Heart, 
  Shield, 
  Users, 
  User,
  Bolt, 
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
  Star,
  Play,
  Award,
  Zap,
  TrendingUp,
  Clock,
  Smartphone,
  Cloud,
  Brain,
  Monitor,
  Headphones,
  Rocket,
  MessageCircle,
  Phone,
  Mail
} from "lucide-react";

// Professional healthcare platform branding
const brandName = "NAVIMED";
const tagline = "Next-Generation Healthcare Management Platform";

export default function LandingPage() {
  console.log("🏠 LandingPage component rendering");
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="text-center max-w-5xl mx-auto">
            {/* Trust Badge */}
            <Badge className="mb-8 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-4 py-2">
              <Award className="w-4 h-4 mr-2" />
              HIPAA Compliant • SOC 2 Type II • FDA 21 CFR Part 11
            </Badge>
            
            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Transform
              </span>
              <br />
              <span className="text-slate-900">Healthcare Delivery</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Enterprise-grade healthcare management platform with real-time multilingual translation, 
              complete tenant isolation, and intelligent workflow automation.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-xl shadow-emerald-600/25 px-8 py-4 text-lg">
                  <Play className="w-5 h-5 mr-2" />
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg">
                  <Monitor className="w-5 h-5 mr-2" />
                  Provider Login
                </Button>
              </Link>
              <Link href="/patient-login">
                <Button size="lg" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg">
                  <User className="w-5 h-5 mr-2" />
                  Patient Portal
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-3">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">99.9%</div>
                <div className="text-slate-600 font-medium">Uptime SLA</div>
              </div>
              <div className="space-y-3">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">50+</div>
                <div className="text-slate-600 font-medium">Languages</div>
              </div>
              <div className="space-y-3">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">&lt;2s</div>
                <div className="text-slate-600 font-medium">Response Time</div>
              </div>
              <div className="space-y-3">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">24/7</div>
                <div className="text-slate-600 font-medium">Expert Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
              <Brain className="w-4 h-4 mr-2" />
              Powered by Advanced AI
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
              Enterprise-Grade <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Healthcare Platform</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Complete healthcare management ecosystem with AI-powered insights, real-time translation, 
              and military-grade security for modern healthcare organizations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gradient-to-br hover:from-emerald-50 hover:to-blue-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl transition-colors">
                    <Languages className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Real-Time Translation</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Instant multilingual support across 50+ languages with AI-powered medical terminology translation for global healthcare delivery.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-emerald-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-100 group-hover:bg-blue-200 rounded-xl transition-colors">
                    <Shield className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Military-Grade Security</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Bank-level encryption, complete tenant isolation, and HIPAA compliance with comprehensive audit trails and access controls.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gradient-to-br hover:from-emerald-50 hover:to-blue-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl transition-colors">
                    <Brain className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">AI-Powered Insights</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Advanced analytics and predictive insights for patient care optimization, resource planning, and clinical decision support.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-emerald-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-100 group-hover:bg-blue-200 rounded-xl transition-colors">
                    <Stethoscope className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Complete EHR/EMR</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Comprehensive electronic health records with patient management, clinical workflows, and seamless provider collaboration.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gradient-to-br hover:from-emerald-50 hover:to-blue-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl transition-colors">
                    <Cloud className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Cloud-Native Architecture</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Scalable, reliable infrastructure with 99.9% uptime SLA, automatic backups, and disaster recovery capabilities.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-emerald-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-100 group-hover:bg-blue-200 rounded-xl transition-colors">
                    <Smartphone className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Mobile-First Design</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Responsive design optimized for all devices with offline capabilities and real-time synchronization.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-slate-900">
              Trusted by Healthcare Organizations Worldwide
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join thousands of healthcare professionals who rely on our platform for secure, efficient patient care.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-emerald-600 mb-2">500+</div>
              <div className="text-slate-600 font-medium">Healthcare Organizations</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">1M+</div>
              <div className="text-slate-600 font-medium">Patient Records Managed</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-emerald-600 mb-2">99.9%</div>
              <div className="text-slate-600 font-medium">Customer Satisfaction</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center border-0 shadow-lg">
              <Award className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h4 className="font-bold text-slate-900 mb-2">HIPAA Compliant</h4>
              <p className="text-slate-600 text-sm">Full healthcare compliance certification</p>
            </Card>
            <Card className="p-6 text-center border-0 shadow-lg">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="font-bold text-slate-900 mb-2">SOC 2 Type II</h4>
              <p className="text-slate-600 text-sm">Enterprise security standards</p>
            </Card>
            <Card className="p-6 text-center border-0 shadow-lg">
              <Globe className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h4 className="font-bold text-slate-900 mb-2">Global Ready</h4>
              <p className="text-slate-600 text-sm">Multi-language, multi-region support</p>
            </Card>
            <Card className="p-6 text-center border-0 shadow-lg">
              <Headphones className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="font-bold text-slate-900 mb-2">24/7 Support</h4>
              <p className="text-slate-600 text-sm">Expert healthcare IT support</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Healthcare Solutions */}
      <section id="solutions" className="py-24 bg-slate-50">
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

      {/* Professional CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 via-blue-600 to-emerald-700">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white">
              Ready to Transform Your Healthcare Operations?
            </h2>
            <p className="text-xl text-emerald-50 mb-12 leading-relaxed">
              Join the future of healthcare management with our enterprise-grade platform. 
              Start your 14-day free trial today - no credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link href="/register">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl px-8 py-4 text-lg font-semibold">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#contact" className="px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-emerald-600 transition-all duration-300 rounded-lg inline-flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Schedule Demo
              </a>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-white/90">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-200" />
                <span className="font-medium">14-Day Free Trial</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-200" />
                <span className="font-medium">No Credit Card Required</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-200" />
                <span className="font-medium">Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Let's Build the Future of Healthcare Together
              </h2>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Our healthcare technology experts are ready to help you implement 
                the perfect solution for your organization's unique needs.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">Sales Team</div>
                    <div className="text-slate-300">314-472-3839</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">Enterprise Sales</div>
                    <div className="text-slate-300">info@argilette.com</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">24/7 Technical Support</div>
                    <div className="text-slate-300">Available for all Enterprise customers</div>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="bg-white text-slate-900 p-8">
              <h3 className="text-2xl font-bold mb-6">Schedule Your Personal Demo</h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input type="text" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input type="text" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Work Email</label>
                  <input type="email" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Organization</label>
                  <input type="text" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Organization Type</label>
                  <select className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    <option>Select organization type</option>
                    <option>Hospital</option>
                    <option>Clinic</option>
                    <option>Pharmacy</option>
                    <option>Laboratory</option>
                    <option>Other</option>
                  </select>
                </div>
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 py-3 text-lg">
                  Schedule Demo
                  <Calendar className="w-5 h-5 ml-2" />
                </Button>
              </div>
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
                <img src={navimedLogo} alt="NaviMed" className="h-10 w-10 rounded-lg object-contain" />
                <span className="text-xl font-bold text-white">{brandName}</span>
              </div>
              <p className="text-slate-400">
                Next-generation healthcare management platform with multilingual support and enterprise security.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="/features" className="hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="/security" className="hover:text-emerald-400 transition-colors">Security</a></li>
                <li><a href="/integrations" className="hover:text-emerald-400 transition-colors">Integrations</a></li>
                <li><a href="/api-docs" className="hover:text-emerald-400 transition-colors">API Docs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Solutions</h4>
              <ul className="space-y-2">
                <li><a href="/solutions/hospitals" className="hover:text-emerald-400 transition-colors">Hospitals</a></li>
                <li><a href="/solutions/clinics" className="hover:text-emerald-400 transition-colors">Clinics</a></li>
                <li><a href="/solutions/pharmacies" className="hover:text-emerald-400 transition-colors">Pharmacies</a></li>
                <li><a href="/solutions/laboratories" className="hover:text-emerald-400 transition-colors">Laboratories</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="/support/documentation" className="hover:text-emerald-400 transition-colors">Documentation</a></li>
                <li><a href="/support/help-center" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
                <li><a href="/support/contact" className="hover:text-emerald-400 transition-colors">Contact Us</a></li>
                <li><a href="/support/status" className="hover:text-emerald-400 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 NAVIMED By ARGILETTE Labs. All rights reserved. Built for healthcare organizations worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}