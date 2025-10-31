import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Calendar, CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  subscriptionStatus: string;
  subscriptionPlanId: string;
  subscriptionInterval: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  trialEndDate: string;
}

export default function BillingManagement() {
  const { toast } = useToast();

  const { data: tenant, isLoading } = useQuery<Tenant>({
    queryKey: ['/api/tenant/current'],
  });

  const openPortalMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/create-billing-portal-session', {
        method: 'POST'
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal",
        variant: "destructive",
      });
    },
  });

  const handleOpenPortal = () => {
    openPortalMutation.mutate();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" data-testid="badge-status-active">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'trial':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" data-testid="badge-status-trial">
            <AlertCircle className="w-3 h-3 mr-1" />
            Trial
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" data-testid="badge-status-cancelled">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      case 'suspended':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" data-testid="badge-status-suspended">
            <XCircle className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" data-testid="badge-status-unknown">
            {status}
          </Badge>
        );
    }
  };

  const getPlanName = (planId: string) => {
    const plans: Record<string, string> = {
      'starter': 'Starter',
      'professional': 'Professional',
      'enterprise': 'Enterprise',
      'white_label': 'White Label',
    };
    return plans[planId] || planId;
  };

  const getPlanPrice = (planId: string, interval: string) => {
    const prices: Record<string, { monthly: number; yearly: number }> = {
      'starter': { monthly: 49.99, yearly: 510.99 },
      'professional': { monthly: 119.99, yearly: 1210.99 },
      'enterprise': { monthly: 319.99, yearly: 3210.99 },
      'white_label': { monthly: 1019.99, yearly: 10210.99 },
    };

    const plan = prices[planId];
    if (!plan) return 0;

    return interval === 'yearly' ? plan.yearly : plan.monthly;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-64 mb-2" />
          <Skeleton className="h-6 w-96 mb-8" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>No Subscription Found</CardTitle>
              <CardDescription>
                Unable to load your subscription details. Please contact support if this issue persists.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" data-testid="heading-billing">
            Billing & Subscription
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>

        <div className="grid gap-6">
          {/* Current Plan Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Current Plan
                  </CardTitle>
                  <CardDescription>Your active subscription plan</CardDescription>
                </div>
                {getStatusBadge(tenant.subscriptionStatus)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Plan</p>
                  <p className="text-2xl font-bold" data-testid="text-plan-name">
                    {tenant.subscriptionPlanId ? getPlanName(tenant.subscriptionPlanId) : 'Trial'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Billing Cycle</p>
                  <p className="text-2xl font-bold" data-testid="text-billing-cycle">
                    {tenant.subscriptionInterval === 'yearly' ? 'Yearly' : 
                     tenant.subscriptionInterval === 'monthly' ? 'Monthly' : 
                     'Trial'}
                  </p>
                </div>
              </div>

              {tenant.subscriptionPlanId && tenant.subscriptionInterval && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-amount">
                        ${getPlanPrice(tenant.subscriptionPlanId, tenant.subscriptionInterval)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Per</p>
                      <p className="text-lg font-medium">
                        {tenant.subscriptionInterval === 'yearly' ? 'Year' : 'Month'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {tenant.subscriptionStatus === 'trial' && tenant.trialEndDate && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <Calendar className="w-4 h-4" />
                    <p className="text-sm" data-testid="text-trial-end">
                      Trial ends on {new Date(tenant.trialEndDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Portal Card */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Subscription</CardTitle>
              <CardDescription>
                Update payment methods, view invoices, and manage your subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Stripe Customer Portal
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                    Access the secure Stripe portal to:
                  </p>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Update payment methods
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      View and download invoices
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Update billing information
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Cancel subscription (if needed)
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleOpenPortal}
                  disabled={!tenant.stripeCustomerId || openPortalMutation.isPending}
                  className="w-full"
                  size="lg"
                  data-testid="button-open-portal"
                >
                  {openPortalMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Opening Portal...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Billing Portal
                    </>
                  )}
                </Button>

                {!tenant.stripeCustomerId && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center" data-testid="text-no-subscription">
                    No active subscription found. Please subscribe to a plan to access the billing portal.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Organization Info */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Your organization information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Organization Name</p>
                  <p className="font-medium" data-testid="text-org-name">{tenant.name}</p>
                </div>
                {tenant.stripeCustomerId && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Customer ID</p>
                    <p className="font-mono text-sm text-gray-700 dark:text-gray-300" data-testid="text-customer-id">
                      {tenant.stripeCustomerId}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
