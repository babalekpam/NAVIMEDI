import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Clock, 
  Shield,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const pharmacyRegistrationSchema = z.object({
  // Organization Details
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  subdomain: z.string().min(3, "Subdomain must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
  
  // Contact Information
  address: z.string().min(10, "Address must be at least 10 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Valid ZIP code is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email address is required"),
  
  // Pharmacy Licensing
  pharmacyLicense: z.string().min(5, "Pharmacy license number is required"),
  deaNumber: z.string().min(5, "DEA number is required"),
  taxId: z.string().min(9, "Tax ID is required"),
  
  // Administrator Details
  adminFirstName: z.string().min(2, "First name is required"),
  adminLastName: z.string().min(2, "Last name is required"),
  adminEmail: z.string().email("Valid email address is required"),
  adminPhone: z.string().min(10, "Valid phone number is required"),
  adminLicense: z.string().min(5, "Pharmacist license is required"),
  
  // Services
  services: z.array(z.string()).min(1, "At least one service must be selected"),
  operatingHours: z.string().min(10, "Operating hours are required"),
  specializations: z.array(z.string()).optional(),
  
  // Insurance and Network
  insuranceNetworks: z.array(z.string()).optional(),
  acceptsInsurance: z.boolean().default(true),
  
  // Additional Information
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

type PharmacyRegistrationForm = z.infer<typeof pharmacyRegistrationSchema>;

const pharmacyServices = [
  "Prescription Dispensing",
  "Medication Counseling", 
  "Immunizations/Vaccinations",
  "Medication Therapy Management",
  "Compounding Services",
  "Specialty Medications",
  "Home Delivery",
  "24/7 Emergency Services",
  "Clinical Consultations",
  "Medication Synchronization"
];

const pharmacySpecializations = [
  "Oncology",
  "Pediatrics", 
  "Geriatrics",
  "Mental Health",
  "Diabetes Care",
  "Pain Management",
  "Respiratory Care",
  "Cardiology",
  "Dermatology",
  "Women's Health"
];

const insuranceNetworks = [
  "Blue Cross Blue Shield",
  "Aetna",
  "Cigna", 
  "UnitedHealth",
  "Humana",
  "Medicare",
  "Medicaid",
  "CVS Caremark",
  "Express Scripts",
  "OptumRx"
];

export default function PharmacyRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [registrationStep, setRegistrationStep] = useState<'form' | 'review' | 'submitted'>('form');

  const form = useForm<PharmacyRegistrationForm>({
    resolver: zodResolver(pharmacyRegistrationSchema),
    defaultValues: {
      services: [],
      specializations: [],
      insuranceNetworks: [],
      acceptsInsurance: true,
      description: "",
      website: ""
    }
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: PharmacyRegistrationForm) => {
      const registrationData = {
        // Tenant information
        tenant: {
          name: data.organizationName,
          type: "pharmacy",
          subdomain: data.subdomain,
          settings: {
            address: `${data.address}, ${data.city}, ${data.state} ${data.zipCode}`,
            phone: data.phone,
            email: data.email,
            licenseNumber: data.pharmacyLicense,
            deaNumber: data.deaNumber,
            taxId: data.taxId,
            services: data.services,
            specializations: data.specializations || [],
            operatingHours: data.operatingHours,
            insuranceNetworks: data.insuranceNetworks || [],
            acceptsInsurance: data.acceptsInsurance,
            description: data.description,
            website: data.website
          }
        },
        // Admin user information
        admin: {
          firstName: data.adminFirstName,
          lastName: data.adminLastName,
          email: data.adminEmail,
          phone: data.adminPhone,
          licenseNumber: data.adminLicense,
          role: "tenant_admin"
        }
      };

      const response = await fetch("/api/pharmacy-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      return response.json();
    },
    onSuccess: () => {
      setRegistrationStep('submitted');
      toast({
        title: "Registration Submitted",
        description: "Your pharmacy registration has been submitted for review. You'll receive confirmation within 24-48 hours."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: PharmacyRegistrationForm) => {
    setRegistrationStep('review');
  };

  const handleConfirmRegistration = () => {
    registrationMutation.mutate(form.getValues());
  };

  if (registrationStep === 'submitted') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Registration Submitted!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your pharmacy registration has been submitted successfully. Our team will review your application and contact you within 24-48 hours.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Application review and verification</li>
                <li>• Account setup and credentials</li>
                <li>• System onboarding and training</li>
                <li>• Integration with healthcare providers</li>
              </ul>
            </div>
            <Button onClick={() => setLocation("/")} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (registrationStep === 'review') {
    const formData = form.getValues();
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <span>Review Registration Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Organization Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Organization Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {formData.organizationName}
                  </div>
                  <div>
                    <span className="font-medium">Subdomain:</span> {formData.subdomain}.navimed.app
                  </div>
                  <div>
                    <span className="font-medium">Address:</span> {formData.address}, {formData.city}, {formData.state} {formData.zipCode}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {formData.phone}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {formData.email}
                  </div>
                  <div>
                    <span className="font-medium">License:</span> {formData.pharmacyLicense}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Administrator Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Administrator Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {formData.adminFirstName} {formData.adminLastName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {formData.adminEmail}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {formData.adminPhone}
                  </div>
                  <div>
                    <span className="font-medium">License:</span> {formData.adminLicense}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Services */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Services & Specializations</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Services:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.services.map((service) => (
                        <Badge key={service} variant="outline">{service}</Badge>
                      ))}
                    </div>
                  </div>
                  {formData.specializations && formData.specializations.length > 0 && (
                    <div>
                      <span className="font-medium">Specializations:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.specializations.map((spec) => (
                          <Badge key={spec} variant="secondary">{spec}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setRegistrationStep('form')}>
                  Back to Edit
                </Button>
                <Button 
                  onClick={handleConfirmRegistration}
                  disabled={registrationMutation.isPending}
                >
                  {registrationMutation.isPending ? "Submitting..." : "Confirm Registration"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Pharmacy</h1>
          <p className="text-gray-600">Join the NAVIMED network as an independent pharmacy organization</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Organization Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span>Organization Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pharmacy Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., City Center Pharmacy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subdomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subdomain *</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <Input placeholder="citycenter" {...field} />
                            <span className="flex items-center px-3 bg-gray-100 border border-l-0 rounded-r text-sm text-gray-600">
                              .navimed.app
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
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
                        <FormLabel>State *</FormLabel>
                        <FormControl>
                          <Input placeholder="NY" {...field} />
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
                        <FormLabel>ZIP Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
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
                        <FormLabel>Phone Number *</FormLabel>
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
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="info@pharmacy.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Licensing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span>Licensing & Certification</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="pharmacyLicense"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pharmacy License Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="PH123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="deaNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DEA Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="AB1234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax ID (EIN) *</FormLabel>
                        <FormControl>
                          <Input placeholder="12-3456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Administrator Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span>Administrator Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="adminFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="adminLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="adminEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="admin@pharmacy.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="adminPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="adminLicense"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pharmacist License Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="RPH123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Services & Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span>Services & Operations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="services"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Services Offered * (Select all that apply)</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {pharmacyServices.map((service) => (
                          <label key={service} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={field.value.includes(service)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([...field.value, service]);
                                } else {
                                  field.onChange(field.value.filter(s => s !== service));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <span>{service}</span>
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operatingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating Hours *</FormLabel>
                      <FormControl>
                        <Input placeholder="Mon-Fri: 8AM-8PM, Sat: 9AM-6PM, Sun: 10AM-4PM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specializations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specializations (Optional)</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {pharmacySpecializations.map((spec) => (
                          <label key={spec} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={field.value?.includes(spec) || false}
                              onChange={(e) => {
                                const current = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([...current, spec]);
                                } else {
                                  field.onChange(current.filter(s => s !== spec));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <span>{spec}</span>
                          </label>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg" className="px-8">
                Review Registration
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}