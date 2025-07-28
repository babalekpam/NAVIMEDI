import { ArrowLeft, Code, Database, Globe, Key, Zap, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function ApiDocs() {
  const endpoints = [
    {
      method: "GET",
      path: "/api/patients",
      description: "Retrieve all patients for the authenticated tenant",
      auth: "Bearer Token Required"
    },
    {
      method: "POST",
      path: "/api/patients",
      description: "Create a new patient record",
      auth: "Bearer Token Required"
    },
    {
      method: "GET",
      path: "/api/appointments",
      description: "Retrieve appointments with optional filtering",
      auth: "Bearer Token Required"
    },
    {
      method: "POST",
      path: "/api/appointments",
      description: "Schedule a new appointment",
      auth: "Bearer Token Required"
    },
    {
      method: "GET",
      path: "/api/prescriptions",
      description: "Retrieve prescriptions for the tenant",
      auth: "Bearer Token Required"
    },
    {
      method: "POST",
      path: "/api/prescriptions",
      description: "Create a new prescription",
      auth: "Bearer Token Required"
    }
  ];

  const sdks = [
    { name: "JavaScript/Node.js", status: "Available", version: "v2.1.0" },
    { name: "Python", status: "Available", version: "v1.8.2" },
    { name: "PHP", status: "Available", version: "v1.5.1" },
    { name: "C#/.NET", status: "Available", version: "v1.4.0" },
    { name: "Java", status: "Beta", version: "v0.9.1" },
    { name: "Ruby", status: "Coming Soon", version: "TBD" }
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
        <div className="container mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Code className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            API Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive REST API documentation for integrating NAVIMED with your applications. 
            Build powerful healthcare solutions with our developer-friendly API.
          </p>
        </div>
      </section>

      {/* API Overview */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="authentication">Authentication</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="sdks">SDKs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <Globe className="w-12 h-12 text-blue-600 mb-4" />
                    <CardTitle>RESTful API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Standard REST architecture with JSON responses, HTTP status codes, and predictable resource-oriented URLs.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Key className="w-12 h-12 text-emerald-600 mb-4" />
                    <CardTitle>Secure Authentication</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      JWT-based authentication with role-based access control ensuring secure access to healthcare data.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Zap className="w-12 h-12 text-purple-600 mb-4" />
                    <CardTitle>Real-time Updates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Webhook support for real-time notifications when data changes, keeping your applications in sync.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-white p-8 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">Base URL</h3>
                <div className="bg-slate-900 p-4 rounded-lg text-emerald-400 font-mono">
                  https://api.navimed.com/v1
                </div>
                <p className="text-gray-600 mt-4">
                  All API requests should be made to this base URL. The current API version is v1.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="authentication" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>API Authentication</CardTitle>
                  <CardDescription>
                    NAVIMED API uses Bearer token authentication. Include your API key in the Authorization header.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Authentication Header</h4>
                    <div className="bg-slate-900 p-4 rounded-lg text-emerald-400 font-mono text-sm">
                      Authorization: Bearer YOUR_API_KEY
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Example Request</h4>
                    <div className="bg-slate-900 p-4 rounded-lg text-emerald-400 font-mono text-sm">
{`curl -X GET \\
  https://api.navimed.com/v1/patients \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Getting Your API Key</h4>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                      <li>Log in to your NAVIMED dashboard</li>
                      <li>Navigate to Settings → API Keys</li>
                      <li>Click "Generate New API Key"</li>
                      <li>Copy and securely store your key</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-6">
              <div className="grid gap-4">
                {endpoints.map((endpoint, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Badge 
                          className={`${
                            endpoint.method === 'GET' ? 'bg-green-100 text-green-800' : 
                            endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="text-lg font-mono">{endpoint.path}</code>
                      </div>
                      <CardDescription>{endpoint.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{endpoint.auth}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Response Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900 p-4 rounded-lg text-emerald-400 font-mono text-sm">
{`{
  "success": true,
  "data": {
    // Response data here
  },
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100
  },
  "meta": {
    "timestamp": "2025-01-28T10:00:00Z",
    "version": "1.0"
  }
}`}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sdks" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sdks.map((sdk, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{sdk.name}</CardTitle>
                        <Badge 
                          className={`${
                            sdk.status === 'Available' ? 'bg-green-100 text-green-800' :
                            sdk.status === 'Beta' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {sdk.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Version: {sdk.version}</p>
                        {sdk.status === 'Available' && (
                          <Button size="sm" variant="outline" className="w-full">
                            Download SDK
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Start Example (Node.js)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900 p-4 rounded-lg text-emerald-400 font-mono text-sm">
{`const NaviMed = require('@navimed/api');

const client = new NaviMed({
  apiKey: 'your_api_key_here'
});

// Get all patients
const patients = await client.patients.list();

// Create a new patient
const newPatient = await client.patients.create({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com'
});`}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Developer Support</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our developer relations team is here to help you integrate successfully.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <FileText className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle>Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Comprehensive guides, tutorials, and reference documentation.
                </p>
                <Button variant="outline">View Docs</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Globe className="w-12 h-12 text-emerald-600 mb-4" />
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Join our developer community for support and discussions.
                </p>
                <Button variant="outline">Join Community</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Key className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Direct Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Get direct support from our developer relations team.
                </p>
                <Button variant="outline">Contact Support</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}