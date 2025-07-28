import { ArrowLeft, FileText, Book, Video, Download, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function Documentation() {
  const docCategories = [
    {
      title: "Getting Started",
      description: "Quick start guides and initial setup",
      docs: [
        "Platform Overview",
        "Account Setup",
        "Initial Configuration",
        "User Management"
      ]
    },
    {
      title: "User Guides",
      description: "Step-by-step instructions for all features",
      docs: [
        "Patient Management",
        "Appointment Scheduling",
        "Billing & Claims",
        "Reporting & Analytics"
      ]
    },
    {
      title: "Administrator Guides",
      description: "System administration and configuration",
      docs: [
        "System Configuration",
        "User Role Management",
        "Security Settings",
        "Backup & Recovery"
      ]
    },
    {
      title: "API Documentation",
      description: "Technical documentation for developers",
      docs: [
        "REST API Reference",
        "Authentication",
        "Webhooks",
        "SDKs & Libraries"
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
              <div className="grid md:grid-cols-2 gap-8">
                {docCategories.map((category, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.docs.map((doc, idx) => (
                          <li key={idx}>
                            <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline">
                              {doc}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>API Documentation</CardTitle>
                  <CardDescription>Complete technical reference for developers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">REST API</h4>
                      <p className="text-sm text-gray-600 mb-4">Complete REST API reference with examples</p>
                      <Button variant="outline" size="sm">View API Docs</Button>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Authentication</h4>
                      <p className="text-sm text-gray-600 mb-4">API authentication and security</p>
                      <Button variant="outline" size="sm">View Auth Guide</Button>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">SDKs</h4>
                      <p className="text-sm text-gray-600 mb-4">Software development kits and libraries</p>
                      <Button variant="outline" size="sm">Download SDKs</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  "Getting Started with NAVIMED",
                  "Patient Management Basics",
                  "Advanced Scheduling Features",
                  "Billing and Claims Processing",
                  "Reporting and Analytics",
                  "System Administration"
                ].map((title, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <Video className="w-12 h-12 text-blue-600 mb-2" />
                      <CardTitle className="text-lg">{title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm">Watch Video</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="downloads">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { name: "User Manual (PDF)", size: "2.5 MB", type: "PDF" },
                  { name: "Administrator Guide (PDF)", size: "1.8 MB", type: "PDF" },
                  { name: "API Reference (PDF)", size: "3.2 MB", type: "PDF" },
                  { name: "Quick Start Guide (PDF)", size: "800 KB", type: "PDF" }
                ].map((file, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Download className="w-8 h-8 text-blue-600" />
                          <div>
                            <div className="font-semibold">{file.name}</div>
                            <div className="text-sm text-gray-500">{file.size}</div>
                          </div>
                        </div>
                        <Button size="sm">Download</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}