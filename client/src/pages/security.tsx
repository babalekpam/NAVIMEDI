import { ArrowLeft, Shield, Lock, Eye, FileCheck, Database, Globe, Smartphone, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function Security() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All data is encrypted using AES-256 encryption both at rest and in transit, ensuring maximum protection of sensitive healthcare information.",
      certifications: ["FIPS 140-2", "AES-256"]
    },
    {
      icon: Eye,
      title: "Role-Based Access Control",
      description: "Granular permission system with customizable roles ensuring users only access information necessary for their responsibilities.",
      certifications: ["RBAC Standard", "Zero Trust"]
    },
    {
      icon: FileCheck,
      title: "HIPAA Compliance",
      description: "Built from the ground up to meet HIPAA requirements with comprehensive audit trails, access logging, and data protection measures.",
      certifications: ["HIPAA BAA", "PHI Protected"]
    },
    {
      icon: Database,
      title: "Data Sovereignty",
      description: "Multi-tenant architecture with complete data isolation, ensuring your organization's data remains separate and secure.",
      certifications: ["ISO 27001", "Multi-Tenant"]
    },
    {
      icon: Shield,
      title: "Advanced Threat Protection",
      description: "Real-time monitoring, intrusion detection, and automated threat response to protect against cybersecurity threats.",
      certifications: ["SOC 2 Type II", "24/7 Monitoring"]
    },
    {
      icon: Globe,
      title: "Secure API Gateway",
      description: "All API communications are secured with OAuth 2.0, JWT tokens, and rate limiting to prevent unauthorized access.",
      certifications: ["OAuth 2.0", "JWT Secured"]
    }
  ];

  const compliance = [
    {
      name: "HIPAA",
      description: "Health Insurance Portability and Accountability Act",
      status: "Compliant"
    },
    {
      name: "SOC 2 Type II",
      description: "Security, Availability, and Confidentiality",
      status: "Certified"
    },
    {
      name: "ISO 27001",
      description: "Information Security Management System",
      status: "Certified"
    },
    {
      name: "GDPR",
      description: "General Data Protection Regulation",
      status: "Compliant"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-3">
                <img src={navimedLogo} alt="NaviMed" className="h-10 w-10 rounded-lg object-contain" />
                <span className="text-2xl font-bold text-blue-600">NAVIMED</span>
              </div>
            </Link>
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Enterprise Security
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Your healthcare data deserves the highest level of protection. NAVIMED implements 
            bank-level security measures with comprehensive compliance standards to safeguard 
            patient information and organizational data.
          </p>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Security Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {feature.certifications.map((cert, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Compliance & Certifications</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {compliance.map((item, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <Award className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <Badge className="bg-emerald-100 text-emerald-800">{item.status}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Measures */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Additional Security Measures</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-400 mt-1" />
                  <div>
                    <strong>24/7 Security Monitoring</strong>
                    <p className="text-slate-300">Continuous monitoring with real-time threat detection and automated response systems.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-400 mt-1" />
                  <div>
                    <strong>Regular Security Audits</strong>
                    <p className="text-slate-300">Quarterly penetration testing and security assessments by third-party experts.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-400 mt-1" />
                  <div>
                    <strong>Secure Data Centers</strong>
                    <p className="text-slate-300">Infrastructure hosted in SOC 2 certified data centers with physical security controls.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-400 mt-1" />
                  <div>
                    <strong>Backup & Recovery</strong>
                    <p className="text-slate-300">Automated daily backups with point-in-time recovery and disaster recovery plans.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-slate-800 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Security Contact</h3>
              <p className="text-slate-300 mb-4">
                Have security questions or need to report a vulnerability? Our security team is here to help.
              </p>
              <div className="space-y-2">
                <p><strong>Security Team:</strong> security@navimed.com</p>
                <p><strong>Phone:</strong> 314-472-3839</p>
                <p><strong>Emergency:</strong> 24/7 on-call support</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}