import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Search, 
  CreditCard, 
  DollarSign, 
  Receipt, 
  Trash2,
  User,
  Pill,
  Package,
  Calculator,
  Printer,
  Mail,
  Phone,
  Clock,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CartItem {
  id: string;
  type: 'prescription' | 'otc' | 'product';
  name: string;
  strength?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  insuranceCovered: boolean;
  copay?: number;
  prescriptionId?: string;
  notes?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    copay: number;
  };
}

interface PaymentMethod {
  type: 'cash' | 'card' | 'insurance' | 'hsa' | 'check';
  amount: number;
}

interface Transaction {
  id: string;
  customerId?: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  insuranceAmount: number;
  totalAmount: number;
  paymentMethods: PaymentMethod[];
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export function PharmacyPOS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [cashAmount, setCashAmount] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch ready prescriptions
  const { data: readyPrescriptions = [] } = useQuery({
    queryKey: ['/api/pharmacy/prescriptions/ready']
  });

  const { data: otcProducts = [] } = useQuery({
    queryKey: ['/api/pharmacy/otc-products']
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/pharmacy/customers']
  });

  // Process sale mutation
  const processSaleMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      return apiRequest('/api/pharmacy/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionData)
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/pharmacy/transactions'] });
      toast({
        title: "Sale Completed",
        description: `Transaction completed successfully. Receipt #${data.receiptNumber}`
      });
      clearCart();
      setIsCheckoutOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to process transaction",
        variant: "destructive"
      });
    }
  });

  const addToCart = (item: any, type: 'prescription' | 'otc' | 'product') => {
    const cartItem: CartItem = {
      id: item.id,
      type,
      name: item.name || item.medicationName,
      strength: item.strength,
      quantity: 1,
      unitPrice: item.price || item.copay || item.totalPrice,
      totalPrice: item.price || item.copay || item.totalPrice,
      insuranceCovered: type === 'prescription' && item.insuranceCovered,
      copay: item.copay,
      prescriptionId: type === 'prescription' ? item.id : undefined
    };

    const existingItemIndex = cart.findIndex(c => c.id === item.id && c.type === type);
    if (existingItemIndex >= 0) {
      updateQuantity(existingItemIndex, cart[existingItemIndex].quantity + 1);
    } else {
      setCart([...cart, cartItem]);
    }
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    updatedCart[index].totalPrice = updatedCart[index].unitPrice * newQuantity;
    setCart(updatedCart);
  };

  const removeFromCart = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setPaymentMethods([]);
    setCashAmount(0);
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const insuranceAmount = cart.reduce((sum, item) => {
      return sum + (item.insuranceCovered ? item.totalPrice - (item.copay || 0) : 0);
    }, 0);
    const tax = (subtotal - insuranceAmount) * 0.08; // 8% tax on non-insurance items
    const total = subtotal + tax - insuranceAmount;
    
    return { subtotal, tax, insuranceAmount, total };
  };

  const handleCheckout = () => {
    const totals = calculateTotals();
    const transactionData = {
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || 'Walk-in Customer',
      items: cart,
      subtotal: totals.subtotal,
      tax: totals.tax,
      insuranceAmount: totals.insuranceAmount,
      totalAmount: totals.total,
      paymentMethods,
      status: 'completed'
    };

    processSaleMutation.mutate(transactionData);
  };

  const addPaymentMethod = (type: PaymentMethod['type'], amount: number) => {
    const newPayment: PaymentMethod = { type, amount };
    setPaymentMethods([...paymentMethods, newPayment]);
  };

  const removePaymentMethod = (index: number) => {
    setPaymentMethods(paymentMethods.filter((_, i) => i !== index));
  };

  const totals = calculateTotals();
  const totalPaid = paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
  const remainingBalance = totals.total - totalPaid;
  const changeAmount = totalPaid > totals.total ? totalPaid - totals.total : 0;

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen max-h-screen overflow-hidden">
      {/* Product Selection */}
      <div className="lg:col-span-2 space-y-4 overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Point of Sale</h2>
          <div className="flex gap-2">
            <Dialog open={isCustomerSearchOpen} onOpenChange={setIsCustomerSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {selectedCustomer ? selectedCustomer.name : 'Select Customer'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select Customer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredCustomers.map(customer => (
                      <div
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsCustomerSearchOpen(false);
                        }}
                        className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                      >
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.phone}</p>
                        {customer.insuranceInfo && (
                          <p className="text-xs text-blue-600">{customer.insuranceInfo.provider}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Ready Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5" />
              Ready Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {readyPrescriptions.map(prescription => (
                <div key={prescription.id} className="border rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{prescription.patientName}</p>
                      <p className="text-sm text-gray-600">{prescription.medicationName}</p>
                    </div>
                    <p className="font-semibold text-green-600">${prescription.totalPrice.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">Qty: {prescription.quantity}</p>
                    <Button
                      size="sm"
                      onClick={() => addToCart(prescription, 'prescription')}
                      className="flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* OTC Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              OTC Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {otcProducts.map(product => (
                <div key={product.id} className="border rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                    <p className="font-semibold">${product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                    <Button
                      size="sm"
                      onClick={() => addToCart(product, 'otc')}
                      className="flex items-center gap-1"
                      disabled={product.stock === 0}
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart and Checkout */}
      <div className="space-y-4">
        <Card className="h-full max-h-screen overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Cart ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${item.type}`} className="border rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        {item.strength && (
                          <p className="text-xs text-gray-600">{item.strength}</p>
                        )}
                        {item.insuranceCovered && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">Insurance</Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(index)}
                        className="p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="font-semibold text-sm">${item.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          {cart.length > 0 && (
            <div className="p-4 border-t">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                {totals.insuranceAmount > 0 && (
                  <div className="flex justify-between text-sm text-blue-600">
                    <span>Insurance:</span>
                    <span>-${totals.insuranceAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>${totals.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${totals.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => setIsCheckoutOpen(true)}
                  disabled={cart.length === 0}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Order Summary */}
            <div>
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="bg-gray-50 p-4 rounded">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${totals.subtotal.toFixed(2)}</span>
                  </div>
                  {totals.insuranceAmount > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Insurance Coverage:</span>
                      <span>-${totals.insuranceAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${totals.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Due:</span>
                    <span>${totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h3 className="font-semibold mb-3">Payment</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  variant="outline"
                  onClick={() => addPaymentMethod('cash', remainingBalance)}
                  disabled={remainingBalance <= 0}
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Cash
                </Button>
                <Button
                  variant="outline"
                  onClick={() => addPaymentMethod('card', remainingBalance)}
                  disabled={remainingBalance <= 0}
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  Card
                </Button>
                <Button
                  variant="outline"
                  onClick={() => addPaymentMethod('hsa', remainingBalance)}
                  disabled={remainingBalance <= 0}
                >
                  <Calculator className="w-4 h-4 mr-1" />
                  HSA
                </Button>
              </div>

              {paymentMethods.length > 0 && (
                <div className="space-y-2 mb-4">
                  {paymentMethods.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="capitalize">{payment.type}: ${payment.amount.toFixed(2)}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removePaymentMethod(index)}
                        className="p-1"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Paid:</span>
                  <span>${totalPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className={remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}>
                    ${remainingBalance.toFixed(2)}
                  </span>
                </div>
                {changeAmount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Change Due:</span>
                    <span>${changeAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCheckout}
                disabled={remainingBalance > 0 || processSaleMutation.isPending}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {processSaleMutation.isPending ? 'Processing...' : 'Complete Sale'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}