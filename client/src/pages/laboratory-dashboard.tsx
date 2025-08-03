import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TestTube, FlaskConical, Clock, CheckCircle, AlertTriangle, Users, BarChart3, FileText, Settings, Plus } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context-fixed";
import { useTranslation } from "@/contexts/translation-context";

export default function LaboratoryDashboard() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState("overview");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <TestTube className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Required</h2>
          <p className="text-gray-600">Please log in to access the laboratory dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratory Dashboard</h1>
          <p className="text-gray-600">Welcome, {user.firstName}. Manage your laboratory operations and test results.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="flex items-center">
            <TestTube className="h-4 w-4 mr-2" />
            {tenant?.name || "Laboratory"}
          </Badge>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tests">Lab Tests</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Key Metrics */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Tests</p>
                    <p className="text-3xl font-bold text-orange-600">24</p>
                    <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-3xl font-bold text-blue-600">18</p>
                    <p className="text-xs text-gray-500 mt-1">Currently processing</p>
                  </div>
                  <FlaskConical className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Today</p>
                    <p className="text-3xl font-bold text-green-600">47</p>
                    <p className="text-xs text-gray-500 mt-1">Results available</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical Results</p>
                    <p className="text-3xl font-bold text-red-600">3</p>
                    <p className="text-xs text-gray-500 mt-1">Requires attention</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mt-6">
            {/* Recent Test Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TestTube className="h-5 w-5 mr-2 text-blue-600" />
                  Recent Test Orders
                </CardTitle>
                <CardDescription>Latest laboratory test requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: "LAB-2024-001", test: "Complete Blood Count", patient: "Sarah Johnson", status: "processing", priority: "routine" },
                  { id: "LAB-2024-002", test: "Lipid Panel", patient: "Michael Davis", status: "pending", priority: "urgent" },
                  { id: "LAB-2024-003", test: "Liver Function", patient: "Emily Chen", status: "completed", priority: "routine" },
                  { id: "LAB-2024-004", test: "Thyroid Panel", patient: "Robert Wilson", status: "processing", priority: "routine" }
                ].map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{order.test}</p>
                      <p className="text-xs text-gray-600">{order.patient} • {order.id}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={order.priority === 'urgent' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {order.priority}
                      </Badge>
                      <Badge 
                        className={`text-xs ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Orders
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-purple-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common laboratory tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setCurrentTab("tests")}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Process New Test
                </Button>
                <Button 
                  onClick={() => setCurrentTab("results")}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Enter Results
                </Button>
                <Button 
                  onClick={() => setCurrentTab("quality")}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Quality Control
                </Button>
                <Button 
                  onClick={() => setCurrentTab("reports")}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Laboratory Tests</CardTitle>
                  <CardDescription>Manage and process laboratory test orders</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Test Order
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Management</h3>
                <p className="text-gray-600 mb-4">Laboratory test processing interface will be available here.</p>
                <Button variant="outline">Coming Soon</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Enter and review laboratory test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Results Management</h3>
                <p className="text-gray-600 mb-4">Test results entry and review interface will be available here.</p>
                <Button variant="outline">Coming Soon</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle>Quality Control</CardTitle>
              <CardDescription>Monitor and maintain laboratory quality standards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Assurance</h3>
                <p className="text-gray-600 mb-4">Quality control monitoring and reporting interface will be available here.</p>
                <Button variant="outline">Coming Soon</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Laboratory Reports</CardTitle>
              <CardDescription>Generate and view laboratory performance reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reporting Dashboard</h3>
                <p className="text-gray-600 mb-4">Laboratory analytics and reporting interface will be available here.</p>
                <Button variant="outline">Coming Soon</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}