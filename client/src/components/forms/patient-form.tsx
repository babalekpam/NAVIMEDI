import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPatientSchema, type Pharmacy } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, MapPin } from "lucide-react";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

interface PatientFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const PatientForm = ({ onSubmit, isLoading = false }: PatientFormProps) => {
  const patientFormSchema = insertPatientSchema.omit({ 
    tenantId: true, 
    mrn: true,
    dateOfBirth: true 
  }).extend({
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional()
    }).optional(),
    emergencyContact: z.object({
      name: z.string().optional(),
      relationship: z.string().optional(),
      phone: z.string().optional()
    }).optional(),
    insuranceInfo: z.object({
      provider: z.string().optional(),
      policyNumber: z.string().optional(),
      groupNumber: z.string().optional()
    }).optional(),
    preferredPharmacyId: z.string().optional()
  });

  const form = useForm({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      phone: "",
      email: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "USA"
      },
      emergencyContact: {
        name: "",
        relationship: "",
        phone: ""
      },
      insuranceInfo: {
        provider: "",
        policyNumber: "",
        groupNumber: ""
      },
      medicalHistory: [],
      allergies: [],
      medications: [],
      preferredPharmacyId: ""
    }
  });

  // Fetch pharmacies for selection
  const { data: pharmacies = [], isLoading: pharmaciesLoading } = useQuery({
    queryKey: ["/api/pharmacies"],
    queryFn: async () => {
      const response = await fetch("/api/pharmacies");
      if (!response.ok) throw new Error("Failed to fetch pharmacies");
      return response.json() as Promise<Pharmacy[]>;
    }
  });

  const handleSubmit = (data: any) => {
    // Send dateOfBirth as string - server will handle the conversion
    const patientData = {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth, // Keep as string
      gender: data.gender || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      address: data.address && (data.address.street || data.address.city || data.address.state || data.address.zipCode) 
        ? data.address 
        : undefined,
      emergencyContact: data.emergencyContact && (data.emergencyContact.name || data.emergencyContact.phone) 
        ? data.emergencyContact 
        : undefined,
      insuranceInfo: data.insuranceInfo && (data.insuranceInfo.provider || data.insuranceInfo.policyNumber) 
        ? data.insuranceInfo 
        : undefined,
      medicalHistory: data.medicalHistory || [],
      allergies: data.allergies || [],
      medications: data.medications || []
    };
    onSubmit(patientData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
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
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="patient@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code</FormLabel>
                  <FormControl>
                    <Input placeholder="12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Preferred Pharmacy</h3>
          <FormField
            control={form.control}
            name="preferredPharmacyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Preferred Pharmacy</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a pharmacy (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {pharmaciesLoading ? (
                      <SelectItem value="loading" disabled>Loading pharmacies...</SelectItem>
                    ) : pharmacies.length === 0 ? (
                      <SelectItem value="none" disabled>No pharmacies available</SelectItem>
                    ) : (
                      pharmacies.map((pharmacy) => (
                        <SelectItem key={pharmacy.id} value={pharmacy.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              <Building2 className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{pharmacy.name}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{pharmacy.phone}</span>
                              </div>
                              {pharmacy.deliveryService && (
                                <Badge variant="secondary" className="text-xs">Delivery</Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Selected pharmacy details */}
          {form.watch("preferredPharmacyId") && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              {(() => {
                const selectedPharmacy = pharmacies.find(p => p.id === form.watch("preferredPharmacyId"));
                if (!selectedPharmacy) return null;
                
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-blue-900">{selectedPharmacy.name}</h4>
                      {selectedPharmacy.deliveryService && (
                        <Badge className="bg-blue-600">Delivery Available</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{selectedPharmacy.phone}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {selectedPharmacy.address?.street}, {selectedPharmacy.address?.city}
                        </span>
                      </div>
                    </div>

                    {selectedPharmacy.specializations && selectedPharmacy.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedPharmacy.specializations.map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-blue-700 border-blue-300">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="emergencyContact.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Emergency contact name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyContact.relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Spouse, Parent, Sibling" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="emergencyContact.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? "Creating..." : "Create Patient"}
          </Button>
        </div>
      </form>
    </Form>
  );
};