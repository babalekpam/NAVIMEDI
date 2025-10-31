import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
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

// Type definitions for API responses
interface ReadmissionPrediction {
  patientId: string;
  patientName: string;
  riskScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  factors: string[];
  recommendations: string[];
}

interface NoShowPrediction {
  appointmentId: string;
  patientName: string;
  appointmentDate: Date;
  department: string;
  noShowProbability: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  factors: string[];
  recommendations: string[];
}

interface InventoryForecast {
  itemId: string;
  itemName: string;
  currentStock: number;
  predictedDemand: number;
  reorderPoint: number;
  suggestedOrder: number;
  daysUntilStockout: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface RevenueForecast {
  month: string;
  predictedRevenue: number;
  confidenceLow: number;
  confidenceHigh: number;
  trend: 'up' | 'down' | 'stable';
  factors: string[];
}

export default function PredictiveAnalytics() {
  const { user, isLoading: authLoading } = useAuth();

  // Readmission Risk Query
  const { data: readmissionData, isLoading: readmissionLoading } = useQuery<{ success: boolean; predictions: ReadmissionPrediction[] }>({
    queryKey: ['/api/predictive/readmission-risk'],
    enabled: !!user && !authLoading
  });

  // No-Show Predictions Query
  const { data: noShowData, isLoading: noShowLoading } = useQuery<{ success: boolean; predictions: NoShowPrediction[] }>({
    queryKey: ['/api/predictive/no-show-probability'],
    enabled: !!user && !authLoading
  });

  // Inventory Forecast Query
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery<{ success: boolean; forecasts: InventoryForecast[] }>({
    queryKey: ['/api/predictive/inventory-forecast'],
    enabled: !!user && !authLoading
  });

  // Revenue Forecast Query
  const { data: revenueData, isLoading: revenueLoading } = useQuery<{ success: boolean; forecast: RevenueForecast[] }>({
    queryKey: ['/api/predictive/revenue-forecast'],
    enabled: !!user && !authLoading
  });

  // Extract data from API responses
  const highRiskPatients = readmissionData?.predictions || [];
  const noShowAppointments = noShowData?.predictions || [];
  const inventoryForecast = inventoryData?.forecasts || [];
  const revenueForecast = revenueData?.forecast || [];

  // Helper functions
  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-600";
    if (score >= 60) return "text-orange-600";
    return "text-yellow-600";
  };

  const getRiskBadge = (riskLevel: string) => {
    if (riskLevel === 'Critical') return <Badge variant="destructive">Critical</Badge>;
    if (riskLevel === 'High') return <Badge className="bg-orange-600">High</Badge>;
    if (riskLevel === 'Moderate') return <Badge className="bg-yellow-600">Moderate</Badge>;
    return <Badge className="bg-green-600">Low</Badge>;
  };

  const getNoShowRiskBadge = (riskLevel: string) => {
    if (riskLevel === 'High') return <Badge variant="destructive">High Risk</Badge>;
    if (riskLevel === 'Moderate') return <Badge className="bg-orange-600">Moderate</Badge>;
    return <Badge className="bg-green-600">Low</Badge>;
  };

  const getInventoryBadge = (daysUntilStockout: number) => {
    if (daysUntilStockout < 7) return <Badge variant="destructive">Critical</Badge>;
    if (daysUntilStockout < 14) return <Badge className="bg-orange-600">Warning</Badge>;
    return <Badge className="bg-green-600">Good</Badge>;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return '📈';
    if (trend === 'decreasing') return '📉';
    return '➡️';
  };

  // Calculate summary statistics for revenue
  const avgForecast = revenueForecast.length > 0
    ? Math.round(revenueForecast.reduce((sum: number, item: any) => sum + item.predictedRevenue, 0) / revenueForecast.length)
    : 0;
  
  const growthRate = revenueForecast.length >= 2
    ? (((revenueForecast[revenueForecast.length - 1]?.predictedRevenue - revenueForecast[0]?.predictedRevenue) / revenueForecast[0]?.predictedRevenue) * 100).toFixed(1)
    : '0.0';

