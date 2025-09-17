import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Building2, 
  Users, 
  Crown, 
  Palette, 
  Settings, 
  Calendar,
  TrendingUp,
  Shield,
  Globe,
  Star,
  Eye,
  Edit3,
  UserPlus,
  Activity
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  type: string;
  subdomain: string;
  userCount: number;
  activeUsers: number;
  subscriptionStatus: string;
  brandName?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string;
  hasWhiteLabel: boolean;
  isUnlimited: boolean;
  createdAt: string;
  settings?: {
    features?: string[];
    planType?: string;
  };
}

export default function SuperAdminClientManagement() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [whiteLabelSettings, setWhiteLabelSettings] = useState({
    brandName: "",
    logoUrl: "",
    primaryColor: "#10b981",
    secondaryColor: "#3b82f6",
    customDomain: "",
    customCss: ""
  });

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['/api/admin/clients'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const updateWhiteLabelMutation = useMutation({
    mutationFn: async (data: { tenantId: string; settings: any }) => {
      const response = await apiRequest(`/api/tenants/${data.tenantId}/white-label`, {
        method: 'PATCH',
        body: data.settings
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "White Label Updated",
        description: "Client white label settings have been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update white label settings.",
        variant: "destructive"
      });
    }
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async (data: { tenantId: string; subscription: any }) => {
      const response = await apiRequest(`/api/tenants/${data.tenantId}/subscription`, {
        method: 'PATCH',
        body: data.subscription
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Subscription Updated",
        description: "Client subscription has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update subscription.",
        variant: "destructive"
      });
    }
  });

  const handleWhiteLabelUpdate = () => {
    if (!selectedClient) return;
    
    updateWhiteLabelMutation.mutate({
      tenantId: selectedClient.id,
      settings: whiteLabelSettings
    });
  };

  const grantUnlimitedAccess = (clientId: string) => {
    updateSubscriptionMutation.mutate({
      tenantId: clientId,
      subscription: {
        subscriptionStatus: 'active',
        planType: 'unlimited',
        features: ['unlimited', 'white_label', 'premium_support', 'api_access', 'advanced_analytics']
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Crown className="h-8 w-8 text-yellow-500" />
          Super Admin - Client Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage all client organizations with unlimited privileges and white label settings
        </p>
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Building2 className="h-12 w-12 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{clients.length}</p>
                <p className="text-sm text-gray-600">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-12 w-12 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {clients.reduce((sum: number, client: Client) => sum + client.activeUsers, 0)}
                </p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Palette className="h-12 w-12 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {clients.filter((client: Client) => client.hasWhiteLabel).length}
                </p>
                <p className="text-sm text-gray-600">White Labeled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Star className="h-12 w-12 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {clients.filter((client: Client) => client.isUnlimited).length}
                </p>
                <p className="text-sm text-gray-600">Unlimited Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client: Client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{client.brandName || client.name}</CardTitle>
                <div className="flex gap-2">
                  {client.isUnlimited && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Unlimited
                    </Badge>
                  )}
                  {client.hasWhiteLabel && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <Palette className="h-3 w-3 mr-1" />
                      Branded
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription>
                {client.type.charAt(0).toUpperCase() + client.type.slice(1)} • {client.subdomain}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Users:</span>
                  <span className="font-medium">{client.activeUsers}/{client.userCount}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={client.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                    {client.subscriptionStatus}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-gray-500">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedClient(client);
                          setWhiteLabelSettings({
                            brandName: client.brandName || client.name,
                            logoUrl: client.logoUrl || "",
                            primaryColor: client.primaryColor || "#10b981",
                            secondaryColor: client.secondaryColor || "#3b82f6",
                            customDomain: client.customDomain || "",
                            customCss: ""
                          });
                        }}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Customize
                      </Button>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Client Management - {selectedClient?.name}</DialogTitle>
                        <DialogDescription>
                          Manage white label settings and subscription for this client
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Tabs defaultValue="branding" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="branding">White Label</TabsTrigger>
                          <TabsTrigger value="subscription">Subscription</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="branding" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="brandName">Brand Name</Label>
                              <Input
                                id="brandName"
                                value={whiteLabelSettings.brandName}
                                onChange={(e) => setWhiteLabelSettings(prev => ({
                                  ...prev,
                                  brandName: e.target.value
                                }))}
                                placeholder="Custom brand name"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="logoUrl">Logo URL</Label>
                              <Input
                                id="logoUrl"
                                value={whiteLabelSettings.logoUrl}
                                onChange={(e) => setWhiteLabelSettings(prev => ({
                                  ...prev,
                                  logoUrl: e.target.value
                                }))}
                                placeholder="https://example.com/logo.png"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="primaryColor">Primary Color</Label>
                              <Input
                                id="primaryColor"
                                type="color"
                                value={whiteLabelSettings.primaryColor}
                                onChange={(e) => setWhiteLabelSettings(prev => ({
                                  ...prev,
                                  primaryColor: e.target.value
                                }))}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="secondaryColor">Secondary Color</Label>
                              <Input
                                id="secondaryColor"
                                type="color"
                                value={whiteLabelSettings.secondaryColor}
                                onChange={(e) => setWhiteLabelSettings(prev => ({
                                  ...prev,
                                  secondaryColor: e.target.value
                                }))}
                              />
                            </div>
                            
                            <div className="col-span-2">
                              <Label htmlFor="customDomain">Custom Domain</Label>
                              <Input
                                id="customDomain"
                                value={whiteLabelSettings.customDomain}
                                onChange={(e) => setWhiteLabelSettings(prev => ({
                                  ...prev,
                                  customDomain: e.target.value
                                }))}
                                placeholder="healthcare.clientdomain.com"
                              />
                            </div>
                            
                            <div className="col-span-2">
                              <Label htmlFor="customCss">Custom CSS</Label>
                              <Textarea
                                id="customCss"
                                value={whiteLabelSettings.customCss}
                                onChange={(e) => setWhiteLabelSettings(prev => ({
                                  ...prev,
                                  customCss: e.target.value
                                }))}
                                placeholder="/* Custom CSS styles */"
                                rows={4}
                              />
                            </div>
                          </div>
                          
                          <Button 
                            onClick={handleWhiteLabelUpdate}
                            disabled={updateWhiteLabelMutation.isPending}
                            className="w-full"
                          >
                            {updateWhiteLabelMutation.isPending ? "Updating..." : "Update White Label Settings"}
                          </Button>
                        </TabsContent>
                        
                        <TabsContent value="subscription" className="space-y-4">
                          <div className="text-center p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                            <Star className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-yellow-800">Unlimited Plan Access</h3>
                            <p className="text-yellow-700 mb-4">
                              Grant this client unlimited access to all platform features
                            </p>
                            <Button
                              onClick={() => selectedClient && grantUnlimitedAccess(selectedClient.id)}
                              disabled={updateSubscriptionMutation.isPending || selectedClient?.isUnlimited}
                              className="bg-yellow-500 hover:bg-yellow-600"
                            >
                              {selectedClient?.isUnlimited ? "Already Unlimited" : "Grant Unlimited Access"}
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-gray-50 rounded">
                              <span className="font-medium">Current Status:</span>
                              <Badge className="ml-2" variant={selectedClient?.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                                {selectedClient?.subscriptionStatus}
                              </Badge>
                            </div>
                            <div className="p-3 bg-gray-50 rounded">
                              <span className="font-medium">Plan Type:</span>
                              <span className="ml-2">{selectedClient?.settings?.planType || 'Standard'}</span>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                  
                  {!client.isUnlimited && (
                    <Button
                      size="sm"
                      onClick={() => grantUnlimitedAccess(client.id)}
                      disabled={updateSubscriptionMutation.isPending}
                      className="bg-yellow-500 hover:bg-yellow-600"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Unlimited
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}