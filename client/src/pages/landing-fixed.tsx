import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader } from "@/components/layout/public-header";
import { OptimizedImage } from "@/components/optimized-image";
import navimedLogo from "@assets/JPG_1753663321927.jpg";
import healthcareTeam from "@assets/image_1754352574197.png";
import medicalImaging from "@assets/image_1754352599331.png";
import healthAssessment from "@assets/image_1754352626174.png";
import healthcareManagement from "@assets/image_1754352650858.png";
import healthcareSecurity from "@assets/image_1754352725355.png";
// Removed massive 6.6MB image to optimize bundle size
// import medicalSupply from "@assets/image_1754352767570.png";
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
    // Removed medicalSupply image (6.6MB) for better performance
    // {
    //   url: medicalSupply,
    //   alt: "Medical Supply Warehouse", 
    //   title: "Medical Supply Management",
    //   description: "State-of-the-art medical equipment warehouse and inventory management systems"
    // }
  ];

  // Image loading is now handled by OptimizedImage component
  // First image gets priority loading for faster LCP

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
              <OptimizedImage
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover"
                priority={index === 0}
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
        {healthcareImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            aria-label={`View ${image.title} - Image ${index + 1} of ${healthcareImages.length}`}
            className={`w-5 h-5 rounded-full transition-all duration-300 ${
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
        aria-label="View previous healthcare image"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
      >
        <ArrowRight className="w-6 h-6 rotate-180 text-gray-700" />
      </button>
      
      <button
        onClick={() => setCurrentImageIndex((prev) => 
          (prev + 1) % healthcareImages.length
        )}
        aria-label="View next healthcare image"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
      >
        <ArrowRight className="w-6 h-6 text-gray-700" />
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
            {/* Trust Badge */}
            <Badge className="mb-8 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-4 py-2">
              <Award className="w-4 h-4 mr-2" />
              HIPAA Compliant • SOC 2 Type II • FDA 21 CFR Part 11
            </Badge>
            
            {/* Main Headline - Benefit-Focused */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Reduce Healthcare
              </span>
              <br />
              <span className="text-slate-900">Admin Burden by 40%</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Streamline hospital operations with NaviMED's complete healthcare management platform. 
              HIPAA-compliant solution trusted by 200+ healthcare facilities worldwide.
            </p>

            {/* Social Proof Numbers */}
            <div className="grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">200+</div>
                <div className="text-sm text-slate-600">Healthcare facilities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">50,000+</div>
                <div className="text-sm text-slate-600">Patient records daily</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">99.9%</div>
                <div className="text-sm text-slate-600">Uptime guarantee</div>
              </div>
            </div>
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
                100% Cloud-Based SaaS
              </Badge>
            </div>
          </div>

          {/* Professional Healthcare Image Carousel */}
          <ImageCarousel />

          {/* Multiple CTA Options */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/organizations/register">
              <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-xl shadow-emerald-600/25 px-8 py-4 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg"
              aria-label="Schedule a product demo with our team"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book a Demo
            </Button>

            <Button 
              size="lg" 
              variant="ghost" 
              className="text-slate-600 hover:text-slate-800 px-8 py-4 text-lg"
              aria-label="View interactive platform tour"
            >
              <Monitor className="w-5 h-5 mr-2" />
              See Platform Tour
            </Button>
          </div>

          {/* Urgency Element */}
          <div className="mb-8 text-center">
            <Badge className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              Limited Time: Free implementation for next 10 sign-ups
            </Badge>
          </div>

          {/* Secondary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <Link href="/supplier-portal">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                <Package className="w-4 h-4 mr-2" />
                Supplier Portal
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                <ShoppingCart className="w-4 h-4 mr-2" />
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

      {/* Customer Success Stories */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              <TrendingUp className="w-4 h-4 mr-2" />
              Success Stories
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Real Results from Healthcare <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Leaders</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See how healthcare organizations achieved measurable improvements with NaviMED
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Testimonial 1 */}
            <Card className="group border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Dr. Sarah Chen</h3>
                    <p className="text-sm text-slate-600">CIO, Metro General Hospital</p>
                  </div>
                </div>
                <blockquote className="text-slate-700 italic mb-4">
                  "NaviMED reduced our prescription processing time by 60% and eliminated medication errors completely. The multi-language support has been a game-changer for our diverse patient community."
                </blockquote>
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  60% faster processing • Zero medication errors
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="group border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-500 bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Pill className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Michael Rodriguez</h3>
                    <p className="text-sm text-slate-600">Director, MediCare Pharmacy</p>
                  </div>
                </div>
                <blockquote className="text-slate-700 italic mb-4">
                  "The unified platform streamlined our entire workflow. We're now serving 40% more patients with the same staff, and patient satisfaction scores increased to 98%."
                </blockquote>
                <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                  <Users className="w-4 h-4" />
                  40% more capacity • 98% satisfaction
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="group border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <TestTube className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Dr. Priya Patel</h3>
                    <p className="text-sm text-slate-600">Lab Director, Advanced Diagnostics</p>
                  </div>
                </div>
                <blockquote className="text-slate-700 italic mb-4">
                  "Lab result turnaround time dropped from 3 days to 8 hours. The real-time notifications and automated reporting saved us countless hours of manual work."
                </blockquote>
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  8-hour turnaround • Automated reporting
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Screenshots Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
              <Monitor className="w-4 h-4 mr-2" />
              Platform Preview
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              See NaviMED in <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Action</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Explore our intuitive dashboard designed for healthcare professionals
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
            {/* Dashboard Screenshot */}
            <Card className="group border-slate-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-emerald-50 to-blue-50 rounded-t-lg p-8 flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-lg shadow-lg p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="h-8 bg-emerald-100 rounded flex items-center px-3">
                        <div className="w-4 h-4 bg-emerald-600 rounded mr-2"></div>
                        <div className="text-xs text-emerald-700">Hospital Dashboard - Live View</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-16 bg-blue-50 rounded p-2">
                          <div className="text-xs text-blue-600 mb-1">Appointments</div>
                          <div className="text-lg font-bold text-blue-800">47</div>
                        </div>
                        <div className="h-16 bg-emerald-50 rounded p-2">
                          <div className="text-xs text-emerald-600 mb-1">Prescriptions</div>
                          <div className="text-lg font-bold text-emerald-800">23</div>
                        </div>
                        <div className="h-16 bg-orange-50 rounded p-2">
                          <div className="text-xs text-orange-600 mb-1">Lab Results</div>
                          <div className="text-lg font-bold text-orange-800">12</div>
                        </div>
                      </div>
                      <div className="h-12 bg-slate-50 rounded p-2">
                        <div className="text-xs text-slate-500 mb-1">Recent Activity</div>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <div className="text-xs text-slate-600">Live updates</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Real-Time Dashboard</h3>
                  <p className="text-slate-600">Comprehensive overview of hospital operations with live metrics and instant notifications.</p>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Interface Screenshot */}
            <Card className="group border-slate-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-500">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-emerald-50 rounded-t-lg p-8 flex items-center justify-center">
                  <div className="w-32 h-48 bg-white rounded-2xl shadow-xl p-2 flex flex-col">
                    <div className="h-4 bg-slate-100 rounded-full mb-2 flex items-center justify-center">
                      <div className="w-8 h-1 bg-slate-300 rounded-full"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-6 bg-blue-100 rounded flex items-center px-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-1"></div>
                        <div className="text-xs text-blue-700">Patient Portal</div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-4 bg-emerald-50 rounded px-1 flex items-center">
                          <div className="text-xs text-emerald-600">Appointments</div>
                        </div>
                        <div className="h-4 bg-blue-50 rounded px-1 flex items-center">
                          <div className="text-xs text-blue-600">Prescriptions</div>
                        </div>
                        <div className="h-4 bg-orange-50 rounded px-1 flex items-center">
                          <div className="text-xs text-orange-600">Lab Results</div>
                        </div>
                      </div>
                      <div className="h-8 bg-emerald-100 rounded p-1">
                        <div className="text-xs text-emerald-700">Quick Actions</div>
                        <div className="flex gap-1 mt-1">
                          <div className="w-3 h-3 bg-emerald-600 rounded"></div>
                          <div className="w-3 h-3 bg-blue-600 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Mobile-First Design</h3>
                  <p className="text-slate-600">Optimized for healthcare professionals on the go with intuitive touch interfaces.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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
                <h3 className="font-semibold mb-2">Bank-level encryption for patient data</h3>
                <p className="text-sm text-gray-600">HIPAA compliant with enterprise-grade security and audit trails</p>
              </CardContent>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <CardContent className="text-center p-0">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold mb-2">Scale securely as you grow</h3>
                <p className="text-sm text-gray-600">Complete data isolation per organization with multi-tenant architecture</p>
              </CardContent>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <CardContent className="text-center p-0">
                <Languages className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                <h3 className="font-semibold mb-2">Serve diverse communities in 25+ languages</h3>
                <p className="text-sm text-gray-600">Real-time translation with AI-powered medical terminology</p>
              </CardContent>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <CardContent className="text-center p-0">
                <Cloud className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
                <h3 className="font-semibold mb-2">99.9% uptime guarantee</h3>
                <p className="text-sm text-gray-600">Scalable cloud infrastructure with automatic backups and disaster recovery</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">Start Your Free SaaS Trial - Transform Healthcare Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Join 500+ healthcare organizations worldwide using our <strong>cloud-based SaaS platform</strong> for improved patient outcomes, 
            streamlined workflows, and enhanced security. <strong>Free 14-day trial</strong> with full access - no installation required!
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
                <button 
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Contact us via live chat"
                >
                  <MessageCircle className="w-5 h-5 hover:text-blue-400" />
                </button>
                <button 
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Call our support team"
                >
                  <Phone className="w-5 h-5 hover:text-green-400" />
                </button>
                <button 
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Send us an email"
                >
                  <Mail className="w-5 h-5 hover:text-red-400" />
                </button>
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
            <p>&copy; 2025 {brandName} by ARGILETTE Lab. All rights reserved. Next-Generation Healthcare Management Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}