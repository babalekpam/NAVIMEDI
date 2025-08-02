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

  const generateComprehensiveReport = () => {
    console.log('🚀 REPORT GENERATION STARTED');
    alert('Starting report generation...');
    
    try {
      // Create simple text content
      const reportContent = `Pharmacy Report - ${new Date().toLocaleDateString()}
Period: ${selectedTimeframe}

=== SUMMARY METRICS ===
Total Prescriptions: ${selectedTimeframe === 'today' ? metrics.prescriptionsToday : metrics.prescriptionsWeek}
Total Revenue: $${selectedTimeframe === 'today' ? metrics.revenueToday : metrics.revenueWeek}
Patients Served: ${selectedTimeframe === 'today' ? metrics.patientsToday : 287}
Average Wait Time: ${metrics.averageWaitTime} minutes
Inventory Alerts: ${metrics.inventoryAlerts}
Insurance Claims: ${metrics.insuranceClaims}

=== CURRENT PRESCRIPTIONS ===
${prescriptions.map(p => `${p.patientName} - ${p.medication} - ${p.status} - ${p.priority}`).join('\n')}

=== INVENTORY ALERTS ===
${inventoryAlerts.map(a => `${a.medication} - Stock: ${a.currentStock} - Reorder: ${a.reorderLevel} - ${a.urgency}`).join('\n')}

Report generated on: ${new Date().toLocaleString()}
`;

      console.log('📄 Content created, creating download...');
      
      // Create blob and download
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `pharmacy-report-${selectedTimeframe}-${Date.now()}.txt`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      console.log('🔗 Link created, triggering download...');
      
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('🧹 Cleanup completed');
      }, 100);

      console.log('✅ REPORT DOWNLOAD INITIATED');
      alert('Report download started! Check your downloads folder.');
      
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error generating report: ' + error);
    }
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
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => window.location.href = '/prescriptions?action=new'}
            >
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
                <Button 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => window.location.href = '/pharmacy-patient-management'}
                >
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
                <button
                  className="w-full mt-3 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                  onClick={() => {
                    // Generate AI Insights Report directly
                    const reportContent = `AI INSIGHTS REPORT
Generated: ${new Date().toLocaleString()}
Pharmacy: Working Test Pharmacy

=== DRUG INTERACTION ALERTS ===
Total Interactions Detected: 3
High Priority: 1
Medium Priority: 2

Interaction Details:
1. Warfarin + Aspirin - Increased bleeding risk
2. Metformin + Alcohol - Enhanced hypoglycemic effect  
3. Lisinopril + Potassium - Hyperkalemia risk

=== ADHERENCE PREDICTION ===
Overall Compliance Rate: 89%
Patients at Risk: 12
Improvement Opportunities: 23

Top Non-Adherent Medications:
- Insulin (72% compliance)
- Blood Pressure Medications (81% compliance)
- Cholesterol Medications (85% compliance)

=== INVENTORY OPTIMIZATION ===
Potential Monthly Savings: $2,340
Overstocked Items: 8
Understocked Items: 5
Optimal Reorder Points Calculated: 156

Cost Reduction Opportunities:
- Generic Substitutions: $1,200/month
- Bulk Purchase Discounts: $890/month
- Waste Reduction: $250/month

=== AI RECOMMENDATIONS ===
1. Implement automated drug interaction screening
2. Set up patient adherence reminders
3. Optimize inventory based on seasonal trends
4. Consider therapeutic substitutions for cost savings

Report generated by NaviMED AI Analytics Engine
`;

                    const blob = new Blob([reportContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ai-insights-report-${Date.now()}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Generate New Report
                </button>
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
                <Button 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => window.location.href = '/pharmacy-patient-management'}
                >
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
                <button 
                  style={{
                    backgroundColor: '#16a34a',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#15803d'}
                  onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#16a34a'}
                  onClick={() => {
                    // CSV format for better compatibility
                    const csvData = [
                      ['PHARMACY ANALYTICS REPORT'],
                      ['Generated', new Date().toLocaleString()],
                      ['Period', selectedTimeframe],
                      [''],
                      ['METRICS', 'VALUE'],
                      ['Prescriptions Today', metrics.prescriptionsToday],
                      ['Revenue Today', '$' + metrics.revenueToday],
                      ['Patients Served', metrics.patientsToday],
                      ['Average Wait Time', metrics.averageWaitTime + ' minutes'],
                      ['Inventory Alerts', metrics.inventoryAlerts],
                      ['Insurance Claims', metrics.insuranceClaims],
                      [''],
                      ['PRESCRIPTIONS', '', '', ''],
                      ['Patient Name', 'Medication', 'Status', 'Priority'],
                      ...prescriptions.map(p => [p.patientName, p.medication, p.status, p.priority]),
                      [''],
                      ['INVENTORY ALERTS', '', '', ''],
                      ['Medication', 'Current Stock', 'Reorder Level', 'Urgency'],
                      ...inventoryAlerts.map(a => [a.medication, a.currentStock, a.reorderLevel, a.urgency]),
                      [''],
                      ['WEEKLY SUMMARY', ''],
                      ['Weekly Prescriptions', metrics.prescriptionsWeek],
                      ['Weekly Revenue', '$' + metrics.revenueWeek],
                      ['Weekly Patients', '287'],
                      ['Patient Satisfaction', '94.2%'],
                      ['Prescription Accuracy', '99.8%']
                    ];
                    
                    const csvString = csvData.map(row => 
                      row.map(cell => `"${cell}"`).join(',')
                    ).join('\n');
                    
                    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    if (link.download !== undefined) {
                      const url = URL.createObjectURL(blob);
                      link.setAttribute('href', url);
                      link.setAttribute('download', `pharmacy-report-${selectedTimeframe}-${new Date().getTime()}.csv`);
                      link.style.visibility = 'hidden';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                >
                  ⬇ Export Report
                </button>
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
              <Button 
                variant="outline" 
                className="flex flex-col items-center gap-2 h-20"
                onClick={() => window.location.href = '/patients'}
              >
                <Search className="w-5 h-5" />
                <span className="text-xs">Search Patient</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col items-center gap-2 h-20"
                onClick={() => window.location.href = '/prescriptions?action=new'}
              >
                <Plus className="w-5 h-5" />
                <span className="text-xs">New Rx</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col items-center gap-2 h-20"
                onClick={() => window.location.href = '/pharmacy-inventory'}
              >
                <Package className="w-5 h-5" />
                <span className="text-xs">Inventory</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col items-center gap-2 h-20"
                onClick={() => window.location.href = '/pharmacy-patient-management'}
              >
                <Phone className="w-5 h-5" />
                <span className="text-xs">Call Patient</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col items-center gap-2 h-20"
                onClick={() => window.location.href = '/prescriptions'}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs">Print Label</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col items-center gap-2 h-20"
                onClick={() => window.location.href = '/pharmacy-patient-management'}
              >
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