  // Loading states
  const isLoading = readmissionLoading || noShowLoading || inventoryLoading || revenueLoading;

  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="auth-loading">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="data-loading">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading predictive analytics...</p>
        </div>
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
              {highRiskPatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="mx-auto h-12 w-12 mb-4 opacity-30" />
                  <p>No high-risk patients identified</p>
                  <p className="text-sm mt-2">This is good news! Continue monitoring patient health.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {highRiskPatients.map((patient: any) => (
                    <div
                      key={patient.patientId}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      data-testid={`patient-${patient.patientId}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <User className="h-10 w-10 text-gray-400" />
                          <div>
                            <h4 className="font-semibold text-lg" data-testid={`patient-name-${patient.patientId}`}>
                              {patient.patientName}
                            </h4>
                          </div>
                        </div>
                        <div className="text-right">
                          {getRiskBadge(patient.riskLevel)}
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
                          {patient.factors.map((factor: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 mt-3">
                        <p className="text-sm font-medium">Recommendations:</p>
                        <div className="flex flex-wrap gap-2">
                          {patient.recommendations.map((rec: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {rec}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm" data-testid={`button-view-${patient.patientId}`}>
                          View Details
                        </Button>
                        <Button size="sm" data-testid={`button-intervene-${patient.patientId}`}>
                          Create Intervention
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              {noShowAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-30" />
                  <p>No high-risk appointments found</p>
                  <p className="text-sm mt-2">All upcoming appointments have low no-show probability.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {noShowAppointments.map((appt: any) => (
                    <div
                      key={appt.appointmentId}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      data-testid={`appointment-${appt.appointmentId}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-semibold" data-testid={`appointment-patient-${appt.appointmentId}`}>
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
                          
                          <div className="space-y-2 mt-3">
                            <p className="text-sm font-medium">Risk Factors:</p>
                            <div className="flex flex-wrap gap-2">
                              {appt.factors.map((factor: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {factor}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2 mt-3">
                            <p className="text-sm font-medium">Recommendations:</p>
                            <div className="flex flex-wrap gap-2">
                              {appt.recommendations.map((rec: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {rec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          {getNoShowRiskBadge(appt.riskLevel)}
                          <p className="text-2xl font-bold text-orange-600 mt-1">{appt.noShowProbability}%</p>
                          <p className="text-xs text-gray-500">No-Show Risk</p>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm" data-testid={`button-send-reminder-${appt.appointmentId}`}>
                          Send Reminder
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-call-patient-${appt.appointmentId}`}>
                          Call Patient
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              {inventoryForecast.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="mx-auto h-12 w-12 mb-4 opacity-30" />
                  <p>No critical inventory items</p>
                  <p className="text-sm mt-2">All inventory levels are within acceptable ranges.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inventoryForecast.map((item: any, idx: number) => (
                    <div
                      key={item.itemId}
                      className="border rounded-lg p-4"
                      data-testid={`inventory-item-${idx}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg flex items-center gap-2" data-testid={`item-name-${idx}`}>
                            {item.itemName} <span className="text-sm">{getTrendIcon(item.trend)}</span>
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Current stock: {item.currentStock} units • Trend: {item.trend}
                          </p>
                        </div>
                        {getInventoryBadge(item.daysUntilStockout)}
                      </div>
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500">Current</p>
                          <p className="text-lg font-semibold">{item.currentStock}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Predicted 30-Day</p>
                          <p className="text-lg font-semibold">{item.predictedDemand}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Reorder Point</p>
                          <p className="text-lg font-semibold">{item.reorderPoint}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Days Until Stockout</p>
                          <p className="text-lg font-semibold">{item.daysUntilStockout}</p>
                        </div>
                      </div>
                      {item.suggestedOrder > 0 && (
                        <div className={`mt-4 p-3 rounded ${
                          item.daysUntilStockout < 7 
                            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                            : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                        }`}>
                          <p className={`text-sm ${
                            item.daysUntilStockout < 7 
                              ? 'text-red-800 dark:text-red-200'
                              : 'text-yellow-800 dark:text-yellow-200'
                          }`}>
                            {item.daysUntilStockout < 7 ? '⚠️ Immediate' : '⚠️'} Recommended reorder: {item.suggestedOrder} units
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Forecast Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <Card data-testid="card-revenue-forecast">
            <CardHeader>
              <CardTitle>6-Month Revenue Forecast</CardTitle>
              <CardDescription>
                Predicted revenue with 95% confidence intervals based on historical data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {revenueForecast.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="mx-auto h-12 w-12 mb-4 opacity-30" />
                  <p>Insufficient data for revenue forecast</p>
                  <p className="text-sm mt-2">More historical data is needed to generate accurate predictions.</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={revenueForecast}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="confidenceHigh"
                        stackId="1"
                        stroke="#93c5fd"
                        fill="#dbeafe"
                        name="Upper Bound (95%)"
                      />
                      <Area
                        type="monotone"
                        dataKey="predictedRevenue"
                        stackId="2"
                        stroke="#3b82f6"
                        fill="#60a5fa"
                        name="Predicted Revenue"
                      />
                      <Area
                        type="monotone"
                        dataKey="confidenceLow"
                        stackId="3"
                        stroke="#93c5fd"
                        fill="#dbeafe"
                        name="Lower Bound (95%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Monthly Forecast</p>
                      <p className="text-2xl font-bold text-blue-600">${(avgForecast / 1000).toFixed(0)}K</p>
                    </div>
                    <div className={`text-center p-4 rounded-lg ${
                      parseFloat(growthRate) >= 0 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
                      <p className={`text-2xl font-bold ${
                        parseFloat(growthRate) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {parseFloat(growthRate) >= 0 ? '+' : ''}{growthRate}%
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                      <p className="text-2xl font-bold text-purple-600">95%</p>
                    </div>
                  </div>

                  {revenueForecast.length > 0 && revenueForecast[0].factors && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-medium mb-2">Forecast Factors:</p>
                      <div className="flex flex-wrap gap-2">
                        {revenueForecast[0].factors.map((factor: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
