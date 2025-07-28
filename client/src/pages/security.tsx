import { PublicHeader } from "@/components/layout/public-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Shield, 
  Lock, 
  Eye, 
  FileCheck,
  CheckCircle,
  ArrowRight,
  Star,
  Key,
  Globe,
  Server,
  UserCheck,
  Zap
} from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/30">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-8 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Enterprise-Grade Security
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Security & Compliance
              </span>
              <br />
              <span className="text-slate-900">You Can Trust</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              NAVIMED is built with healthcare security standards and regulatory compliance at its foundation, ensuring your patient data is always protected.
            </p>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Industry Certifications & Compliance</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Certified and audited by leading security organizations to meet the highest healthcare standards
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">HIPAA Compliant</h3>
                <p className="text-slate-600 text-sm">
                  Full compliance with Health Insurance Portability and Accountability Act requirements
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">SOC 2 Type II</h3>
                <p className="text-slate-600 text-sm">
                  Independently audited security controls and operational effectiveness
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">FDA 21 CFR Part 11</h3>
                <p className="text-slate-600 text-sm">
                  Electronic records and signatures compliance for clinical environments
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">GDPR Ready</h3>
                <p className="text-slate-600 text-sm">
                  European data protection regulation compliance with data sovereignty
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Advanced Security Features</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Multiple layers of security protection to safeguard patient data and healthcare operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-xl">End-to-End Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  AES-256 encryption for data at rest and TLS 1.3 for data in transit.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Database encryption at rest
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Encrypted data transmission
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Key rotation management
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <UserCheck className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Multi-Factor Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Advanced authentication with role-based access controls and audit trails.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    SMS and email 2FA
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Biometric authentication
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Session management
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Audit & Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Comprehensive audit logging with real-time monitoring and alerts.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    Complete audit trails
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    Real-time monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    Anomaly detection
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Server className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Data Isolation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Complete tenant isolation with dedicated resources and data segregation.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Multi-tenant architecture
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Data segregation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Resource isolation
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Key className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Access Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Granular role-based permissions with principle of least privilege.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                    Role-based permissions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                    Least privilege access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                    Time-based access
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-teal-200 hover:border-teal-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Incident Response</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  24/7 security monitoring with automated incident response and recovery.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-500" />
                    24/7 SOC monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-500" />
                    Automated response
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-500" />
                    Disaster recovery
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Infrastructure Security */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Infrastructure Security</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Built on enterprise-grade cloud infrastructure with multiple security layers
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Server className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Secure Cloud Hosting</h3>
                  <p className="text-slate-600">
                    Hosted on AWS with enterprise-grade security controls, DDoS protection, and 99.9% uptime SLA.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Network Security</h3>
                  <p className="text-slate-600">
                    Multiple firewalls, intrusion detection systems, and network segmentation to protect against threats.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Data Backup & Recovery</h3>
                  <p className="text-slate-600">
                    Automated encrypted backups with point-in-time recovery and geographic replication.
                  </p>
                </div>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-center">Security Statistics</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">99.9%</div>
                    <div className="text-sm text-slate-600">Uptime SLA</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">&lt;2s</div>
                    <div className="text-sm text-slate-600">Incident Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                    <div className="text-sm text-slate-600">Security Monitoring</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">0</div>
                    <div className="text-sm text-slate-600">Data Breaches</div>
                  </div>
                </div>
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
              Trust in Security, Focus on Care
            </h2>
            <p className="text-xl text-emerald-50 mb-12 leading-relaxed">
              With enterprise-grade security handled for you, focus on what matters most - delivering exceptional patient care.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl px-8 py-4 text-lg font-semibold">
                  Start Secure Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 text-lg font-semibold">
                  Security Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}