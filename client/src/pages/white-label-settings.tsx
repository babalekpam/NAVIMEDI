import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Palette, 
  Upload, 
  Save, 
  Eye, 
  Code, 
  Globe, 
  Crown,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useTenant } from "@/hooks/use-tenant";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface WhiteLabelSettings {
  brandName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain: string;
  customCss: string;
}

export default function WhiteLabelSettingsPage() {
  const { toast } = useToast();
  const { tenant: currentTenant } = useTenant();
  const [previewMode, setPreviewMode] = useState(false);

  const [settings, setSettings] = useState<WhiteLabelSettings>({
    brandName: currentTenant?.brandName || currentTenant?.name || "",
    logoUrl: currentTenant?.logoUrl || "",
    primaryColor: currentTenant?.primaryColor || "#10b981",
    secondaryColor: currentTenant?.secondaryColor || "#3b82f6",
    customDomain: currentTenant?.customDomain || "",
    customCss: currentTenant?.customCss || ""
  });

  const { data: subscription } = useQuery({
    queryKey: ['/api/subscriptions/current'],
    enabled: !!currentTenant
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: Partial<WhiteLabelSettings>) => {
      const response = await fetch(`/api/tenants/${currentTenant?.id}/white-label`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to save settings');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "White label settings have been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
    if (!previewMode) {
      // Apply preview styles
      document.documentElement.style.setProperty('--primary', settings.primaryColor);
      document.documentElement.style.setProperty('--secondary', settings.secondaryColor);
    } else {
      // Reset to original styles
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--secondary');
    }
  };

  const isWhiteLabelEnabled = (subscription as any)?.whitelabelEnabled || (subscription as any)?.plan === 'white_label';

  if (!isWhiteLabelEnabled) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-yellow-200 bg-yellow-50">
            <Crown className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              White label features are available on Enterprise and White Label plans. 
              <Button variant="link" className="p-0 ml-2 text-yellow-800 underline">
                Upgrade your plan
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">White Label Settings</h1>
            <p className="text-slate-600 mt-2">
              Customize your platform's branding and appearance
            </p>
          </div>
          <Badge className="bg-purple-100 text-purple-800">
            <Crown className="w-3 h-3 mr-1" />
            White Label Enabled
          </Badge>
        </div>

        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="domain">Domain</TabsTrigger>
            <TabsTrigger value="css">Custom CSS</TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Brand Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="brandName">Brand Name</Label>
                      <Input
                        id="brandName"
                        value={settings.brandName}
                        onChange={(e) => setSettings(prev => ({ ...prev, brandName: e.target.value }))}
                        placeholder="Your Healthcare Platform"
                      />
                    </div>

                    <div>
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="logoUrl"
                          value={settings.logoUrl}
                          onChange={(e) => setSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                          placeholder="https://example.com/logo.png"
                        />
                        <Button variant="outline" size="icon">
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Brand Preview</Label>
                    <div className="border rounded-lg p-6 bg-white">
                      <div className="flex items-center gap-3">
                        {settings.logoUrl ? (
                          <img 
                            src={settings.logoUrl} 
                            alt="Logo" 
                            className="h-8 w-8 rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-8 w-8 bg-slate-200 rounded"></div>
                        )}
                        <span className="text-xl font-bold" style={{ color: settings.primaryColor }}>
                          {settings.brandName || "Your Brand"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Color Scheme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-20 h-10"
                        />
                        <Input
                          value={settings.primaryColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                          placeholder="#10b981"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={settings.secondaryColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="w-20 h-10"
                        />
                        <Input
                          value={settings.secondaryColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Color Preview</Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Button style={{ backgroundColor: settings.primaryColor }}>
                          Primary Button
                        </Button>
                        <span className="text-sm text-slate-600">Primary color usage</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" style={{ 
                          borderColor: settings.secondaryColor, 
                          color: settings.secondaryColor 
                        }}>
                          Secondary Button
                        </Button>
                        <span className="text-sm text-slate-600">Secondary color usage</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Domain Tab */}
          <TabsContent value="domain">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Custom Domain
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="customDomain">Custom Domain</Label>
                  <Input
                    id="customDomain"
                    value={settings.customDomain}
                    onChange={(e) => setSettings(prev => ({ ...prev, customDomain: e.target.value }))}
                    placeholder="healthcare.yourcompany.com"
                  />
                  <p className="text-sm text-slate-600 mt-2">
                    Enter your custom domain. You'll need to configure DNS settings to point to our servers.
                  </p>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>DNS Configuration Required:</strong>
                    <br />
                    Create a CNAME record pointing to: platform.navimed.com
                    <br />
                    SSL certificates will be automatically provisioned.
                  </AlertDescription>
                </Alert>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Current Status</h4>
                  <div className="flex items-center gap-2">
                    {settings.customDomain ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800">
                          Domain configured: {settings.customDomain}
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800">
                          Using default subdomain: {currentTenant?.subdomain}.navimed.com
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom CSS Tab */}
          <TabsContent value="css">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Custom CSS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="customCss">Custom CSS Code</Label>
                  <Textarea
                    id="customCss"
                    value={settings.customCss}
                    onChange={(e) => setSettings(prev => ({ ...prev, customCss: e.target.value }))}
                    placeholder="/* Your custom CSS styles */
.custom-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.custom-button {
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}"
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <p className="text-sm text-slate-600 mt-2">
                    Add custom CSS to further customize your platform's appearance. 
                    Changes will be applied to all users in your organization.
                  </p>
                </div>

                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Important:</strong> Custom CSS can affect platform functionality. 
                    Test thoroughly before applying to production.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 justify-end">
          <Button 
            variant="outline" 
            onClick={handlePreview}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {previewMode ? 'Exit Preview' : 'Preview Changes'}
          </Button>
          
          <Button 
            onClick={handleSave}
            disabled={saveSettingsMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saveSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {previewMode && (
          <Alert className="border-blue-200 bg-blue-50">
            <Eye className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Preview mode is active. You're seeing how your changes will look to users.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}