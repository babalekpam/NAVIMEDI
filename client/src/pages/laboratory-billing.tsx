import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, CreditCard, FileText, TrendingUp, Download, TestTube, FileDown } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface LabBillingTransaction {
  id: string;
  transactionDate: string;
  patientName: string;
  testOrderId: string;
  testName: string;
  insuranceProvider?: string;
  insuranceClaim: number;
  patientCopay: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'insurance' | 'check';
  status: 'completed' | 'pending' | 'failed';
  claimStatus?: 'submitted' | 'approved' | 'denied' | 'processing';
  notes?: string;
}

export default function LaboratoryBilling() {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");

  // Fetch laboratory billing data from API
  const { data: billingData = [], isLoading } = useQuery({
    queryKey: ["/api/laboratory/billing"],
    staleTime: 30000,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const getClaimStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    
    const statusConfig = {
      submitted: { color: 'bg-blue-100 text-blue-800', text: 'Submitted' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      denied: { color: 'bg-red-100 text-red-800', text: 'Denied' },
      processing: { color: 'bg-yellow-100 text-yellow-800', text: 'Processing' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? <Badge className={config.color}>{config.text}</Badge> : null;
  };

  const getPaymentMethodDisplay = (method: string) => {
    const methods = {
      cash: '💵 Cash',
      card: '💳 Card',
      insurance: '🏥 Insurance',
      check: '📄 Check'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const handleDownloadInsuranceFile = async (transaction: LabBillingTransaction) => {
    try {
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Create a mock insurance file content for download
      const currentDate = new Date().toLocaleDateString();
      const serviceDate = new Date(transaction.transactionDate).toLocaleDateString();
      
      const insuranceFileContent = `INSURANCE CLAIM SUBMISSION
Laboratory: LABSAFE
Address: 789 Research Boulevard, Science City, SC 98765
Phone: 555-LAB-SAFE
Tax ID: 44-LABSAFE
CLIA Number: CLIA-LABSAFE-789

PATIENT INFORMATION
Name: ${transaction.patientName}
Test Order ID: ${transaction.testOrderId}
Service Date: ${serviceDate}

BILLING INFORMATION
Test Name: ${transaction.testName}
Insurance Provider: ${transaction.insuranceProvider || 'N/A'}
Total Amount: $${transaction.totalAmount.toFixed(2)}
Insurance Claim: $${transaction.insuranceClaim.toFixed(2)}
Patient Copay: $${transaction.patientCopay.toFixed(2)}
Payment Method: ${transaction.paymentMethod}
Status: ${transaction.status}
Claim Status: ${transaction.claimStatus || 'N/A'}

NOTES
${transaction.notes || 'No additional notes'}

Generated: ${currentDate}

---
This file is for insurance manual submission.
Please attach all required supporting documentation.
`;

      // Create and download the file
      const blob = new Blob([insuranceFileContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `insurance-claim-${transaction.testOrderId}-${transaction.patientName.replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('Insurance file downloaded successfully');
    } catch (error) {
      console.error('Error downloading insurance file:', error);
    }
  };

  // Filter data
  const filteredData = billingData.filter(transaction => {
    const matchesSearch = (transaction.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (transaction.testName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (transaction.testOrderId || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    const matchesPaymentMethod = paymentMethodFilter === "all" || transaction.paymentMethod === paymentMethodFilter;
    
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  // Calculate totals
  const totalRevenue = billingData.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalInsuranceClaims = billingData.reduce((sum, t) => sum + t.insuranceClaim, 0);
  const totalPatientCopays = billingData.reduce((sum, t) => sum + t.patientCopay, 0);
  const completedTransactions = billingData.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laboratory Billing & Revenue</h1>
          <p className="text-gray-600 mt-1">Track lab test payments, insurance claims, and financial reporting</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Generate Invoice
          </Button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insurance Claims</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInsuranceClaims.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Claimed from insurance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patient Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPatientCopays.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Patient copays & direct pay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTransactions}</div>
            <p className="text-xs text-gray-500">Completed this period</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Laboratory Transaction History</CardTitle>
              <CardDescription>View and manage lab test billing transactions</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Lab Test</TableHead>
                  <TableHead>Insurance</TableHead>
                  <TableHead>Patient Pay</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(transaction.transactionDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.patientName}</div>
                        <div className="text-sm text-gray-500">{transaction.testOrderId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm flex items-center gap-1">
                        <TestTube className="h-3 w-3 text-blue-500" />
                        {transaction.testName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">${transaction.insuranceClaim.toFixed(2)}</div>
                        {transaction.insuranceProvider && (
                          <div className="text-xs text-gray-500">{transaction.insuranceProvider}</div>
                        )}
                        {transaction.claimStatus && getClaimStatusBadge(transaction.claimStatus)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">${transaction.patientCopay.toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">${transaction.totalAmount.toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{getPaymentMethodDisplay(transaction.paymentMethod)}</div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" data-testid="view-receipt" title="View Receipt">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownloadInsuranceFile(transaction)}
                          data-testid="download-insurance-file"
                          title="Download Insurance File"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No transactions found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}