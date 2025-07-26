import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DollarSign, Plus, Search, Filter, MoreHorizontal, FileText, CreditCard } from "lucide-react";
import { InsuranceClaim, Patient } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  processing: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  denied: "bg-red-100 text-red-800",
  paid: "bg-green-100 text-green-800",
};

export default function Billing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { user } = useAuth();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

  const { data: claims = [], isLoading } = useQuery<InsuranceClaim[]>({
    queryKey: ["/api/insurance-claims"],
    enabled: !!user && !!tenant,
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: !!user && !!tenant,
  });

  const filteredClaims = claims.filter(claim => {
    const patient = patients.find(p => p.id === claim.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "";
    const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient ${patientId.slice(-4)}`;
  };

  // Calculate summary statistics
  const totalClaimsAmount = filteredClaims.reduce((sum, claim) => sum + parseFloat(claim.totalAmount), 0);
  const approvedAmount = filteredClaims
    .filter(claim => claim.status === 'approved' || claim.status === 'paid')
    .reduce((sum, claim) => sum + parseFloat(claim.approvedAmount || '0'), 0);
  const paidAmount = filteredClaims
    .filter(claim => claim.status === 'paid')
    .reduce((sum, claim) => sum + parseFloat(claim.paidAmount || '0'), 0);
  const pendingClaims = filteredClaims.filter(claim => 
    claim.status === 'submitted' || claim.status === 'processing'
  ).length;

  if (!user || !tenant) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Claims</h1>
          <p className="text-gray-600 mt-1">Manage insurance claims and billing operations</p>
        </div>
        {(user.role === "billing_staff" || user.role === "physician" || user.role === "tenant_admin") && (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Claim
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Claims</p>
                <p className="text-3xl font-bold text-gray-900">${totalClaimsAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{filteredClaims.length} claims</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Amount</p>
                <p className="text-3xl font-bold text-gray-900">${approvedAmount.toLocaleString()}</p>
                <p className="text-sm text-green-600">
                  {totalClaimsAmount > 0 ? Math.round((approvedAmount / totalClaimsAmount) * 100) : 0}% approval rate
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                <p className="text-3xl font-bold text-gray-900">${paidAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Received payments</p>
              </div>
              <div className="p-3 bg-teal-50 rounded-lg">
                <CreditCard className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Claims</p>
                <p className="text-3xl font-bold text-gray-900">{pendingClaims}</p>
                <p className="text-sm text-yellow-600">Awaiting response</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
              <Input
                placeholder="Search by patient or claim number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Claims List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Insurance Claims
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4 py-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? "No claims match your search criteria" : "No insurance claims have been created yet"}
              </p>
              {(user.role === "billing_staff" || user.role === "physician" || user.role === "tenant_admin") && (
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Claim
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-0">
              {filteredClaims.map((claim) => (
                <div 
                  key={claim.id}
                  className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        claim.status === 'paid' ? 'bg-green-50' : 
                        claim.status === 'denied' ? 'bg-red-50' :
                        claim.status === 'approved' ? 'bg-green-50' :
                        claim.status === 'processing' ? 'bg-yellow-50' :
                        'bg-blue-50'
                      }`}>
                        <DollarSign className={`h-5 w-5 ${
                          claim.status === 'paid' ? 'text-green-600' : 
                          claim.status === 'denied' ? 'text-red-600' :
                          claim.status === 'approved' ? 'text-green-600' :
                          claim.status === 'processing' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          Claim #{claim.claimNumber}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          ${parseFloat(claim.totalAmount).toLocaleString()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Patient: {getPatientName(claim.patientId)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Submitted: {claim.submittedDate ? new Date(claim.submittedDate).toLocaleDateString() : 'Not submitted'}
                      </p>
                      {claim.approvedAmount && (
                        <p className="text-xs text-green-600">
                          Approved: ${parseFloat(claim.approvedAmount).toLocaleString()}
                        </p>
                      )}
                      {claim.paidAmount && (
                        <p className="text-xs text-green-600">
                          Paid: ${parseFloat(claim.paidAmount).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Badge 
                        variant="secondary"
                        className={statusColors[claim.status] || statusColors.draft}
                      >
                        {claim.status.replace('_', ' ')}
                      </Badge>
                      {claim.processedDate && (
                        <p className="text-xs text-gray-400 mt-1">
                          Processed: {new Date(claim.processedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        View Details
                      </Button>
                      {claim.status === 'draft' && (
                        <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                          Submit Claim
                        </Button>
                      )}
                      {claim.status === 'approved' && !claim.paidAmount && (
                        <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700">
                          Record Payment
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
