import { Link } from "wouter";
import { 
  Activity, 
  Users, 
  Building2, 
  Stethoscope, 
  Calendar, 
  FileText,
  Shield,
  Globe,
  ChevronRight,
  Heart,
  Pill,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const features = [
    {
      icon: <Stethoscope className="h-8 w-8" />,
      title: "Healthcare Professionals",
      description: "Comprehensive tools for doctors, nurses, and medical staff"
    },
    {
      icon: <Building2 className="h-8 w-8" />,
      title: "Hospital Management",
      description: "Complete administration and department management"
    },
    {
      icon: <Pill className="h-8 w-8" />,
      title: "Pharmacy Integration",
      description: "Seamless prescription routing and inventory management"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Patient Portal",
      description: "Empower patients with access to their health records"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Appointment Booking",
      description: "Easy scheduling and telemedicine integration"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Compliant",
      description: "Enterprise-grade security with HIPAA compliance"
    }
  ];

  const stats = [
    { label: "Healthcare Providers", value: "500+" },
    { label: "Patient Records", value: "100K+" },
    { label: "Prescriptions Processed", value: "1M+" },
    { label: "Countries Supported", value: "25+" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NaviMED
              </span>
            </div>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Next-Generation Healthcare Management Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Connect hospitals, pharmacies, laboratories, and patients in one unified platform. 
            Streamline operations, improve patient care, and enhance healthcare delivery.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                Start Free Trial
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white/60 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-gray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Comprehensive Healthcare Solutions</h2>
          <p className="text-xl text-gray-600">Everything you need to manage modern healthcare</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Role-Based Access */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Role-Based Access for Every User</h2>
            <p className="text-xl opacity-90">Tailored dashboards and features for each healthcare role</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { role: "Patients", icon: <Users className="h-12 w-12" />, desc: "Book appointments, view records, manage prescriptions" },
              { role: "Doctors", icon: <Stethoscope className="h-12 w-12" />, desc: "Patient management, prescriptions, lab orders" },
              { role: "Pharmacists", icon: <Pill className="h-12 w-12" />, desc: "Prescription processing, inventory, insurance claims" },
              { role: "Administrators", icon: <ClipboardList className="h-12 w-12" />, desc: "Full platform control, analytics, user management" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="mb-4 flex justify-center">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.role}</h3>
                <p className="opacity-90 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Reach */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Global Reach, Local Impact</h2>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-start space-x-3">
                <Globe className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <strong className="text-gray-900">Multi-Language Support:</strong> Available in English, Spanish, French, and German
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <strong className="text-gray-900">Enterprise Security:</strong> HIPAA compliant with end-to-end encryption
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Activity className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <strong className="text-gray-900">Real-time Sync:</strong> Instant updates across all connected facilities
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FileText className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <strong className="text-gray-900">Comprehensive Reporting:</strong> Advanced analytics and insights
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-8">
            <h3 className="text-2xl font-semibold mb-4">Ready to transform your healthcare operations?</h3>
            <p className="text-gray-600 mb-6">Join hundreds of healthcare providers already using NaviMED</p>
            <Link href="/register">
              <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6" />
                <span className="text-xl font-bold">NaviMED</span>
              </div>
              <p className="text-gray-400">Connecting healthcare for better patient outcomes</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/login">Sign In</Link></li>
                <li><Link href="/register">Register</Link></li>
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs">Documentation</Link></li>
                <li><Link href="/support">Support</Link></li>
                <li><Link href="/api">API</Link></li>
                <li><Link href="/status">System Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 NaviMED Healthcare Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}