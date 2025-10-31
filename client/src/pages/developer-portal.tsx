import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, Trash2, Copy, Check, Plus, Activity, Globe, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Link } from 'wouter';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function DeveloperPortal() {
  const { toast } = useToast();
  const [copiedKey, setCopiedKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [createKeyDialogOpen, setCreateKeyDialogOpen] = useState(false);
  const [createWebhookDialogOpen, setCreateWebhookDialogOpen] = useState(false);

  // API Keys query
  const { data: apiKeys = [], isLoading: keysLoading } = useQuery<any[]>({
    queryKey: ['/api/developer/api-keys']
  });

  // Usage stats query
  const { data: usageStats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ['/api/developer/usage-stats']
  });

  // Webhooks query
  const { data: webhooks = [], isLoading: webhooksLoading } = useQuery<any[]>({
    queryKey: ['/api/developer/webhooks']
  });

  // Create API key mutation
  const createApiKeyMutation = useMutation({
    mutationFn: async (data: { keyName: string; permissions: string[]; rateLimit?: number }) => {
      return await apiRequest('/api/developer/api-keys', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/developer/api-keys'] });
      setNewlyCreatedKey(data.plainKey);
      setCreateKeyDialogOpen(false);
      toast({
        title: 'API Key Created',
        description: 'Your new API key has been generated. Copy it now as it won\'t be shown again.'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create API key',
        variant: 'destructive'
      });
    }
  });

  // Revoke API key mutation
  const revokeApiKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      return await apiRequest(`/api/developer/api-keys/${keyId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/developer/api-keys'] });
      toast({
        title: 'API Key Revoked',
        description: 'The API key has been permanently revoked'
      });
    }
  });

  // Create webhook mutation
  const createWebhookMutation = useMutation({
    mutationFn: async (data: { url: string; events: string[] }) => {
      return await apiRequest('/api/developer/webhooks', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/developer/webhooks'] });
      setCreateWebhookDialogOpen(false);
      toast({
        title: 'Webhook Created',
        description: 'Your webhook endpoint has been registered'
      });
    }
  });

  // Delete webhook mutation
  const deleteWebhookMutation = useMutation({
    mutationFn: async (webhookId: string) => {
      return await apiRequest(`/api/developer/webhooks/${webhookId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/developer/webhooks'] });
      toast({
        title: 'Webhook Deleted',
        description: 'The webhook has been removed'
      });
    }
  });

  // Test webhook mutation
  const testWebhookMutation = useMutation({
    mutationFn: async (webhookId: string) => {
      return await apiRequest(`/api/developer/webhooks/${webhookId}/test`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: 'Test Event Sent',
        description: 'A test webhook event has been sent to your endpoint'
      });
    }
  });

  const handleCopyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
    toast({
      title: 'Copied!',
      description: 'API key copied to clipboard'
    });
  };

  const handleCreateKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const permissions = formData.getAll('permissions') as string[];
    
    createApiKeyMutation.mutate({
      keyName: formData.get('keyName') as string,
      permissions: permissions.length > 0 ? permissions : ['read_patients', 'read_appointments'],
      rateLimit: parseInt(formData.get('rateLimit') as string) || 1000
    });
  };

  const handleCreateWebhook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const events = formData.getAll('events') as string[];
    
    createWebhookMutation.mutate({
      url: formData.get('url') as string,
      events: events.length > 0 ? events : ['patient.created', 'appointment.scheduled']
    });
  };

  return (
    <div className="container mx-auto py-8 px-4" data-testid="page-developer-portal">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Developer Portal</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Manage API keys, monitor usage, and configure webhooks for the NaviMED Healthcare Platform
        </p>
      </div>

      {/* New API Key Alert */}
      {newlyCreatedKey && (
        <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" data-testid="alert-new-api-key">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Your new API key (save this now!):</p>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-3 rounded border">
              <code className="flex-1 text-sm font-mono" data-testid="text-new-api-key">{newlyCreatedKey}</code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyKey(newlyCreatedKey)}
                data-testid="button-copy-new-key"
              >
                {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm mt-2 text-muted-foreground">
              This key will only be shown once. Store it securely.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4" data-testid="tabs-list">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="api-keys" data-testid="tab-api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks" data-testid="tab-webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="quickstart" data-testid="tab-quickstart">Quick Start</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card data-testid="card-total-requests">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total API Requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-requests">
                  {statsLoading ? '...' : usageStats?.totalRequests?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card data-testid="card-avg-response-time">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-avg-response-time">
                  {statsLoading ? '...' : usageStats?.avgResponseTime || '0'}ms
                </div>
                <p className="text-xs text-muted-foreground">Across all endpoints</p>
              </CardContent>
            </Card>

            <Card data-testid="card-error-rate">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-error-rate">
                  {statsLoading ? '...' : usageStats?.errorRate || '0'}%
                </div>
                <p className="text-xs text-muted-foreground">4xx and 5xx errors</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Endpoints */}
          <Card data-testid="card-top-endpoints">
            <CardHeader>
              <CardTitle>Most Used Endpoints</CardTitle>
              <CardDescription>Your API usage by endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : usageStats?.requestsByEndpoint?.length > 0 ? (
                <div className="space-y-4">
                  {usageStats.requestsByEndpoint.map((endpoint: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between" data-testid={`endpoint-stat-${idx}`}>
                      <div>
                        <code className="text-sm font-mono">{endpoint.endpoint}</code>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">{endpoint.count.toLocaleString()} requests</div>
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${(endpoint.count / (usageStats?.requestsByEndpoint[0]?.count || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No API usage data yet. Create an API key to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold" data-testid="text-api-keys-title">API Keys</h2>
              <p className="text-muted-foreground">Manage your API keys for programmatic access</p>
            </div>
            <Dialog open={createKeyDialogOpen} onOpenChange={setCreateKeyDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-api-key">
                  <Plus className="mr-2 h-4 w-4" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-create-api-key">
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Generate a new API key with specific permissions for your application
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateKey}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="keyName">Key Name</Label>
                      <Input
                        id="keyName"
                        name="keyName"
                        placeholder="Production API Key"
                        required
                        data-testid="input-key-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rateLimit">Rate Limit (requests/hour)</Label>
                      <Input
                        id="rateLimit"
                        name="rateLimit"
                        type="number"
                        defaultValue="1000"
                        min="100"
                        max="10000"
                        data-testid="input-rate-limit"
                      />
                    </div>
                    <div>
                      <Label>Permissions (select at least one)</Label>
                      <ScrollArea className="h-48 border rounded p-2">
                        {[
                          'read_patients', 'write_patients',
                          'read_appointments', 'write_appointments',
                          'read_prescriptions', 'write_prescriptions',
                          'read_lab_orders', 'write_lab_orders',
                          'read_documents', 'write_documents'
                        ].map(perm => (
                          <label key={perm} className="flex items-center space-x-2 py-2" data-testid={`checkbox-permission-${perm}`}>
                            <input type="checkbox" name="permissions" value={perm} className="rounded" />
                            <span className="text-sm">{perm.replace(/_/g, ' ')}</span>
                          </label>
                        ))}
                      </ScrollArea>
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="submit" disabled={createApiKeyMutation.isPending} data-testid="button-submit-create-key">
                      {createApiKeyMutation.isPending ? 'Creating...' : 'Create API Key'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4" data-testid="list-api-keys">
            {keysLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Loading API keys...
                </CardContent>
              </Card>
            ) : apiKeys.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No API keys yet. Create your first API key to get started.
                </CardContent>
              </Card>
            ) : (
              apiKeys.map((key: any) => (
                <Card key={key.id} data-testid={`card-api-key-${key.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          {key.keyName}
                        </CardTitle>
                        <CardDescription>
                          Created {format(new Date(key.createdAt), 'PPP')}
                          {key.lastUsedAt && ` • Last used ${format(new Date(key.lastUsedAt), 'PPP')}`}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={key.isActive ? 'default' : 'secondary'} data-testid={`badge-status-${key.id}`}>
                          {key.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => revokeApiKeyMutation.mutate(key.id)}
                          disabled={revokeApiKeyMutation.isPending}
                          data-testid={`button-revoke-${key.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rate Limit:</span>
                        <span className="text-sm font-medium" data-testid={`text-rate-limit-${key.id}`}>
                          {key.rateLimit || 1000} requests/hour
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Permissions:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(key.permissions as string[]).map((perm: string) => (
                            <Badge key={perm} variant="outline" className="text-xs" data-testid={`badge-permission-${perm}`}>
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold" data-testid="text-webhooks-title">Webhooks</h2>
              <p className="text-muted-foreground">Configure webhook endpoints to receive real-time events</p>
            </div>
            <Dialog open={createWebhookDialogOpen} onOpenChange={setCreateWebhookDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-webhook">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-create-webhook">
                <DialogHeader>
                  <DialogTitle>Add Webhook Endpoint</DialogTitle>
                  <DialogDescription>
                    Configure a URL to receive webhook events
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateWebhook}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="url">Endpoint URL</Label>
                      <Input
                        id="url"
                        name="url"
                        type="url"
                        placeholder="https://your-app.com/webhook"
                        required
                        data-testid="input-webhook-url"
                      />
                    </div>
                    <div>
                      <Label>Events to Subscribe</Label>
                      <ScrollArea className="h-48 border rounded p-2">
                        {[
                          'patient.created', 'patient.updated',
                          'appointment.scheduled', 'appointment.cancelled',
                          'prescription.created', 'prescription.dispensed',
                          'lab_order.created', 'lab_order.completed'
                        ].map(event => (
                          <label key={event} className="flex items-center space-x-2 py-2" data-testid={`checkbox-event-${event}`}>
                            <input type="checkbox" name="events" value={event} className="rounded" />
                            <span className="text-sm">{event}</span>
                          </label>
                        ))}
                      </ScrollArea>
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="submit" disabled={createWebhookMutation.isPending} data-testid="button-submit-create-webhook">
                      {createWebhookMutation.isPending ? 'Adding...' : 'Add Webhook'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4" data-testid="list-webhooks">
            {webhooksLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Loading webhooks...
                </CardContent>
              </Card>
            ) : webhooks.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No webhooks configured. Add your first webhook to receive real-time events.
                </CardContent>
              </Card>
            ) : (
              webhooks.map((webhook: any) => (
                <Card key={webhook.id} data-testid={`card-webhook-${webhook.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <code className="text-sm font-mono break-all">{webhook.url}</code>
                        </CardTitle>
                        <CardDescription>
                          {webhook.lastTriggered 
                            ? `Last triggered ${format(new Date(webhook.lastTriggered), 'PPP')}` 
                            : 'Never triggered'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testWebhookMutation.mutate(webhook.id)}
                          disabled={testWebhookMutation.isPending}
                          data-testid={`button-test-webhook-${webhook.id}`}
                        >
                          Test
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                          disabled={deleteWebhookMutation.isPending}
                          data-testid={`button-delete-webhook-${webhook.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={webhook.isActive ? 'default' : 'secondary'} data-testid={`badge-webhook-status-${webhook.id}`}>
                          {webhook.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {webhook.failureCount > 0 && (
                          <Badge variant="destructive" data-testid={`badge-failures-${webhook.id}`}>
                            {webhook.failureCount} failures
                          </Badge>
                        )}
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Events:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(webhook.events as string[]).map((event: string) => (
                            <Badge key={event} variant="outline" className="text-xs" data-testid={`badge-event-${event}`}>
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Quick Start Tab */}
        <TabsContent value="quickstart" className="space-y-6">
          <Card data-testid="card-quickstart">
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
              <CardDescription>Get started with the NaviMED Healthcare Platform API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">1. Create an API Key</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Navigate to the API Keys tab and create a new key with the required permissions for your application.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">2. Authenticate Your Requests</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Include your API key in the request headers:
                </p>
                <pre className="bg-black dark:bg-gray-900 text-white p-4 rounded overflow-x-auto text-sm" data-testid="code-auth-example">
                  <code>{`curl -X GET 'https://api.navimed.com/v1/patients' \\
  -H 'X-API-Key: your_api_key_here' \\
  -H 'Content-Type: application/json'`}</code>
                </pre>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">3. Make Your First Request</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Try fetching the list of patients:
                </p>
                <pre className="bg-black dark:bg-gray-900 text-white p-4 rounded overflow-x-auto text-sm" data-testid="code-first-request">
                  <code>{`const response = await fetch('/api/patients', {
  headers: {
    'X-API-Key': 'your_api_key_here',
    'Content-Type': 'application/json'
  }
});

const patients = await response.json();
console.log(patients);`}</code>
                </pre>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">4. Explore the Documentation</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  View comprehensive API documentation with examples:
                </p>
                <Link href="/api-documentation">
                  <Button variant="outline" data-testid="button-view-docs">
                    View API Documentation
                  </Button>
                </Link>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">5. Handle Errors</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  The API uses standard HTTP status codes. Common error codes:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li><code>401 Unauthorized</code> - Invalid or missing API key</li>
                  <li><code>403 Forbidden</code> - Insufficient permissions</li>
                  <li><code>429 Too Many Requests</code> - Rate limit exceeded</li>
                  <li><code>500 Internal Server Error</code> - Server error</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
