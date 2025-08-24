import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  MessageSquare, 
  TrendingUp,
  Package,
  Building2,
  Stethoscope,
  TestTube,
  Pill,
  Monitor,
  Settings,
  BookOpen,
  Wrench,
  Shield,  
  Home,
  Laptop
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/contexts/tenant-context-fixed";

interface Advertisement {
  id: string;
  tenantId: string;
  companyName: string;
  contactEmail: string;
  contactPhone?: string;
  websiteUrl?: string;
  title: string;
  description: string;
  category: string;
  targetAudience: string[];
  keywords: string[];
  imageUrls: string[];
  videoUrl?: string;
  brochureUrl?: string;
  priceRange?: string;
  currency: string;
  productSpecifications: any;
  certifications: string[];
  status: 'draft' | 'pending_review' | 'approved' | 'active' | 'paused' | 'expired' | 'rejected' | 'suspended';
  priority: 'standard' | 'featured' | 'premium' | 'sponsored';
  billingType: 'monthly' | 'per_click' | 'per_impression' | 'fixed_duration';
  monthlyFee?: number;
  clickRate?: number;
  impressionRate?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  autoRenew: boolean;
  impressions: number;
  clicks: number;
  conversions: number;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { value: "medical_devices", label: "Medical Devices", icon: Package },
  { value: "diagnostic_equipment", label: "Diagnostic Equipment", icon: Monitor },
  { value: "surgical_instruments", label: "Surgical Instruments", icon: Stethoscope },
  { value: "laboratory_equipment", label: "Laboratory Equipment", icon: TestTube },
  { value: "pharmacy_supplies", label: "Pharmacy Supplies", icon: Pill },
  { value: "software_solutions", label: "Software Solutions", icon: Laptop },
  { value: "consulting_services", label: "Consulting Services", icon: Building2 },
  { value: "training_programs", label: "Training Programs", icon: BookOpen },
  { value: "maintenance_services", label: "Maintenance Services", icon: Wrench },
  { value: "insurance_services", label: "Insurance Services", icon: Shield },
  { value: "facility_management", label: "Facility Management", icon: Home },
];

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-700",
  pending_review: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  active: "bg-blue-100 text-blue-700",
  paused: "bg-orange-100 text-orange-700",
  expired: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
  suspended: "bg-purple-100 text-purple-700"
};

