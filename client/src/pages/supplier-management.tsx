import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from '@/lib/queryClient';

interface MedicalSupplier {
  id: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  website?: string;
  businessLicense: string;
  productCategories: string[];
  certifications: string[];
  description?: string;
  status: 'pending_review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function SupplierManagement() {
  const [selectedSupplier, setSelectedSupplier] = useState<MedicalSupplier | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch suppliers
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['/api/admin/suppliers'],
    retry: false,
  });

  // Approve supplier mutation
  const approveSupplier = useMutation({
    mutationFn: async (supplierId: string) => {
      await apiRequest(`/api/admin/suppliers/${supplierId}/approve`, {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Supplier Approved',
        description: 'The supplier has been approved and can now access the marketplace.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/suppliers'] });
      setSelectedSupplier(null);
    },
    onError: (error) => {
      toast({
        title: 'Approval Failed',
        description: 'Failed to approve supplier. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Reject supplier mutation
  const rejectSupplier = useMutation({
    mutationFn: async ({ supplierId, reason }: { supplierId: string; reason: string }) => {
      await apiRequest(`/api/admin/suppliers/${supplierId}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Supplier Rejected',
        description: 'The supplier registration has been rejected.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/suppliers'] });
      setSelectedSupplier(null);
      setRejectionReason('');
    },
    onError: (error) => {
      toast({
        title: 'Rejection Failed',
        description: 'Failed to reject supplier. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Filter suppliers
  const filteredSuppliers = suppliers.filter((supplier: MedicalSupplier) => {
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    const matchesSearch = supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = suppliers.filter((s: MedicalSupplier) => s.status === 'pending_review').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading supplier registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-600 mt-2">Review and manage medical supplier registrations</p>
        </div>
        <div className="flex items-center gap-4">
          {pendingCount > 0 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 px-3 py-1">
              {pendingCount} pending review{pendingCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Suppliers</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by company name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Registrations ({filteredSuppliers.length})</CardTitle>
          <CardDescription>
            Review supplier applications and approve or reject registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No suppliers found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSuppliers.map((supplier: MedicalSupplier) => (
                <div key={supplier.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">{supplier.companyName}</h3>
                        {getStatusBadge(supplier.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {supplier.contactEmail}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {supplier.contactPhone}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {supplier.address}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Applied: {new Date(supplier.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {supplier.productCategories.map((category, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSupplier(supplier)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{supplier.companyName} - Registration Details</DialogTitle>
                            <DialogDescription>
                              Review complete supplier information and take action
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedSupplier && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Company Name</Label>
                                  <p className="text-sm text-gray-600">{selectedSupplier.companyName}</p>
                                </div>
                                <div>
                                  <Label>Contact Email</Label>
                                  <p className="text-sm text-gray-600">{selectedSupplier.contactEmail}</p>
                                </div>
                                <div>
                                  <Label>Phone Number</Label>
                                  <p className="text-sm text-gray-600">{selectedSupplier.contactPhone}</p>
                                </div>
                                <div>
                                  <Label>Business License</Label>
                                  <p className="text-sm text-gray-600">{selectedSupplier.businessLicense}</p>
                                </div>
                              </div>

                              <div>
                                <Label>Address</Label>
                                <p className="text-sm text-gray-600">{selectedSupplier.address}</p>
                              </div>

                              {selectedSupplier.website && (
                                <div>
                                  <Label>Website</Label>
                                  <p className="text-sm text-gray-600">{selectedSupplier.website}</p>
                                </div>
                              )}

                              <div>
                                <Label>Product Categories</Label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {selectedSupplier.productCategories.map((category, index) => (
                                    <Badge key={index} variant="outline">{category}</Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <Label>Certifications</Label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {selectedSupplier.certifications.map((cert, index) => (
                                    <Badge key={index} variant="secondary">{cert}</Badge>
                                  ))}
                                </div>
                              </div>

                              {selectedSupplier.description && (
                                <div>
                                  <Label>Company Description</Label>
                                  <p className="text-sm text-gray-600">{selectedSupplier.description}</p>
                                </div>
                              )}

                              {selectedSupplier.status === 'pending_review' && (
                                <div className="flex gap-3 pt-4 border-t">
                                  <Button
                                    onClick={() => approveSupplier.mutate(selectedSupplier.id)}
                                    disabled={approveSupplier.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve Supplier
                                  </Button>
                                  
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="destructive"
                                        disabled={rejectSupplier.isPending}
                                      >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Reject
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Reject Supplier Registration</DialogTitle>
                                        <DialogDescription>
                                          Please provide a reason for rejecting this supplier registration.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="rejection-reason">Rejection Reason</Label>
                                          <Textarea
                                            id="rejection-reason"
                                            placeholder="Please provide a detailed reason for rejection..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            className="mt-1"
                                          />
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="destructive"
                                            onClick={() => rejectSupplier.mutate({
                                              supplierId: selectedSupplier.id,
                                              reason: rejectionReason
                                            })}
                                            disabled={!rejectionReason.trim() || rejectSupplier.isPending}
                                          >
                                            Confirm Rejection
                                          </Button>
                                          <Button variant="outline">
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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