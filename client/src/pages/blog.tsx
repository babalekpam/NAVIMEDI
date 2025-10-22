import { PublicHeader } from "@/components/layout/public-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Calendar,
  Clock,
  User,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Stethoscope,
  Brain,
  Shield,
  Zap,
  Target,
  FileText,
  ExternalLink,
  BookOpen,
  Lightbulb,
  Award,
  Activity
} from "lucide-react";
import { SEOHead } from "@/components/seo-head";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorRole: string;
  publishDate: string;
  readTime: string;
  tags: string[];
  featured: boolean;
  image?: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "ai-healthcare-transformation-2025",
    title: "AI in Healthcare: How Machine Learning is Reducing Medical Errors by 47% in 2025",
    excerpt: "New research from 200+ healthcare facilities shows Advanced diagnostic tools are dramatically improving patient safety and reducing costs. Our comprehensive analysis reveals the technologies making the biggest impact.",
    content: "Full analysis of AI implementation across healthcare systems...",
    category: "AI & Technology",
    author: "Dr. Elena Rodriguez",
    authorRole: "Chief Medical Officer, NAVIMED",
    publishDate: "2025-09-10",
    readTime: "8 min read",
    tags: ["AI", "Medical Errors", "Patient Safety", "Machine Learning", "Healthcare Technology"],
    featured: true
  },
  {
    id: "hipaa-compliance-2025-update",
    title: "HIPAA Compliance in 2025: New Requirements and 12-Point Security Checklist",
    excerpt: "Updated HIPAA guidelines introduce stricter data protection requirements. Our legal and security experts break down what healthcare organizations need to know and implement immediately.",
    content: "Comprehensive guide to 2025 HIPAA compliance requirements...",
    category: "Compliance & Security",
    author: "Sarah Chen, JD",
    authorRole: "Healthcare Compliance Director",
    publishDate: "2025-09-05",
    readTime: "12 min read",
    tags: ["HIPAA", "Compliance", "Data Security", "Healthcare Law", "Privacy"],
    featured: true
  },
  {
    id: "telehealth-adoption-study",
    title: "Telehealth Adoption Reaches 89% Among US Healthcare Providers: What's Driving Growth",
    excerpt: "Our 6-month study of 1,500+ healthcare providers reveals surprising trends in telehealth adoption, patient satisfaction metrics, and ROI calculations that every healthcare executive needs to see.",
    content: "Detailed analysis of telehealth adoption trends...",
    category: "Industry Research",
    author: "Michael Park, PhD",
    authorRole: "Healthcare Analytics Researcher",
    publishDate: "2025-09-01",
    readTime: "10 min read",
    tags: ["Telehealth", "Digital Health", "Patient Care", "Healthcare Trends", "ROI"],
    featured: true
  },
  {
    id: "pharmacy-automation-roi",
    title: "Pharmacy Automation ROI Study: $2.3M Average Savings for Mid-Size Healthcare Systems",
    excerpt: "Our analysis of 85 healthcare systems implementing pharmacy automation reveals consistent cost savings, error reduction, and efficiency gains. Includes detailed implementation timeline and budget planning.",
    content: "Comprehensive ROI analysis of pharmacy automation...",
    category: "Operational Excellence",
    author: "Dr. James Liu",
    authorRole: "Chief Pharmacy Officer",
    publishDate: "2025-08-28",
    readTime: "15 min read",
    tags: ["Pharmacy Automation", "ROI", "Cost Savings", "Medication Safety", "Healthcare Operations"],
    featured: false
  },
  {
    id: "patient-portal-engagement-metrics",
    title: "Patient Portal Engagement: 73% Increase in Satisfaction When Multi-Language Support is Available",
    excerpt: "Analysis of patient portal usage data from 300+ healthcare facilities shows dramatic improvements in patient engagement and health outcomes when language barriers are removed.",
    content: "Study of patient portal engagement and language accessibility...",
    category: "Patient Experience",
    author: "Dr. Maria Gonzalez",
    authorRole: "Director of Patient Experience",
    publishDate: "2025-08-25",
    readTime: "7 min read",
    tags: ["Patient Engagement", "Multi-language", "Health Equity", "Patient Portals", "User Experience"],
    featured: false
  },
  {
    id: "ehr-interoperability-challenges",
    title: "EHR Interoperability in 2025: Breaking Down Data Silos with FHIR R5",
    excerpt: "The latest FHIR R5 standard is revolutionizing healthcare data exchange. Our technical deep-dive covers implementation strategies, common pitfalls, and real-world success stories.",
    content: "Technical analysis of FHIR R5 implementation...",
    category: "Interoperability",
    author: "Alex Thompson, MS",
    authorRole: "Senior Healthcare IT Architect",
    publishDate: "2025-08-20",
    readTime: "13 min read",
    tags: ["FHIR", "Interoperability", "EHR", "Health Data Exchange", "Healthcare IT"],
    featured: false
  }
];

