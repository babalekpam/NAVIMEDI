import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar,
  Eye,
  FileText,
  Users
} from "lucide-react";

interface ApprovalLevel {
  level: number;
  approverRole: string;
  required: boolean;
  completed: boolean;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

interface AccessRequest {
  id: string;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  patientMrn: string;
  requestingPhysicianFirstName: string;
  requestingPhysicianLastName: string;
  requestType: string;
  reason: string;
  urgency: string;
  accessContext: string;
  patientSensitivityLevel: string;
  currentApprovalLevel: number;
  approvalWorkflow: {
    levels: ApprovalLevel[];
  };
  requestedDate: string;
  status: string;
}

const urgencyColors = {
  low: "bg-green-100 text-green-800",
  normal: "bg-blue-100 text-blue-800", 
  high: "bg-orange-100 text-orange-800",
  emergency: "bg-red-100 text-red-800"
};

const sensitivityColors = {
  standard: "bg-gray-100 text-gray-800",
  sensitive: "bg-yellow-100 text-yellow-800",
  restricted: "bg-red-100 text-red-800"
};

const contextColors = {
  routine: "bg-blue-100 text-blue-800",
  emergency: "bg-red-100 text-red-800",
  consultation: "bg-purple-100 text-purple-800",
  research: "bg-green-100 text-green-800",
  legal: "bg-orange-100 text-orange-800"
};

export default function MultiLevelApprovalManager() {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [approvalConditions, setApprovalConditions] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending approvals for current user
  const { data: pendingApprovals = [], isLoading: loadingPending } = useQuery({
    queryKey: ["/api/my-pending-approvals"],
    enabled: activeTab === "pending"
  });

  // Fetch all access requests for overview
  const { data: allRequests = [], isLoading: loadingAll } = useQuery({
    queryKey: ["/api/patient-access-requests"],
    enabled: activeTab === "all"
  });

  // Fetch approval history for selected request
  const { data: approvalHistory = [] } = useQuery({
    queryKey: ["/api/patient-access-requests", selectedRequest, "history"],
    enabled: !!selectedRequest
  });

  // Approval mutation
  const approveMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: 'approve' | 'deny' }) => {
      return apiRequest(`/api/patient-access-requests/${requestId}/${action}`, {
        method: 'POST',
        body: {
          notes: approvalNotes,
          conditions: action === 'approve' ? approvalConditions : undefined
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Access request processed successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patient-access-requests"] });
      setApprovalNotes("");
      setApprovalConditions("");
      setSelectedRequest(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process access request",
        variant: "destructive"
      });
    }
  });

  const handleApproval = (requestId: string, action: 'approve' | 'deny') => {
    approveMutation.mutate({ requestId, action });
  };

  const renderApprovalWorkflow = (workflow: { levels: ApprovalLevel[] }, currentLevel: number) => {
    return (
      <div className="space-y-2">
        {workflow.levels.map((level, index) => (
          <div
            key={level.level}
            className={`flex items-center space-x-3 p-3 rounded-lg border ${
              level.level === currentLevel
                ? "border-blue-500 bg-blue-50"
                : level.completed
                ? "border-green-500 bg-green-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex-shrink-0">
              {level.completed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : level.level === currentLevel ? (
                <Clock className="h-5 w-5 text-blue-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Level {level.level}: {level.approverRole.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  {level.completed && level.approvedBy && (
                    <p className="text-xs text-gray-500">
                      Approved by {level.approvedBy} on {new Date(level.approvedAt!).toLocaleDateString()}
                    </p>
                  )}
                  {level.notes && (
                    <p className="text-xs text-gray-600 mt-1">{level.notes}</p>
                  )}
                </div>
                <Badge variant={level.required ? "default" : "secondary"}>
                  {level.required ? "Required" : "Optional"}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRequestCard = (request: AccessRequest, isPending: boolean = false) => (
    <Card key={request.id} className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              Patient: {request.patientFirstName} {request.patientLastName}
            </CardTitle>
            <p className="text-sm text-gray-600">MRN: {request.patientMrn}</p>
            <p className="text-sm text-gray-600">
              Requested by: Dr. {request.requestingPhysicianFirstName} {request.requestingPhysicianLastName}
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <Badge className={urgencyColors[request.urgency as keyof typeof urgencyColors]}>
              {request.urgency.toUpperCase()}
            </Badge>
            <Badge className={sensitivityColors[request.patientSensitivityLevel as keyof typeof sensitivityColors]}>
              {request.patientSensitivityLevel.toUpperCase()}
            </Badge>
            <Badge className={contextColors[request.accessContext as keyof typeof contextColors]}>
              {request.accessContext.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Request Reason:</Label>
            <p className="text-sm text-gray-700 mt-1">{request.reason}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Approval Progress:</Label>
            <div className="mt-2">
              {renderApprovalWorkflow(request.approvalWorkflow, request.currentApprovalLevel)}
            </div>
          </div>

          {isPending && (
            <div className="flex items-center space-x-4 pt-4 border-t">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setSelectedRequest(request.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Review & Approve
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Review Access Request</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Patient</Label>
                        <p className="text-sm">{request.patientFirstName} {request.patientLastName} (MRN: {request.patientMrn})</p>
                      </div>
                      <div>
                        <Label>Requesting Physician</Label>
                        <p className="text-sm">Dr. {request.requestingPhysicianFirstName} {request.requestingPhysicianLastName}</p>
                      </div>
                    </div>
                    <div>
                      <Label>Request Reason</Label>
                      <p className="text-sm bg-gray-50 p-2 rounded">{request.reason}</p>
                    </div>
                    <div>
                      <Label htmlFor="approval-notes">Review Notes</Label>
                      <Textarea
                        id="approval-notes"
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        placeholder="Add your review notes..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="approval-conditions">Approval Conditions (Optional)</Label>
                      <Textarea
                        id="approval-conditions"
                        value={approvalConditions}
                        onChange={(e) => setApprovalConditions(e.target.value)}
                        placeholder="Any special conditions or restrictions..."
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => handleApproval(request.id, 'deny')}
                        disabled={approveMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Deny
                      </Button>
                      <Button
                        onClick={() => handleApproval(request.id, 'approve')}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedRequest(request.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Approval History</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    {approvalHistory.map((entry: any, index: number) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Level {entry.approvalLevel}: {entry.decision}</p>
                            <p className="text-sm text-gray-600">By {entry.approverRole}</p>
                            {entry.notes && <p className="text-sm mt-1">{entry.notes}</p>}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.decidedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Patient Access Approval Center</h1>
        <p className="text-gray-600">Review and approve patient access requests with contextual multi-level approval workflow</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            My Pending Approvals ({pendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            All Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {loadingPending ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading pending approvals...</p>
            </div>
          ) : pendingApprovals.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">No pending approvals requiring your attention</p>
            </div>
          ) : (
            pendingApprovals.map((request: AccessRequest) => renderRequestCard(request, true))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {loadingAll ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading all requests...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allRequests.map((request: AccessRequest) => renderRequestCard(request, false))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}