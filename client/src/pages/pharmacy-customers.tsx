import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Phone, Mail, Calendar, Pill, FileText, Plus } from "lucide-react";

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
  insuranceProvider?: string;
  totalPrescriptions: number;
  activePrescriptions: number;
  lastVisit: string;
  preferredContactMethod: 'email' | 'phone' | 'sms';
  allergies: string[];
  notes?: string;
}

export default function PharmacyCustomers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<PharmacyCustomer | null>(null);

  // Mock data for pharmacy customers
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["/api/pharmacy/customers"],
    queryFn: () => Promise.resolve([
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
    ]),
    staleTime: 30000,
  });

  const filteredCustomers = customers.filter(customer =>
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

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.activePrescriptions > 0).length;
  const totalActivePrescriptions = customers.reduce((sum, c) => sum + c.activePrescriptions, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage pharmacy customer profiles and prescription history</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Customer
        </Button>
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