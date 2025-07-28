import { ArrowLeft, Building2, Users, Calendar, FileText, DollarSign, Shield, Clock, CheckCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function HospitalSolutions() {
  const features = [
    {
      icon: Users,
      title: "Patient Management",
      description: "Comprehensive patient records with medical history, allergies, medications, and treatment plans.",
      benefits: ["Electronic health records", "Medical history tracking", "Patient portal access", "Family health records"]
    },
    {
      icon: Calendar,
      title: "Advanced Scheduling",
      description: "Multi-department scheduling with resource management, staff coordination, and patient flow optimization.",
      benefits: ["Department coordination", "Resource allocation", "Waiting time optimization", "Emergency scheduling"]
    },
    {
      icon: Heart,
      title: "Clinical Documentation",
      description: "Complete clinical workflow with consultation notes, treatment plans, and care coordination.",
      benefits: ["Progress notes", "Treatment plans", "Clinical protocols", "Care team coordination"]
    },
    {
      icon: DollarSign,
      title: "Revenue Cycle Management",
      description: "End-to-end billing with insurance claims, payment processing, and financial reporting.",
      benefits: ["Insurance verification", "Claims processing", "Payment tracking", "Financial analytics"]
    },
    {
      icon: FileText,
      title: "Laboratory Integration",
      description: "Seamless lab order management with results integration and clinical decision support.",
      benefits: ["Lab order tracking", "Results integration", "Critical value alerts", "Trend analysis"]
    },
    {
      icon: Shield,
      title: "Compliance & Security",
      description: "HIPAA-compliant platform with audit trails, access controls, and data protection.",
      benefits: ["HIPAA compliance", "Access controls", "Audit logging", "Data encryption"]
    }
  ];

  const hospitalTypes = [
    {
      type: "General Hospitals",
      description: "Comprehensive care with multiple departments and specialties",
      features: ["Emergency department", "Inpatient care", "Surgery suites", "Diagnostic imaging"]
    },
    {
      type: "Specialty Hospitals",
      description: "Focused care for specific medical conditions or procedures",
      features: ["Cardiac care", "Cancer treatment", "Orthopedic surgery", "Rehabilitation"]
    },
    {
      type: "Teaching Hospitals",
      description: "Academic medical centers with research and education",
      features: ["Resident management", "Research protocols", "Academic reporting", "Training modules"]
    },
    {
      type: "Critical Access Hospitals",
      description: "Rural hospitals providing essential healthcare services",
      features: ["Remote monitoring", "Telemedicine", "Transfer protocols", "Emergency care"]
    }
  ];

  const stats = [
    { number: "500+", label: "Hospitals Using NAVIMED" },
    { number: "2M+", label: "Patient Records Managed" },
    { number: "99.9%", label: "System Uptime" },
    { number: "24/7", label: "Technical Support" }
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
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center mb-6">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                Hospital Solutions
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Comprehensive hospital management platform designed to streamline operations, 
                improve patient care, and enhance clinical workflows across all departments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-emerald-600">
                    Start Free Trial
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  Schedule Demo
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Hospital Management Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything your hospital needs to deliver exceptional patient care and operational efficiency.
            </p>
          </div>
          
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

      {/* Hospital Types */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Solutions for Every Hospital Type</h2>
            <p className="text-xl text-gray-600">
              Tailored solutions for different hospital sizes and specialties.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {hospitalTypes.map((hospital, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">{hospital.type}</CardTitle>
                  <CardDescription>{hospital.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {hospital.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Implementation Process</h2>
            <p className="text-xl text-slate-300">
              Our proven implementation methodology ensures smooth transition and rapid adoption.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Assessment</h3>
              <p className="text-slate-300">Analyze current workflows and identify optimization opportunities.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Configuration</h3>
              <p className="text-slate-300">Customize NAVIMED to match your hospital's specific needs.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Training</h3>
              <p className="text-slate-300">Comprehensive staff training and change management support.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Go-Live</h3>
              <p className="text-slate-300">Phased rollout with 24/7 support during transition.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-emerald-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Hospital?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of hospitals already using NAVIMED to improve patient care and operational efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Contact Sales: 314-472-3839
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}