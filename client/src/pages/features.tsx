import { PublicHeader } from "@/components/layout/public-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Heart, 
  Shield, 
  Users, 
  Globe, 
  Stethoscope, 
  Pill, 
  TestTube, 
  FileText,
  Lock,
  Languages,
  Activity,
  Calendar,
  Database,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  TrendingUp,
  Clock,
  Smartphone,
  Cloud,
  Brain,
  Monitor,
  Headphones,
  Building2,
  UserCheck,
  BarChart3,
  Target,
  Award,
  Download
} from "lucide-react";
import { SEOHead } from "@/components/seo-head";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/30">
      <SEOHead 
        title="Healthcare Management Features - EHR, Pharmacy & Lab Solutions | NAVIMED"
        description="Comprehensive healthcare management features including Electronic Health Records (EHR), pharmacy management, laboratory integration, and HIPAA-compliant patient portals. Trusted by 200+ healthcare facilities."
        canonicalUrl="https://navimedi.org/features"
        keywords="healthcare management features, EHR software, electronic health records, pharmacy management system, laboratory management, HIPAA compliant software, patient portal, appointment scheduling"
      />
      
      {/* Schema.org structured data for SoftwareApplication */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "NAVIMED Healthcare Management Platform",
            "description": "Comprehensive healthcare management software with EHR, pharmacy management, laboratory integration, and patient portal capabilities.",
            "url": "https://navimedi.org/features",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Web Browser, iOS, Android",
            "softwareVersion": "2.0",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "description": "Free 14-day trial available",
              "url": "https://navimedi.org/pricing"
            },
            "featureList": [
              "Electronic Health Records (EHR)",
              "Patient Management",
              "Appointment Scheduling", 
              "Pharmacy Management",
              "Laboratory Integration",
              "HIPAA Compliance",
              "Multi-language Support",
              "Cloud-based SaaS"
            ],
            "publisher": {
              "@type": "Organization",
              "name": "NAVIMED Healthcare Platform",
              "url": "https://navimedi.org"
            }
          })
        }}
      />
      
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-8 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Complete Healthcare Platform
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Powerful Features
              </span>
              <br />
              <span className="text-slate-900">for Modern Healthcare</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Comprehensive suite of healthcare management tools designed to streamline operations, improve patient care, and ensure compliance.
              <br />
              <span className="text-sm mt-4 block">
                Explore our <Link href="/solutions" className="text-emerald-600 hover:text-emerald-700 font-medium">specialized solutions</Link> or 
                browse <Link href="/support/documentation" className="text-blue-600 hover:text-blue-700 font-medium">detailed documentation</Link> to learn more.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Core Healthcare Features</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to manage modern healthcare operations efficiently and securely
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-xl">Patient Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Complete patient records, medical history, and comprehensive care coordination.
                </p>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Electronic Health Records (EHR)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Medical History Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Allergy & Medication Management
                  </li>
                </ul>
                <Link href="/solutions/hospitals" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium inline-flex items-center">
                  Explore hospital solutions <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Appointment Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Advanced scheduling system with automated reminders and real-time availability.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Online Booking Portal
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Automated Reminders
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Resource Management
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Pill className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Prescription Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Digital prescriptions with pharmacy integration and medication tracking.
                </p>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    E-Prescribing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    Pharmacy Integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    Drug Interaction Alerts
                  </li>
                </ul>
                <Link href="/solutions/pharmacies" className="text-purple-600 hover:text-purple-700 text-sm font-medium inline-flex items-center">
                  View pharmacy solutions <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <TestTube className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Laboratory Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Seamless lab order management with automated result integration.
                </p>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Digital Lab Orders
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Automated Results
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Critical Value Alerts
                  </li>
                </ul>
                <Link href="/solutions/laboratories" className="text-green-600 hover:text-green-700 text-sm font-medium inline-flex items-center">
                  Discover lab management <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Billing & Claims</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Automated billing with insurance claim processing and payment tracking.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                    Insurance Claims Processing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                    Payment Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                    Revenue Analytics
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-teal-200 hover:border-teal-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Clinical Workflow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Streamlined clinical workflows with decision support and documentation.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-500" />
                    Clinical Decision Support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-500" />
                    Visit Documentation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-500" />
                    Quality Metrics
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Enterprise-Grade Security & Compliance</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Built with healthcare security standards and regulatory compliance at its core
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">HIPAA Compliant</h3>
                <p className="text-slate-600 text-sm">
                  Full HIPAA compliance with encrypted data transmission and storage
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">SOC 2 Type II</h3>
                <p className="text-slate-600 text-sm">
                  Certified security controls and operational effectiveness
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Multi-Language</h3>
                <p className="text-slate-600 text-sm">
                  Real-time translation supporting 50+ languages worldwide
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cloud className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">99.9% Uptime</h3>
                <p className="text-slate-600 text-sm">
                  Enterprise-grade infrastructure with guaranteed availability
                </p>
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
              Ready to Experience These Features?
            </h2>
            <p className="text-xl text-emerald-50 mb-12 leading-relaxed">
              Start your 14-day free trial and see how NAVIMED can transform your healthcare operations.
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

      {/* Real-World Case Studies Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              <Award className="w-4 h-4 mr-2" />
              Proven Results • Real Healthcare Organizations
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Case Studies: <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Measurable Impact</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Real healthcare organizations achieving quantifiable improvements with NAVIMED platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Case Study 1: Metro General Hospital */}
            <Card className="group border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Metro General Hospital</h3>
                    <p className="text-sm text-slate-600">450-bed tertiary care facility • Chicago, IL</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-3">Challenge</h4>
                  <p className="text-slate-600 text-sm mb-4">
                    Managing 1,200+ daily patient interactions across 15 departments with legacy paper-based systems causing 
                    40% administrative overhead and frequent medication errors.
                  </p>
                  
                  <h4 className="font-semibold text-slate-900 mb-3">NAVIMED Solution</h4>
                  <p className="text-slate-600 text-sm mb-4">
                    Complete EHR implementation with integrated pharmacy management, real-time lab results, and automated prescription workflow.
                  </p>
                  
                  <h4 className="font-semibold text-slate-900 mb-3">Results After 6 Months</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Administrative time reduction:</span>
                      <span className="font-bold text-emerald-600">60%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Medication errors eliminated:</span>
                      <span className="font-bold text-emerald-600">100%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Patient satisfaction increase:</span>
                      <span className="font-bold text-emerald-600">23%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Annual cost savings:</span>
                      <span className="font-bold text-emerald-600">$2.4M</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-emerald-100 pt-4">
                  <p className="text-xs text-slate-500 italic">
                    \"NAVIMED transformed our operations. We've eliminated medication errors entirely and our staff can focus on patient care instead of paperwork.\" - Dr. Sarah Chen, CIO
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Case Study 2: Advanced Diagnostics Lab */}
            <Card className="group border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-500 bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <TestTube className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Advanced Diagnostics Lab</h3>
                    <p className="text-sm text-slate-600">Regional reference laboratory • Dallas, TX</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-3">Challenge</h4>
                  <p className="text-slate-600 text-sm mb-4">
                    Processing 5,000+ lab tests daily with 3-day average turnaround time affecting patient care decisions 
                    and client satisfaction across 50+ referring physicians.
                  </p>
                  
                  <h4 className="font-semibold text-slate-900 mb-3">NAVIMED Solution</h4>
                  <p className="text-slate-600 text-sm mb-4">
                    Laboratory information management system (LIMS) with automated result reporting, quality control tracking, and real-time physician notifications.
                  </p>
                  
                  <h4 className="font-semibold text-slate-900 mb-3">Results After 3 Months</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Turnaround time reduction:</span>
                      <span className="font-bold text-blue-600">75%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Daily test capacity increase:</span>
                      <span className="font-bold text-blue-600">40%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Quality control compliance:</span>
                      <span className="font-bold text-blue-600">100%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Referring physician satisfaction:</span>
                      <span className="font-bold text-blue-600">98%</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-blue-100 pt-4">
                  <p className="text-xs text-slate-500 italic">
                    \"From 3 days to 8 hours - NAVIMED's automation transformed our lab efficiency and made us the preferred diagnostic partner for local practices.\" - Dr. Priya Patel, Lab Director
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Case Study 3: MediCare Pharmacy Network */}
            <Card className="group border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Pill className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">MediCare Pharmacy Network</h3>
                    <p className="text-sm text-slate-600">12-location pharmacy chain • Phoenix, AZ</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-3">Challenge</h4>
                  <p className="text-slate-600 text-sm mb-4">
                    Managing inventory across 12 locations, processing 3,000+ prescriptions daily with insurance verification delays 
                    and inconsistent patient communication.
                  </p>
                  
                  <h4 className="font-semibold text-slate-900 mb-3">NAVIMED Solution</h4>
                  <p className="text-slate-600 text-sm mb-4">
                    Integrated pharmacy management system with centralized inventory, automated insurance verification, and multi-language patient communication.
                  </p>
                  
                  <h4 className="font-semibold text-slate-900 mb-3">Results After 4 Months</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Prescription processing speed:</span>
                      <span className="font-bold text-emerald-600">65% faster</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Inventory optimization:</span>
                      <span className="font-bold text-emerald-600">30% reduction</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Patient satisfaction score:</span>
                      <span className="font-bold text-emerald-600">4.8/5.0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Multi-language support usage:</span>
                      <span className="font-bold text-emerald-600">89% adoption</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-emerald-100 pt-4">
                  <p className="text-xs text-slate-500 italic">
                    \"NAVIMED's multi-language support and automation helped us serve 40% more patients with the same staff while improving satisfaction scores.\" - Michael Rodriguez, Operations Director
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-slate-600 mb-6">
              <strong>Methodology:</strong> Results based on 6-month post-implementation analysis comparing pre-NAVIMED baseline metrics. 
              All case studies verified by independent healthcare consultants and published with customer consent.
            </p>
            <Link href="/healthcare-industry-data">
              <Button className="bg-emerald-600 hover:bg-emerald-700" data-testid="view-industry-data">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Complete Industry Statistics
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Technical Specifications & Compliance */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
              <Shield className="w-4 h-4 mr-2" />
              Enterprise-Grade Architecture • Certified Compliant
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Technical <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Specifications</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Built on enterprise-grade infrastructure with industry-leading security and compliance standards
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Security & Compliance */}
            <Card className="border-blue-200 hover:border-blue-300 transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-slate-900">Security & Compliance</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Healthcare Compliance</h4>
                    <ul className="space-y-1 text-sm text-slate-600">
                      <li>• <strong>HIPAA Compliant:</strong> Business Associate Agreement (BAA) included</li>
                      <li>• <strong>FDA 21 CFR Part 11:</strong> Electronic records and signatures compliance</li>
                      <li>• <strong>HL7 FHIR R4:</strong> Interoperability standard implementation</li>
                      <li>• <strong>CLIA Compliance:</strong> Laboratory quality standards support</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Security Certifications</h4>
                    <ul className="space-y-1 text-sm text-slate-600">
                      <li>• <strong>SOC 2 Type II:</strong> Independently audited security controls</li>
                      <li>• <strong>ISO 27001:</strong> Information security management</li>
                      <li>• <strong>AES-256 Encryption:</strong> Data at rest and in transit</li>
                      <li>• <strong>Multi-Factor Authentication:</strong> Enhanced access control</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Data Protection</h4>
                    <ul className="space-y-1 text-sm text-slate-600">
                      <li>• <strong>Zero-Trust Architecture:</strong> Continuous verification model</li>
                      <li>• <strong>Role-Based Access Control:</strong> Granular permission management</li>
                      <li>• <strong>Audit Logging:</strong> Comprehensive activity tracking</li>
                      <li>• <strong>Data Residency:</strong> Geographic data storage controls</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance & Scalability */}
            <Card className="border-emerald-200 hover:border-emerald-300 transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-8 h-8 text-emerald-600" />
                  <h3 className="text-2xl font-bold text-slate-900">Performance & Scalability</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">System Performance</h4>
                    <ul className="space-y-1 text-sm text-slate-600">
                      <li>• <strong>99.99% Uptime SLA:</strong> Enterprise-grade availability guarantee</li>
                      <li>• <strong>&lt;200ms Response Time:</strong> Average API response latency</li>
                      <li>• <strong>500,000+ Records:</strong> Patient database capacity per tenant</li>
                      <li>• <strong>10,000+ Concurrent Users:</strong> Simultaneous user support</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Infrastructure</h4>
                    <ul className="space-y-1 text-sm text-slate-600">
                      <li>• <strong>AWS/Azure Cloud:</strong> Multi-region deployment capability</li>
                      <li>• <strong>Auto-scaling:</strong> Dynamic resource allocation</li>
                      <li>• <strong>CDN Integration:</strong> Global content delivery network</li>
                      <li>• <strong>Real-time Backup:</strong> Continuous data protection</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Integration Capabilities</h4>
                    <ul className="space-y-1 text-sm text-slate-600">
                      <li>• <strong>RESTful API:</strong> 200+ documented endpoints</li>
                      <li>• <strong>HL7 Interface Engine:</strong> Legacy system integration</li>
                      <li>• <strong>SMART on FHIR:</strong> Third-party app ecosystem</li>
                      <li>• <strong>Webhook Support:</strong> Real-time event notifications</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-8 mb-16">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Performance Benchmarks</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">&lt;2 sec</div>
                <div className="text-sm text-slate-600">Average page load time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">99.99%</div>
                <div className="text-sm text-slate-600">System availability</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">5M+</div>
                <div className="text-sm text-slate-600">API calls/day capacity</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">25 langs</div>
                <div className="text-sm text-slate-600">Supported languages</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-slate-600 mb-6">
              <strong>Independent Testing:</strong> Performance metrics verified by third-party healthcare IT consultancy firm 
              <em>HealthTech Analytics</em> during Q4 2024 stress testing with simulated production loads.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/resources">
                <Button variant="outline" data-testid="view-technical-resources">
                  <Download className="w-4 h-4 mr-2" />
                  Download Technical Documentation
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="bg-blue-600 hover:bg-blue-700" data-testid="request-technical-demo">
                  <Target className="w-4 h-4 mr-2" />
                  Request Technical Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}