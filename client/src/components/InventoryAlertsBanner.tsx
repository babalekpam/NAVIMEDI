import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, XCircle, ChevronDown, ChevronUp, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function InventoryAlertsBanner() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  // Fetch alerts with auto-refresh every 60 seconds
  const { data: alerts = [], refetch } = useQuery({
    queryKey: ['/api/inventory/alerts'],
    queryFn: async () => {
      const response = await fetch('/api/inventory/alerts?acknowledged=false', {
        credentials: 'include'
      });
      if (!response.ok) return [];
      return response.json();
    },
    refetchInterval: 60000, // Auto-refresh every 60 seconds
    staleTime: 30000
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: number) => {
      return await apiRequest(`/api/inventory/alerts/${alertId}/acknowledge`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/alerts'] });
      toast({
        title: "Alert Acknowledged",
        description: "The alert has been marked as acknowledged",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to acknowledge alert",
        variant: "destructive"
      });
    }
  });

  const handleAcknowledge = (alertId: number) => {
    acknowledgeMutation.mutate(alertId);
  };

  // Group alerts by type
  const alertsByType = alerts.reduce((acc: any, alert: any) => {
    if (!acc[alert.alertType]) {
      acc[alert.alertType] = [];
    }
    acc[alert.alertType].push(alert);
    return acc;
  }, {});

  const lowStockCount = alertsByType.low_stock?.length || 0;
  const expiringCount = alertsByType.expiring_soon?.length || 0;
  const expiredCount = alertsByType.expired?.length || 0;
  const recallCount = alertsByType.recall?.length || 0;

  const totalAlerts = alerts.length;

  if (totalAlerts === 0) {
    return null; // Don't show banner if no alerts
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4" />;
      case 'expiring_soon':
        return <AlertCircle className="h-4 w-4" />;
      case 'expired':
      case 'recall':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'high':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="border-l-4 border-l-orange-500" data-testid="inventory-alerts-banner">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <div>
              <h3 className="font-semibold text-lg" data-testid="text-alert-title">
                Inventory Alerts ({totalAlerts})
              </h3>
              <div className="flex gap-3 mt-1">
                {lowStockCount > 0 && (
                  <Badge variant="outline" className="bg-yellow-50" data-testid="badge-low-stock-count">
                    📦 Low Stock: {lowStockCount}
                  </Badge>
                )}
                {expiringCount > 0 && (
                  <Badge variant="outline" className="bg-orange-50" data-testid="badge-expiring-count">
                    ⏰ Expiring: {expiringCount}
                  </Badge>
                )}
                {expiredCount > 0 && (
                  <Badge variant="outline" className="bg-red-50" data-testid="badge-expired-count">
                    ❌ Expired: {expiredCount}
                  </Badge>
                )}
                {recallCount > 0 && (
                  <Badge variant="destructive" data-testid="badge-recall-count">
                    🚨 Recall: {recallCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid="button-toggle-alerts"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                View Details
              </>
            )}
          </Button>
        </div>

        {/* Expanded Alert Details */}
        {isExpanded && (
          <div className="mt-4 space-y-2" data-testid="alerts-list">
            {alerts.map((alert: any) => (
              <div
                key={alert.id}
                className={`p-3 rounded-md border ${getAlertColor(alert.severity)}`}
                data-testid={`alert-item-${alert.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    {getAlertIcon(alert.alertType)}
                    <div>
                      <div className="font-medium" data-testid={`alert-message-${alert.id}`}>
                        {alert.message}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Triggered: {new Date(alert.triggeredAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAcknowledge(alert.id)}
                    disabled={acknowledgeMutation.isPending}
                    data-testid={`button-acknowledge-${alert.id}`}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Acknowledge
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
