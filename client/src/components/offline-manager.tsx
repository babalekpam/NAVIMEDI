import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Database,
  Clock
} from "lucide-react";

interface OfflineManagerProps {
  tenantId: string;
  userId: string;
}

export function OfflineManager({ tenantId, userId }: OfflineManagerProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineEnabled, setIsOfflineEnabled] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit] = useState(100); // MB

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check offline settings
    const offlineEnabled = localStorage.getItem('offlineEnabled') === 'true';
    setIsOfflineEnabled(offlineEnabled);

    // Load sync data
    loadSyncData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadSyncData = () => {
    try {
      const lastSync = localStorage.getItem('lastSyncTime');
      if (lastSync) {
        setLastSyncTime(new Date(lastSync));
      }

      const pending = localStorage.getItem('pendingChanges');
      if (pending) {
        setPendingChanges(parseInt(pending));
      }

      // Calculate storage used
      let totalSize = 0;
      for (let key in localStorage) {
        if (key.startsWith('offline_')) {
          totalSize += localStorage.getItem(key)?.length || 0;
        }
      }
      setStorageUsed(Math.round(totalSize / (1024 * 1024))); // Convert to MB
    } catch (error) {
      console.error('Error loading sync data:', error);
    }
  };

  const enableOfflineMode = async () => {
    try {
      setIsSyncing(true);
      setSyncProgress(0);

      // Download essential data for offline use
      const essentialData = [
        'patients',
        'appointments',
        'prescriptions',
        'service-prices',
        'insurance-providers'
      ];

      for (let i = 0; i < essentialData.length; i++) {
        const dataType = essentialData[i];
        setSyncProgress(((i + 1) / essentialData.length) * 100);
        
        try {
          const response = await fetch(`/api/${dataType}`);
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem(`offline_${dataType}`, JSON.stringify(data));
          }
        } catch (error) {
          console.error(`Error downloading ${dataType}:`, error);
        }
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      localStorage.setItem('offlineEnabled', 'true');
      localStorage.setItem('lastSyncTime', new Date().toISOString());
      setIsOfflineEnabled(true);
      setLastSyncTime(new Date());
      setIsSyncing(false);
      setSyncProgress(0);
      loadSyncData();
    } catch (error) {
      console.error('Error enabling offline mode:', error);
      setIsSyncing(false);
    }
  };

  const disableOfflineMode = () => {
    // Clear offline data
    for (let key in localStorage) {
      if (key.startsWith('offline_')) {
        localStorage.removeItem(key);
      }
    }
    localStorage.removeItem('offlineEnabled');
    localStorage.removeItem('lastSyncTime');
    localStorage.removeItem('pendingChanges');
    
    setIsOfflineEnabled(false);
    setLastSyncTime(null);
    setPendingChanges(0);
    setStorageUsed(0);
  };

  const syncChanges = async () => {
    if (!isOnline) return;

    try {
      setIsSyncing(true);
      setSyncProgress(0);

      // Get pending changes from localStorage
      const pendingData = localStorage.getItem('pendingSync');
      if (pendingData) {
        const changes = JSON.parse(pendingData);
        
        for (let i = 0; i < changes.length; i++) {
          const change = changes[i];
          setSyncProgress(((i + 1) / changes.length) * 100);
          
          try {
            await fetch(`/api/offline-sync`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
              },
              body: JSON.stringify(change)
            });
          } catch (error) {
            console.error('Sync error:', error);
          }
          
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        localStorage.removeItem('pendingSync');
        setPendingChanges(0);
      }

      localStorage.setItem('lastSyncTime', new Date().toISOString());
      setLastSyncTime(new Date());
      setIsSyncing(false);
      setSyncProgress(0);
    } catch (error) {
      console.error('Error syncing changes:', error);
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Alert className={isOnline ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-600" />
          )}
          <AlertDescription className={isOnline ? "text-green-800" : "text-red-800"}>
            {isOnline ? "You're online and connected" : "You're currently offline"}
          </AlertDescription>
        </div>
      </Alert>

      {/* Offline Mode Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Offline Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isOfflineEnabled ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Enable offline mode to continue working when internet connection is unavailable. 
                Essential data will be stored locally on your device.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Offline Features Include:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• View patient records</li>
                  <li>• Create and edit appointments</li>
                  <li>• Write prescriptions</li>
                  <li>• Access medical history</li>
                  <li>• Automatic sync when back online</li>
                </ul>
              </div>

              <Button 
                onClick={enableOfflineMode} 
                disabled={isSyncing}
                className="w-full"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Setting up offline mode...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Enable Offline Mode
                  </>
                )}
              </Button>

              {isSyncing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Downloading data...</span>
                    <span>{Math.round(syncProgress)}%</span>
                  </div>
                  <Progress value={syncProgress} />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Offline mode enabled</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>

              {/* Storage Usage */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Storage used</span>
                  <span>{storageUsed}MB / {storageLimit}MB</span>
                </div>
                <Progress value={(storageUsed / storageLimit) * 100} />
              </div>

              {/* Sync Status */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium">Last sync</span>
                  </div>
                  <span className="text-sm text-slate-600">
                    {lastSyncTime ? lastSyncTime.toLocaleString() : 'Never'}
                  </span>
                </div>

                {pendingChanges > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-800">
                      {pendingChanges} changes pending sync
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={syncChanges}
                    disabled={!isOnline || isSyncing || pendingChanges === 0}
                    className="flex-1"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Sync Now
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={disableOfflineMode}
                  >
                    Disable
                  </Button>
                </div>

                {isSyncing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Syncing changes...</span>
                      <span>{Math.round(syncProgress)}%</span>
                    </div>
                    <Progress value={syncProgress} />
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offline Data Management */}
      {isOfflineEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Offline Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Patients:</span>
                <Badge variant="outline">Synced</Badge>
              </div>
              <div className="flex justify-between">
                <span>Appointments:</span>
                <Badge variant="outline">Synced</Badge>
              </div>
              <div className="flex justify-between">
                <span>Prescriptions:</span>
                <Badge variant="outline">Synced</Badge>
              </div>
              <div className="flex justify-between">
                <span>Service Prices:</span>
                <Badge variant="outline">Synced</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default OfflineManager;