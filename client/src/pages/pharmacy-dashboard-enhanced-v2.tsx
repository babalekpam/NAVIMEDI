import { useState, useEffect } from 'react';
import { 
  Activity, AlertTriangle, BarChart3, Bell, Calendar, CheckCircle, 
  Clock, CreditCard, DollarSign, Download, FileText, Heart, 
  MessageSquare, Package, Pill, Plus, QrCode, RefreshCw, 
  Search, Shield, Star, TrendingUp, Users, Zap, Phone,
  Smartphone, Tablet, Wifi, WifiOff, MapPin, Truck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';

interface PharmacyMetrics {
  prescriptionsToday: number;
  prescriptionsWeek: number;
  revenueToday: number;
  revenueWeek: number;
  patientsToday: number;
  averageWaitTime: number;
  inventoryAlerts: number;
  insuranceClaims: number;
}

interface PrescriptionStatus {
  id: string;
  patientName: string;
  medication: string;
  status: 'new' | 'processing' | 'ready' | 'dispensed';
  waitTime: number;
  priority: 'normal' | 'urgent' | 'critical';
  insuranceStatus: 'approved' | 'pending' | 'denied';
}

interface InventoryAlert {
  id: string;
  medication: string;
  currentStock: number;
  reorderLevel: number;
  supplier: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export default function PharmacyDashboardEnhancedV2() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today');
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [notifications, setNotifications] = useState<number>(12);
  
  // Mock data - replace with real API calls
  const metrics: PharmacyMetrics = {
    prescriptionsToday: 89,
    prescriptionsWeek: 612,
    revenueToday: 3247.50,
    revenueWeek: 21834.75,
    patientsToday: 67,
    averageWaitTime: 12,
    inventoryAlerts: 8,
    insuranceClaims: 456
  };

  const prescriptions: PrescriptionStatus[] = [
    { id: 'P001', patientName: 'Sarah Johnson', medication: 'Metformin 500mg', status: 'ready', waitTime: 5, priority: 'normal', insuranceStatus: 'approved' },
    { id: 'P002', patientName: 'Mike Chen', medication: 'Lisinopril 10mg', status: 'processing', waitTime: 15, priority: 'urgent', insuranceStatus: 'pending' },
    { id: 'P003', patientName: 'Emma Davis', medication: 'Atorvastatin 20mg', status: 'new', waitTime: 0, priority: 'critical', insuranceStatus: 'approved' },
    { id: 'P004', patientName: 'John Smith', medication: 'Amlodipine 5mg', status: 'ready', waitTime: 8, priority: 'normal', insuranceStatus: 'approved' },
  ];

  const inventoryAlerts: InventoryAlert[] = [
    { id: 'I001', medication: 'Insulin Glargine', currentStock: 5, reorderLevel: 20, supplier: 'Sanofi', urgency: 'critical' },
    { id: 'I002', medication: 'Albuterol Inhaler', currentStock: 12, reorderLevel: 25, supplier: 'GSK', urgency: 'high' },
    { id: 'I003', medication: 'Amoxicillin 500mg', currentStock: 45, reorderLevel: 100, supplier: 'Teva', urgency: 'medium' },
  ];

  const generateComprehensiveReport = async () => {
    const csvContent = `Comprehensive Pharmacy Analytics Report
Generated: ${new Date().toLocaleString()}
Period: ${selectedTimeframe === 'today' ? 'Today' : selectedTimeframe === 'week' ? 'This Week' : 'This Month'}

=== EXECUTIVE SUMMARY ===
Total Prescriptions,${selectedTimeframe === 'today' ? metrics.prescriptionsToday : metrics.prescriptionsWeek}
Total Revenue,$${selectedTimeframe === 'today' ? metrics.revenueToday : metrics.revenueWeek}
Patients Served,${selectedTimeframe === 'today' ? metrics.patientsToday : 287}
Average Wait Time,${metrics.averageWaitTime} minutes
Patient Satisfaction,94.2%
Insurance Claims Processed,${metrics.insuranceClaims}
Claims Approval Rate,92.8%

=== PRESCRIPTION ANALYTICS ===
Status,Count,Percentage
New,${prescriptions.filter(p => p.status === 'new').length},${(prescriptions.filter(p => p.status === 'new').length / prescriptions.length * 100).toFixed(1)}%
Processing,${prescriptions.filter(p => p.status === 'processing').length},${(prescriptions.filter(p => p.status === 'processing').length / prescriptions.length * 100).toFixed(1)}%
Ready,${prescriptions.filter(p => p.status === 'ready').length},${(prescriptions.filter(p => p.status === 'ready').length / prescriptions.length * 100).toFixed(1)}%
Dispensed,${prescriptions.filter(p => p.status === 'dispensed').length},${(prescriptions.filter(p => p.status === 'dispensed').length / prescriptions.length * 100).toFixed(1)}%

=== TOP MEDICATIONS ===
Medication,Prescriptions,Revenue,Margin
Metformin 500mg,89,$2,456.78,34.2%
Lisinopril 10mg,76,$1,987.45,28.9%
Atorvastatin 20mg,65,$3,245.67,41.3%
Amlodipine 5mg,54,$1,678.23,32.1%
Omeprazole 20mg,48,$1,234.89,29.7%
Insulin Glargine,42,$4,567.89,18.5%
Albuterol Inhaler,38,$2,345.67,35.8%
Simvastatin 40mg,35,$1,456.78,31.2%

=== INVENTORY ALERTS ===
Medication,Current Stock,Reorder Level,Urgency,Supplier
${inventoryAlerts.map(alert => `${alert.medication},${alert.currentStock},${alert.reorderLevel},${alert.urgency},${alert.supplier}`).join('\n')}

=== FINANCIAL PERFORMANCE ===
Revenue Stream,Amount,Percentage
Prescription Sales,$${(metrics.revenueWeek * 0.75).toFixed(2)},75.0%
Insurance Copays,$${(metrics.revenueWeek * 0.15).toFixed(2)},15.0%
OTC Sales,$${(metrics.revenueWeek * 0.08).toFixed(2)},8.0%
Consultation Fees,$${(metrics.revenueWeek * 0.02).toFixed(2)},2.0%

=== OPERATIONAL EFFICIENCY ===
Metric,Value,Target,Performance
Average Processing Time,${metrics.averageWaitTime} min,15 min,80.0%
First Fill Rate,94.2%,95.0%,99.2%
Generic Substitution Rate,78.5%,75.0%,104.7%
Medication Therapy Management,156 consultations,120,130.0%
Vaccination Services,89 vaccines,80,111.3%

=== PATIENT DEMOGRAPHICS ===
Age Group,Count,Percentage
0-18,45,15.7%
19-34,78,27.2%
35-54,98,34.1%
55-74,87,30.3%
75+,79,27.5%

Insurance Type,Count,Percentage
Medicare,134,46.7%
Medicaid,67,23.3%
Commercial,98,34.1%
Cash Pay,23,8.0%
Other,15,5.2%

=== CLINICAL SERVICES ===
Service,This Period,Last Period,Growth
Medication Counseling,234,198,+18.2%
Drug Interaction Screening,456,423,+7.8%
Adherence Monitoring,123,145,-15.2%
Immunizations,89,67,+32.8%
Health Screenings,45,38,+18.4%
MTM Consultations,67,52,+28.8%

=== QUALITY METRICS ===
Metric,Score,Benchmark,Status
Prescription Accuracy,99.8%,99.5%,Exceeds
Customer Satisfaction,4.8/5.0,4.5/5.0,Exceeds
Wait Time Compliance,85.6%,90.0%,Below Target
Insurance Processing,92.8%,95.0%,Below Target
Inventory Turnover,12.4x,10.0x,Exceeds`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `comprehensive_pharmacy_report_${selectedTimeframe}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'urgent': return 'text-orange-600 bg-orange-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'ready': return 'bg-green-500';
      case 'dispensed': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modern Pharmacy Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time pharmacy operations & analytics</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Online Status */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border">
              {onlineStatus ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600 font-medium">Offline</span>
                </>
              )}
            </div>
            
            {/* Notifications */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border relative">
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">{notifications}</span>
              {notifications > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </div>
            
            {/* Quick Actions */}
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Prescription
            </Button>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Prescriptions Today</p>
                  <p className="text-2xl font-bold">{metrics.prescriptionsToday}</p>
                </div>
                <Pill className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Revenue Today</p>
                  <p className="text-2xl font-bold">${metrics.revenueToday.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Patients Served</p>
                  <p className="text-2xl font-bold">{metrics.patientsToday}</p>
                </div>
                <Users className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Avg Wait Time</p>
                  <p className="text-2xl font-bold">{metrics.averageWaitTime}m</p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Inventory Alerts</p>
                  <p className="text-2xl font-bold">{metrics.inventoryAlerts}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm">Insurance Claims</p>
                  <p className="text-2xl font-bold">{metrics.insuranceClaims}</p>
                </div>
                <Shield className="w-8 h-8 text-teal-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Live Prescription Queue */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Live Prescription Queue
                </CardTitle>
                <Button size="sm" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(prescription.status)}`}></div>
                    <div>
                      <p className="font-medium">{prescription.patientName}</p>
                      <p className="text-sm text-gray-600">{prescription.medication}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getPriorityColor(prescription.priority)}>
                      {prescription.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {prescription.insuranceStatus}
                    </Badge>
                    <span className="text-sm text-gray-500">{prescription.waitTime}m</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Inventory Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-600" />
                Critical Inventory Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {inventoryAlerts.map((alert) => (
                <div key={alert.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{alert.medication}</p>
                    <Badge className={getUrgencyColor(alert.urgency)}>
                      {alert.urgency}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Current: {alert.currentStock}</span>
                      <span>Reorder: {alert.reorderLevel}</span>
                    </div>
                    <Progress 
                      value={(alert.currentStock / alert.reorderLevel) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-gray-500">Supplier: {alert.supplier}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Modern Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Digital Health Integration */}
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <Smartphone className="w-5 h-5" />
                Digital Health Hub
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  <span>QR Prescription Pickup</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>SMS Notifications</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Medication Reminders</span>
                </div>
                <Button size="sm" className="w-full mt-3">
                  Manage Services
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI-Powered Insights */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Zap className="w-5 h-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-purple-700">Drug Interaction Alerts</p>
                  <p className="text-xs text-gray-600">3 potential interactions detected</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-purple-700">Adherence Prediction</p>
                  <p className="text-xs text-gray-600">89% patient compliance rate</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-purple-700">Inventory Optimization</p>
                  <p className="text-xs text-gray-600">Save $2,340 this month</p>
                </div>
                <Button size="sm" className="w-full mt-3" variant="outline">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>



          {/* Delivery & Logistics */}
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Truck className="w-5 h-5" />
                Delivery Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-orange-700">Active Deliveries</p>
                  <p className="text-xs text-gray-600">14 orders in transit</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-orange-700">Same-Day Delivery</p>
                  <p className="text-xs text-gray-600">Available until 6 PM</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-orange-700">Drone Delivery</p>
                  <p className="text-xs text-gray-600">2 prescriptions via drone</p>
                </div>
                <Button size="sm" className="w-full mt-3">
                  Track Deliveries
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Analytics & Reporting */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Advanced Analytics & Reporting
              </CardTitle>
              <div className="flex gap-2">
                <select 
                  value={selectedTimeframe} 
                  onChange={(e) => setSelectedTimeframe(e.target.value as 'today' | 'week' | 'month')}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <Button onClick={generateComprehensiveReport} className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">+15.3%</p>
                <p className="text-sm text-gray-600">Revenue Growth</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">4.8/5.0</p>
                <p className="text-sm text-gray-600">Patient Satisfaction</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">99.8%</p>
                <p className="text-sm text-gray-600">Prescription Accuracy</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <CreditCard className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">92.8%</p>
                <p className="text-sm text-gray-600">Insurance Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                <Search className="w-5 h-5" />
                <span className="text-xs">Search Patient</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                <Plus className="w-5 h-5" />
                <span className="text-xs">New Rx</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                <Package className="w-5 h-5" />
                <span className="text-xs">Inventory</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                <Phone className="w-5 h-5" />
                <span className="text-xs">Call Patient</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                <FileText className="w-5 h-5" />
                <span className="text-xs">Print Label</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                <MapPin className="w-5 h-5" />
                <span className="text-xs">Track Delivery</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}