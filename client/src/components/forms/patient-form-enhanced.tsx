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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Phone, MapPin, Activity, Heart, Thermometer, Wind, Weight, Ruler, Stethoscope, Eye } from "lucide-react";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface PatientFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  department?: string;
  includeVitalSigns?: boolean;
}

// Specialty-specific vital signs requirements
const getVitalSignsForSpecialty = (department: string) => {
  const baseVitals = {
    bloodPressure: true,
    heartRate: true,
    temperature: true,
    weight: true,
    height: true
  };

  const specialtyVitals = {
    'Emergency': {
      ...baseVitals,
      oxygenSaturation: true,
      respiratoryRate: true,
      painScale: true,
      consciousness: true
    },
    'Cardiology': {
      ...baseVitals,
      oxygenSaturation: true,
      respiratoryRate: true,
      chestPain: true,
      exerciseTolerance: true
    },
    'Pediatrics': {
      ...baseVitals,
      headCircumference: true,
      developmentalMilestones: true,
      immunizationStatus: true
    },
    'Internal Medicine': {
      ...baseVitals,
      oxygenSaturation: true,
      bmi: true,
      smokingStatus: true
    },
    'Surgery': {
      ...baseVitals,
      oxygenSaturation: true,
      allergies: true,
      fastingStatus: true,
      anesthesiaRisk: true
    }
  };

  return specialtyVitals[department as keyof typeof specialtyVitals] || baseVitals;
};

export const PatientForm = ({ onSubmit, isLoading = false, department = '', includeVitalSigns = false }: PatientFormProps) => {
  const [activeTab, setActiveTab] = useState('basic');
  const requiredVitals = getVitalSignsForSpecialty(department);

  const patientFormSchema = insertPatientSchema.omit({ 
    tenantId: true, 
    mrn: true,
    dateOfBirth: true 
  }).extend({
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    // Medical Information Arrays
    medicalHistory: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    // Vital Signs (optional)
    bloodPressureSystolic: z.string().optional(),
    bloodPressureDiastolic: z.string().optional(),
    heartRate: z.string().optional(),
    temperature: z.string().optional(),
    oxygenSaturation: z.string().optional(),
    respiratoryRate: z.string().optional(),
    weight: z.string().optional(),
    height: z.string().optional(),
    painScale: z.string().optional(),
    consciousness: z.string().optional(),
    vitalSignsNotes: z.string().optional()
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
      medicalHistory: [],
      allergies: [],
      medications: [],
      // Vital signs defaults
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      heartRate: "",
      temperature: "",
      oxygenSaturation: "",
      respiratoryRate: "",
      weight: "",
      height: "",
      painScale: "",
      consciousness: "",
      vitalSignsNotes: ""
    }
  });

  const handleSubmit = (data: any) => {
    const patientData = {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      medicalHistory: data.medicalHistory || [],
      allergies: data.allergies || [],
      medications: data.medications || [],
      // Include vital signs if provided
      vitalSigns: includeVitalSigns ? {
        bloodPressureSystolic: data.bloodPressureSystolic,
        bloodPressureDiastolic: data.bloodPressureDiastolic,
        heartRate: data.heartRate,
        temperature: data.temperature,
        oxygenSaturation: data.oxygenSaturation,
        respiratoryRate: data.respiratoryRate,
        weight: data.weight,
        height: data.height,
        painScale: data.painScale,
        consciousness: data.consciousness,
        notes: data.vitalSignsNotes
      } : undefined
    };
    onSubmit(patientData);
  };

  const renderVitalSignsSection = () => {
    if (!includeVitalSigns) return null;

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Vital Signs - {department}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Vitals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {requiredVitals.bloodPressure && (
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Blood Pressure
                </FormLabel>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="bloodPressureSystolic"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Systolic" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <span className="self-center">/</span>
                  <FormField
                    control={form.control}
                    name="bloodPressureDiastolic"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Diastolic" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {requiredVitals.heartRate && (
              <FormField
                control={form.control}
                name="heartRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Heart Rate (bpm)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="72" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {requiredVitals.temperature && (
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Temperature (°F)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="98.6" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Physical Measurements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredVitals.weight && (
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Weight className="h-4 w-4" />
                      Weight (lbs)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="150" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {requiredVitals.height && (
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      Height (inches)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="70" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Emergency/Cardiology specific vitals */}
          {(requiredVitals.oxygenSaturation || requiredVitals.respiratoryRate) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requiredVitals.oxygenSaturation && (
                <FormField
                  control={form.control}
                  name="oxygenSaturation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Wind className="h-4 w-4" />
                        Oxygen Saturation (%)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="98" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {requiredVitals.respiratoryRate && (
                <FormField
                  control={form.control}
                  name="respiratoryRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Wind className="h-4 w-4" />
                        Respiratory Rate (breaths/min)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="16" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}

          {/* Emergency-specific vitals */}
          {(requiredVitals.painScale || requiredVitals.consciousness) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requiredVitals.painScale && (
                <FormField
                  control={form.control}
                  name="painScale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pain Scale (0-10)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pain level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[0,1,2,3,4,5,6,7,8,9,10].map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} - {num === 0 ? 'No Pain' : num <= 3 ? 'Mild' : num <= 6 ? 'Moderate' : 'Severe'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {requiredVitals.consciousness && (
                <FormField
                  control={form.control}
                  name="consciousness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level of Consciousness</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select consciousness level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="alert">Alert</SelectItem>
                          <SelectItem value="verbal">Responds to Verbal</SelectItem>
                          <SelectItem value="pain">Responds to Pain</SelectItem>
                          <SelectItem value="unresponsive">Unresponsive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}

          {/* Notes */}
          <FormField
            control={form.control}
            name="vitalSignsNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vital Signs Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Additional notes about vital signs..." 
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {includeVitalSigns && (
          <div className="mb-6">
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <Button
                type="button"
                variant={activeTab === 'basic' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('basic')}
                className="flex-1"
              >
                Patient Info
              </Button>
              <Button
                type="button"
                variant={activeTab === 'vitals' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('vitals')}
                className="flex-1"
              >
                Vital Signs
              </Button>
            </div>
          </div>
        )}

        {(!includeVitalSigns || activeTab === 'basic') && (
          <div className="space-y-6">
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
          </div>
        )}

        {includeVitalSigns && activeTab === 'vitals' && renderVitalSignsSection()}

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? "Creating..." : "Create Patient"}
          </Button>
        </div>
      </form>
    </Form>
  );
};