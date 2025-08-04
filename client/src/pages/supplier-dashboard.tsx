import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Building2, 
  Package, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  DollarSign,
  Plus,
  Edit,
  Calendar,
  Users,
  Star,
  Activity
} from 'lucide-react';
// Simple supplier dashboard - isolated from hospital authentication system

interface SupplierData {
  id: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl?: string;
  businessAddress: string;
  city: string;
  state: string;
  country: string;
  businessDescription: string;
  productCategories: string[];
  yearsInBusiness: string;
  numberOfEmployees: string;
  annualRevenue: string;
  certifications: string[];
  status: string;
}

interface Advertisement {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: number;
  clicks: number;
  impressions: number;
  conversions: number;
  monthlyFee: number;
  currency: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export default function SupplierDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Simple supplier authentication check - no dependencies on hospital auth system
  const [currentUser, setCurrentUser] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const userType = localStorage.getItem('userType');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (userType !== 'supplier' || !token || !user) {
      console.log('[SUPPLIER DASHBOARD] Not authenticated as supplier, redirecting');
      localStorage.clear();
      window.location.replace('/supplier-login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      if (userData.userType === 'supplier') {
        setCurrentUser(userData);
        setIsAuthenticated(true);
        console.log('[SUPPLIER DASHBOARD] Authenticated supplier:', userData.username);
      } else {
        localStorage.clear();
        window.location.replace('/supplier-login');
      }
    } catch (e) {
      localStorage.clear();
      window.location.replace('/supplier-login');
    }
  }, []);

  // Don't render anything if not authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying supplier authentication...</p>
        </div>
      </div>
    );
  }

  // Fetch supplier profile
  const { data: supplierProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/supplier/profile'],
    queryFn: () => apiRequest('/api/supplier/profile'),
    enabled: isAuthenticated  // Only fetch when authenticated
  });

  // Fetch supplier advertisements
  const { data: advertisements, isLoading: adsLoading } = useQuery({
    queryKey: ['/api/supplier/advertisements'],
    queryFn: () => apiRequest('/api/supplier/advertisements'),
    enabled: isAuthenticated  // Only fetch when authenticated
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-700',
      'pending_review': 'bg-yellow-100 text-yellow-700',
      'draft': 'bg-gray-100 text-gray-700',
      'paused': 'bg-orange-100 text-orange-700',
      'expired': 'bg-red-100 text-red-700',
      'approved': 'bg-blue-100 text-blue-700'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const totalImpressions = advertisements?.reduce((sum: number, ad: Advertisement) => sum + ad.impressions, 0) || 0;
  const totalClicks = advertisements?.reduce((sum: number, ad: Advertisement) => sum + ad.clicks, 0) || 0;
  const totalConversions = advertisements?.reduce((sum: number, ad: Advertisement) => sum + ad.conversions, 0) || 0;
  const activeAds = advertisements?.filter((ad: Advertisement) => ad.isActive).length || 0;
  const clickThroughRate = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00';

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading supplier dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {supplierProfile?.companyName || 'Supplier'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Advertisement
          </Button>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Ads</p>
                <p className="text-2xl font-bold text-gray-900">{activeAds}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                <p className="text-2xl font-bold text-gray-900">{totalImpressions.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MousePointer className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-gray-900">{totalConversions}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Click-Through Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{clickThroughRate}%</div>
            <p className="text-gray-600 text-sm mt-1">
              {totalClicks} clicks from {totalImpressions} impressions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-green-600" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{conversionRate}%</div>
            <p className="text-gray-600 text-sm mt-1">
              {totalConversions} conversions from {totalClicks} clicks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="advertisements">Advertisements</TabsTrigger>
          <TabsTrigger value="profile">Company Profile</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Advertisements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Advertisements</CardTitle>
                <CardDescription>Your latest advertisement campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {advertisements?.slice(0, 3).map((ad: Advertisement) => (
                    <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{ad.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {ad.category.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(ad.status)}>
                          {ad.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {ad.clicks} clicks
                        </p>
                      </div>
                    </div>
                  ))}
                  {!advertisements?.length && (
                    <p className="text-gray-500 text-center py-8">
                      No advertisements yet. Create your first ad to get started!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Company Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Company Overview</CardTitle>
                <CardDescription>Your business profile summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{supplierProfile?.companyName}</p>
                      <p className="text-sm text-gray-600">{supplierProfile?.city}, {supplierProfile?.state}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{supplierProfile?.numberOfEmployees}</p>
                      <p className="text-sm text-gray-600">Employees</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{supplierProfile?.yearsInBusiness}</p>
                      <p className="text-sm text-gray-600">In Business</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{supplierProfile?.annualRevenue}</p>
                      <p className="text-sm text-gray-600">Annual Revenue</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advertisements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Advertisements</CardTitle>
              <CardDescription>Manage your advertisement campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {advertisements?.map((ad: Advertisement) => (
                  <div key={ad.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{ad.title}</h3>
                        <p className="text-gray-600 mt-2 line-clamp-2">{ad.description}</p>
                        <div className="flex items-center gap-4 mt-4">
                          <Badge className={getStatusColor(ad.status)}>
                            {ad.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            Category: {ad.category.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-600">
                            ${ad.monthlyFee}/month
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600">Impressions</p>
                            <p className="font-semibold">{ad.impressions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Clicks</p>
                            <p className="font-semibold">{ad.clicks}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Conversions</p>
                            <p className="font-semibold">{ad.conversions}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {!advertisements?.length && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No advertisements yet</h3>
                    <p className="text-gray-600 mb-4">Create your first advertisement to start reaching healthcare providers.</p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Advertisement
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>Your business information and credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Company Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Company Name</label>
                      <p className="text-gray-900">{supplierProfile?.companyName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Contact Email</label>
                      <p className="text-gray-900">{supplierProfile?.contactEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{supplierProfile?.contactPhone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Website</label>
                      <p className="text-gray-900">{supplierProfile?.websiteUrl || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Business Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-gray-900">
                        {supplierProfile?.city}, {supplierProfile?.state}, {supplierProfile?.country}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Years in Business</label>
                      <p className="text-gray-900">{supplierProfile?.yearsInBusiness}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Employees</label>
                      <p className="text-gray-900">{supplierProfile?.numberOfEmployees}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Annual Revenue</label>
                      <p className="text-gray-900">{supplierProfile?.annualRevenue}</p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Product Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {supplierProfile?.productCategories?.map((category: string) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {supplierProfile?.certifications?.map((cert: string) => (
                      <Badge key={cert} variant="outline">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Business Description</h4>
                  <p className="text-gray-700">{supplierProfile?.businessDescription}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Impressions</span>
                    <span className="font-semibold">{totalImpressions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Clicks</span>
                    <span className="font-semibold">{totalClicks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Conversions</span>
                    <span className="font-semibold">{totalConversions}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-600 font-medium">Click-Through Rate</span>
                    <span className="font-bold text-blue-600">{clickThroughRate}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-600 font-medium">Conversion Rate</span>
                    <span className="font-bold text-green-600">{conversionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ad Performance by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {advertisements?.reduce((acc: any[], ad: Advertisement) => {
                    const existing = acc.find(item => item.category === ad.category);
                    if (existing) {
                      existing.clicks += ad.clicks;
                      existing.impressions += ad.impressions;
                      existing.conversions += ad.conversions;
                      existing.count += 1;
                    } else {
                      acc.push({
                        category: ad.category,
                        clicks: ad.clicks,
                        impressions: ad.impressions,
                        conversions: ad.conversions,
                        count: 1
                      });
                    }
                    return acc;
                  }, []).map((category: any) => (
                    <div key={category.category} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium capitalize">
                          {category.category.replace('_', ' ')}
                        </h4>
                        <Badge variant="secondary">{category.count} ads</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Impressions: </span>
                          <span className="font-medium">{category.impressions.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Clicks: </span>
                          <span className="font-medium">{category.clicks}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Conversions: </span>
                          <span className="font-medium">{category.conversions}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}