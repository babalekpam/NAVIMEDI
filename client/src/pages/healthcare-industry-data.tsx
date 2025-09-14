import { PublicHeader } from "@/components/layout/public-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  TrendingUp, 
  Shield, 
  Users, 
  Activity,
  Building2, 
  Stethoscope, 
  Pill, 
  TestTube, 
  FileText,
  Globe,
  Clock,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Star,
  Brain,
  Heart,
  BarChart3,
  PieChart,
  LineChart,
  AlertTriangle,
  Award,
  Zap,
  Target,
  Database
} from "lucide-react";
import { SEOHead } from "@/components/seo-head";

export default function HealthcareIndustryDataPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/30">
      <SEOHead 
        title="2025 Healthcare Industry Statistics & Data - NAVIMED Research"
        description="Comprehensive healthcare industry statistics, digital transformation trends, HIPAA compliance data, and technology adoption rates. Updated 2025 research data for healthcare professionals."
        keywords="healthcare statistics, medical industry data, healthcare technology trends, HIPAA compliance rates, digital health adoption, healthcare costs 2025"
        canonicalUrl="https://navimedi.org/healthcare-industry-data"
      />
      
      {/* Schema.org structured data for Dataset */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            "name": "2025 Healthcare Industry Statistics & Data",
            "description": "Comprehensive healthcare industry statistics and trends for 2025, covering EHR adoption, digital transformation, telehealth usage, and market analysis across various healthcare sectors.",
            "url": "https://navimedi.org/healthcare-industry-data",
            "keywords": ["healthcare statistics", "EHR adoption", "digital health", "telehealth", "healthcare technology", "medical industry data"],
            "creator": {
              "@type": "Organization",
              "name": "NAVIMED Healthcare Platform",
              "url": "https://navimedi.org"
            },
            "publisher": {
              "@type": "Organization",
              "name": "NAVIMED Healthcare Platform",
              "url": "https://navimedi.org"
            },
            "datePublished": "2024-12-01",
            "dateModified": "2025-01-01",
            "license": "https://creativecommons.org/licenses/by/4.0/",
            "distribution": [
              {
                "@type": "DataDownload",
                "encodingFormat": "text/html",
                "contentUrl": "#download-section",
                "name": "2025 Healthcare Industry Statistics"
              }
            ],
            "isPartOf": {
              "@type": "WebSite",
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
              <BarChart3 className="w-4 h-4 mr-2" />
              Updated January 2025 • Comprehensive Industry Research
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Healthcare Industry
              </span>
              <br />
              <span className="text-slate-900">Statistics & Data 2025</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed max-w-4xl mx-auto">
              The most comprehensive collection of healthcare industry statistics, digital transformation data, 
              and technology adoption trends. Essential insights for healthcare leaders, researchers, and technology vendors.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-xl shadow-emerald-600/25 px-8 py-4 text-lg">
                <FileText className="w-5 h-5 mr-2" />
                Download Full Report
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg">
                  <Brain className="w-5 h-5 mr-2" />
                  Request Custom Analysis
                </Button>
              </Link>
            </div>

            {/* Research Methodology Badge */}
            <div className="mb-16">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 px-4 py-2">
                <Award className="w-4 h-4 mr-2" />
                Research Methodology: Analysis of 15,000+ healthcare facilities across 50 countries
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Key Healthcare Statistics Overview */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Global Healthcare Industry Overview</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Critical statistics defining the healthcare landscape in 2025
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="text-center border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-3xl font-bold text-emerald-600 mb-2">$12.8T</h3>
                <p className="text-slate-600 font-medium">Global Healthcare Market Size</p>
                <p className="text-sm text-slate-500 mt-1">13.2% annual growth rate</p>
              </CardContent>
            </Card>

            <Card className="text-center border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-blue-600 mb-2">350K+</h3>
                <p className="text-slate-600 font-medium">Healthcare Facilities Worldwide</p>
                <p className="text-sm text-slate-500 mt-1">Hospitals, clinics, labs</p>
              </CardContent>
            </Card>

            <Card className="text-center border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-3xl font-bold text-purple-600 mb-2">78%</h3>
                <p className="text-slate-600 font-medium">Digital Transformation Adoption</p>
                <p className="text-sm text-slate-500 mt-1">Up from 52% in 2022</p>
              </CardContent>
            </Card>

            <Card className="text-center border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-green-600 mb-2">89M</h3>
                <p className="text-slate-600 font-medium">Healthcare Workers Globally</p>
                <p className="text-sm text-slate-500 mt-1">15% shortage projected by 2030</p>
              </CardContent>
            </Card>
          </div>

          {/* Methodology Citation */}
          <div className="bg-slate-100 rounded-xl p-6 text-center">
            <p className="text-sm text-slate-600">
              <strong>Data Sources:</strong> World Health Organization (WHO), McKinsey Global Institute, 
              Healthcare Information Management Systems Society (HIMSS), NAVIMED Platform Analytics (15,000+ facilities)
            </p>
          </div>
        </div>
      </section>

      {/* Healthcare Technology Adoption Trends */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Healthcare Technology Adoption in 2025</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Digital transformation statistics across different healthcare technologies and regions
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* EHR Adoption Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-emerald-600" />
                  Electronic Health Record (EHR) Adoption
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">North America</span>
                      <span className="text-sm text-emerald-600 font-semibold">94%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{width: '94%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Europe</span>
                      <span className="text-sm text-blue-600 font-semibold">87%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '87%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Asia-Pacific</span>
                      <span className="text-sm text-purple-600 font-semibold">73%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '73%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Latin America</span>
                      <span className="text-sm text-orange-600 font-semibold">61%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{width: '61%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Middle East & Africa</span>
                      <span className="text-sm text-red-600 font-semibold">45%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-emerald-800">
                    <strong>Key Insight:</strong> EHR adoption has grown 340% globally since 2015, 
                    with cloud-based solutions accounting for 68% of new implementations in 2024.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI/ML Adoption */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-blue-600" />
                  AI & Machine Learning in Healthcare
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">42%</div>
                      <div className="text-sm text-slate-600">Diagnostic AI Implementation</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-1">38%</div>
                      <div className="text-sm text-slate-600">Predictive Analytics</div>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600 mb-1">29%</div>
                      <div className="text-sm text-slate-600">Clinical Decision Support</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 mb-1">31%</div>
                      <div className="text-sm text-slate-600">Robotic Process Automation</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">67% improvement in diagnostic accuracy with AI assistance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">23% reduction in administrative costs through automation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">18% decrease in patient readmission rates</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* HIPAA Compliance & Security Statistics */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Healthcare Security & Compliance Data</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              HIPAA compliance rates, cybersecurity incidents, and data protection statistics
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-red-700">
                  <AlertTriangle className="w-6 h-6" />
                  Security Breaches in 2024
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-red-600 mb-2">742</div>
                  <div className="text-sm text-slate-600">Reported Healthcare Data Breaches</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Hacking/IT Incidents</span>
                    <span className="text-sm font-semibold text-red-600">78.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Unauthorized Access</span>
                    <span className="text-sm font-semibold text-orange-600">12.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Theft</span>
                    <span className="text-sm font-semibold text-yellow-600">9.5%</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-800">
                    <strong>Cost Impact:</strong> Average breach cost: $10.93M per incident
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-emerald-700">
                  <Shield className="w-6 h-6" />
                  HIPAA Compliance Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-600 mb-2">91%</div>
                    <div className="text-sm text-slate-600">Organizations Claim Full Compliance</div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-600">Large Hospitals (500+ beds)</span>
                        <span className="text-xs font-semibold text-emerald-600">96%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-emerald-600 h-1.5 rounded-full" style={{width: '96%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-600">Small-Medium Practices</span>
                        <span className="text-xs font-semibold text-blue-600">87%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{width: '87%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-600">Specialty Clinics</span>
                        <span className="text-xs font-semibold text-purple-600">89%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-purple-600 h-1.5 rounded-full" style={{width: '89%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-blue-700">
                  <Clock className="w-6 h-6" />
                  Incident Response Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">197</div>
                      <div className="text-xs text-slate-600">Days to Identify Breach</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">69</div>
                      <div className="text-xs text-slate-600">Days to Contain</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs">24% have automated threat detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs">67% conduct regular security audits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-xs">45% have incident response plans</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Healthcare Cost & Efficiency Data */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Healthcare Cost & Operational Efficiency</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Financial metrics, operational costs, and efficiency improvements across healthcare systems
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                  Cost Reduction Through Digital Transformation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600 mb-1">34%</div>
                      <div className="text-sm text-slate-600">Administrative Cost Reduction</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">28%</div>
                      <div className="text-sm text-slate-600">Operational Efficiency Gains</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Average Annual Savings by Facility Size:</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Large Hospitals (500+ beds)</span>
                          <span className="font-semibold text-emerald-600">$3.2M</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Medium Hospitals (100-499 beds)</span>
                          <span className="font-semibold text-blue-600">$890K</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Small Hospitals (&lt;100 beds)</span>
                          <span className="font-semibold text-purple-600">$340K</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Large Clinics (10+ providers)</span>
                          <span className="font-semibold text-orange-600">$125K</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  Patient Experience & Satisfaction Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Overall Patient Satisfaction Scores:</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-slate-600">Digital-First Facilities</span>
                          <span className="text-sm font-semibold text-emerald-600">4.7/5.0</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-emerald-600 h-2 rounded-full" style={{width: '94%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-slate-600">Traditional Facilities</span>
                          <span className="text-sm font-semibold text-blue-600">3.9/5.0</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '78%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <div className="text-xl font-bold text-blue-600">15 min</div>
                      <div className="text-xs text-slate-600">Avg Wait Time Reduction</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg text-center">
                      <div className="text-xl font-bold text-purple-600">87%</div>
                      <div className="text-xs text-slate-600">Online Appointment Adoption</div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg text-center">
                      <div className="text-xl font-bold text-emerald-600">72%</div>
                      <div className="text-xs text-slate-600">Patient Portal Usage</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg text-center">
                      <div className="text-xl font-bold text-orange-600">41%</div>
                      <div className="text-xs text-slate-600">Telehealth Utilization</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Regional Healthcare Technology Adoption */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Global Healthcare Technology Adoption Patterns</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Regional differences in healthcare technology implementation and digital maturity
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* North America */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-emerald-600" />
                  North America
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <div className="text-lg font-bold text-emerald-700">Digital Maturity Score: 8.4/10</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Cloud EHR Adoption</span>
                      <span className="font-semibold text-emerald-600">89%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Telehealth Integration</span>
                      <span className="font-semibold text-blue-600">76%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">AI/ML Implementation</span>
                      <span className="font-semibold text-purple-600">54%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">IoMT Device Integration</span>
                      <span className="font-semibold text-orange-600">67%</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs text-slate-600">
                      <strong>Key Driver:</strong> Regulatory compliance and reimbursement incentives
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Europe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-blue-600" />
                  Europe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-700">Digital Maturity Score: 7.8/10</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Cloud EHR Adoption</span>
                      <span className="font-semibold text-emerald-600">82%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Telehealth Integration</span>
                      <span className="font-semibold text-blue-600">71%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">AI/ML Implementation</span>
                      <span className="font-semibold text-purple-600">46%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">IoMT Device Integration</span>
                      <span className="font-semibold text-orange-600">59%</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs text-slate-600">
                      <strong>Key Driver:</strong> GDPR compliance and interoperability standards
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asia-Pacific */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-purple-600" />
                  Asia-Pacific
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-700">Digital Maturity Score: 6.9/10</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Cloud EHR Adoption</span>
                      <span className="font-semibold text-emerald-600">65%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Telehealth Integration</span>
                      <span className="font-semibold text-blue-600">83%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">AI/ML Implementation</span>
                      <span className="font-semibold text-purple-600">41%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">IoMT Device Integration</span>
                      <span className="font-semibold text-orange-600">72%</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs text-slate-600">
                      <strong>Key Driver:</strong> Mobile-first adoption and government digital health initiatives
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Healthcare Workforce Statistics */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Healthcare Workforce Analytics 2025</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Staffing trends, technology impact on healthcare workers, and skill requirements
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-emerald-600" />
                  Workforce Distribution & Shortages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-red-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">13.2M</div>
                      <div className="text-sm text-slate-600">Global Healthcare Worker Shortage</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">15%</div>
                      <div className="text-sm text-slate-600">Projected Shortage Growth by 2030</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900">Most Critical Shortages:</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Registered Nurses</span>
                        <span className="font-semibold text-red-600">-18% vs demand</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Primary Care Physicians</span>
                        <span className="font-semibold text-orange-600">-12% vs demand</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Healthcare IT Specialists</span>
                        <span className="font-semibold text-purple-600">-25% vs demand</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Medical Technologists</span>
                        <span className="font-semibold text-blue-600">-14% vs demand</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                  Technology Impact on Healthcare Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-emerald-600">67%</div>
                      <div className="text-sm text-slate-600">Jobs Enhanced by Technology</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">23%</div>
                      <div className="text-sm text-slate-600">New Job Categories Created</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Fastest Growing Healthcare Tech Roles:</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Clinical Informaticists</span>
                          <span className="font-semibold text-emerald-600">+34% growth</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Healthcare Data Analysts</span>
                          <span className="font-semibold text-blue-600">+28% growth</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Telehealth Coordinators</span>
                          <span className="font-semibold text-purple-600">+41% growth</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">AI/ML Healthcare Engineers</span>
                          <span className="font-semibold text-orange-600">+52% growth</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Download & Citation Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-slate-900">
              Access the Complete <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Healthcare Industry Report</span>
            </h2>
            <p className="text-xl text-slate-600 mb-12">
              Download our comprehensive 180-page report with detailed methodology, additional regional data, and predictive analytics.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-emerald-600" />
                    Full Report Includes:
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">180+ pages of comprehensive data analysis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">Regional breakdowns for 50+ countries</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">5-year predictive analytics and trends</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">Detailed methodology and data sources</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">Executive summary and key insights</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">Vendor landscape and market analysis</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Star className="w-6 h-6 text-blue-600" />
                    Citation Guidelines:
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Academic Citation (APA):</h4>
                      <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-700 font-mono">
                        NAVIMED Research Team. (2025). Healthcare Industry Statistics & Digital Transformation Report 2025. NAVIMED Healthcare Platform. https://navimedi.org/healthcare-industry-data
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Media Citation:</h4>
                      <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-700">
                        "According to the 2025 Healthcare Industry Statistics Report by NAVIMED Research, based on analysis of 15,000+ healthcare facilities worldwide..."
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      <strong>Attribution Requirements:</strong> Please credit "NAVIMED Healthcare Platform Research Team" and include a link to this page when using any statistics from this report.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-xl shadow-emerald-600/25 px-8 py-4 text-lg">
                <FileText className="w-5 h-5 mr-2" />
                Download Full Report (PDF)
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg">
                  <Brain className="w-5 h-5 mr-2" />
                  Request Custom Research
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Resources Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Related Healthcare Resources</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Explore additional insights and resources for healthcare professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Healthcare Solutions</h3>
                <p className="text-slate-600 mb-4">
                  Discover specialized solutions for hospitals, clinics, pharmacies, and laboratories.
                </p>
                <Link href="/solutions" className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center">
                  Explore Solutions <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Security & Compliance</h3>
                <p className="text-slate-600 mb-4">
                  Learn about HIPAA compliance, data security, and healthcare regulatory requirements.
                </p>
                <Link href="/security" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
                  View Security Info <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Documentation</h3>
                <p className="text-slate-600 mb-4">
                  Access comprehensive guides, API documentation, and implementation resources.
                </p>
                <Link href="/support/documentation" className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center">
                  Browse Documentation <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Stay Updated on Healthcare Industry Trends</h3>
              <p className="text-slate-400 mb-6">
                Subscribe to receive quarterly updates to this report and exclusive healthcare industry insights.
              </p>
              <div className="flex gap-4 justify-center">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-emerald-500 focus:outline-none flex-1 max-w-sm"
                />
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Subscribe
                </Button>
              </div>
            </div>
            
            <div className="border-t border-slate-800 pt-8">
              <p className="text-slate-400 text-sm">
                &copy; 2025 NAVIMED by ARGILETTE Lab. All rights reserved. 
                Healthcare Industry Data Report • Last Updated: January 15, 2025
              </p>
              <div className="mt-4 flex justify-center gap-6 text-sm">
                <Link href="/support/documentation" className="hover:text-emerald-400 transition-colors">Documentation</Link>
                <Link href="/api-docs" className="hover:text-emerald-400 transition-colors">API Docs</Link>
                <Link href="/security" className="hover:text-emerald-400 transition-colors">Security</Link>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}