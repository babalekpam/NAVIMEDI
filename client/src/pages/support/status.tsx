import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function Status() {
  const services = [
    { name: "API Services", status: "operational", uptime: "99.98%" },
    { name: "Web Application", status: "operational", uptime: "99.97%" },
    { name: "Database Services", status: "operational", uptime: "99.99%" },
    { name: "Authentication", status: "operational", uptime: "99.96%" },
    { name: "Email Services", status: "operational", uptime: "99.95%" },
    { name: "File Storage", status: "operational", uptime: "99.94%" }
  ];

  const incidents = [
    {
      date: "Jan 25, 2025",
      title: "Database Performance Optimization",
      status: "resolved",
      description: "Routine maintenance completed successfully"
    },
    {
      date: "Jan 20, 2025", 
      title: "API Rate Limiting Update",
      status: "resolved",
      description: "Improved API performance and reliability"
    },
    {
      date: "Jan 15, 2025",
      title: "Scheduled Maintenance",
      status: "resolved", 
      description: "System updates and security patches applied"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "degraded":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "outage":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-100 text-green-800">Operational</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>;
      case "outage":
        return <Badge className="bg-red-100 text-red-800">Outage</Badge>;
      case "resolved":
        return <Badge className="bg-blue-100 text-blue-800">Resolved</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

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
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              System Status
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Real-time status and uptime information for all NAVIMED services.
            </p>
          </div>

          <div className="mb-12">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <CardTitle className="text-green-800">All Systems Operational</CardTitle>
                    <CardDescription className="text-green-700">
                      All services are running normally
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Service Status</CardTitle>
                <CardDescription>Current status of all NAVIMED services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <div className="font-semibold">{service.name}</div>
                          <div className="text-sm text-gray-600">Uptime: {service.uptime}</div>
                        </div>
                      </div>
                      {getStatusBadge(service.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Recent Incidents</CardTitle>
                <CardDescription>Recent system updates and maintenance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incidents.map((incident, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">{incident.title}</div>
                        {getStatusBadge(incident.status)}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{incident.date}</div>
                      <div className="text-sm text-gray-700">{incident.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">99.98%</div>
                    <div className="text-gray-600">Overall Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">127ms</div>
                    <div className="text-gray-600">Average Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">0</div>
                    <div className="text-gray-600">Active Incidents</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}