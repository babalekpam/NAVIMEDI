import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  ShoppingCart,
  Truck,
  Calendar,
  MapPin,
  ThermometerSun,
  Beaker,
  Boxes,
  FileText,
  Users,
  Building2,
  Phone,
  Mail,
  CreditCard,
  Archive,
  AlertCircle,
  CheckSquare,
  Timer,
  Target,
  Gauge,
  Activity,
  Star,
  Award,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/contexts/tenant-context-fixed";
import { useTranslation } from "@/contexts/translation-context";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  category: "reagent" | "consumable" | "equipment" | "calibrator" | "control";
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  supplier: string;
  location: string;
  expiryDate?: string;
  batchNumber?: string;
  status: "in_stock" | "low_stock" | "out_of_stock" | "expired" | "near_expiry";
  lastOrdered?: string;
  lastUsed?: string;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string[];
  rating: number;
  paymentTerms: string;
  deliveryTime: number; // in days
  minOrderAmount: number;
  status: "active" | "inactive" | "pending";
  lastOrder?: string;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: "draft" | "sent" | "confirmed" | "received" | "cancelled";
  orderDate: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  createdBy: string;
  notes?: string;
}

interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface UsageData {
  itemId: string;
  itemName: string;
  usedQuantity: number;
  period: string;
  cost: number;
  department: string;
}

