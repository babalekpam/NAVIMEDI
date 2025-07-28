import { ArrowLeft, Shield, Users, Calendar, FileText, DollarSign, Globe, Smartphone, Cloud, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function Features() {
  const features = [
    {
      icon: Users,
      title: "Patient Management",
      description: "Comprehensive patient records, medical history tracking, and intelligent data organization with advanced search capabilities.",
      benefits: ["Complete medical histories", "Real-time updates", "HIPAA compliant", "Multi-tenant isolation"]
    },
    {
      icon: Calendar,
      title: "Appointment Scheduling",
      description: "Smart scheduling system with automated reminders, conflict detection, and seamless integration with provider calendars.",
      benefits: ["Automated reminders", "Conflict detection", "Provider integration", "Patient self-scheduling"]
    },
    {
      icon: FileText,
      title: "Electronic Health Records",
      description: "Complete EHR/EMR system with consultation notes, treatment plans, and comprehensive medical documentation.",
      benefits: ["Digital documentation", "Treatment tracking", "Clinical notes", "Audit trails"]
    },
    {
      icon: DollarSign,
      title: "Billing & Claims",
      description: "Automated insurance claims processing, payment tracking, and comprehensive financial reporting.",
      benefits: ["Insurance integration", "Automated claims", "Payment tracking", "Financial reports"]
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with role-based access control, data encryption, and compliance monitoring.",
      benefits: ["256-bit encryption", "Role-based access", "Audit logging", "Compliance ready"]
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Native support for multiple languages with real-time translation and localized interfaces.",
      benefits: ["Real-time translation", "Localized UI", "Cultural adaptation", "Global deployment"]
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Responsive design that works seamlessly across all devices with native mobile app capabilities.",
      benefits: ["Responsive design", "Touch optimized", "Offline sync", "Native apps"]
    },
    {
      icon: Cloud,
      title: "Cloud Infrastructure",
      description: "Scalable cloud architecture with 99.9% uptime, automatic backups, and disaster recovery.",
      benefits: ["99.9% uptime", "Auto scaling", "Data backup", "Disaster recovery"]
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
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Platform Features
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the comprehensive suite of tools designed to streamline healthcare operations, 
            improve patient care, and drive operational efficiency across your organization.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
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
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-emerald-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial today and see how NAVIMED can transform your healthcare operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}