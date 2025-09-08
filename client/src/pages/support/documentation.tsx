import { ArrowLeft, FileText, Book, Video, Download, Search, Users, Clock, Code, Key, Zap, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function Documentation() {
  const docCategories = [
    {
      title: "Getting Started",
      description: "Quick start guides and initial setup",
      docs: [
        { title: "Platform Overview", description: "Complete introduction to NAVIMED healthcare platform features and capabilities", readTime: "10 min" },
        { title: "Organization Setup", description: "Step-by-step guide to setting up your healthcare organization", readTime: "15 min" },
        { title: "User Account Configuration", description: "Creating and configuring user accounts for your team members", readTime: "8 min" },
        { title: "Initial System Configuration", description: "Essential settings and configurations for new installations", readTime: "20 min" },
        { title: "First Patient Registration", description: "Complete walkthrough of registering your first patient", readTime: "12 min" },
        { title: "Role-Based Access Setup", description: "Configuring permissions for doctors, nurses, and administrative staff", readTime: "18 min" }
      ]
    },
    {
      title: "User Guides",
      description: "Comprehensive guides for daily operations",
      docs: [
        { title: "Patient Management System", description: "Complete guide to managing patient records, medical history, and care plans", readTime: "25 min" },
        { title: "Appointment Scheduling", description: "Advanced scheduling features, conflict resolution, and calendar management", readTime: "20 min" },
        { title: "Electronic Health Records", description: "Creating, updating, and managing comprehensive patient health records", readTime: "30 min" },
        { title: "Prescription Management", description: "Digital prescription creation, routing, and pharmacy integration", readTime: "22 min" },
        { title: "Laboratory Order Processing", description: "Ordering lab tests, tracking results, and clinical decision support", readTime: "18 min" },
        { title: "Insurance Claims Processing", description: "Filing insurance claims, tracking payments, and managing denials", readTime: "35 min" },
        { title: "Billing and Revenue Cycle", description: "Complete billing workflow from service delivery to payment collection", readTime: "40 min" },
        { title: "Clinical Documentation", description: "Best practices for clinical notes, consultation records, and care documentation", readTime: "28 min" }
      ]
    },
    {
      title: "Administrator Guides",
      description: "System administration and advanced configuration",
      docs: [
        { title: "System Administration Panel", description: "Complete overview of administrative functions and system management", readTime: "30 min" },
        { title: "User Role and Permission Management", description: "Advanced user management, custom roles, and granular permissions", readTime: "25 min" },
        { title: "Security and Compliance Settings", description: "HIPAA compliance, data encryption, and security policy configuration", readTime: "45 min" },
        { title: "Data Backup and Recovery", description: "Automated backup configuration, disaster recovery, and data restoration", readTime: "35 min" },
        { title: "Integration Management", description: "Connecting external systems, APIs, and third-party healthcare applications", readTime: "50 min" },
        { title: "Performance Monitoring", description: "System performance metrics, monitoring dashboards, and optimization", readTime: "40 min" },
        { title: "Audit Log Management", description: "Comprehensive audit trails, compliance reporting, and log analysis", readTime: "30 min" }
      ]
    },
    {
      title: "Specialty Workflows",
      description: "Guides for specific healthcare specialties",
      docs: [
        { title: "Emergency Department Workflow", description: "Optimized workflows for emergency care, triage, and critical patient management", readTime: "35 min" },
        { title: "Pharmacy Operations", description: "Prescription processing, inventory management, and medication dispensing", readTime: "40 min" },
        { title: "Laboratory Information System", description: "Lab workflow optimization, result reporting, and quality control", readTime: "45 min" },
        { title: "Surgical Suite Management", description: "Pre-operative planning, surgical scheduling, and post-operative care", readTime: "38 min" },
        { title: "Pediatric Care Protocols", description: "Specialized workflows for pediatric patients and family-centered care", readTime: "32 min" },
        { title: "Mental Health Documentation", description: "Specialized documentation for mental health services and therapy sessions", readTime: "28 min" }
      ]
    },
    {
      title: "Comprehensive Training Programs",
      description: "Professional training and certification programs",
      docs: [
        { title: "Comprehensive User Training", description: "Complete training program with Foundation, Intermediate, and Advanced levels for all healthcare staff", readTime: "20-40 hours" },
        { title: "System Admin Training", description: "Advanced administrator training covering system setup, security, data management, and integration", readTime: "15-20 hours" },
        { title: "Workflow Training Modules", description: "Hands-on training for specific healthcare workflows including patient admission and clinical documentation", readTime: "4-8 hours per workflow" },
        { title: "Troubleshooting Guide", description: "Complete troubleshooting reference with common issues, error codes, and FAQ for quick problem resolution", readTime: "Quick Reference" },
        { title: "Quick Reference Guide", description: "Printable quick reference materials including keyboard shortcuts, common actions, and medical codes", readTime: "Quick Reference" }
      ]
    }
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
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Comprehensive guides, tutorials, and reference materials to help you get the most out of NAVIMED.
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search documentation..." className="pl-10" />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="guides" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="guides">User Guides</TabsTrigger>
              <TabsTrigger value="api">API Docs</TabsTrigger>
              <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
              <TabsTrigger value="downloads">Downloads</TabsTrigger>
            </TabsList>

            <TabsContent value="guides" className="space-y-8">
              <div className="grid gap-8">
                {docCategories.map((category, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {category.docs.map((doc, idx) => (
                          <div key={idx} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <Link href={`/docs/${doc.title.toLowerCase().replace(/\s+/g, '-')}`}>
                                  <button className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer text-left">
                                    {doc.title}
                                  </button>
                                </Link>
                                <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">{doc.readTime}</span>
                                </div>
                              </div>
                              <Link href={`/docs/${doc.title.toLowerCase().replace(/\s+/g, '-')}`}>
                                <Button variant="ghost" size="sm">
                                  <FileText className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="api" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <Code className="w-8 h-8 text-blue-600 mb-2" />
                    <CardTitle>REST API Reference</CardTitle>
                    <CardDescription>Complete API documentation with interactive examples</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Core Endpoints</h4>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Patient Management API</li>
                        <li>• Appointment Scheduling API</li>
                        <li>• Electronic Health Records API</li>
                        <li>• Prescription Management API</li>
                        <li>• Insurance Claims API</li>
                      </ul>
                    </div>
                    <Link href="/api-docs">
                      <Button variant="outline" className="w-full">
                        View Complete API Reference
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Key className="w-8 h-8 text-emerald-600 mb-2" />
                    <CardTitle>Authentication & Security</CardTitle>
                    <CardDescription>API security, authentication methods, and best practices</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Security Features</h4>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• JWT-based authentication</li>
                        <li>• Role-based access control</li>
                        <li>• Rate limiting and throttling</li>
                        <li>• HIPAA-compliant data handling</li>
                        <li>• API key management</li>
                      </ul>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open('/docs/api-security', '_blank')}
                    >
                      View Security Documentation
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Zap className="w-8 h-8 text-purple-600 mb-2" />
                    <CardTitle>Webhooks & Real-time</CardTitle>
                    <CardDescription>Event-driven integration and real-time notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Available Webhooks</h4>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Patient registration events</li>
                        <li>• Appointment status changes</li>
                        <li>• Lab result notifications</li>
                        <li>• Insurance claim updates</li>
                        <li>• System alerts and notifications</li>
                      </ul>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open('/docs/webhooks-setup', '_blank')}
                    >
                      Configure Webhooks
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Download className="w-8 h-8 text-orange-600 mb-2" />
                    <CardTitle>SDKs & Libraries</CardTitle>
                    <CardDescription>Official software development kits and code libraries</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Available SDKs</h4>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Node.js/JavaScript SDK</li>
                        <li>• Python SDK</li>
                        <li>• PHP SDK</li>
                        <li>• C#/.NET SDK</li>
                        <li>• Java SDK (Beta)</li>
                      </ul>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open('/downloads/sdks', '_blank')}
                    >
                      Download SDKs
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>API Quick Start</CardTitle>
                  <CardDescription>Get started with the NAVIMED API in minutes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900 p-4 rounded-lg text-emerald-400 font-mono text-sm overflow-x-auto">
{`// Install the NAVIMED SDK
npm install @navimed/api

// Initialize the client
const NaviMed = require('@navimed/api');
const client = new NaviMed({
  apiKey: 'your_api_key_here',
  environment: 'production' // or 'sandbox'
});

// Example: Get all patients
const patients = await client.patients.list({
  limit: 10,
  filter: {
    status: 'active'
  }
});

// Example: Create a new appointment
const appointment = await client.appointments.create({
  patientId: 'patient_123',
  providerId: 'provider_456', 
  scheduledAt: '2025-01-29T10:00:00Z',
  duration: 30,
  type: 'consultation'
});`}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos" className="space-y-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Video Tutorial Library</h3>
                  <Link href="/videos/integration">
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Add Real Videos
                    </Button>
                  </Link>
                </div>
                <p className="text-gray-600 mb-6">Comprehensive video guides covering all aspects of the NAVIMED healthcare platform. Follow the learning paths below for structured training.</p>
                
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">🎯 New User Path</h4>
                    <p className="text-sm text-blue-700">Start here for platform basics</p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h4 className="font-medium text-emerald-900 mb-2">👩‍⚕️ Clinical Staff Path</h4>
                    <p className="text-sm text-emerald-700">Essential workflows for patient care</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">⚙️ Administrative Path</h4>
                    <p className="text-sm text-purple-700">System management and compliance</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Platform Overview & Setup",
                    description: "Complete introduction to NAVIMED platform and initial setup process",
                    duration: "12:45",
                    category: "Getting Started",
                    level: "Beginner",
                    slug: "platform-overview-setup"
                  },
                  {
                    title: "Patient Registration Walkthrough",
                    description: "Step-by-step guide to registering new patients and managing records",
                    duration: "8:30",
                    category: "Patient Management",
                    level: "Beginner",
                    slug: "patient-registration"
                  },
                  {
                    title: "Advanced Appointment Scheduling",
                    description: "Master complex scheduling scenarios, recurring appointments, and resource management",
                    duration: "15:20",
                    category: "Scheduling",
                    level: "Intermediate",
                    slug: "appointment-scheduling"
                  },
                  {
                    title: "Electronic Health Records Deep Dive",
                    description: "Complete EHR workflow including documentation, care plans, and clinical notes",
                    duration: "22:15",
                    category: "Clinical",
                    level: "Intermediate",
                    slug: "electronic-health-records"
                  },
                  {
                    title: "Insurance Claims Processing",
                    description: "End-to-end insurance claims workflow from submission to payment",
                    duration: "18:45",
                    category: "Billing",
                    level: "Advanced",
                    slug: "insurance-claims-processing"
                  },
                  {
                    title: "Prescription Management System",
                    description: "Digital prescriptions, pharmacy integration, and medication management",
                    duration: "14:30",
                    category: "Clinical",
                    level: "Intermediate",
                    slug: "prescription-management"
                  },
                  {
                    title: "Laboratory Integration Setup",
                    description: "Connecting lab systems, ordering tests, and managing results",
                    duration: "16:45",
                    category: "Laboratory",
                    level: "Advanced",
                    slug: "laboratory-integration"
                  },
                  {
                    title: "System Administration Essentials",
                    description: "User management, security settings, and system configuration",
                    duration: "25:30",
                    category: "Administration",
                    level: "Advanced",
                    slug: "system-administration"
                  },
                  {
                    title: "HIPAA Compliance & Security",
                    description: "Ensuring HIPAA compliance and implementing security best practices",
                    duration: "19:20",
                    category: "Security",
                    level: "Advanced",
                    slug: "hipaa-compliance-security"
                  }
                ].map((video, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="relative">
                        <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                          <Video className="w-12 h-12 text-white" />
                        </div>
                        <Badge className="absolute top-2 right-2 bg-black/70 text-white">{video.duration}</Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight">{video.title}</CardTitle>
                      <CardDescription className="text-sm">{video.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline">{video.category}</Badge>
                        <Badge className={`${
                          video.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                          video.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {video.level}
                        </Badge>
                      </div>
                      <Link href={`/videos/${video.slug || video.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}`}>
                        <Button className="w-full">
                          <Video className="w-4 h-4 mr-2" />
                          Watch Video
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Video Learning Paths</CardTitle>
                  <CardDescription>Structured learning sequences for different roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <h4 className="font-medium text-blue-900 mb-3">🎯 New User Path</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          <span className="text-blue-700">Platform Overview & Setup (12:45)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          <span className="text-blue-700">Patient Registration (8:30)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          <span className="text-blue-700">Basic Appointment Scheduling (15:20)</span>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 mt-3 font-medium">Total: 36 minutes</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-emerald-50">
                      <h4 className="font-medium text-emerald-900 mb-3">👩‍⚕️ Clinical Staff Path</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                          <span className="text-emerald-700">Electronic Health Records (22:15)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                          <span className="text-emerald-700">Prescription Management (14:30)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                          <span className="text-emerald-700">Laboratory Integration (16:45)</span>
                        </div>
                      </div>
                      <p className="text-xs text-emerald-600 mt-3 font-medium">Total: 53 minutes</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-purple-50">
                      <h4 className="font-medium text-purple-900 mb-3">⚙️ Administrative Path</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                          <span className="text-purple-700">Insurance Claims Processing (18:45)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                          <span className="text-purple-700">System Administration (25:30)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                          <span className="text-purple-700">HIPAA Compliance & Security (19:20)</span>
                        </div>
                      </div>
                      <p className="text-xs text-purple-600 mt-3 font-medium">Total: 63 minutes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="downloads" className="space-y-6">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Documentation Downloads</CardTitle>
                    <CardDescription>Comprehensive guides and manuals for offline reference</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { 
                          name: "Complete User Manual", 
                          description: "Comprehensive guide covering all NAVIMED features and workflows",
                          size: "4.2 MB", 
                          type: "PDF",
                          pages: "156 pages",
                          icon: FileText
                        },
                        { 
                          name: "Administrator Guide", 
                          description: "System administration, security settings, and advanced configuration",
                          size: "2.8 MB", 
                          type: "PDF",
                          pages: "89 pages",
                          icon: FileText
                        },
                        { 
                          name: "API Documentation", 
                          description: "Complete REST API reference with code examples and SDKs",
                          size: "3.5 MB", 
                          type: "PDF",
                          pages: "124 pages",
                          icon: Code
                        },
                        { 
                          name: "Quick Start Guide", 
                          description: "Get up and running with NAVIMED in under 30 minutes",
                          size: "1.2 MB", 
                          type: "PDF",
                          pages: "24 pages",
                          icon: FileText
                        },
                        { 
                          name: "HIPAA Compliance Guide", 
                          description: "Comprehensive guide to HIPAA compliance and security best practices",
                          size: "2.1 MB", 
                          type: "PDF",
                          pages: "67 pages",
                          icon: FileText
                        },
                        { 
                          name: "Integration Handbook", 
                          description: "Step-by-step integration guides for common healthcare systems",
                          size: "3.8 MB", 
                          type: "PDF",
                          pages: "112 pages",
                          icon: FileText
                        }
                      ].map((file, index) => (
                        <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <file.icon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{file.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{file.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>{file.size}</span>
                                <span>{file.pages}</span>
                                <span className="uppercase">{file.type}</span>
                              </div>
                            </div>
                            <Button 
                              size="sm"
                              onClick={() => {
                                // Create a mock download
                                const link = document.createElement('a');
                                link.href = `data:application/pdf;base64,JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL091dGxpbmVzIDIgMCBSCi9QYWdlcyAzIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvT3V0bGluZXMKL0NvdW50IDAKL1Jvb3QgMSAwIFIKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9Db3VudCAxCi9LaWRzIFs0IDAgUl0KPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAzIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSAKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvQXJpYWwtQm9sZE1UCj4+Cj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKNSAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzIgNzIwIFRkCihOQVZJTUVEIERvY3VtZW50YXRpb24pIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNzQgMDAwMDAgbiAKMDAwMDAwMDEyMCAwMDAwMCBuIAowMDAwMDAwMTc5IDAwMDAwIG4gCjAwMDAwMDA0MTcgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo1MjcKJSVFT0Y=`;
                                link.download = `${file.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Software Downloads</CardTitle>
                    <CardDescription>SDKs, libraries, and development tools</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { 
                          name: "Node.js SDK", 
                          version: "v2.1.0",
                          description: "Official JavaScript/Node.js SDK",
                          size: "2.4 MB",
                          type: "NPM Package"
                        },
                        { 
                          name: "Python SDK", 
                          version: "v1.8.2",
                          description: "Official Python SDK",
                          size: "1.8 MB",
                          type: "PyPI Package"
                        },
                        { 
                          name: "PHP SDK", 
                          version: "v1.5.1",
                          description: "Official PHP SDK",
                          size: "1.2 MB",
                          type: "Composer Package"
                        },
                        { 
                          name: "C# SDK", 
                          version: "v1.4.0",
                          description: "Official .NET SDK",
                          size: "2.1 MB",
                          type: "NuGet Package"
                        },
                        { 
                          name: "Postman Collection", 
                          version: "v3.0",
                          description: "Complete API collection for testing",
                          size: "450 KB",
                          type: "JSON Collection"
                        },
                        { 
                          name: "OpenAPI Spec", 
                          version: "v3.0.3",
                          description: "OpenAPI/Swagger specification",
                          size: "280 KB",
                          type: "YAML/JSON"
                        }
                      ].map((software, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{software.name}</CardTitle>
                              <Badge variant="outline">{software.version}</Badge>
                            </div>
                            <CardDescription className="text-sm">{software.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs text-gray-500">{software.size}</span>
                              <span className="text-xs text-gray-500">{software.type}</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => {
                                // Create a mock download
                                const link = document.createElement('a');
                                link.href = `data:application/zip;base64,UEsDBAoAAAAAAIdYT1QAAAAAAAAAAAAAAAAJAAAAc2RrLWZpbGVzL1BLAwQKAAAAAAB/WE9UAAAAAAAAAAAAAAAAFAAAAG5hdmltZWQtc2RrLXYyLjEuMC50YXJQSwMECgAAAAAAgFhPVAAAAAAAAAAAAAAAABYAAABwYWNrYWdlLWRlcGVuZGVuY2llcy50eHRQSwECFAAKAAAAAAB/WE9UAAAAAAAAAAAAAAAAFAAAAG5hdmltZWQtc2RrLXYyLjEuMC50YXIAAAAAAAAAAFBLAQIUAAoAAAAAAIBYT1QAAAAAAAAAAAAAAAAWAAAAcGFja2FnZS1kZXBlbmRlbmNpZXMudHh0AAAAAAAAAABQSwECFAAKAAAAAACHWE9UAAAAAAAAAAAAAAAACQAAAHN`;
                                link.download = `${software.name.toLowerCase().replace(/\s+/g, '-')}-${software.version}.zip`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download className="w-3 h-3 mr-2" />
                              Download
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Templates & Examples</CardTitle>
                    <CardDescription>Sample configurations and implementation templates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { 
                          name: "Hospital Configuration Template", 
                          description: "Pre-configured settings template for hospital deployments",
                          size: "45 KB",
                          type: "JSON"
                        },
                        { 
                          name: "Clinic Setup Template", 
                          description: "Optimized configuration for small to medium clinics",
                          size: "32 KB",
                          type: "JSON"
                        },
                        { 
                          name: "Pharmacy Integration Examples", 
                          description: "Sample code for pharmacy system integrations",
                          size: "1.8 MB",
                          type: "ZIP"
                        },
                        { 
                          name: "Custom Role Configurations", 
                          description: "Example role and permission configurations",
                          size: "28 KB",
                          type: "JSON"
                        },
                        { 
                          name: "Webhook Implementation Examples", 
                          description: "Sample webhook handlers in multiple languages",
                          size: "892 KB",
                          type: "ZIP"
                        },
                        { 
                          name: "Integration Testing Suite", 
                          description: "Complete test suite for API integrations",
                          size: "2.3 MB",
                          type: "ZIP"
                        }
                      ].map((template, index) => (
                        <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{template.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span>{template.size}</span>
                                <span className="uppercase">{template.type}</span>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                // Create a mock download
                                const link = document.createElement('a');
                                link.href = `data:application/${template.type.toLowerCase()};base64,eyJuYW1lIjoiJHt0ZW1wbGF0ZS5uYW1lfSIsInZlcnNpb24iOiIxLjAuMCIsInNldHRpbmdzIjp7fX0=`;
                                link.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}.${template.type.toLowerCase()}`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </section>
    </div>
  );
}