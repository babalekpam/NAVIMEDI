import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Building2, Clock, Award, Globe } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { insertLaboratoryApplicationSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type LaboratoryApplicationForm = z.infer<typeof insertLaboratoryApplicationSchema>;

const specializations = [
  "Hematology", "Chemistry", "Microbiology", "Immunology", "Pathology",
  "Molecular Diagnostics", "Genetics", "Toxicology", "Endocrinology",
  "Cardiology", "Oncology", "Infectious Disease", "Blood Banking"
];

const accreditationOptions = [
  "CAP (College of American Pathologists)",
  "CLIA (Clinical Laboratory Improvement Amendments)",
  "ISO 15189",
  "NABL (National Accreditation Board for Testing)",
  "JCI (Joint Commission International)",
  "AABB (American Association of Blood Banks)"
];

const servicesOptions = [
  "Routine Blood Work", "Emergency Testing", "Specialized Diagnostics",
  "Point-of-Care Testing", "Home Collection", "24/7 Operations",
  "Pathology Services", "Genetic Testing", "Drug Testing",
  "COVID-19 Testing", "Cancer Screening", "Infectious Disease Testing"
];

export function LaboratoryApplicationForm() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<LaboratoryApplicationForm>({
    resolver: zodResolver(insertLaboratoryApplicationSchema),
    defaultValues: {
      laboratoryName: "",
      licenseNumber: "",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States"
      },
      specializations: [],
      description: "",
      websiteUrl: "",
      accreditations: [],
      averageTurnaroundTime: 24,
      operatingHours: {},
      servicesOffered: [],
      equipmentDetails: "",
      certificationDocuments: []
    }
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (data: LaboratoryApplicationForm) => {
      const response = await fetch("/api/laboratory-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error("Failed to submit application");
      }
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Application Submitted",
        description: "Your laboratory registration application has been submitted successfully. We will review it and contact you within 3-5 business days.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: LaboratoryApplicationForm) => {
    createApplicationMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Application Submitted Successfully!</CardTitle>
          <CardDescription>
            Thank you for applying to join the NAVIMED laboratory network. 
            Your application has been received and will be reviewed by our team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Our team will review your application within 3-5 business days</li>
              <li>• We may contact you for additional information or documentation</li>
              <li>• Once approved, you'll receive setup instructions and API credentials</li>
              <li>• You'll be able to start receiving lab orders from healthcare organizations</li>
            </ul>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={() => {
                setIsSubmitted(false);
                form.reset();
              }}
              variant="outline"
            >
              Submit Another Application
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Laboratory Registration Application
        </CardTitle>
        <CardDescription>
          Join the NAVIMED platform to receive lab orders from hospitals, clinics, and healthcare organizations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="laboratoryName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Laboratory Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your laboratory name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter laboratory license number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person *</FormLabel>
                      <FormControl>
                        <Input placeholder="Primary contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@laboratory.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Address Information</h3>
              
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
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
                      <FormLabel>ZIP Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="ZIP Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Laboratory Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Laboratory Details</h3>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Laboratory Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your laboratory, capabilities, and experience"
                        className="min-h-[100px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.yourlaboratory.com" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="averageTurnaroundTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Turnaround Time (hours)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          max="168"
                          placeholder="24"
                          {...field}
                          value={field.value || 24}
                          onChange={e => field.onChange(parseInt(e.target.value) || 24)}
                        />
                      </FormControl>
                      <FormDescription>
                        Typical time from sample receipt to results delivery
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Specializations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Specializations</h3>
              <FormField
                control={form.control}
                name="specializations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Your Laboratory Specializations</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {specializations.map((spec) => (
                        <div key={spec} className="flex items-center space-x-2">
                          <Checkbox
                            id={spec}
                            checked={field.value?.includes(spec)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value || []), spec]);
                              } else {
                                field.onChange(field.value?.filter(s => s !== spec));
                              }
                            }}
                          />
                          <label
                            htmlFor={spec}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {spec}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Accreditations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Accreditations & Certifications</h3>
              <FormField
                control={form.control}
                name="accreditations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Your Current Accreditations</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {accreditationOptions.map((acc) => (
                        <div key={acc} className="flex items-center space-x-2">
                          <Checkbox
                            id={acc}
                            checked={field.value?.includes(acc)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value || []), acc]);
                              } else {
                                field.onChange(field.value?.filter(a => a !== acc));
                              }
                            }}
                          />
                          <label
                            htmlFor={acc}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {acc}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Services Offered */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Services Offered</h3>
              <FormField
                control={form.control}
                name="servicesOffered"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Services You Provide</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {servicesOptions.map((service) => (
                        <div key={service} className="flex items-center space-x-2">
                          <Checkbox
                            id={service}
                            checked={field.value?.includes(service)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value || []), service]);
                              } else {
                                field.onChange(field.value?.filter(s => s !== service));
                              }
                            }}
                          />
                          <label
                            htmlFor={service}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {service}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Equipment Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Equipment & Capabilities</h3>
              <FormField
                control={form.control}
                name="equipmentDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment and Technology Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your key equipment, technology platforms, and analytical capabilities"
                        className="min-h-[100px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Include information about analyzers, instruments, and any specialized equipment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                * Required fields
              </div>
              <Button 
                type="submit" 
                disabled={createApplicationMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createApplicationMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}