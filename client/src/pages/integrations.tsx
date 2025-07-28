import { ArrowLeft, Zap, Database, Cloud, Smartphone, Globe, Users, FileText, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function Integrations() {
  const integrationCategories = [
    {
      title: "Healthcare Systems",
      icon: FileText,
      description: "Connect with existing healthcare infrastructure",
      integrations: [
        { name: "HL7 FHIR", type: "Standard", description: "Industry standard for healthcare data exchange" },
        { name: "Epic MyChart", type: "EHR", description: "Patient portal integration" },
        { name: "Cerner PowerChart", type: "EHR", description: "Clinical documentation system" },
        { name: "Allscripts", type: "EHR", description: "Electronic health records platform" },
        { name: "athenahealth", type: "EHR", description: "Cloud-based healthcare platform" },
        { name: "NextGen", type: "EHR", description: "Ambulatory EHR solution" }
      ]
    },
    {
      title: "Payment Processing",
      icon: DollarSign,
      description: "Streamline billing and payment collection",
      integrations: [
        { name: "Stripe", type: "Payment", description: "Online payment processing" },
        { name: "Square", type: "Payment", description: "Point-of-sale solutions" },
        { name: "PayPal", type: "Payment", description: "Digital wallet and payments" },
        { name: "Authorize.Net", type: "Payment", description: "Payment gateway services" },
        { name: "Clover", type: "POS", description: "Point-of-sale system" },
        { name: "First Data", type: "Payment", description: "Payment processing solutions" }
      ]
    },
    {
      title: "Insurance & Claims",
      icon: FileText,
      description: "Automate insurance verification and claims",
      integrations: [
        { name: "Eligibility API", type: "Insurance", description: "Real-time eligibility verification" },
        { name: "Change Healthcare", type: "Claims", description: "Claims processing network" },
        { name: "Availity", type: "Insurance", description: "Healthcare information exchange" },
        { name: "RelayHealth", type: "Claims", description: "Electronic transactions" },
        { name: "Emdeon", type: "Claims", description: "Revenue cycle management" },
        { name: "Navicure", type: "Claims", description: "Claims management platform" }
      ]
    },
    {
      title: "Laboratory Systems",
      icon: Database,
      description: "Connect with lab equipment and systems",
      integrations: [
        { name: "Lab Instruments", type: "Hardware", description: "Direct instrument connectivity" },
        { name: "Quest Diagnostics", type: "Lab", description: "Laboratory testing services" },
        { name: "LabCorp", type: "Lab", description: "Clinical laboratory services" },
        { name: "Cerner PathNet", type: "LIS", description: "Laboratory information system" },
        { name: "Epic Beaker", type: "LIS", description: "Laboratory workflow system" },
        { name: "Sunquest", type: "LIS", description: "Laboratory data management" }
      ]
    },
    {
      title: "Communication",
      icon: Users,
      description: "Enhance patient and provider communication",
      integrations: [
        { name: "Twilio", type: "SMS", description: "SMS and voice messaging" },
        { name: "SendGrid", type: "Email", description: "Email delivery service" },
        { name: "Zoom", type: "Video", description: "Telehealth video calls" },
        { name: "Microsoft Teams", type: "Video", description: "Healthcare collaboration" },
        { name: "Slack", type: "Chat", description: "Team communication" },
        { name: "WhatsApp Business", type: "Messaging", description: "Patient messaging" }
      ]
    },
    {
      title: "Cloud & Infrastructure",
      icon: Cloud,
      description: "Enterprise-grade infrastructure integrations",
      integrations: [
        { name: "AWS", type: "Cloud", description: "Amazon Web Services" },
        { name: "Microsoft Azure", type: "Cloud", description: "Cloud computing platform" },
        { name: "Google Cloud", type: "Cloud", description: "Google Cloud Platform" },
        { name: "Salesforce Health Cloud", type: "CRM", description: "Healthcare customer relationship management" },
        { name: "Active Directory", type: "Identity", description: "Enterprise identity management" },
        { name: "Single Sign-On", type: "Auth", description: "SAML/OAuth integration" }
      ]
    }
  ];

  const apiFeatures = [
    "RESTful API with OpenAPI documentation",
    "Webhook support for real-time notifications",
    "Rate limiting and authentication",
    "Sandbox environment for testing",
    "SDKs for popular programming languages",
    "24/7 developer support"
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
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Integrations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connect NAVIMED with your existing healthcare ecosystem. Our comprehensive integration 
            platform supports 200+ healthcare applications and systems to streamline your workflows.
          </p>
        </div>
      </section>

      {/* Integration Categories */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="space-y-12">
            {integrationCategories.map((category, index) => (
              <div key={index}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{category.title}</h2>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.integrations.map((integration, idx) => (
                    <Card key={idx} className="hover:shadow-lg transition-shadow duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <Badge variant="secondary">{integration.type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{integration.description}</CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Documentation */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Developer-Friendly API</h2>
              <p className="text-gray-600 mb-8">
                Build custom integrations with our comprehensive REST API. Complete documentation, 
                SDKs, and sandbox environment to get you started quickly.
              </p>
              <ul className="space-y-3">
                {apiFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button className="bg-gradient-to-r from-blue-600 to-emerald-600">
                  View API Documentation
                </Button>
              </div>
            </div>
            <div className="bg-slate-900 p-8 rounded-lg text-white">
              <h3 className="text-lg font-bold mb-4">Sample API Call</h3>
              <pre className="text-sm text-emerald-400 overflow-x-auto">
{`curl -X GET \\
  https://api.navimed.com/v1/patients \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"

{
  "patients": [
    {
      "id": "patient_123",
      "name": "John Doe",
      "mrn": "MRN001234",
      "created_at": "2025-01-28T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-emerald-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Connect Your Systems?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Our integration specialists will help you connect NAVIMED with your existing healthcare infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Start Integration
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Contact Integration Team
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}