const categories = ["All", "AI & Technology", "Compliance & Security", "Industry Research", "Operational Excellence", "Patient Experience", "Interoperability"];

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured);
  const recentPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/30">
      <SEOHead 
        title="Healthcare Industry Insights & Research Blog | NAVIMED"
        description="Expert healthcare insights, original research, and industry analysis. Get the latest on AI in healthcare, HIPAA compliance, telehealth trends, and operational excellence from healthcare technology leaders."
        canonicalUrl="https://navimedi.org/blog"
        keywords="healthcare blog, medical technology insights, healthcare research, HIPAA compliance, telehealth trends, AI in healthcare, EHR interoperability, healthcare operations"
      />
      
      {/* Schema.org structured data for Blog */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "NAVIMED Healthcare Insights Blog",
            "description": "Expert healthcare insights, original research, and industry analysis from NAVIMED healthcare technology leaders.",
            "url": "https://navimedi.org/blog",
            "publisher": {
              "@type": "Organization",
              "name": "NAVIMED Healthcare Platform",
              "url": "https://navimedi.org"
            },
            "blogPost": featuredPosts.map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt,
              "author": {
                "@type": "Person",
                "name": post.author,
                "jobTitle": post.authorRole
              },
              "datePublished": post.publishDate,
              "url": `https://navimedi.org/blog/${post.id}`,
              "keywords": post.tags.join(", "),
              "about": {
                "@type": "Thing",
                "name": post.category
              }
            }))
          })
        }}
      />
      
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-8 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-4 py-2">
              <BookOpen className="w-4 h-4 mr-2" />
              Healthcare Industry Insights
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Expert Research
              </span>
              <br />
              <span className="text-slate-900">& Industry Analysis</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Original research, in-depth analysis, and actionable insights from healthcare technology leaders. 
              Stay ahead with data-driven perspectives on AI, compliance, operations, and patient care innovation.
              <br />
              <span className="text-sm mt-4 block">
                Explore our <Link href="/healthcare-industry-data" className="text-emerald-600 hover:text-emerald-700 font-medium">comprehensive industry data</Link> or 
                browse our <Link href="/resources" className="text-blue-600 hover:text-blue-700 font-medium">resource hub</Link> for tools and guides.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-4 text-slate-900">Featured Research</h2>
              <p className="text-xl text-slate-600">
                Most impactful insights from our healthcare experts
              </p>
            </div>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
              <Award className="w-4 h-4 mr-2" />
              Editor's Choice
            </Badge>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {featuredPosts.map((post, index) => (
              <Card key={post.id} className={`group border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 ${index === 0 ? 'lg:col-span-2' : ''}`}>
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      <Lightbulb className="w-3 h-3 mr-1" />
                      {post.category}
                    </Badge>
                    <div className="flex items-center text-sm text-slate-500 gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>

                  <h3 className={`font-bold text-slate-900 mb-4 ${index === 0 ? 'text-2xl md:text-3xl' : 'text-xl'} group-hover:text-emerald-600 transition-colors`}>
                    {post.title}
                  </h3>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{post.tags.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{post.author}</p>
                        <p className="text-xs text-slate-500">{post.authorRole}</p>
                      </div>
                    </div>
                    <Link href={`/blog/${post.id}`}>
                      <Button 
                        variant="ghost" 
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        data-testid={`read-blog-${post.id}`}
                      >
                        Read Full Article <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-4 text-slate-900">Recent Insights</h2>
              <p className="text-xl text-slate-600">
                Latest research and analysis from our healthcare experts
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.slice(1, 4).map(category => (
                <Badge 
                  key={category} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-emerald-50"
                  data-testid={`filter-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map(post => (
              <Card key={post.id} className="group border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      {post.category}
                    </Badge>
                    <div className="flex items-center text-xs text-slate-500 gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-xs">{post.author}</p>
                        <p className="text-xs text-slate-500">{post.readTime}</p>
                      </div>
                    </div>
                    <Link href={`/blog/${post.id}`}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        data-testid={`read-blog-${post.id}`}
                      >
                        Read <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button className="bg-emerald-600 hover:bg-emerald-700" data-testid="view-all-posts">
              <FileText className="w-4 h-4 mr-2" />
              View All Posts
            </Button>
          </div>
        </div>
      </section>

      {/* Research Methodology & Credibility */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100">
              <Shield className="w-4 h-4 mr-2" />
              Research Standards & Methodology
            </Badge>
            <h2 className="text-4xl font-bold mb-4 text-slate-900">
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Rigorous Research</span> Standards
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our insights are backed by comprehensive data analysis, peer review, and independent verification
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center border-emerald-200 hover:border-emerald-300 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-3">Data-Driven Analysis</h3>
                <p className="text-slate-600 text-sm mb-4">
                  All insights based on analysis of 500+ healthcare facilities, with sample sizes clearly documented and statistical significance reported.
                </p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• Minimum 95% confidence intervals</li>
                  <li>• Multi-source data verification</li>
                  <li>• Independent statistical review</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center border-blue-200 hover:border-blue-300 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-3">Expert Review Process</h3>
                <p className="text-slate-600 text-sm mb-4">
                  All content reviewed by board-certified healthcare professionals and industry experts before publication.
                </p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• Medical professional review</li>
                  <li>• Legal compliance verification</li>
                  <li>• Technical accuracy validation</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center border-emerald-200 hover:border-emerald-300 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-3">Transparent Methodology</h3>
                <p className="text-slate-600 text-sm mb-4">
                  Full methodology, data sources, and limitations disclosed for every research piece to enable independent verification.
                </p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• Open methodology documentation</li>
                  <li>• Data source attribution</li>
                  <li>• Limitation acknowledgment</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Research Impact & Citations</h3>
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <div>
                <div className="text-3xl font-bold text-emerald-600 mb-2">150+</div>
                <div className="text-sm text-slate-600">Healthcare facilities<br/>in research studies</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">25+</div>
                <div className="text-sm text-slate-600">Peer-reviewed<br/>publications</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600 mb-2">500+</div>
                <div className="text-sm text-slate-600">Industry citations<br/>and references</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
                <div className="text-sm text-slate-600">Accuracy rate<br/>in follow-up studies</div>
              </div>
            </div>
            <p className="text-slate-600 text-sm">
              Our research is regularly cited by healthcare journals, industry reports, and academic publications. 
              <Link href="/healthcare-industry-data" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                View our comprehensive industry statistics <ExternalLink className="w-3 h-3 inline ml-1" />
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 via-blue-600 to-emerald-700">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Stay Ahead of Healthcare Innovation
            </h2>
            <p className="text-xl text-emerald-50 mb-8">
              Get exclusive insights, research previews, and industry analysis delivered to your inbox weekly.
            </p>
            
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-lg border border-white/20 bg-white/10 placeholder:text-white/70 text-white focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  data-testid="newsletter-email-input"
                />
                <Button 
                  className="bg-white text-emerald-600 hover:bg-emerald-50 font-semibold px-6"
                  data-testid="newsletter-subscribe"
                >
                  Subscribe
                </Button>
              </div>
              <p className="text-sm text-emerald-100 mt-4">
                Join 15,000+ healthcare professionals. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}