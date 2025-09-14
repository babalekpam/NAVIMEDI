import { PublicHeader } from "@/components/layout/public-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Download, 
  FileText, 
  Calculator,
  CheckSquare,
  Book,
  Shield, 
  Users, 
  Activity,
  Building2, 
  Stethoscope, 
  Pill, 
  TestTube, 
  Globe,
  Clock,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Star,
  Brain,
  Heart,
  BarChart3,
  Target,
  Database,
  Award,
  Zap,
  TrendingUp,
  PieChart,
  LineChart,
  Settings,
  BookOpen,
  ClipboardList,
  FileSpreadsheet,
  Play,
  Search,
  Monitor,
  User,
  Calendar,
  MessageCircle
} from "lucide-react";
import { SEOHead } from "@/components/seo-head";

export default function ResourcesPage() {
  const resources = [
    {
      id: "compliance-checklist",
      title: "HIPAA Compliance Checklist for Healthcare Organizations",
      description: "Complete 50-point checklist to ensure your healthcare facility meets all HIPAA requirements and passes audits.",
      category: "Compliance",
      type: "Checklist",
      icon: CheckSquare,
      downloadUrl: "#download-hipaa-compliance-checklist",
      popular: true
    },
    {
      id: "ehr-implementation-guide",
      title: "Complete EHR Implementation Guide",
      description: "Step-by-step guide for implementing Electronic Health Records in healthcare facilities of any size.",
      category: "Implementation",
      type: "Guide",
      icon: Book,
      downloadUrl: "#download-ehr-implementation-guide",
      featured: true
    },
    {
      id: "roi-calculator",
      title: "Healthcare Technology ROI Calculator",
      description: "Interactive calculator to determine the return on investment for healthcare technology solutions.",
      category: "Business Tools",
      type: "Calculator",
      icon: Calculator,
      downloadUrl: "#roi-calculator-tool",
      interactive: true
    },
    {
      id: "patient-satisfaction-template",
      title: "Patient Satisfaction Survey Template",
      description: "Professionally designed patient satisfaction survey template with scoring methodology.",
      category: "Quality Improvement",
      type: "Template",
      icon: FileText,
      downloadUrl: "#download-patient-satisfaction-template"
    },
    {
      id: "cybersecurity-whitepaper",
      title: "Healthcare Cybersecurity: 2025 Threat Landscape",
      description: "Comprehensive analysis of cybersecurity threats facing healthcare organizations and prevention strategies.",
      category: "Security",
      type: "Whitepaper",
      icon: Shield,
      downloadUrl: "#download-cybersecurity-whitepaper",
      popular: true
    },
    {
      id: "workflow-optimization",
      title: "Healthcare Workflow Optimization Playbook",
      description: "Proven strategies to reduce administrative burden and improve operational efficiency by up to 40%.",
      category: "Operations",
      type: "Playbook",
      icon: TrendingUp,
      downloadUrl: "#download-workflow-optimization",
      featured: true
    },
    {
      id: "telehealth-setup-guide",
      title: "Telehealth Implementation Starter Kit",
      description: "Everything you need to launch telehealth services including technical requirements, compliance guidelines, and best practices.",
      category: "Digital Health",
      type: "Starter Kit",
      icon: Monitor,
      downloadUrl: "#download-telehealth-starter-kit"
    },
    {
      id: "medication-management-checklist",
      title: "Medication Management Safety Checklist",
      description: "Essential checklist to prevent medication errors and ensure patient safety in pharmacy operations.",
      category: "Pharmacy",
      type: "Checklist",
      icon: Pill,
      downloadUrl: "#download-medication-checklist"
    },
    {
      id: "lab-quality-standards",
      title: "Laboratory Quality Control Standards Guide",
      description: "Comprehensive guide to maintaining laboratory quality standards and regulatory compliance.",
      category: "Laboratory",
      type: "Standards Guide",
      icon: TestTube,
      downloadUrl: "#download-lab-quality-standards"
    },
    {
      id: "cost-analysis-template",
      title: "Healthcare Cost Analysis Spreadsheet",
      description: "Excel template for analyzing healthcare costs per department, procedure, and patient type.",
      category: "Financial",
      type: "Spreadsheet",
      icon: FileSpreadsheet,
      downloadUrl: "#download-cost-analysis-template"
    }
  ];

  const categories = Array.from(new Set(resources.map(r => r.category)));
  const types = Array.from(new Set(resources.map(r => r.type)));

  const webinars = [
    {
      title: "Reducing Healthcare Administrative Burden: Real-World Strategies",
      description: "Learn how leading hospitals reduced admin tasks by 40% using proven workflow optimization techniques.",
      date: "February 15, 2025",
      duration: "45 minutes",
      speaker: "Dr. Sarah Chen, Healthcare Operations Expert",
      registrationUrl: "#webinar-registration"
    },
    {
      title: "HIPAA Compliance in the Digital Age: 2025 Updates",
      description: "Stay current with the latest HIPAA requirements and compliance strategies for modern healthcare technology.",
      date: "February 28, 2025", 
      duration: "60 minutes",
      speaker: "Michael Rodriguez, Healthcare Compliance Attorney",
      registrationUrl: "#webinar-registration"
    },
    {
      title: "Telehealth Success Stories: Implementation Best Practices",
      description: "Real case studies from healthcare organizations that successfully implemented telehealth programs.",
      date: "March 7, 2025",
      duration: "50 minutes", 
      speaker: "Dr. Priya Patel, Telehealth Implementation Specialist",
      registrationUrl: "#webinar-registration"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/30">
      <SEOHead 
        title="Free Healthcare Resources, Guides & Tools - NAVIMED Resource Hub"
        description="Download free healthcare resources including HIPAA compliance checklists, EHR implementation guides, ROI calculators, and industry whitepapers. Trusted by 200+ healthcare organizations."
        canonicalUrl="https://navimedi.org/resources"
        keywords="healthcare resources, HIPAA compliance checklist, EHR implementation guide, healthcare tools, medical whitepapers, healthcare templates, free downloads"
      />
      
      {/* Schema.org structured data for WebPage */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Healthcare Resources Hub - Free Guides, Tools & Templates",
            "description": "Comprehensive collection of free healthcare resources including compliance checklists, implementation guides, calculators, and industry whitepapers for healthcare professionals.",
            "url": "https://navimedi.org/resources",
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://navimedi.org"
                },
                {
                  "@type": "ListItem", 
                  "position": 2,
                  "name": "Resources",
                  "item": "https://navimedi.org/resources"
                }
              ]
            },
            "mainEntity": [
              {
                "@type": "DigitalDocument",
                "name": "HIPAA Compliance Checklist for Healthcare Organizations",
                "description": "Complete 50-point checklist to ensure healthcare facilities meet HIPAA requirements",
                "url": "https://navimedi.org/resources#hipaa-compliance-checklist"
              },
              {
                "@type": "DigitalDocument", 
                "name": "Complete EHR Implementation Guide",
                "description": "Step-by-step guide for implementing Electronic Health Records in healthcare facilities",
                "url": "https://navimedi.org/resources#ehr-implementation-guide"
              }
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
          <div className="text-center max-w-5xl mx-auto">
            <Badge className="mb-8 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-4 py-2">
              <BookOpen className="w-4 h-4 mr-2" />
              Free Resources • Updated January 2025 • Trusted by 200+ Organizations
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Healthcare Resource
              </span>
              <br />
              <span className="text-slate-900">Hub</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed max-w-4xl mx-auto">
              Free guides, checklists, templates, and tools to help healthcare organizations improve operations, 
              ensure compliance, and deliver better patient care. No registration required for most resources.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-xl shadow-emerald-600/25 px-8 py-4 text-lg">
                <Download className="w-5 h-5 mr-2" />
                Browse All Resources
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Link href="#webinars">
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg">
                  <Play className="w-5 h-5 mr-2" />
                  View Upcoming Webinars
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">50+</div>
                <div className="text-sm text-slate-600">Free Resources</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">25K+</div>
                <div className="text-sm text-slate-600">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">200+</div>
                <div className="text-sm text-slate-600">Organizations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">4.9/5</div>
                <div className="text-sm text-slate-600">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Categories Filter */}
      <section className="py-12 bg-white/70 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Explore by Category</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-emerald-50 hover:border-emerald-300">
                All Resources
              </Badge>
              {categories.map((category) => (
                <Badge key={category} variant="outline" className="px-4 py-2 cursor-pointer hover:bg-blue-50 hover:border-blue-300">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured & Popular Resources */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              <Star className="w-4 h-4 mr-2" />
              Most Popular Downloads
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Essential <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Healthcare Resources</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Start with these highly-rated resources used by healthcare professionals worldwide
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {resources.filter(r => r.featured || r.popular).map((resource) => {
              const IconComponent = resource.icon;
              return (
                <Card key={resource.id} className="group border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 bg-white">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex gap-2">
                        {resource.featured && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            Featured
                          </Badge>
                        )}
                        {resource.popular && (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                            Popular
                          </Badge>
                        )}
                        {resource.interactive && (
                          <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                            Interactive
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{resource.title}</h3>
                    <p className="text-slate-600 mb-4 leading-relaxed">{resource.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Badge variant="outline" className="text-xs">{resource.category}</Badge>
                        <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        data-testid={`download-${resource.id}`}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {resource.interactive ? 'Use Tool' : 'Download'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Resources Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Complete Resource <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Library</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive collection of healthcare resources organized by specialty and use case
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => {
              const IconComponent = resource.icon;
              return (
                <Card key={resource.id} className="group border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-slate-100 group-hover:bg-emerald-100 rounded-lg flex items-center justify-center transition-colors">
                        <IconComponent className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
                      </div>
                      <div className="flex gap-1">
                        {resource.featured && (
                          <Badge variant="outline" className="text-xs bg-emerald-50 border-emerald-200">
                            Featured
                          </Badge>
                        )}
                        {resource.popular && (
                          <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                      {resource.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">{resource.category}</Badge>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-slate-300 hover:border-emerald-400 hover:text-emerald-600"
                        data-testid={`download-${resource.id}`}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        {resource.interactive ? 'Use' : 'Get'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Tools Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-emerald-50" id="roi-calculator-tool">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
              <Calculator className="w-4 h-4 mr-2" />
              Interactive Tools
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Healthcare <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Calculators</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Use our free interactive tools to make data-driven healthcare decisions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* ROI Calculator */}
            <Card className="group border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-500 bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">ROI Calculator</h3>
                    <p className="text-slate-600">Calculate technology investment returns</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Current Annual Operating Costs ($)
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="500000"
                      data-testid="input-operating-costs"
                    />
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Expected Efficiency Improvement (%)
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="25"
                      max="100"
                      data-testid="input-efficiency-improvement"
                    />
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Technology Investment ($)
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="50000"
                      data-testid="input-technology-investment"
                    />
                  </div>
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-calculate-roi">
                  Calculate ROI
                </Button>
                
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700 mb-1">Results will appear here</div>
                    <div className="text-sm text-green-600">Enter values above and click Calculate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Staffing Calculator */}
            <Card className="group border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Staffing Calculator</h3>
                    <p className="text-slate-600">Optimize healthcare staffing levels</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Average Patients Per Day
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                      placeholder="150"
                      data-testid="input-patients-per-day"
                    />
                  </div>
                  
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Average Time Per Patient (minutes)
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                      placeholder="30"
                      data-testid="input-time-per-patient"
                    />
                  </div>
                  
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Operating Hours Per Day
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                      placeholder="12"
                      max="24"
                      data-testid="input-operating-hours"
                    />
                  </div>
                </div>
                
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" data-testid="button-calculate-staffing">
                  Calculate Staffing Needs
                </Button>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700 mb-1">Results will appear here</div>
                    <div className="text-sm text-blue-600">Enter values above and click Calculate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Webinars Section */}
      <section className="py-20 bg-white" id="webinars">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              <Play className="w-4 h-4 mr-2" />
              Upcoming Webinars
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Expert-Led <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Learning Sessions</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join industry experts for live discussions on the latest healthcare trends and best practices
            </p>
          </div>
          
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            {webinars.map((webinar, index) => (
              <Card key={index} className="group border-slate-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-500">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                      {webinar.date}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {webinar.duration}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {webinar.title}
                  </h3>
                  <p className="text-slate-600 mb-4 leading-relaxed">
                    {webinar.description}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm text-slate-600 font-medium">{webinar.speaker}</span>
                  </div>
                  
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" data-testid={`register-webinar-${index}`}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Register Free
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Healthcare Operations?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join 200+ healthcare organizations using our platform to reduce administrative burden and improve patient care. 
            <strong>Start with our free resources, then see the platform in action.</strong>
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/organizations/register">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-emerald-600">
                <MessageCircle className="w-5 h-5 mr-2" />
                Request Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}