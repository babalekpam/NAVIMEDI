import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader } from "@/components/layout/public-header";
import navimedLogo from "@assets/JPG_1753663321927.jpg";
import healthcareTeam from "@assets/image_1754352574197.png";
import medicalImaging from "@assets/image_1754352599331.png";
import healthAssessment from "@assets/image_1754352626174.png";
import healthcareManagement from "@assets/image_1754352650858.png";
import healthcareSecurity from "@assets/image_1754352725355.png";
import medicalSupply from "@assets/image_1754352767570.png";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
  Mail,
  Megaphone,
  ShoppingCart,
  Package,
  Laptop
} from "lucide-react";

// Professional healthcare platform branding
const brandName = "NAVIMED";
const tagline = "Next-Generation Healthcare Management Platform";

// Interfaces
interface PlatformStats {
  organizations: number;
  users: number;
  uptime: string;
  languages: number;
  responseTime: string;
  support: string;
}

interface PlatformData {
  platform: string;
  statistics: PlatformStats;
  status: string;
  timestamp: string;
}

// Professional Healthcare Image Carousel Component
function ImageCarousel() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());
  
  // Professional healthcare photographs provided by the user
  const healthcareImages = [
    {
      url: healthcareTeam,
      alt: "Healthcare Team Meeting",
      title: "Professional Healthcare Team",
      description: "Collaborative healthcare professionals working together for better patient outcomes"
    },
    {
      url: medicalImaging,
      alt: "Medical Imaging Analysis",
      title: "Advanced Medical Imaging",
      description: "Cutting-edge diagnostic technology with brain scan analysis and medical expertise"
    },
    {
      url: healthAssessment,
      alt: "Health Assessment Technology",
      title: "Digital Health Assessment",
      description: "Comprehensive health monitoring and assessment through advanced digital platforms"
    },
    {
      url: healthcareManagement,
      alt: "Healthcare Management System",
      title: "Healthcare Management Solutions",
      description: "Integrated healthcare management icons and comprehensive system overview"
    },
    {
      url: healthcareSecurity,
      alt: "Healthcare Security & Compliance",
      title: "Secure Healthcare Platform",
      description: "Advanced security measures and compliance protocols for healthcare data protection"
    },
    {
      url: medicalSupply,
      alt: "Medical Supply Warehouse",
      title: "Medical Supply Management",
      description: "State-of-the-art medical equipment warehouse and inventory management systems"
    }
  ];

  // Preload critical first image for faster LCP
  useEffect(() => {
    if (healthcareImages.length > 0) {
      const firstImage = new Image();
      firstImage.src = healthcareImages[0].url;
      firstImage.onload = () => setImagesLoaded(prev => new Set(prev).add(0));
    }
  }, []);

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % healthcareImages.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [healthcareImages.length]);

  return (
    <div className="relative max-w-6xl mx-auto">
      {/* Main Image Display */}
      <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
        {healthcareImages.map((image, index) => {
          // Only render current image and next image for performance
          const shouldRender = index === currentImageIndex || 
                               index === (currentImageIndex + 1) % healthcareImages.length ||
                               index === (currentImageIndex - 1 + healthcareImages.length) % healthcareImages.length;
          
          if (!shouldRender) return null;
          
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                {...(index === 0 && { fetchpriority: "high" })}
                style={{
                  contentVisibility: index === currentImageIndex ? 'visible' : 'hidden'
                }}
              />
              {/* Overlay with gradient and text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                <div className="p-8 text-white">
                  <h3 className="text-2xl font-bold mb-2">{image.title}</h3>
                  <p className="text-lg opacity-90">{image.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center mt-6 space-x-3">
        {healthcareImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? 'bg-blue-600 scale-125' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentImageIndex((prev) => 
          prev === 0 ? healthcareImages.length - 1 : prev - 1
        )}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
      >
        <ArrowRight className="w-5 h-5 rotate-180 text-gray-700" />
      </button>
      
      <button
        onClick={() => setCurrentImageIndex((prev) => 
          (prev + 1) % healthcareImages.length
        )}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
      >
        <ArrowRight className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
}

export default function LandingPage() {
  const { data: platformData, isLoading } = useQuery<PlatformData>({
    queryKey: ['/api/platform/stats'],
    retry: false,
  });

  const stats = platformData?.statistics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <PublicHeader />
      
      {/* Hero Section with Professional Healthcare Carousel */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-6">
              {brandName} - #1 Healthcare Management Platform
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto">
              <strong>HIPAA-compliant healthcare software</strong> for hospitals, pharmacies & laboratories. 
              Streamline patient management, prescription workflows, and lab operations with 
              <strong> multilingual support</strong> across 25+ languages and <strong>enterprise-grade security</strong>.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Building2 className="w-4 h-4 mr-2" />
                Multi-Tenant Architecture
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Shield className="w-4 h-4 mr-2" />
                Enterprise Security
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Languages className="w-4 h-4 mr-2" />
                Multi-Language Support
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Globe className="w-4 h-4 mr-2" />
                Global Deployment
              </Badge>
            </div>
          </div>

          {/* Professional Healthcare Image Carousel */}
          <ImageCarousel />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
            <Link href="/organizations/register">
              <Button size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Building2 className="w-5 h-5 mr-2" />
                Register Organization
              </Button>
            </Link>
            <Link href="/supplier-portal">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2">
                <Package className="w-5 h-5 mr-2" />
                Supplier Portal
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Real-time Platform Statistics */}
      {stats && (
        <section className="py-16 bg-white/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Trusted by 500+ Healthcare Organizations Worldwide
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stats.organizations.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Organizations</div>
                </CardContent>
              </Card>
              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="text-3xl font-bold text-green-600 mb-2">{stats.users.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </CardContent>
              </Card>
              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{stats.uptime}</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </CardContent>
              </Card>
              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{stats.languages}</div>
                  <div className="text-sm text-gray-600">Languages</div>
                </CardContent>
              </Card>
              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="text-3xl font-bold text-red-600 mb-2">{stats.responseTime}</div>
                  <div className="text-sm text-gray-600">Response Time</div>
                </CardContent>
              </Card>
              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">{stats.support}</div>
                  <div className="text-sm text-gray-600">Support</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Healthcare Organization Types */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Healthcare Organizations We Serve
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="text-center pb-6">
                <Stethoscope className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <CardTitle className="text-2xl">Hospitals</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Patient Management</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Department Operations</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Medical Staff Coordination</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Insurance Management</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Billing & Analytics</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="text-center pb-6">
                <Pill className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <CardTitle className="text-2xl">Pharmacies</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Prescription Management</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Inventory Control</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Insurance Verification</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Patient Communication</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Supplier Integration</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="text-center pb-6">
                <TestTube className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                <CardTitle className="text-2xl">Laboratories</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Test Order Management</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Results Reporting</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Quality Control</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Achievement Tracking</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Performance Analytics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Enterprise Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <CardContent className="text-center p-0">
                <Shield className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-semibold mb-2">Security & Compliance</h3>
                <p className="text-sm text-gray-600">HIPAA compliant with enterprise-grade security</p>
              </CardContent>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <CardContent className="text-center p-0">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold mb-2">Multi-Tenant</h3>
                <p className="text-sm text-gray-600">Complete data isolation per organization</p>
              </CardContent>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <CardContent className="text-center p-0">
                <Languages className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                <h3 className="font-semibold mb-2">Multi-Language</h3>
                <p className="text-sm text-gray-600">English, Spanish, French, German support</p>
              </CardContent>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <CardContent className="text-center p-0">
                <Cloud className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
                <h3 className="font-semibold mb-2">Cloud Native</h3>
                <p className="text-sm text-gray-600">Scalable cloud infrastructure with 99.9% uptime</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">Start Your Free Trial - Transform Healthcare Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Join 500+ healthcare organizations worldwide using NaviMED for improved patient outcomes, 
            streamlined workflows, and enhanced security. <strong>Free 30-day trial</strong> with full platform access.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/organizations/register">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                <Rocket className="w-5 h-5 mr-2" />
                Get Started Today
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-blue-600">
                <Package className="w-5 h-5 mr-2" />
                Explore Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">{brandName}</h3>
              <p className="text-gray-400 mb-4">{tagline}</p>
              <div className="flex space-x-4">
                <MessageCircle className="w-5 h-5 hover:text-blue-400 cursor-pointer" />
                <Phone className="w-5 h-5 hover:text-green-400 cursor-pointer" />
                <Mail className="w-5 h-5 hover:text-red-400 cursor-pointer" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Organizations</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Hospitals</li>
                <li>Pharmacies</li>
                <li>Laboratories</li>
                <li>Healthcare Providers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Patient Management</li>
                <li>Prescription Processing</li>
                <li>Laboratory Integration</li>
                <li>Medical Marketplace</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>24/7 Support</li>
                <li>Documentation</li>
                <li>Training</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 {brandName}. All rights reserved. Next-Generation Healthcare Management Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}