export default function Advertisements() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Check if user is a supplier (can post advertisements)
  const isSupplier = currentTenant?.type === 'supplier';
  // Healthcare practices can only view advertisements, not create them
  const isHealthcarePractice = ['hospital', 'pharmacy', 'laboratory'].includes(currentTenant?.type || '');

  // Fetch advertisements
  const { data: advertisements, isLoading, error } = useQuery({
    queryKey: ['/api/advertisements'],
    queryFn: () => apiRequest('/api/advertisements')
  });

  // Create advertisement mutation
  const createAdMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/advertisements', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({ title: "Advertisement created successfully" });
      setShowCreateDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/advertisements'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create advertisement", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Update advertisement status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiRequest(`/api/advertisements/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    onSuccess: () => {
      toast({ title: "Advertisement status updated" });
      queryClient.invalidateQueries({ queryKey: ['/api/advertisements'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update status", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Delete advertisement mutation
  const deleteAdMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/advertisements/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      toast({ title: "Advertisement deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/advertisements'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to delete advertisement", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const filteredAds = advertisements?.filter((ad: Advertisement) => {
    if (filterCategory && filterCategory !== "all" && ad.category !== filterCategory) return false;
    if (filterStatus && filterStatus !== "all" && ad.status !== filterStatus) return false;
    return true;
  });

  const handleViewAd = (ad: Advertisement) => {
    setSelectedAd(ad);
    setShowViewDialog(true);
  };

  const handleToggleStatus = (ad: Advertisement) => {
    const newStatus = ad.status === 'active' ? 'paused' : 'active';
    updateStatusMutation.mutate({ id: ad.id, status: newStatus });
  };

  const calculateCTR = (ad: Advertisement) => {
    return ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white">
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Setting up Advertisement Marketplace</h3>
          <p className="text-gray-600 mb-4">
            The advertisement marketplace is being initialized. This feature will be available once the database tables are created.
          </p>
          <p className="text-sm text-gray-500">
            Error: {error?.message || 'Unable to load advertisements'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Marketplace</h1>
          {isHealthcarePractice ? (
            <p className="text-gray-600">Discover medical devices, equipment, and healthcare services from suppliers</p>
          ) : (
            <p className="text-gray-600">Discover medical devices, equipment, and healthcare services</p>
          )}
        </div>
        {/* Only show Post Advertisement button for suppliers */}
        {isSupplier && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Post Advertisement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Advertisement</DialogTitle>
              </DialogHeader>
              <CreateAdForm onSubmit={(data) => createAdMutation.mutate(data)} />
            </DialogContent>
          </Dialog>
        )}
        {/* Show informational message for healthcare practices */}
        {isHealthcarePractice && (
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Healthcare Practice</p>
            <p className="text-xs text-gray-400">Browse and contact medical suppliers</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 min-w-48">
          <Label htmlFor="category-filter">Category</Label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-48">
          <Label htmlFor="status-filter">Status</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(filterCategory !== "all" || filterStatus !== "all") && (
          <Button 
            variant="outline" 
            onClick={() => {
              setFilterCategory("all");
              setFilterStatus("all");
            }}
            className="self-end"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Advertisement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAds?.map((ad: Advertisement) => {
          const category = CATEGORIES.find(c => c.value === ad.category);
          const CategoryIcon = category?.icon || Package;
          
          return (
            <Card key={ad.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <CategoryIcon className="w-5 h-5 text-emerald-600" />
                    <Badge className={STATUS_COLORS[ad.status]}>
                      {ad.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewAd(ad)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {/* Only show edit/delete controls for suppliers */}
                    {isSupplier && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStatus(ad)}
                          disabled={updateStatusMutation.isPending}
                        >
                          {ad.status === 'active' ? 
                            <Pause className="w-4 h-4" /> : 
                            <Play className="w-4 h-4" />
                          }
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAdMutation.mutate(ad.id)}
                          disabled={deleteAdMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg">{ad.title}</CardTitle>
                <p className="text-sm text-gray-600 font-medium">{ad.companyName}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {ad.description}
                </p>
                
                {ad.priceRange && (
                  <p className="text-lg font-semibold text-emerald-600 mb-3">
                    {ad.priceRange}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{ad.impressions.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>{calculateCTR(ad)}% CTR</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {ad.keywords?.slice(0, 3).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {ad.keywords?.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{ad.keywords.length - 3} more
                    </Badge>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleViewAd(ad)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {isHealthcarePractice ? "Contact Supplier" : "View Details & Inquire"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAds?.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No advertisements found</h3>
          <p className="text-gray-600 mb-4">
            {filterCategory || filterStatus ? 
              "Try adjusting your filters to find relevant medical suppliers." :
              (isHealthcarePractice ? 
                "No advertisements available. Medical suppliers will post their products and services here." :
                "Be the first to post an advertisement in the medical marketplace."
              )
            }
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Post Advertisement
          </Button>
        </div>
      )}

      {/* View Advertisement Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advertisement Details</DialogTitle>
          </DialogHeader>
          {selectedAd && <AdDetailView ad={selectedAd} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateAdForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    companyName: "",
    contactEmail: "",
    contactPhone: "",
    websiteUrl: "",
    title: "",
    description: "",
    category: "",
    targetAudience: [] as string[],
    keywords: "",
    priceRange: "",
    currency: "USD",
    productSpecifications: {},
    certifications: "",
    billingType: "monthly",
    monthlyFee: "",
    startDate: "",
    endDate: "",
    autoRenew: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
      certifications: formData.certifications.split(',').map(c => c.trim()).filter(c => c),
      monthlyFee: formData.monthlyFee ? parseFloat(formData.monthlyFee) : null,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
    };
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="billing">Billing & Duration</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div>
            <Label htmlFor="title">Advertisement Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Advanced Cardiac Monitor - FDA Approved"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of your product or service..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priceRange">Price Range</Label>
              <Input
                id="priceRange"
                value={formData.priceRange}
                onChange={(e) => setFormData(prev => ({ ...prev, priceRange: e.target.value }))}
                placeholder="e.g., $5,000 - $15,000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
              placeholder="cardiac, monitor, FDA approved, hospital equipment"
            />
          </div>

          <div>
            <Label htmlFor="certifications">Certifications (comma-separated)</Label>
            <Input
              id="certifications"
              value={formData.certifications}
              onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
              placeholder="FDA, CE, ISO 13485, HIPAA"
            />
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="billingType">Billing Type</Label>
              <Select value={formData.billingType} onValueChange={(value) => setFormData(prev => ({ ...prev, billingType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Subscription</SelectItem>
                  <SelectItem value="per_click">Per Click</SelectItem>
                  <SelectItem value="per_impression">Per Impression</SelectItem>
                  <SelectItem value="fixed_duration">Fixed Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="monthlyFee">Monthly Fee ($)</Label>
              <Input
                id="monthlyFee"
                type="number"
                step="0.01"
                value={formData.monthlyFee}
                onChange={(e) => setFormData(prev => ({ ...prev, monthlyFee: e.target.value }))}
                placeholder="99.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => {}}>
          Save as Draft
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
          Submit for Review
        </Button>
      </div>
    </form>
  );
}

function AdDetailView({ ad }: { ad: Advertisement }) {
  const { toast } = useToast();
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    interestedIn: ad.title
  });
  
  const category = CATEGORIES.find(c => c.value === ad.category);
  const CategoryIcon = category?.icon || Package;

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/marketplace/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...inquiryData,
          advertisementId: ad.id,
          supplierEmail: ad.contactEmail,
          supplierCompany: ad.companyName
        })
      });

      if (response.ok) {
        toast({
          title: "Inquiry sent successfully",
          description: "The supplier will contact you directly via email or phone.",
        });
        setShowInquiryForm(false);
        setInquiryData({
          name: '',
          email: '',
          phone: '',
          company: '',
          message: '',
          interestedIn: ad.title
        });
      } else {
        throw new Error('Failed to send inquiry');
      }
    } catch (error) {
      toast({
        title: "Failed to send inquiry",
        description: "Please try again or contact the supplier directly.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <CategoryIcon className="w-8 h-8 text-emerald-600" />
          <div>
            <h3 className="text-xl font-semibold">{ad.title}</h3>
            <p className="text-gray-600">{ad.companyName}</p>
          </div>
        </div>
        <Badge className={STATUS_COLORS[ad.status]}>
          {ad.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h4 className="font-semibold mb-2">Description</h4>
          <p className="text-gray-700 mb-4">{ad.description}</p>

          {ad.keywords?.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {ad.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {ad.certifications?.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {ad.certifications.map((cert, index) => (
                  <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Contact Information</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> {ad.contactEmail}</p>
                {ad.contactPhone && <p><strong>Phone:</strong> {ad.contactPhone}</p>}
                {ad.websiteUrl && (
                  <p>
                    <strong>Website:</strong>{' '}
                    <a href={ad.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Visit Website
                    </a>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {ad.priceRange && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Pricing</h4>
                <p className="text-lg font-semibold text-emerald-600">{ad.priceRange}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Impressions:</span>
                  <span className="font-medium">{ad.impressions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Clicks:</span>
                  <span className="font-medium">{ad.clicks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>CTR:</span>
                  <span className="font-medium">
                    {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00'}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {!showInquiryForm ? (
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setShowInquiryForm(true)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Inquiry
            </Button>
          ) : (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Send Inquiry</h4>
                <form onSubmit={handleSendInquiry} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="inquiry-name">Name *</Label>
                      <Input
                        id="inquiry-name"
                        value={inquiryData.name}
                        onChange={(e) => setInquiryData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="inquiry-email">Email *</Label>
                      <Input
                        id="inquiry-email"
                        type="email"
                        value={inquiryData.email}
                        onChange={(e) => setInquiryData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="inquiry-phone">Phone</Label>
                      <Input
                        id="inquiry-phone"
                        value={inquiryData.phone}
                        onChange={(e) => setInquiryData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Your phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="inquiry-company">Company</Label>
                      <Input
                        id="inquiry-company"
                        value={inquiryData.company}
                        onChange={(e) => setInquiryData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Your organization"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="inquiry-message">Message *</Label>
                    <Textarea
                      id="inquiry-message"
                      value={inquiryData.message}
                      onChange={(e) => setInquiryData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Please provide details about your inquiry, quantity needed, timeline, etc."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      Send Inquiry
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowInquiryForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}