export default function LabInventoryManagement() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  // Mock data for demonstration
  const mockInventory: InventoryItem[] = [
    {
      id: "1",
      itemCode: "REG-001",
      name: "CBC Reagent Pack",
      category: "reagent",
      currentStock: 45,
      minStock: 20,
      maxStock: 100,
      unit: "kit",
      unitCost: 125.50,
      totalValue: 5647.50,
      supplier: "LabCorp Reagents",
      location: "Reagent Fridge A-1",
      expiryDate: "2025-12-15",
      batchNumber: "LOT-2025-089",
      status: "in_stock",
      lastOrdered: "2025-07-15",
      lastUsed: "2025-08-25"
    },
    {
      id: "2",
      itemCode: "CON-045",
      name: "Urine Collection Cups",
      category: "consumable",
      currentStock: 12,
      minStock: 50,
      maxStock: 500,
      unit: "box",
      unitCost: 35.75,
      totalValue: 429.00,
      supplier: "MedSupply Inc",
      location: "Supply Room B-3",
      status: "low_stock",
      lastOrdered: "2025-06-20",
      lastUsed: "2025-08-25"
    },
    {
      id: "3",
      itemCode: "CAL-012",
      name: "Chemistry Calibrator Set",
      category: "calibrator",
      currentStock: 8,
      minStock: 5,
      maxStock: 20,
      unit: "set",
      unitCost: 285.00,
      totalValue: 2280.00,
      supplier: "Precision Labs",
      location: "Calibrator Storage C-2",
      expiryDate: "2025-09-30",
      batchNumber: "CAL-2025-041",
      status: "near_expiry",
      lastOrdered: "2025-05-10",
      lastUsed: "2025-08-20"
    },
    {
      id: "4",
      itemCode: "QC-078",
      name: "Hematology Control Material",
      category: "control",
      currentStock: 0,
      minStock: 10,
      maxStock: 30,
      unit: "vial",
      unitCost: 45.25,
      totalValue: 0,
      supplier: "Quality Controls Ltd",
      location: "QC Storage D-1",
      status: "out_of_stock",
      lastOrdered: "2025-07-30",
      lastUsed: "2025-08-24"
    },
    {
      id: "5",
      itemCode: "REG-089",
      name: "Lipid Panel Reagents",
      category: "reagent",
      currentStock: 15,
      minStock: 10,
      maxStock: 50,
      unit: "kit",
      unitCost: 189.75,
      totalValue: 2846.25,
      supplier: "BioChem Solutions",
      location: "Reagent Fridge A-2",
      expiryDate: "2025-08-30",
      batchNumber: "LOT-2025-156",
      status: "expired",
      lastOrdered: "2025-04-15",
      lastUsed: "2025-08-15"
    }
  ];

  const mockSuppliers: Supplier[] = [
    {
      id: "1",
      name: "LabCorp Reagents",
      contactPerson: "Sarah Williams",
      email: "sarah.williams@labcorp.com",
      phone: "555-0123",
      address: "123 Science Drive, Research City, RC 12345",
      category: ["reagent", "calibrator"],
      rating: 4.8,
      paymentTerms: "Net 30",
      deliveryTime: 3,
      minOrderAmount: 500,
      status: "active",
      lastOrder: "2025-07-15"
    },
    {
      id: "2",
      name: "MedSupply Inc",
      contactPerson: "Michael Chen",
      email: "m.chen@medsupply.com",
      phone: "555-0456",
      address: "456 Medical Plaza, Healthcare City, HC 67890",
      category: ["consumable", "equipment"],
      rating: 4.5,
      paymentTerms: "Net 45",
      deliveryTime: 5,
      minOrderAmount: 250,
      status: "active",
      lastOrder: "2025-06-20"
    },
    {
      id: "3",
      name: "Precision Labs",
      contactPerson: "Dr. Emily Rodriguez",
      email: "e.rodriguez@precisionlabs.com",
      phone: "555-0789",
      address: "789 Precision Way, Calibration City, CC 13579",
      category: ["calibrator", "control"],
      rating: 4.9,
      paymentTerms: "Net 30",
      deliveryTime: 2,
      minOrderAmount: 1000,
      status: "active",
      lastOrder: "2025-05-10"
    }
  ];

  const mockPurchaseOrders: PurchaseOrder[] = [
    {
      id: "1",
      orderNumber: "PO-2025-001",
      supplier: "LabCorp Reagents",
      items: [
        { itemId: "1", itemName: "CBC Reagent Pack", quantity: 50, unitCost: 125.50, totalCost: 6275.00 },
        { itemId: "3", itemName: "Chemistry Calibrator Set", quantity: 10, unitCost: 285.00, totalCost: 2850.00 }
      ],
      totalAmount: 9125.00,
      status: "sent",
      orderDate: "2025-08-25",
      expectedDelivery: "2025-08-28",
      createdBy: "John Smith"
    },
    {
      id: "2",
      orderNumber: "PO-2025-002",
      supplier: "Quality Controls Ltd",
      items: [
        { itemId: "4", itemName: "Hematology Control Material", quantity: 25, unitCost: 45.25, totalCost: 1131.25 }
      ],
      totalAmount: 1131.25,
      status: "confirmed",
      orderDate: "2025-08-24",
      expectedDelivery: "2025-08-27",
      createdBy: "Jane Doe"
    }
  ];

  const mockUsageData: UsageData[] = [
    { itemId: "1", itemName: "CBC Reagent Pack", usedQuantity: 15, period: "This Week", cost: 1882.50, department: "Hematology" },
    { itemId: "2", itemName: "Urine Collection Cups", usedQuantity: 8, period: "This Week", cost: 286.00, department: "Urinalysis" },
    { itemId: "3", itemName: "Chemistry Calibrator Set", usedQuantity: 2, period: "This Week", cost: 570.00, department: "Chemistry" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock": return "bg-green-100 text-green-800";
      case "low_stock": return "bg-yellow-100 text-yellow-800";
      case "out_of_stock": return "bg-red-100 text-red-800";
      case "expired": return "bg-red-100 text-red-800";
      case "near_expiry": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "reagent": return "bg-blue-100 text-blue-800";
      case "consumable": return "bg-green-100 text-green-800";
      case "equipment": return "bg-purple-100 text-purple-800";
      case "calibrator": return "bg-orange-100 text-orange-800";
      case "control": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "confirmed": return "bg-green-100 text-green-800";
      case "received": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStockLevel = (current: number, min: number, max: number) => {
    const percentage = (current / max) * 100;
    if (current === 0) return { level: 0, color: "bg-red-500" };
    if (current <= min) return { level: percentage, color: "bg-yellow-500" };
    return { level: percentage, color: "bg-green-500" };
  };

  const filteredInventory = mockInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.itemCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6" data-testid="lab-inventory-management">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="h-8 w-8 mr-3 text-orange-600" />
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive inventory tracking and vendor management system
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => setIsNewItemOpen(true)}
            data-testid="button-add-item"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsNewOrderOpen(true)}
            data-testid="button-new-order"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-3xl font-bold text-gray-900">1,247</p>
                <p className="text-xs text-green-600 mt-1">567 active</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                <p className="text-3xl font-bold text-yellow-600">23</p>
                <p className="text-xs text-yellow-600 mt-1">5 critical</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-3xl font-bold text-green-600">$89.2K</p>
                <p className="text-xs text-green-600 mt-1">+12% this month</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold text-blue-600">7</p>
                <p className="text-xs text-blue-600 mt-1">$18.5K value</p>
              </div>
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory" className="flex items-center">
            <Boxes className="w-4 h-4 mr-2" />
            Inventory Items
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Purchase Orders
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center">
            <Building2 className="w-4 h-4 mr-2" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Usage Analytics
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            Alerts & Reports
          </TabsTrigger>
        </TabsList>

        {/* Inventory Items Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>Manage reagents, consumables, and equipment</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search items by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-inventory"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="reagent">Reagents</SelectItem>
                    <SelectItem value="consumable">Consumables</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="calibrator">Calibrators</SelectItem>
                    <SelectItem value="control">Controls</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="near_expiry">Near Expiry</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Inventory Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock Level</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => {
                      const stockLevel = getStockLevel(item.currentStock, item.minStock, item.maxStock);
                      return (
                        <TableRow key={item.id} data-testid={`row-item-${item.id}`}>
                          <TableCell className="font-medium">{item.itemCode}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(item.category)}>
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span>{item.currentStock} {item.unit}</span>
                                <span className="text-gray-500">/{item.maxStock}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={cn("h-2 rounded-full", stockLevel.color)}
                                  style={{width: `${stockLevel.level}%`}}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">${item.totalValue.toFixed(2)}</div>
                              <div className="text-gray-500">${item.unitCost}/{item.unit}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.expiryDate ? (
                              <div className="text-sm">
                                <div>{item.expiryDate}</div>
                                <div className="text-gray-500">{item.batchNumber}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedItem(item)}
                                data-testid={`button-view-${item.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-edit-${item.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {item.status === "low_stock" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-orange-600"
                                  data-testid={`button-reorder-${item.id}`}
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>Manage and track purchase orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockPurchaseOrders.map((order) => (
                  <Card key={order.id} className="border-l-4 border-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{order.orderNumber}</h4>
                          <p className="text-gray-600">{order.supplier}</p>
                        </div>
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-600">Order Date:</span>
                          <p className="font-medium">{order.orderDate}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Expected Delivery:</span>
                          <p className="font-medium">{order.expectedDelivery || "TBD"}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Total Amount:</span>
                          <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Items:</span>
                          <p className="font-medium">{order.items.length} items</p>
                        </div>
                      </div>

                      <div className="border rounded-lg overflow-hidden mb-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Unit Cost</TableHead>
                              <TableHead>Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {order.items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.itemName}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                                <TableCell>${item.totalCost.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                        {order.status === "sent" && (
                          <Button variant="outline" size="sm">
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Mark Received
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Management</CardTitle>
              <CardDescription>Manage vendor relationships and contacts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockSuppliers.map((supplier) => (
                  <Card key={supplier.id} className="border-l-4 border-green-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{supplier.name}</h4>
                          <p className="text-gray-600">{supplier.contactPerson}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={cn("h-4 w-4", 
                                  i < Math.floor(supplier.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                                )} 
                              />
                            ))}
                            <span className="ml-1 text-sm text-gray-600">{supplier.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{supplier.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{supplier.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-xs">{supplier.address}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-600">Payment Terms:</span>
                          <p className="font-medium">{supplier.paymentTerms}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Delivery Time:</span>
                          <p className="font-medium">{supplier.deliveryTime} days</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Min Order:</span>
                          <p className="font-medium">${supplier.minOrderAmount}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Order:</span>
                          <p className="font-medium">{supplier.lastOrder || "Never"}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="text-sm text-gray-600 mb-2 block">Categories:</span>
                        <div className="flex flex-wrap gap-2">
                          {supplier.category.map((cat, index) => (
                            <Badge key={index} variant="outline">{cat}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSupplier(supplier)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          New Order
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Analytics Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>Track consumption patterns and costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Weekly Usage Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Items Consumed</p>
                          <p className="text-3xl font-bold text-blue-600">25</p>
                          <p className="text-xs text-blue-600 mt-1">This week</p>
                        </div>
                        <Activity className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Usage Cost</p>
                          <p className="text-3xl font-bold text-green-600">$2.7K</p>
                          <p className="text-xs text-green-600 mt-1">This week</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Efficiency</p>
                          <p className="text-3xl font-bold text-purple-600">94%</p>
                          <p className="text-xs text-purple-600 mt-1">Usage vs planned</p>
                        </div>
                        <Target className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Usage Details */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity Used</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Department</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockUsageData.map((usage, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{usage.itemName}</TableCell>
                          <TableCell>{usage.usedQuantity}</TableCell>
                          <TableCell>{usage.period}</TableCell>
                          <TableCell>${usage.cost.toFixed(2)}</TableCell>
                          <TableCell>{usage.department}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts & Reports Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
                <CardDescription>Critical inventory notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "critical", message: "4 items out of stock", count: 4, icon: XCircle, color: "text-red-600" },
                    { type: "warning", message: "23 items below minimum stock", count: 23, icon: AlertTriangle, color: "text-yellow-600" },
                    { type: "expiry", message: "8 items expiring within 30 days", count: 8, icon: Clock, color: "text-orange-600" },
                    { type: "info", message: "12 pending purchase orders", count: 12, icon: Truck, color: "text-blue-600" }
                  ].map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <alert.icon className={cn("h-5 w-5", alert.color)} />
                        <span className="font-medium">{alert.message}</span>
                      </div>
                      <Badge variant="outline">{alert.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Reports</CardTitle>
                <CardDescription>Generate inventory reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Inventory Valuation Report", icon: DollarSign },
                    { name: "Low Stock Report", icon: AlertTriangle },
                    { name: "Expiry Report", icon: Calendar },
                    { name: "Usage Analysis", icon: BarChart3 },
                    { name: "Vendor Performance", icon: Building2 },
                    { name: "Cost Analysis", icon: TrendingUp }
                  ].map((report, index) => (
                    <Button key={index} variant="outline" className="w-full justify-start">
                      <report.icon className="h-4 w-4 mr-2" />
                      {report.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Item Details Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Item Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Item Code</Label>
                  <p className="text-sm text-gray-900">{selectedItem.itemCode}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-gray-900">{selectedItem.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <Badge className={getCategoryColor(selectedItem.category)}>
                    {selectedItem.category}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Stock</Label>
                  <p className="text-sm text-gray-900">{selectedItem.currentStock} {selectedItem.unit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Min Stock</Label>
                  <p className="text-sm text-gray-900">{selectedItem.minStock} {selectedItem.unit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Max Stock</Label>
                  <p className="text-sm text-gray-900">{selectedItem.maxStock} {selectedItem.unit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Unit Cost</Label>
                  <p className="text-sm text-gray-900">${selectedItem.unitCost.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Value</Label>
                  <p className="text-sm text-gray-900">${selectedItem.totalValue.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Supplier</Label>
                  <p className="text-sm text-gray-900">{selectedItem.supplier}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm text-gray-900">{selectedItem.location}</p>
                </div>
                {selectedItem.expiryDate && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Expiry Date</Label>
                      <p className="text-sm text-gray-900">{selectedItem.expiryDate}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Batch Number</Label>
                      <p className="text-sm text-gray-900">{selectedItem.batchNumber}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedItem(null)}>
              Close
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Edit Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Item Dialog */}
      <Dialog open={isNewItemOpen} onOpenChange={setIsNewItemOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <DialogDescription>
              Enter details for the new inventory item
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-code">Item Code</Label>
                <Input id="item-code" placeholder="Enter item code" />
              </div>
              <div>
                <Label htmlFor="item-name">Item Name</Label>
                <Input id="item-name" placeholder="Enter item name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reagent">Reagent</SelectItem>
                    <SelectItem value="consumable">Consumable</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="calibrator">Calibrator</SelectItem>
                    <SelectItem value="control">Control</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSuppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="min-stock">Min Stock</Label>
                <Input id="min-stock" type="number" placeholder="Minimum" />
              </div>
              <div>
                <Label htmlFor="max-stock">Max Stock</Label>
                <Input id="max-stock" type="number" placeholder="Maximum" />
              </div>
              <div>
                <Label htmlFor="unit-cost">Unit Cost</Label>
                <Input id="unit-cost" type="number" placeholder="Cost per unit" />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Storage Location</Label>
              <Input id="location" placeholder="Enter storage location" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewItemOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}