import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClipboardCheck, Plus, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function InventoryAudits() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  const { toast } = useToast();

  // Fetch audits
  const { data: audits = [], isLoading } = useQuery({
    queryKey: ['/api/inventory/audits'],
    queryFn: async () => {
      const response = await fetch('/api/inventory/audits', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch audits');
      return response.json();
    },
    staleTime: 30000
  });

  // Fetch inventory items for creating new audits
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['/api/inventory'],
    queryFn: async () => {
      const response = await fetch('/api/inventory', {
        credentials: 'include'
      });
      if (!response.ok) return [];
      return response.json();
    },
    staleTime: 60000
  });

  const createAuditMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/inventory/audit', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/audits'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Audit Created",
        description: "Inventory audit has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create audit",
        variant: "destructive"
      });
    }
  });

  const completeAuditMutation = useMutation({
    mutationFn: async ({ id, actualQuantity, notes }: any) => {
      return await apiRequest(`/api/inventory/audits/${id}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ actualQuantity, notes })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/audits'] });
      setSelectedAudit(null);
      toast({
        title: "Audit Completed",
        description: "Audit has been completed and variance calculated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete audit",
        variant: "destructive"
      });
    }
  });

  const handleCreateAudit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemId = parseInt(formData.get('inventoryItemId') as string);
    const expectedQuantity = parseInt(formData.get('expectedQuantity') as string);

    createAuditMutation.mutate({
      inventoryItemId: itemId,
      expectedQuantity,
      status: 'pending'
    });
  };

  const handleCompleteAudit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const actualQuantity = parseInt(formData.get('actualQuantity') as string);
    const notes = formData.get('notes') as string;

    completeAuditMutation.mutate({
      id: selectedAudit.id,
      actualQuantity,
      notes
    });
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      completed: { color: 'bg-green-100 text-green-800', icon: '✅' },
      discrepancy: { color: 'bg-red-100 text-red-800', icon: '⚠️' }
    };
    
    const cfg = config[status as keyof typeof config] || config.pending;
    
    return (
      <Badge className={cfg.color}>
        {cfg.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const pendingAudits = audits.filter((a: any) => a.status === 'pending');
  const completedAudits = audits.filter((a: any) => a.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Audits</h1>
          <p className="text-gray-600 mt-1">Manage inventory stock counts and audit trails</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" data-testid="button-create-audit">
              <Plus className="h-4 w-4" />
              Start New Audit
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-create-audit">
            <DialogHeader>
              <DialogTitle>Start New Inventory Audit</DialogTitle>
              <DialogDescription>
                Select an item and enter the expected quantity to start an audit
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAudit} className="space-y-4">
              <div>
                <Label htmlFor="inventoryItemId">Inventory Item</Label>
                <select
                  id="inventoryItemId"
                  name="inventoryItemId"
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                  data-testid="select-inventory-item"
                >
                  <option value="">Select an item...</option>
                  {inventoryItems.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.medicationName} ({item.currentStock} units)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="expectedQuantity">Expected Quantity</Label>
                <Input
                  id="expectedQuantity"
                  name="expectedQuantity"
                  type="number"
                  placeholder="Enter expected quantity"
                  required
                  min="0"
                  data-testid="input-expected-quantity"
                />
              </div>
              <Button type="submit" className="w-full" disabled={createAuditMutation.isPending} data-testid="button-submit-audit">
                {createAuditMutation.isPending ? 'Creating...' : 'Create Audit'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Audits</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-count">{pendingAudits.length}</div>
            <p className="text-xs text-gray-500">Need to be completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-completed-count">{completedAudits.length}</div>
            <p className="text-xs text-gray-500">Audits finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discrepancies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-discrepancy-count">
              {completedAudits.filter((a: any) => a.status === 'discrepancy').length}
            </div>
            <p className="text-xs text-gray-500">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Audits Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit History</CardTitle>
          <CardDescription>View and manage all inventory audits</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading audits...</div>
          ) : audits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No audits found. Click "Start New Audit" to begin.
            </div>
          ) : (
            <Table data-testid="table-audits">
              <TableHeader>
                <TableRow>
                  <TableHead>Audit Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audits.map((audit: any) => {
                  const item = inventoryItems.find((i: any) => i.id === audit.inventoryItemId);
                  return (
                    <TableRow key={audit.id} data-testid={`audit-row-${audit.id}`}>
                      <TableCell>{new Date(audit.auditDate).toLocaleDateString()}</TableCell>
                      <TableCell>{item?.medicationName || 'Unknown'}</TableCell>
                      <TableCell>{audit.expectedQuantity || '-'}</TableCell>
                      <TableCell>{audit.actualQuantity || '-'}</TableCell>
                      <TableCell>
                        {audit.variance !== null && audit.variance !== undefined ? (
                          <span className={audit.variance < 0 ? 'text-red-600 font-semibold' : audit.variance > 0 ? 'text-green-600 font-semibold' : ''}>
                            {audit.variance > 0 ? '+' : ''}{audit.variance}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(audit.status)}</TableCell>
                      <TableCell>
                        {audit.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedAudit(audit)}
                            data-testid={`button-complete-${audit.id}`}
                          >
                            Complete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Complete Audit Dialog */}
      <Dialog open={!!selectedAudit} onOpenChange={(open) => !open && setSelectedAudit(null)}>
        <DialogContent data-testid="dialog-complete-audit">
          <DialogHeader>
            <DialogTitle>Complete Audit</DialogTitle>
            <DialogDescription>
              Enter the actual counted quantity for this item
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCompleteAudit} className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm font-medium">Expected Quantity:</div>
              <div className="text-2xl font-bold">{selectedAudit?.expectedQuantity}</div>
            </div>
            <div>
              <Label htmlFor="actualQuantity">Actual Counted Quantity</Label>
              <Input
                id="actualQuantity"
                name="actualQuantity"
                type="number"
                placeholder="Enter actual quantity"
                required
                min="0"
                data-testid="input-actual-quantity"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any notes about this audit..."
                rows={3}
                data-testid="textarea-audit-notes"
              />
            </div>
            <Button type="submit" className="w-full" disabled={completeAuditMutation.isPending} data-testid="button-submit-complete">
              {completeAuditMutation.isPending ? 'Completing...' : 'Complete Audit'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
