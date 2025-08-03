import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTenant } from "@/contexts/tenant-context-fixed";
import { useToast } from "@/hooks/use-toast";
import { Archive, Search, FileText, Download, Calendar, DollarSign, Receipt, Clock } from 'lucide-react';

interface ArchivedPrescription {
  id: string;
  originalPrescriptionId: string;
  tenantId: string;
  patientData: {
    id: string;
    name: string;
    medication: string;
  };
  prescriptionData: {
    id: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    quantity: number;
    refills: number;
    instructions: string;
    status: string;
    prescribedDate: string;
    dispensedDate: string;
    insuranceProvider?: string;
    insuranceCopay?: number;
    insuranceCoveragePercentage?: number;
    totalCost?: number;
    pharmacyNotes?: string;
  };
  receiptData: {
    claimNumber: string;
    transactionId: string;
    dispensedAt: string;
    dispensedBy: string;
  };
  archivedAt: string;
}

export default function PrescriptionArchivesPage() {
  const { tenant } = useTenant();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedArchive, setSelectedArchive] = useState<ArchivedPrescription | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch archived prescriptions
  const { data: archives = [], isLoading } = useQuery<ArchivedPrescription[]>({
    queryKey: ['/api/pharmacy/prescription-archives', tenant?.id],
    enabled: !!tenant?.id && tenant?.type === 'pharmacy',
  });

  // Filter archives
  const filteredArchives = archives.filter((archive) => {
    const matchesSearch = 
      archive.prescriptionData.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      archive.patientData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      archive.receiptData.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      archive.receiptData.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const archivedDate = new Date(archive.archivedAt);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - archivedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case "today":
          matchesDate = daysDiff === 0;
          break;
        case "week":
          matchesDate = daysDiff <= 7;
          break;
        case "month":
          matchesDate = daysDiff <= 30;
          break;
        case "quarter":
          matchesDate = daysDiff <= 90;
          break;
      }
    }
    
    return matchesSearch && matchesDate;
  });

  const handleViewDetails = (archive: ArchivedPrescription) => {
    setSelectedArchive(archive);
    setIsDetailModalOpen(true);
  };

  const handlePrintReceipt = (archive: ArchivedPrescription) => {
    const receiptWindow = window.open('', '_blank');
    if (receiptWindow) {
      receiptWindow.document.write(`
        <html>
          <head>
            <title>Prescription Receipt - ${archive.receiptData.claimNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
              .field { margin: 8px 0; }
              .total { font-weight: bold; border-top: 1px solid #000; padding-top: 8px; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${tenant?.name}</h2>
              <p>Prescription Receipt</p>
            </div>
            
            <div class="field"><strong>Patient:</strong> ${archive.patientData.name}</div>
            <div class="field"><strong>Medication:</strong> ${archive.prescriptionData.medicationName}</div>
            <div class="field"><strong>Dosage:</strong> ${archive.prescriptionData.dosage}</div>
            <div class="field"><strong>Quantity:</strong> ${archive.prescriptionData.quantity}</div>
            <div class="field"><strong>Instructions:</strong> ${archive.prescriptionData.instructions}</div>
            
            <div class="field"><strong>Claim Number:</strong> ${archive.receiptData.claimNumber}</div>
            <div class="field"><strong>Transaction ID:</strong> ${archive.receiptData.transactionId}</div>
            <div class="field"><strong>Dispensed:</strong> ${new Date(archive.receiptData.dispensedAt).toLocaleString()}</div>
            
            ${archive.prescriptionData.insuranceProvider ? `
              <div class="field"><strong>Insurance:</strong> ${archive.prescriptionData.insuranceProvider}</div>
              <div class="field"><strong>Coverage:</strong> ${archive.prescriptionData.insuranceCoveragePercentage}%</div>
              <div class="field"><strong>Copay:</strong> $${archive.prescriptionData.insuranceCopay}</div>
            ` : ''}
            
            <div class="total">
              <div class="field"><strong>Total Cost:</strong> $${archive.prescriptionData.totalCost || '0.00'}</div>
            </div>
            
            <div style="margin-top: 20px; font-size: 10px; text-align: center; border-top: 1px solid #000; padding-top: 8px;">
              ${tenant?.name} - HIPAA Compliant<br>
              NaviMED Platform Connected Pharmacy
            </div>
          </body>
        </html>
      `);
      receiptWindow.document.close();
      receiptWindow.print();
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Claim Number',
      'Transaction ID',
      'Patient Name',
      'Medication',
      'Dosage',
      'Quantity',
      'Insurance Provider',
      'Copay',
      'Total Cost',
      'Dispensed Date',
      'Archived Date'
    ];

    const csvData = filteredArchives.map(archive => [
      archive.receiptData.claimNumber,
      archive.receiptData.transactionId,
      archive.patientData.name,
      archive.prescriptionData.medicationName,
      archive.prescriptionData.dosage,
      archive.prescriptionData.quantity,
      archive.prescriptionData.insuranceProvider || 'N/A',
      archive.prescriptionData.insuranceCopay || '0.00',
      archive.prescriptionData.totalCost || '0.00',
      new Date(archive.receiptData.dispensedAt).toLocaleString(),
      new Date(archive.archivedAt).toLocaleString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-archives-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Prescription archives exported to CSV successfully",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading archived prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prescription Archives</h1>
          <p className="text-gray-600 mt-1">
            View and manage dispensed prescription records for bookkeeping
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={filteredArchives.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Archived</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archives.length}</div>
            <p className="text-xs text-muted-foreground">
              Dispensed prescriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {archives.filter(a => {
                const archivedDate = new Date(a.archivedAt);
                const now = new Date();
                return archivedDate.getMonth() === now.getMonth() && 
                       archivedDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Prescriptions dispensed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${archives.reduce((sum, a) => sum + (a.prescriptionData.totalCost || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total from archived prescriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insurance Claims</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {archives.filter(a => a.prescriptionData.insuranceProvider).length}
            </div>
            <p className="text-xs text-muted-foreground">
              With insurance coverage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Archives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Archives</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by medication, patient, claim number, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="date-filter">Filter by Date</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Archives Table */}
      <Card>
        <CardHeader>
          <CardTitle>Archived Prescriptions</CardTitle>
          <CardDescription>
            {filteredArchives.length} record(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredArchives.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim Number</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Insurance</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Dispensed Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArchives.map((archive) => (
                  <TableRow key={archive.id}>
                    <TableCell className="font-medium">
                      {archive.receiptData.claimNumber}
                    </TableCell>
                    <TableCell>{archive.patientData.name}</TableCell>
                    <TableCell>{archive.prescriptionData.medicationName}</TableCell>
                    <TableCell>{archive.prescriptionData.dosage}</TableCell>
                    <TableCell>
                      {archive.prescriptionData.insuranceProvider ? (
                        <Badge variant="secondary">
                          {archive.prescriptionData.insuranceProvider}
                        </Badge>
                      ) : (
                        <span className="text-gray-500">Cash</span>
                      )}
                    </TableCell>
                    <TableCell>
                      ${archive.prescriptionData.totalCost?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>
                      {new Date(archive.receiptData.dispensedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(archive)}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrintReceipt(archive)}
                        >
                          <Receipt className="h-3 w-3 mr-1" />
                          Receipt
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Archive className="mx-auto h-8 w-8 mb-2" />
              <p>No archived prescriptions found</p>
              <p className="text-sm">Dispensed prescriptions will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prescription Archive Details</DialogTitle>
            <DialogDescription>
              Complete record for {selectedArchive?.receiptData.claimNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedArchive && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Patient Name</Label>
                  <p>{selectedArchive.patientData.name}</p>
                </div>
                <div>
                  <Label className="font-medium">Medication</Label>
                  <p>{selectedArchive.prescriptionData.medicationName}</p>
                </div>
                <div>
                  <Label className="font-medium">Dosage</Label>
                  <p>{selectedArchive.prescriptionData.dosage}</p>
                </div>
                <div>
                  <Label className="font-medium">Frequency</Label>
                  <p>{selectedArchive.prescriptionData.frequency}</p>
                </div>
                <div>
                  <Label className="font-medium">Quantity</Label>
                  <p>{selectedArchive.prescriptionData.quantity}</p>
                </div>
                <div>
                  <Label className="font-medium">Refills</Label>
                  <p>{selectedArchive.prescriptionData.refills}</p>
                </div>
              </div>

              {selectedArchive.prescriptionData.instructions && (
                <div>
                  <Label className="font-medium">Instructions</Label>
                  <p className="text-sm text-gray-600">{selectedArchive.prescriptionData.instructions}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Transaction Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Claim Number</Label>
                    <p>{selectedArchive.receiptData.claimNumber}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Transaction ID</Label>
                    <p>{selectedArchive.receiptData.transactionId}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Dispensed Date</Label>
                    <p>{new Date(selectedArchive.receiptData.dispensedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Archived Date</Label>
                    <p>{new Date(selectedArchive.archivedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {selectedArchive.prescriptionData.insuranceProvider && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Insurance Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Provider</Label>
                      <p>{selectedArchive.prescriptionData.insuranceProvider}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Coverage</Label>
                      <p>{selectedArchive.prescriptionData.insuranceCoveragePercentage}%</p>
                    </div>
                    <div>
                      <Label className="font-medium">Patient Copay</Label>
                      <p>${selectedArchive.prescriptionData.insuranceCopay}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Total Cost</Label>
                      <p>${selectedArchive.prescriptionData.totalCost?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handlePrintReceipt(selectedArchive)}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}