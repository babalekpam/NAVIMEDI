import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Building2, 
  Package, 
  Award, 
  Eye, 
  Plus, 
  Settings, 
  LogOut,
  BarChart3,
  MessageSquare,
  Calendar
} from 'lucide-react';

interface SupplierDashboardProps {
  supplier: {
    id: string;
    companyName: string;
    contactEmail: string;
    status: string;
  };
  onLogout: () => void;
}

export default function SupplierDashboard({ supplier, onLogout }: SupplierDashboardProps) {
  const [stats, setStats] = useState({
    totalAds: 0,
    totalViews: 0,
    totalInquiries: 0,
    activeAds: 0
  });

  useEffect(() => {
    // In a real application, we would fetch actual stats from the API
    // For now, we'll use mock data
    setStats({
      totalAds: 5,
      totalViews: 1247,
      totalInquiries: 23,
      activeAds: 3
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('supplierToken');
    localStorage.removeItem('supplierData');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Supplier Dashboard</h1>
                <p className="text-sm text-gray-500">{supplier.companyName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {supplier.status}
              </Badge>
              <Avatar>
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {supplier.companyName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back to NaviMED Marketplace!
          </h2>
          <p className="text-gray-600">
            Manage your medical device advertisements and connect with healthcare providers.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Advertisements</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAds}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeAds} currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInquiries}</div>
              <p className="text-xs text-muted-foreground">
                5 new this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.7</div>
              <p className="text-xs text-muted-foreground">
                Excellent rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to manage your marketplace presence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create New Advertisement
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Eye className="w-4 h-4 mr-2" />
                View My Advertisements
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <MessageSquare className="w-4 h-4 mr-2" />
                Manage Inquiries
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Settings className="w-4 h-4 mr-2" />
                Account Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates on your advertisements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New inquiry received</p>
                    <p className="text-xs text-gray-500">Surgical Microscope - Boston General Hospital</p>
                    <p className="text-xs text-gray-400">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Advertisement approved</p>
                    <p className="text-xs text-gray-500">Patient Monitoring System</p>
                    <p className="text-xs text-gray-400">1 day ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Profile view increase</p>
                    <p className="text-xs text-gray-500">+15% this week</p>
                    <p className="text-xs text-gray-400">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advertising Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Advertisement Performance</CardTitle>
            <CardDescription>
              Overview of your most popular advertisements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Advanced Surgical Microscope</h4>
                    <p className="text-sm text-gray-500">High-precision surgical equipment</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">324 views</p>
                  <p className="text-sm text-gray-500">8 inquiries</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Patient Monitoring System</h4>
                    <p className="text-sm text-gray-500">Continuous vital signs monitoring</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">267 views</p>
                  <p className="text-sm text-gray-500">5 inquiries</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Diagnostic Ultrasound Machine</h4>
                    <p className="text-sm text-gray-500">Portable diagnostic imaging</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">189 views</p>
                  <p className="text-sm text-gray-500">3 inquiries</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}