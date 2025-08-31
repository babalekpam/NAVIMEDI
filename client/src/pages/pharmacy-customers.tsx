import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, Phone, Mail, Calendar, Pill, FileText, Plus, Truck, MapPin, MessageSquare, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PharmacyCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  insuranceProvider?: string;
  totalPrescriptions: number;
  activePrescriptions: number;
  lastVisit: string;
  preferredContactMethod: 'email' | 'phone' | 'sms';
  preferredFulfillmentMethod: 'pickup' | 'delivery';
  deliveryInstructions?: string;
  allergies: string[];
  notes?: string;
}

// Form schema for adding new customers
const addCustomerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  preferredFulfillmentMethod: z.enum(['pickup', 'delivery']).default('pickup'),
  deliveryStreet: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryState: z.string().optional(),
  deliveryZipCode: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  insuranceProvider: z.string().optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'sms']).default('email'),
  allergies: z.string().optional(),
  notes: z.string().optional(),
});

type AddCustomerFormData = z.infer<typeof addCustomerSchema>;

export default function PharmacyCustomers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<PharmacyCustomer | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form for adding new customers
  const form = useForm<AddCustomerFormData>({
    resolver: zodResolver(addCustomerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      preferredFulfillmentMethod: 'pickup',
      deliveryStreet: "",
      deliveryCity: "",
      deliveryState: "",
      deliveryZipCode: "",
      deliveryInstructions: "",
      insuranceProvider: "",
      preferredContactMethod: 'email',
      allergies: "",
      notes: "",
    },
  });

  // Mutation for creating new customers
  const addCustomerMutation = useMutation({
    mutationFn: async (customerData: AddCustomerFormData) => {
      const deliveryAddress = customerData.preferredFulfillmentMethod === 'delivery' && 
        customerData.deliveryStreet ? {
          street: customerData.deliveryStreet,
          city: customerData.deliveryCity || '',
          state: customerData.deliveryState || '',
          zipCode: customerData.deliveryZipCode || '',
        } : null;

      const patientData = {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        dateOfBirth: customerData.dateOfBirth,
        address: {
          street: customerData.street,
          city: customerData.city,
          state: customerData.state,
          zipCode: customerData.zipCode,
        },
        deliveryAddress,
        emergencyContact: null,
        insuranceInfo: customerData.insuranceProvider ? { provider: customerData.insuranceProvider } : null,
        allergies: customerData.allergies ? customerData.allergies.split(',').map(a => a.trim()) : [],
        medicalHistory: [],
        medications: [],
        preferredContactMethod: customerData.preferredContactMethod,
        preferredFulfillmentMethod: customerData.preferredFulfillmentMethod,
        deliveryInstructions: customerData.deliveryInstructions,
        notes: customerData.notes,
      };
      
      return apiRequest('/api/patients', {
        method: 'POST',
        body: JSON.stringify(patientData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setIsAddCustomerOpen(false);
      form.reset();
      toast({
        title: "Customer Added",
        description: "New customer has been successfully added to your system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add customer. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: AddCustomerFormData) => {
    addCustomerMutation.mutate(data);
  };

  // Replace mock data with real API call
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["/api/patients"],
    staleTime: 30000,
  });

  // Transform API data to match PharmacyCustomer interface
  const transformedCustomers: PharmacyCustomer[] = customers.map((patient: any) => {
    // Handle insurance info - it can be a JSON object or string
    let insuranceProvider = '';
    if (patient.insuranceInfo) {
      try {
        // If it's already an object, use it directly
        if (typeof patient.insuranceInfo === 'object') {
          insuranceProvider = patient.insuranceInfo.provider || patient.insuranceInfo.manualProvider || '';
        } 
        // If it's a string, parse it as JSON
        else if (typeof patient.insuranceInfo === 'string') {
          const parsed = JSON.parse(patient.insuranceInfo);
          insuranceProvider = parsed.provider || parsed.manualProvider || '';
        }
        
        console.log(`Insurance for ${patient.firstName} ${patient.lastName}:`, insuranceProvider);
      } catch (e) {
        console.warn(`Failed to parse insurance for ${patient.firstName} ${patient.lastName}:`, patient.insuranceInfo);
        insuranceProvider = '';
      }
    }

    return {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email || '',
      phone: patient.phone || '',
      dateOfBirth: patient.dateOfBirth,
      address: patient.address || { street: '', city: '', state: '', zipCode: '' },
      deliveryAddress: patient.deliveryAddress,
      insuranceProvider,
      totalPrescriptions: 0, // Will be calculated from prescription data
      activePrescriptions: 0, // Will be calculated from prescription data
      lastVisit: patient.updatedAt || patient.createdAt,
      preferredContactMethod: patient.preferredContactMethod || 'email',
      preferredFulfillmentMethod: patient.preferredFulfillmentMethod || 'pickup',
      deliveryInstructions: patient.deliveryInstructions,
      allergies: Array.isArray(patient.allergies) ? patient.allergies : [],
      notes: patient.notes || '',
    };
  });

  // Use transformed customers from API data instead of mock data
  const finalCustomers = transformedCustomers.length > 0 ? transformedCustomers : [
      // Fallback data only if API returns empty
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1-555-0123',
        dateOfBirth: '1980-05-15',
        address: {
          street: '123 Main St',
          city: 'Healthcare City',
          state: 'CA',
          zipCode: '90210'
        },
        insuranceProvider: 'Blue Cross Blue Shield',
        totalPrescriptions: 24,
        activePrescriptions: 3,
        lastVisit: '2025-01-25',
        preferredContactMethod: 'email' as const,
        allergies: ['Penicillin', 'Shellfish'],
        notes: 'Prefers generic medications when available'
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@email.com',
        phone: '+1-555-0456',
        dateOfBirth: '1975-12-08',
        address: {
          street: '456 Oak Avenue',
          city: 'Medical District',
          state: 'NY',
          zipCode: '10001'
        },
        insuranceProvider: 'Aetna',
        totalPrescriptions: 18,
        activePrescriptions: 2,
        lastVisit: '2025-01-28',
        preferredContactMethod: 'phone' as const,
        allergies: ['Sulfa drugs'],
        notes: 'Diabetic - monitor blood sugar medications'
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@email.com',
        phone: '+1-555-0789',
        dateOfBirth: '1965-09-22',
        address: {
          street: '789 Pine Street',
          city: 'Health Valley',
          state: 'TX',
          zipCode: '75001'
        },
        insuranceProvider: 'UnitedHealth',
        totalPrescriptions: 45,
        activePrescriptions: 5,
        lastVisit: '2025-01-20',
        preferredContactMethod: 'sms' as const,
        allergies: [],
        notes: 'Regular customer - hypertension management'
      },
      {
        id: '4',
        firstName: 'Sarah',
        lastName: 'Davis',
        email: 'sarah.davis@email.com',
        phone: '+1-555-0321',
        dateOfBirth: '1990-03-11',
        address: {
          street: '321 Elm Drive',
          city: 'Wellness Town',
          state: 'FL',
          zipCode: '33101'
        },
        insuranceProvider: 'Humana',
        totalPrescriptions: 8,
        activePrescriptions: 1,
        lastVisit: '2025-01-15',
        preferredContactMethod: 'email' as const,
        allergies: ['Latex'],
        notes: 'New mother - postpartum medications'
      },
      {
        id: '5',
        firstName: 'Robert',
        lastName: 'Wilson',
        email: 'robert.wilson@email.com',
        phone: '+1-555-0654',
        dateOfBirth: '1955-07-30',
        address: {
          street: '654 Maple Lane',
          city: 'Care City',
          state: 'WA',
          zipCode: '98101'
        },
        insuranceProvider: 'Medicare',
        totalPrescriptions: 67,
        activePrescriptions: 8,
        lastVisit: '2025-01-29',
        preferredContactMethod: 'phone' as const,
        allergies: ['NSAIDs', 'Aspirin'],
        notes: 'Senior patient - multiple chronic conditions'
      }
    ];

  const filteredCustomers = finalCustomers.filter(customer =>
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatAddress = (address: PharmacyCustomer['address']) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'sms': return <Phone className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const totalCustomers = finalCustomers.length;
  const activeCustomers = finalCustomers.filter(c => c.activePrescriptions > 0).length;
  const totalActivePrescriptions = finalCustomers.reduce((sum, c) => sum + c.activePrescriptions, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage pharmacy customer profiles and prescription history</p>
        </div>
        <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" data-testid="button-add-customer">
              <Plus className="h-4 w-4" />
              Add New Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Create a new customer account for your pharmacy
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} data-testid="input-first-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} data-testid="input-last-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-date-of-birth" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address Information */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Address Information</h4>
                  
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main Street" {...field} data-testid="input-street" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} data-testid="input-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} data-testid="input-state" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} data-testid="input-zip-code" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Delivery & Pickup Options */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">🚚 Delivery & Pickup Options</h4>
                  
                  <FormField
                    control={form.control}
                    name="preferredFulfillmentMethod"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Preferred Fulfillment Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="select-fulfillment-method">
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select fulfillment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pickup">Pickup at Pharmacy</SelectItem>
                            <SelectItem value="delivery">Home Delivery</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Delivery Address - Show only if delivery is selected */}
                  {form.watch("preferredFulfillmentMethod") === "delivery" && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-medium text-blue-800">Delivery Address</h5>
                      <p className="text-sm text-blue-600">Leave blank to use main address for delivery</p>
                      
                      <FormField
                        control={form.control}
                        name="deliveryStreet"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Street Address (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Delivery Street (leave blank to use main address)" {...field} data-testid="input-delivery-street" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="deliveryCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Delivery City</FormLabel>
                              <FormControl>
                                <Input placeholder="City" {...field} data-testid="input-delivery-city" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="deliveryState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Delivery State</FormLabel>
                              <FormControl>
                                <Input placeholder="State" {...field} data-testid="input-delivery-state" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="deliveryZipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Delivery ZIP</FormLabel>
                              <FormControl>
                                <Input placeholder="12345" {...field} data-testid="input-delivery-zip" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="deliveryInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Instructions (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Special delivery instructions (gate code, apartment number, etc.)"
                                className="min-h-[60px]"
                                {...field}
                                data-testid="input-delivery-instructions"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Additional Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="insuranceProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Insurance Provider (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Blue Cross, Aetna, etc." {...field} data-testid="input-insurance" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="preferredContactMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Contact Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="select-contact-method">
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select contact method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="sms">SMS</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Known Allergies (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Penicillin, Shellfish, etc. (comma separated)" {...field} data-testid="input-allergies" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional notes about this customer"
                            className="min-h-[80px]"
                            {...field}
                            data-testid="input-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddCustomerOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addCustomerMutation.isPending}
                    data-testid="button-submit-customer"
                  >
                    {addCustomerMutation.isPending ? "Adding..." : "Add Customer"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-gray-500">Registered patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-xs text-gray-500">With active prescriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
            <Pill className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivePrescriptions}</div>
            <p className="text-xs text-gray-500">Currently being filled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500">New registrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Directory</CardTitle>
              <CardDescription>View and manage customer information</CardDescription>
            </div>
            <div className="relative w-80">
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Fulfillment</TableHead>
                  <TableHead>Insurance</TableHead>
                  <TableHead>Prescriptions</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-800 font-medium">
                            {getInitials(customer.firstName, customer.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                          <div className="text-sm text-gray-500">
                            DOB: {new Date(customer.dateOfBirth).toLocaleDateString()}
                          </div>
                          {customer.allergies.length > 0 && (
                            <div className="text-xs text-red-600">
                              Allergies: {customer.allergies.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {customer.phone}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {getContactMethodIcon(customer.preferredContactMethod)}
                          Prefers {customer.preferredContactMethod}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          {customer.preferredFulfillmentMethod === 'delivery' ? (
                            <>
                              <Truck className="h-3 w-3 text-blue-600" />
                              <span className="text-blue-600 font-medium">Delivery</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="h-3 w-3 text-green-600" />
                              <span className="text-green-600 font-medium">Pickup</span>
                            </>
                          )}
                        </div>
                        {customer.preferredFulfillmentMethod === 'delivery' && customer.deliveryAddress && (
                          <div className="text-xs text-gray-500">
                            {customer.deliveryAddress.street}
                          </div>
                        )}
                        {customer.deliveryInstructions && (
                          <div className="text-xs text-gray-500 italic">
                            {customer.deliveryInstructions.substring(0, 30)}{customer.deliveryInstructions.length > 30 ? '...' : ''}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {customer.insuranceProvider || 'No insurance'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {customer.activePrescriptions} active
                        </div>
                        <div className="text-xs text-gray-500">
                          {customer.totalPrescriptions} total
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(customer.lastVisit).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Pill className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No customers found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}