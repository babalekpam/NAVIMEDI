import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, Package, DollarSign, Calendar, User, Activity } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

export default function PredictiveAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/analytics/predictions"],
    enabled: true
  });

  // Mock data for high-risk patients
  const highRiskPatients = [
    {
      id: "P001",
      name: "John Smith",
      age: 68,
      condition: "Heart Failure",
      riskScore: 87,
      lastAdmission: "2025-10-15",
      factors: ["Previous readmission", "Multiple comorbidities", "Age > 65"]
    },
    {
      id: "P002",
      name: "Mary Johnson",
      age: 72,
      condition: "Diabetes",
      riskScore: 76,
      lastAdmission: "2025-10-20",
      factors: ["Poor medication adherence", "Uncontrolled glucose", "Age > 65"]
    },
    {
      id: "P003",
      name: "Robert Williams",
      age: 55,
      condition: "COPD",
      riskScore: 69,
      lastAdmission: "2025-10-18",
      factors: ["Active smoker", "Multiple ED visits", "Low compliance"]
    }
  ];

  // No-show predictions
  const noShowAppointments = [
    {
      id: "A001",
      patientName: "Sarah Davis",
      appointmentDate: "2025-11-05",
      department: "Cardiology",
      noShowProbability: 72,
      reason: "History of 3 no-shows in last 6 months"
    },
    {
      id: "A002",
      patientName: "Michael Brown",
      appointmentDate: "2025-11-06",
      department: "Orthopedics",
      noShowProbability: 65,
      reason: "Long wait time, first-time patient"
    },
    {
      id: "A003",
      patientName: "Jennifer Wilson",
      appointmentDate: "2025-11-07",
      department: "Primary Care",
      noShowProbability: 58,
      reason: "Appointment scheduled >30 days out"
    }
  ];

  // Inventory demand forecast
  const inventoryForecast = [
    { item: "N95 Masks", current: 450, predicted30Day: 2100, reorderPoint: 500, status: "critical" },
    { item: "Surgical Gloves", current: 3200, predicted30Day: 4500, reorderPoint: 1000, status: "good" },
    { item: "IV Catheters", current: 850, predicted30Day: 1200, reorderPoint: 500, status: "warning" },
    { item: "Gauze Pads", current: 1500, predicted30Day: 2000, reorderPoint: 800, status: "good" }
  ];

  // Revenue forecast data
  const revenueForecast = [
    { month: "Nov 2025", actual: 0, predicted: 875000, lowerBound: 825000, upperBound: 925000 },
    { month: "Dec 2025", actual: 0, predicted: 892000, lowerBound: 840000, upperBound: 945000 },
    { month: "Jan 2026", actual: 0, predicted: 910000, lowerBound: 855000, upperBound: 965000 },
    { month: "Feb 2026", actual: 0, predicted: 925000, lowerBound: 868000, upperBound: 982000 },
    { month: "Mar 2026", actual: 0, predicted: 943000, lowerBound: 882000, upperBound: 1004000 },
    { month: "Apr 2026", actual: 0, predicted: 960000, lowerBound: 895000, upperBound: 1025000 }
  ];

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-600";
    if (score >= 60) return "text-orange-600";
    return "text-yellow-600";
  };

  const getRiskBadge = (score: number) => {
    if (score >= 80) return <Badge variant="destructive">Critical</Badge>;
    if (score >= 60) return <Badge className="bg-orange-600">High</Badge>;
    return <Badge className="bg-yellow-600">Moderate</Badge>;
  };

  const getInventoryBadge = (status: string) => {
    if (status === "critical") return <Badge variant="destructive">Critical</Badge>;
    if (status === "warning") return <Badge className="bg-orange-600">Warning</Badge>;
    return <Badge className="bg-green-600">Good</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="predictive-analytics-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="page-title">
          Predictive Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          AI-powered predictions and forecasts for proactive decision-making
        </p>
      </div>

      <Tabs defaultValue="readmission" className="space-y-6">
        <TabsList data-testid="tabs-list">
          <TabsTrigger value="readmission" data-testid="tab-readmission">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Readmission Risk
          </TabsTrigger>
          <TabsTrigger value="noshow" data-testid="tab-noshow">
            <Calendar className="mr-2 h-4 w-4" />
            No-Show Predictions
          </TabsTrigger>
          <TabsTrigger value="inventory" data-testid="tab-inventory">
            <Package className="mr-2 h-4 w-4" />
            Inventory Forecast
          </TabsTrigger>
          <TabsTrigger value="revenue" data-testid="tab-revenue">
            <DollarSign className="mr-2 h-4 w-4" />
            Revenue Forecast
          </TabsTrigger>
        </TabsList>

        {/* Readmission Risk Tab */}
        <TabsContent value="readmission" className="space-y-6">
          <Card data-testid="card-readmission-overview">
            <CardHeader>
              <CardTitle>High-Risk Patients</CardTitle>
              <CardDescription>
                Patients with elevated readmission risk requiring proactive intervention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {highRiskPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    data-testid={`patient-${patient.id}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <User className="h-10 w-10 text-gray-400" />
                        <div>
                          <h4 className="font-semibold text-lg" data-testid={`patient-name-${patient.id}`}>
                            {patient.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {patient.age} years • {patient.condition}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getRiskBadge(patient.riskScore)}
                        <p className={`text-2xl font-bold mt-1 ${getRiskColor(patient.riskScore)}`}>
                          {patient.riskScore}%
                        </p>
                        <p className="text-xs text-gray-500">Risk Score</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <Progress value={patient.riskScore} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Risk Factors:</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.factors.map((factor, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Last admission: {new Date(patient.lastAdmission).toLocaleDateString()}
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" data-testid={`button-view-${patient.id}`}>
                          View Details
                        </Button>
                        <Button size="sm" data-testid={`button-intervene-${patient.id}`}>
                          Create Intervention
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* No-Show Predictions Tab */}
        <TabsContent value="noshow" className="space-y-6">
          <Card data-testid="card-noshow-predictions">
            <CardHeader>
              <CardTitle>High No-Show Probability Appointments</CardTitle>
              <CardDescription>
                Upcoming appointments with elevated risk of patient no-show
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {noShowAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    data-testid={`appointment-${appt.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-semibold" data-testid={`appointment-patient-${appt.id}`}>
                              {appt.patientName}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(appt.appointmentDate).toLocaleDateString()} • {appt.department}
                            </p>
                          </div>
                        </div>
                        <div className="mb-2">
                          <Progress value={appt.noShowProbability} className="h-2" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Reason:</span> {appt.reason}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-orange-600">{appt.noShowProbability}%</p>
                        <p className="text-xs text-gray-500">No-Show Risk</p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" data-testid={`button-send-reminder-${appt.id}`}>
                        Send Reminder
                      </Button>
                      <Button variant="outline" size="sm" data-testid={`button-call-patient-${appt.id}`}>
                        Call Patient
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Forecast Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card data-testid="card-inventory-forecast">
            <CardHeader>
              <CardTitle>30-Day Inventory Demand Forecast</CardTitle>
              <CardDescription>
                Predicted inventory needs based on historical usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventoryForecast.map((item, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-4"
                    data-testid={`inventory-item-${idx}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg" data-testid={`item-name-${idx}`}>
                          {item.item}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Current stock: {item.current} units
                        </p>
                      </div>
                      {getInventoryBadge(item.status)}
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500">Current</p>
                        <p className="text-lg font-semibold">{item.current}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Predicted 30-Day</p>
                        <p className="text-lg font-semibold">{item.predicted30Day}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Reorder Point</p>
                        <p className="text-lg font-semibold">{item.reorderPoint}</p>
                      </div>
                    </div>
                    {item.status === "critical" && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          ⚠️ Recommended immediate reorder: {item.predicted30Day - item.current} units
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Forecast Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <Card data-testid="card-revenue-forecast">
            <CardHeader>
              <CardTitle>6-Month Revenue Forecast</CardTitle>
              <CardDescription>
                Predicted revenue with 95% confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    stackId="1"
                    stroke="#93c5fd"
                    fill="#dbeafe"
                    name="Upper Bound"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stackId="2"
                    stroke="#3b82f6"
                    fill="#60a5fa"
                    name="Predicted"
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBound"
                    stackId="3"
                    stroke="#93c5fd"
                    fill="#dbeafe"
                    name="Lower Bound"
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Monthly Forecast</p>
                  <p className="text-2xl font-bold text-blue-600">$917,500</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
                  <p className="text-2xl font-bold text-green-600">+2.1%</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                  <p className="text-2xl font-bold text-purple-600">95%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
