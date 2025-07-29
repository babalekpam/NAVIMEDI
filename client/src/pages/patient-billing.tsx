import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/contexts/translation-context";
import { useTenantCurrencies, formatCurrencyAmount, type CurrencyInfo } from "@/hooks/useCurrency";

interface PatientBill {
  id: string;
  billNumber: string;
  description: string;
  serviceDate: string;
  dueDate: string;
  currency: string;
  originalAmount: string;
  paidAmount: string;
  remainingBalance: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  appointmentId?: string;
  prescriptionId?: string;
  labOrderId?: string;
  servicePriceId?: string;
  insuranceClaimId?: string;
  insuranceCovered: string;
  patientResponsibility: string;
  notes?: string;
  lateFeesApplied: string;
  createdAt: string;
  updatedAt: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'partial':
      return 'bg-yellow-100 text-yellow-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'paid':
      return <CheckCircle className="h-4 w-4" />;
    case 'partial':
      return <Clock className="h-4 w-4" />;
    case 'overdue':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export default function PatientBilling() {
  const { t } = useTranslation();
  
  const { data: bills = [], isLoading } = useQuery({
    queryKey: ["/api/patient/bills"],
    retry: false,
  });

  const { data: tenantCurrencies } = useTenantCurrencies();

  // Helper function to format currency amounts
  const formatAmount = (amount: string, currencyCode?: string) => {
    const currency = currencyCode || tenantCurrencies?.baseCurrency || 'USD';
    const currencyInfo = tenantCurrencies?.supportedCurrencies?.find(c => c.code === currency);
    return formatCurrencyAmount(amount, currency, currencyInfo);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalOutstanding = bills
    .filter((bill: PatientBill) => bill.status !== 'paid')
    .reduce((sum: number, bill: PatientBill) => sum + parseFloat(bill.remainingBalance), 0);

  const paidBills = bills.filter((bill: PatientBill) => bill.status === 'paid');
  const unpaidBills = bills.filter((bill: PatientBill) => bill.status !== 'paid');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bills & Payments</h1>
          <p className="text-gray-600">View and manage your medical bills and payment history</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatAmount(totalOutstanding.toFixed(2))}
            </div>
            <p className="text-xs text-muted-foreground">
              {unpaidBills.length} unpaid {unpaidBills.length === 1 ? 'bill' : 'bills'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Year</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(paidBills.reduce((sum, bill) => sum + parseFloat(bill.originalAmount), 0).toFixed(2))}
            </div>
            <p className="text-xs text-muted-foreground">
              {paidBills.length} paid {paidBills.length === 1 ? 'bill' : 'bills'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insurance Coverage</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatAmount(bills.reduce((sum, bill) => sum + parseFloat(bill.insuranceCovered || '0'), 0).toFixed(2))}
            </div>
            <p className="text-xs text-muted-foreground">Total coverage amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Bills Section */}
      {unpaidBills.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Outstanding Bills</h2>
          <div className="space-y-4">
            {unpaidBills.map((bill: PatientBill) => (
              <Card key={bill.id} className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{bill.description}</CardTitle>
                      <CardDescription>
                        Bill #{bill.billNumber} • Service Date: {new Date(bill.serviceDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(bill.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(bill.status)}
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-semibold">{formatAmount(bill.originalAmount, bill.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Insurance Covered</p>
                      <p className="font-semibold text-green-600">{formatAmount(bill.insuranceCovered || '0', bill.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Your Responsibility</p>
                      <p className="font-semibold text-blue-600">{formatAmount(bill.patientResponsibility, bill.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount Due</p>
                      <p className="font-semibold text-red-600">{formatAmount(bill.remainingBalance, bill.currency)}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Due Date: {new Date(bill.dueDate).toLocaleDateString()}</p>
                      {parseFloat(bill.lateFeesApplied || '0') > 0 && (
                        <p className="text-sm text-red-600">Late Fees: {formatAmount(bill.lateFeesApplied, bill.currency)}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Payment History Section */}
      {paidBills.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          <div className="space-y-4">
            {paidBills.map((bill: PatientBill) => (
              <Card key={bill.id} className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{bill.description}</CardTitle>
                      <CardDescription>
                        Bill #{bill.billNumber} • Service Date: {new Date(bill.serviceDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(bill.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(bill.status)}
                        Paid
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-semibold">{formatAmount(bill.originalAmount, bill.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Insurance Covered</p>
                      <p className="font-semibold text-green-600">{formatAmount(bill.insuranceCovered || '0', bill.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">You Paid</p>
                      <p className="font-semibold">{formatAmount(bill.paidAmount, bill.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Date</p>
                      <p className="font-semibold text-green-600">{new Date(bill.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Paid in full</p>
                    <Button variant="outline" size="sm">
                      Download Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Bills Message */}
      {bills.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bills Found</h3>
            <p className="text-gray-600 text-center max-w-md">
              You don't have any medical bills at this time. Bills will appear here after you receive medical services.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}