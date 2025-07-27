import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OfflineManager } from "@/components/offline-manager";
import { useTenant } from "@/hooks/use-tenant";
import { useAuth } from "@/hooks/use-auth";
import { 
  WifiOff, 
  Download, 
  Upload, 
  Database, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

export default function OfflineModePage() {
  const { tenant } = useTenant();
  const { user } = useAuth();

  if (!tenant || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <WifiOff className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Offline Mode & Sync</h1>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Enterprise Feature
            </Badge>
          </div>
          <p className="text-slate-600 text-lg">
            Manage offline functionality and data synchronization for your healthcare system
          </p>
        </div>

        {/* Feature Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="w-5 h-5 text-green-600" />
                Local Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-3">
                Store patient data, prescriptions, and medical records locally for offline access
              </p>
              <Badge variant="outline" className="text-green-700 border-green-200">
                Always Available
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="w-5 h-5 text-blue-600" />
                Auto Sync
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-3">
                Automatically synchronize changes when internet connection is restored
              </p>
              <Badge variant="outline" className="text-blue-700 border-blue-200">
                Background Process
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-purple-600" />
                HIPAA Secure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-3">
                All offline data is encrypted and meets HIPAA compliance standards
              </p>
              <Badge variant="outline" className="text-purple-700 border-purple-200">
                Fully Compliant
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Offline Manager Component */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WifiOff className="w-5 h-5" />
              Offline Manager
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OfflineManager tenantId={tenant.id} userId={user.id} />
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              How to Use Offline Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Enable Offline Mode</h4>
                <p className="text-slate-600 text-sm">
                  Click "Enable Offline Mode" in the Offline Manager above to download essential data to your device
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Work Offline</h4>
                <p className="text-slate-600 text-sm">
                  Continue accessing patient records, entering prescriptions, and managing appointments even without internet
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Automatic Sync</h4>
                <p className="text-slate-600 text-sm">
                  When internet returns, all changes are automatically synchronized with the cloud database
                </p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Offline mode is designed for temporary disconnections. 
                For extended offline use (over 7 days), please contact our support team for guidance.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}