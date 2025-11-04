import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Calendar,
  DollarSign,
  ShoppingCart,
  Truck,
  BarChart3,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface InventoryItem {
  id: string;
  name: string;
  genericName: string;
  brandName?: string;
  strength: string;
  dosageForm: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitCost: number;
  sellingPrice: number;
  supplier: string;
  batchNumber: string;
  lotNumber?: string;
  manufacturingDate: string;
  expiryDate: string;
  location: string;
  category: string;
  therapeuticClass: string;
  controlledSubstance: boolean;
  scheduleClass?: string;
  ndcNumber?: string;
  barcode?: string;
  status: 'active' | 'inactive' | 'discontinued';
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired' | 'expiring_soon';
  createdAt: string;
  updatedAt: string;
}

interface StockMovement {
  id: string;
  inventoryItemId: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'return' | 'expired' | 'damaged';
  quantity: number;
  unitCost?: number;
  totalValue: number;
  reason: string;
  referenceNumber?: string;
  performedBy: string;
  createdAt: string;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
}

export function PharmacyInventoryManager() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showExpiring, setShowExpiring] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [formData, setFormData] = useState({
    name: '', genericName: '', brandName: '', strength: '', dosageForm: '',
    currentStock: 0, minStock: 0, maxStock: 0, reorderPoint: 0,
    unitCost: 0, sellingPrice: 0, supplier: '', batchNumber: '',
    manufacturingDate: '', expiryDate: '', location: '', category: '',
    therapeuticClass: '', controlledSubstance: false, scheduleClass: '',
    ndcNumber: '', barcode: ''
  });

  // Fetch inventory items
  const { data: inventory = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ['/api/pharmacy/inventory']
  });

  // Fetch stock movements
  const { data: movements = [] } = useQuery<StockMovement[]>({
    queryKey: ['/api/pharmacy/stock-movements']
  });

  // Fetch suppliers
  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ['/api/pharmacy/suppliers']
  });

  // Add/Update inventory item mutation
  const saveItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editingItem ? `/api/pharmacy/inventory/${editingItem.id}` : '/api/pharmacy/inventory';
      const method = editingItem ? 'PUT' : 'POST';
      return apiRequest(url, { method, body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pharmacy/inventory'] });
      toast({
        title: editingItem ? "Item Updated" : "Item Added",
        description: `Inventory item has been ${editingItem ? 'updated' : 'added'} successfully.`
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save inventory item",
        variant: "destructive"
      });
    }
  });

  // Delete inventory item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/pharmacy/inventory/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pharmacy/inventory'] });
      toast({
        title: "Item Deleted",
        description: "Inventory item has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete inventory item",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '', genericName: '', brandName: '', strength: '', dosageForm: '',
      currentStock: 0, minStock: 0, maxStock: 0, reorderPoint: 0,
      unitCost: 0, sellingPrice: 0, supplier: '', batchNumber: '',
      manufacturingDate: '', expiryDate: '', location: '', category: '',
      therapeuticClass: '', controlledSubstance: false, scheduleClass: '',
      ndcNumber: '', barcode: ''
    });
    setEditingItem(null);
    setIsAddDialogOpen(false);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      genericName: item.genericName,
      brandName: item.brandName || '',
      strength: item.strength,
      dosageForm: item.dosageForm,
      currentStock: item.currentStock,
      minStock: item.minStock,
      maxStock: item.maxStock,
      reorderPoint: item.reorderPoint,
      unitCost: item.unitCost,
      sellingPrice: item.sellingPrice,
      supplier: item.supplier,
      batchNumber: item.batchNumber,
      manufacturingDate: item.manufacturingDate.split('T')[0],
      expiryDate: item.expiryDate.split('T')[0],
      location: item.location,
      category: item.category,
      therapeuticClass: item.therapeuticClass,
      controlledSubstance: item.controlledSubstance,
      scheduleClass: item.scheduleClass || '',
      ndcNumber: item.ndcNumber || '',
      barcode: item.barcode || ''
    });
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.genericName || !formData.strength) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    saveItemMutation.mutate(formData);
  };

  const getStockStatusBadge = (status: string) => {
    const statusConfig = {
      in_stock: { color: 'bg-green-100 text-green-800', label: 'In Stock' },
      low_stock: { color: 'bg-yellow-100 text-yellow-800', label: 'Low Stock' },
      out_of_stock: { color: 'bg-red-100 text-red-800', label: 'Out of Stock' },
      expired: { color: 'bg-red-100 text-red-800', label: 'Expired' },
      expiring_soon: { color: 'bg-orange-100 text-orange-800', label: 'Expiring Soon' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.in_stock;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.stockStatus === filterStatus;
    const matchesLowStock = !showLowStock || item.stockStatus === 'low_stock' || item.stockStatus === 'out_of_stock';
    const matchesExpiring = !showExpiring || item.stockStatus === 'expired' || item.stockStatus === 'expiring_soon';
    
    return matchesSearch && matchesCategory && matchesStatus && matchesLowStock && matchesExpiring;
  });

  const categories = [...new Set(inventory.map(item => item.category))];
  const lowStockCount = inventory.filter(item => item.stockStatus === 'low_stock' || item.stockStatus === 'out_of_stock').length;
  const expiringCount = inventory.filter(item => item.stockStatus === 'expired' || item.stockStatus === 'expiring_soon').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-gray-600">Manage your pharmacy inventory, stock levels, and supplies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Export Report
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Medication Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter medication name"
                  />
                </div>
                <div>
                  <Label htmlFor="genericName">Generic Name *</Label>
                  <Input
                    id="genericName"
                    value={formData.genericName}
                    onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                    placeholder="Enter generic name"
                  />
                </div>
                <div>
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    value={formData.brandName}
                    onChange={(e) => setFormData({...formData, brandName: e.target.value})}
                    placeholder="Enter brand name"
                  />
                </div>
                <div>
                  <Label htmlFor="strength">Strength *</Label>
                  <Input
                    id="strength"
                    value={formData.strength}
                    onChange={(e) => setFormData({...formData, strength: e.target.value})}
                    placeholder="e.g., 500mg, 10ml"
                  />
                </div>
                <div>
                  <Label htmlFor="dosageForm">Dosage Form</Label>
                  <Select value={formData.dosageForm} onValueChange={(value) => setFormData({...formData, dosageForm: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dosage form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="capsule">Capsule</SelectItem>
                      <SelectItem value="liquid">Liquid</SelectItem>
                      <SelectItem value="injection">Injection</SelectItem>
                      <SelectItem value="cream">Cream</SelectItem>
                      <SelectItem value="ointment">Ointment</SelectItem>
                      <SelectItem value="drops">Drops</SelectItem>
                      <SelectItem value="inhaler">Inhaler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g., Diabetes, Cardiovascular"
                  />
                </div>
                <div>
                  <Label htmlFor="currentStock">Current Stock</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({...formData, currentStock: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="minStock">Minimum Stock</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="maxStock">Maximum Stock</Label>
                  <Input
                    id="maxStock"
                    type="number"
                    value={formData.maxStock}
                    onChange={(e) => setFormData({...formData, maxStock: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="reorderPoint">Reorder Point</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    value={formData.reorderPoint}
                    onChange={(e) => setFormData({...formData, reorderPoint: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="unitCost">Unit Cost ($)</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    step="0.01"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({...formData, unitCost: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="sellingPrice">Selling Price ($)</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({...formData, sellingPrice: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    placeholder="Enter supplier name"
                  />
                </div>
                <div>
                  <Label htmlFor="batchNumber">Batch Number</Label>
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                    placeholder="Enter batch number"
                  />
                </div>
                <div>
                  <Label htmlFor="manufacturingDate">Manufacturing Date</Label>
                  <Input
                    id="manufacturingDate"
                    type="date"
                    value={formData.manufacturingDate}
                    onChange={(e) => setFormData({...formData, manufacturingDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Storage Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., A-12-3"
                  />
                </div>
                <div>
                  <Label htmlFor="ndcNumber">NDC Number</Label>
                  <Input
                    id="ndcNumber"
                    value={formData.ndcNumber}
                    onChange={(e) => setFormData({...formData, ndcNumber: e.target.value})}
                    placeholder="12345-678-90"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSave} disabled={saveItemMutation.isPending}>
                  {saveItemMutation.isPending ? 'Saving...' : (editingItem ? 'Update' : 'Add')} Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Items</p>
                <p className="text-2xl font-bold text-orange-600">{expiringCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ${inventory.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, generic name, or batch number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant={showLowStock ? "default" : "outline"}
          onClick={() => setShowLowStock(!showLowStock)}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Low Stock ({lowStockCount})
        </Button>
        <Button 
          variant={showExpiring ? "default" : "outline"}
          onClick={() => setShowExpiring(!showExpiring)}
          className="flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Expiring ({expiringCount})
        </Button>
      </div>

      {/* Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items ({filteredInventory.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading inventory...</p>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No inventory items found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInventory.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-gray-600">{item.genericName} - {item.strength} {item.dosageForm}</p>
                      {item.brandName && (
                        <p className="text-sm text-gray-500">Brand: {item.brandName}</p>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      {getStockStatusBadge(item.stockStatus)}
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500">Current Stock</p>
                      <p className="font-semibold">{item.currentStock} units</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Min/Max</p>
                      <p className="font-semibold">{item.minStock}/{item.maxStock}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Unit Cost</p>
                      <p className="font-semibold">${item.unitCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Selling Price</p>
                      <p className="font-semibold">${item.sellingPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Expiry Date</p>
                      <p className="font-semibold">{new Date(item.expiryDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-semibold">{item.location}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-3">
                    <p>Batch: {item.batchNumber} | Supplier: {item.supplier}</p>
                    {item.ndcNumber && <p>NDC: {item.ndcNumber}</p>}
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Reorder
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => deleteItemMutation.mutate(item.id)}
                      disabled={deleteItemMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
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