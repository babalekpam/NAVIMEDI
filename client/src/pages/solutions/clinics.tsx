import { ArrowLeft, Building, Users, Calendar, FileText, Heart, Clock, CheckCircle, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function ClinicSolutions() {
  const features = [
    {
      icon: Users,
      title: "Patient Management",
      description: "Streamlined patient records with appointment history, treatment plans, and follow-up scheduling.",
      benefits: ["Electronic health records", "Patient portal", "Family health tracking", "Medical history"]
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Optimized appointment scheduling with automated reminders and waitlist management.",
      benefits: ["Online booking", "Automated reminders", "Waitlist management", "Provider availability"]
    },
    {
      icon: Stethoscope,
      title: "Clinical Workflows",
      description: "Efficient clinical documentation with treatment protocols and care plans.",
      benefits: ["Progress notes", "Care protocols", "Treatment tracking", "Clinical alerts"]
    },
    {
      icon: Heart,
      title: "Preventive Care",
      description: "Proactive health management with wellness programs and screening reminders.",
      benefits: ["Wellness programs", "Screening alerts", "Health maintenance", "Vaccination tracking"]
    }
  ];

  const clinicTypes = [
    "Primary Care Clinics",
    "Specialty Clinics", 
    "Urgent Care Centers",
    "Pediatric Clinics",
    "Women's Health Clinics",
    "Mental Health Clinics"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-3">
                <img src={navimedLogo} alt="NaviMed" className="h-10 w-10 rounded-lg object-contain" />
                <span className="text-2xl font-bold text-blue-600">NAVIMED</span>
              </div>
            </Link>
            <Link href="/"><Button variant="ghost"><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Button></Link>
          </div>
        </div>
      </header>

      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-6">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Clinic Solutions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Comprehensive clinic management platform designed to enhance patient care, streamline operations, and improve practice efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"><Button size="lg" className="bg-gradient-to-r from-blue-600 to-emerald-600">Start Free Trial</Button></Link>
            <Button size="lg" variant="outline">Schedule Demo</Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Clinic Management Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
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

      <section className="py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Supported Clinic Types</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {clinicTypes.map((type, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="text-lg font-semibold">{type}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}