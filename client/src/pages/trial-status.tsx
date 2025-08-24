import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  CreditCard,
  RefreshCw 
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTenant } from "@/contexts/tenant-context";

interface TrialStatus {
  id: string;
  name: string;
  type: string;
  trialStartDate: string;
  trialEndDate: string;
  subscriptionStatus: 'trial' | 'active' | 'suspended' | 'cancelled' | 'expired';
  suspendedAt?: string;
  suspensionReason?: string;
  isActive: boolean;
  daysRemaining: number;
  isTrialExpired: boolean;
  isTrialActive: boolean;
  isPlatformOwner?: boolean;
  unlimitedAccess?: boolean;
}

export default function TrialStatusPage() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Redirect non-trial accounts away from trial status page
  React.useEffect(() => {
    if (tenant && tenant.subscriptionStatus !== 'trial') {
      setLocation('/dashboard');
    }
  }, [tenant, setLocation]);

  // Don't render anything for non-trial accounts
  if (tenant && tenant.subscriptionStatus !== 'trial') {
    return null;
  }

  const { data: trialStatus, isLoading, error } = useQuery<TrialStatus>({
    queryKey: ['/api/trial/status'],
    enabled: !!user && tenant?.subscriptionStatus === 'trial'
  });

  const extendTrialMutation = useMutation({
    mutationFn: async ({ tenantId, days }: { tenantId: string; days: number }) => {
      const response = await fetch(`/api/trial/${tenantId}/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ days })
      });
      
      if (!response.ok) {
        throw new Error('Failed to extend trial');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trial/status'] });
    }
  });

  const reactivateMutation = useMutation({
    mutationFn: async ({ tenantId, subscriptionPlan }: { tenantId: string; subscriptionPlan: string }) => {
      const response = await fetch(`/api/trial/${tenantId}/reactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ subscriptionPlan })
      });
      
      if (!response.ok) {
        throw new Error('Failed to reactivate tenant');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trial/status'] });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Trial Status</h1>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Trial Status</h1>
        </div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load trial status. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!trialStatus) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Trial Status</h1>
        </div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Trial information not available.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusBadge = () => {
    // ARGILETTE platform owner has unlimited access
    if (trialStatus.isPlatformOwner || trialStatus.unlimitedAccess) {
      return <Badge variant="default" className="bg-purple-100 text-purple-800">Platform Owner - Unlimited Access</Badge>;
    }
    
    switch (trialStatus.subscriptionStatus) {
      case 'trial':
        return trialStatus.isTrialActive ? 
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">Active Trial</Badge> :
          <Badge variant="destructive">Trial Expired</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active Subscription</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getProgressColor = () => {
    if (trialStatus.daysRemaining > 7) return "bg-green-500";
    if (trialStatus.daysRemaining > 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  const progressPercentage = Math.max(0, Math.min(100, (trialStatus.daysRemaining / 14) * 100));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Trial Status</h1>
        <Button 
          variant="outline" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/trial/status'] })}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Trial Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Trial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              {getStatusBadge()}
            </div>
            
            {trialStatus.isPlatformOwner || trialStatus.unlimitedAccess ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Access Level</span>
                  <span className="font-semibold text-purple-600">Unlimited</span>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Platform Owner Status</strong><br />
                    As the platform owner, ARGILETTE has unlimited access to all features with no expiration.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Trial Progress</span>
                  <span>{trialStatus.daysRemaining} days remaining</span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Started: {new Date(trialStatus.trialStartDate).toLocaleDateString()}</span>
                  <span>Ends: {new Date(trialStatus.trialEndDate).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            {trialStatus.subscriptionStatus === 'suspended' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Account Suspended</strong><br />
                  {trialStatus.suspensionReason || "Trial period expired"}
                  {trialStatus.suspendedAt && (
                    <div className="text-xs text-gray-500 mt-1">
                      Suspended on: {new Date(trialStatus.suspendedAt).toLocaleString()}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {trialStatus.isTrialActive && trialStatus.daysRemaining <= 3 && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Trial Ending Soon</strong><br />
                  Your trial expires in {trialStatus.daysRemaining} days. Upgrade now to continue using the service.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trialStatus.isPlatformOwner || trialStatus.unlimitedAccess ? (
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Platform Owner Privileges</strong><br />
                    You have full administrative access to the entire platform with no limitations or expiration dates.
                  </p>
                </div>
                <Link href="/tenant-management">
                  <Button className="w-full" variant="outline">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Manage Organizations
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {trialStatus.subscriptionStatus === 'trial' && !trialStatus.isTrialExpired && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Upgrade to a paid plan to continue using all features after your trial ends.
                    </p>
                    <Link href="/pricing">
                      <Button className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        View Pricing Plans
                      </Button>
                    </Link>
                  </div>
                )}

                {trialStatus.subscriptionStatus === 'suspended' && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Your account has been suspended. Upgrade to reactivate your account.
                    </p>
                    <Link href="/pricing">
                      <Button className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Upgrade Now
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            {user?.role === 'super_admin' && (
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-medium text-sm">Admin Actions</h4>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => extendTrialMutation.mutate({ 
                    tenantId: trialStatus.id, 
                    days: 14 
                  })}
                  disabled={extendTrialMutation.isPending}
                  className="w-full"
                >
                  {extendTrialMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4 mr-2" />
                  )}
                  Extend Trial (14 days)
                </Button>

                {trialStatus.subscriptionStatus === 'suspended' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => reactivateMutation.mutate({ 
                      tenantId: trialStatus.id, 
                      subscriptionPlan: 'professional' 
                    })}
                    disabled={reactivateMutation.isPending}
                    className="w-full"
                  >
                    {reactivateMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Reactivate Account
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}