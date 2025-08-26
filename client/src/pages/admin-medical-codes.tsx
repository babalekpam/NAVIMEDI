import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload, Download, Edit, Trash2, Search, Globe } from "lucide-react";

// Form schemas
const countrySchema = z.object({
  code: z.string().min(2, "Country code must be at least 2 characters").max(3, "Country code must be at most 3 characters"),
  name: z.string().min(1, "Country name is required"),
  region: z.string().optional(),
  cptCodeSystem: z.string().default("CPT-4"),
  icd10CodeSystem: z.string().default("ICD-10"),
  pharmaceuticalCodeSystem: z.string().default("NDC"),
  currencyCode: z.string().min(3).max(3),
  dateFormat: z.string().default("MM/DD/YYYY"),
  timeZone: z.string().default("America/New_York")
});

const medicalCodeSchema = z.object({
  countryId: z.string().min(1, "Country is required"),
  codeType: z.enum(["CPT", "ICD10", "PHARMACEUTICAL"]),
  code: z.string().min(1, "Code is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().optional(),
  amount: z.string().optional()
});

const csvUploadSchema = z.object({
  countryId: z.string().min(1, "Country is required"),
  file: z.any().refine((files) => files?.length == 1, "File is required.")
});

type Country = {
  id: string;
  code: string;
  name: string;
  region?: string;
  cptCodeSystem: string;
  icd10CodeSystem: string;
  pharmaceuticalCodeSystem: string;
  currencyCode: string;
  dateFormat: string;
  timeZone: string;
  isActive: boolean;
  createdAt: string;
};

type MedicalCode = {
  id: string;
  countryId: string;
  codeType: string;
  code: string;
  description: string;
  category?: string;
  amount?: number;
  source?: string;
  isActive: boolean;
  uploadedAt: string;
};

type CodeUpload = {
  id: string;
  countryId: string;
  fileName: string;
  fileSize?: number;
  recordsProcessed: number;
  recordsImported: number;
  recordsSkipped: number;
  errors: string[];
  status: string;
  createdAt: string;
  completedAt?: string;
};

export default function AdminMedicalCodes() {
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCodeType, setSelectedCodeType] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCountryDialogOpen, setIsCountryDialogOpen] = useState(false);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [editingCode, setEditingCode] = useState<MedicalCode | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: countries = [], isLoading: countriesLoading } = useQuery({
    queryKey: ["/api/admin/countries"],
    queryFn: () => apiRequest("/api/admin/countries")
  });

  const { data: medicalCodes = [], isLoading: codesLoading } = useQuery({
    queryKey: ["/api/admin/medical-codes", selectedCountry, selectedCodeType, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCountry) params.append("countryId", selectedCountry);
      if (selectedCodeType !== "ALL") params.append("codeType", selectedCodeType);
      if (searchTerm) params.append("search", searchTerm);
      return apiRequest(`/api/admin/medical-codes?${params}`);
    }
  });

  const { data: uploads = [], isLoading: uploadsLoading } = useQuery({
    queryKey: ["/api/admin/medical-code-uploads"],
    queryFn: () => apiRequest("/api/admin/medical-code-uploads")
  });

  // Forms
  const countryForm = useForm<z.infer<typeof countrySchema>>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      code: "",
      name: "",
      region: "",
      cptCodeSystem: "CPT-4",
      icd10CodeSystem: "ICD-10",
      pharmaceuticalCodeSystem: "NDC",
      currencyCode: "USD",
      dateFormat: "MM/DD/YYYY",
      timeZone: "America/New_York"
    }
  });

  const codeForm = useForm<z.infer<typeof medicalCodeSchema>>({
    resolver: zodResolver(medicalCodeSchema),
    defaultValues: {
      countryId: "",
      codeType: "CPT",
      code: "",
      description: "",
      category: "",
      amount: ""
    }
  });

  const uploadForm = useForm<z.infer<typeof csvUploadSchema>>({
    resolver: zodResolver(csvUploadSchema),
    defaultValues: {
      countryId: ""
    }
  });

  // Mutations
  const createCountryMutation = useMutation({
    mutationFn: (data: z.infer<typeof countrySchema>) => 
      apiRequest("/api/admin/countries", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/countries"] });
      setIsCountryDialogOpen(false);
      setEditingCountry(null);
      countryForm.reset();
      toast({ title: "Country created successfully!" });
    },
    onError: () => {
      toast({ title: "Error creating country", variant: "destructive" });
    }
  });

  const updateCountryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.infer<typeof countrySchema> }) => 
      apiRequest(`/api/admin/countries/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/countries"] });
      setIsCountryDialogOpen(false);
      setEditingCountry(null);
      countryForm.reset();
      toast({ title: "Country updated successfully!" });
    },
    onError: () => {
      toast({ title: "Error updating country", variant: "destructive" });
    }
  });

  const createCodeMutation = useMutation({
    mutationFn: (data: z.infer<typeof medicalCodeSchema>) => 
      apiRequest("/api/admin/medical-codes", { method: "POST", body: JSON.stringify({ ...data, amount: data.amount ? parseFloat(data.amount) : undefined }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/medical-codes"] });
      setIsCodeDialogOpen(false);
      setEditingCode(null);
      codeForm.reset();
      toast({ title: "Medical code created successfully!" });
    },
    onError: () => {
      toast({ title: "Error creating medical code", variant: "destructive" });
    }
  });

  const updateCodeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.infer<typeof medicalCodeSchema> }) => 
      apiRequest(`/api/admin/medical-codes/${id}`, { method: "PUT", body: JSON.stringify({ ...data, amount: data.amount ? parseFloat(data.amount) : undefined }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/medical-codes"] });
      setIsCodeDialogOpen(false);
      setEditingCode(null);
      codeForm.reset();
      toast({ title: "Medical code updated successfully!" });
    },
    onError: () => {
      toast({ title: "Error updating medical code", variant: "destructive" });
    }
  });

  const uploadCodesMutation = useMutation({
    mutationFn: (formData: FormData) => 
      apiRequest("/api/admin/medical-codes/upload", { method: "POST", body: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/medical-codes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/medical-code-uploads"] });
      setIsUploadDialogOpen(false);
      uploadForm.reset();
      toast({ title: "CSV upload started successfully!" });
    },
    onError: () => {
      toast({ title: "Error uploading CSV", variant: "destructive" });
    }
  });

  const deleteCodeMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/admin/medical-codes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/medical-codes"] });
      toast({ title: "Medical code deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Error deleting medical code", variant: "destructive" });
    }
  });

  // Handlers
  const handleCountrySubmit = (data: z.infer<typeof countrySchema>) => {
    if (editingCountry) {
      updateCountryMutation.mutate({ id: editingCountry.id, data });
    } else {
      createCountryMutation.mutate(data);
    }
  };

  const handleCodeSubmit = (data: z.infer<typeof medicalCodeSchema>) => {
    if (editingCode) {
      updateCodeMutation.mutate({ id: editingCode.id, data });
    } else {
      createCodeMutation.mutate(data);
    }
  };

  const handleUploadSubmit = (data: z.infer<typeof csvUploadSchema>) => {
    const formData = new FormData();
    formData.append("countryId", data.countryId);
    formData.append("file", data.file[0]);
    uploadCodesMutation.mutate(formData);
  };

  const handleEditCountry = (country: Country) => {
    setEditingCountry(country);
    countryForm.reset({
      code: country.code,
      name: country.name,
      region: country.region || "",
      cptCodeSystem: country.cptCodeSystem,
      icd10CodeSystem: country.icd10CodeSystem,
      pharmaceuticalCodeSystem: country.pharmaceuticalCodeSystem,
      currencyCode: country.currencyCode,
      dateFormat: country.dateFormat,
      timeZone: country.timeZone
    });
    setIsCountryDialogOpen(true);
  };

  const handleEditCode = (code: MedicalCode) => {
    setEditingCode(code);
    codeForm.reset({
      countryId: code.countryId,
      codeType: code.codeType as "CPT" | "ICD10" | "PHARMACEUTICAL",
      code: code.code,
      description: code.description,
      category: code.category || "",
      amount: code.amount?.toString() || ""
    });
    setIsCodeDialogOpen(true);
  };

  const downloadTemplate = () => {
    const csvContent = "codeType,code,description,category,amount\nCPT,99213,Office Visit Level 3,Office Visit,150.00\nICD10,Z00.00,General Adult Medical Examination,Preventive,0.00\nPHARMACEUTICAL,NDC123456,Generic Medication,Antibiotics,25.99";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "medical-codes-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-600" />
            Global Medical Codes Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage country-specific medical codes, diagnosis codes, and pharmaceutical codes for the platform
          </p>
        </div>
      </div>

      <Tabs defaultValue="countries" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="codes">Medical Codes</TabsTrigger>
          <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
          <TabsTrigger value="history">Upload History</TabsTrigger>
        </TabsList>

        <TabsContent value="countries" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Countries & Regions</h2>
            <Dialog open={isCountryDialogOpen} onOpenChange={setIsCountryDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingCountry(null); countryForm.reset(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Country
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingCountry ? "Edit Country" : "Add New Country"}</DialogTitle>
                  <DialogDescription>
                    Configure country-specific medical coding standards and localization settings.
                  </DialogDescription>
                </DialogHeader>
                <Form {...countryForm}>
                  <form onSubmit={countryForm.handleSubmit(handleCountrySubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={countryForm.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country Code</FormLabel>
                            <FormControl>
                              <Input placeholder="USA" {...field} data-testid="input-country-code" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={countryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country Name</FormLabel>
                            <FormControl>
                              <Input placeholder="United States" {...field} data-testid="input-country-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={countryForm.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Region</FormLabel>
                            <FormControl>
                              <Input placeholder="North America" {...field} data-testid="input-country-region" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={countryForm.control}
                        name="currencyCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency Code</FormLabel>
                            <FormControl>
                              <Input placeholder="USD" {...field} data-testid="input-currency-code" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={countryForm.control}
                        name="cptCodeSystem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPT Code System</FormLabel>
                            <FormControl>
                              <Input placeholder="CPT-4" {...field} data-testid="input-cpt-system" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={countryForm.control}
                        name="icd10CodeSystem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ICD Code System</FormLabel>
                            <FormControl>
                              <Input placeholder="ICD-10" {...field} data-testid="input-icd-system" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={countryForm.control}
                        name="pharmaceuticalCodeSystem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pharmaceutical System</FormLabel>
                            <FormControl>
                              <Input placeholder="NDC" {...field} data-testid="input-pharma-system" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={countryForm.control}
                        name="dateFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Format</FormLabel>
                            <FormControl>
                              <Input placeholder="MM/DD/YYYY" {...field} data-testid="input-date-format" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={countryForm.control}
                        name="timeZone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Zone</FormLabel>
                            <FormControl>
                              <Input placeholder="America/New_York" {...field} data-testid="input-timezone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCountryDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createCountryMutation.isPending || updateCountryMutation.isPending}
                        data-testid="button-save-country"
                      >
                        {editingCountry ? "Update" : "Create"} Country
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {countriesLoading ? (
              <div className="col-span-full text-center py-8">Loading countries...</div>
            ) : countries.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No countries configured yet. Add your first country to get started.
              </div>
            ) : (
              countries.map((country: Country) => (
                <Card key={country.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{country.name}</CardTitle>
                      <Badge variant={country.isActive ? "default" : "secondary"}>
                        {country.code}
                      </Badge>
                    </div>
                    <CardDescription>{country.region}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">CPT:</span> {country.cptCodeSystem}</div>
                      <div><span className="font-medium">ICD:</span> {country.icd10CodeSystem}</div>
                      <div><span className="font-medium">Pharma:</span> {country.pharmaceuticalCodeSystem}</div>
                      <div><span className="font-medium">Currency:</span> {country.currencyCode}</div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditCountry(country)}
                        data-testid={`button-edit-country-${country.code}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="codes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Medical Codes</h2>
            <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingCode(null); codeForm.reset(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Code
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingCode ? "Edit Medical Code" : "Add New Medical Code"}</DialogTitle>
                  <DialogDescription>
                    Add country-specific medical codes with descriptions and pricing.
                  </DialogDescription>
                </DialogHeader>
                <Form {...codeForm}>
                  <form onSubmit={codeForm.handleSubmit(handleCodeSubmit)} className="space-y-4">
                    <FormField
                      control={codeForm.control}
                      name="countryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-code-country">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countries.map((country: Country) => (
                                <SelectItem key={country.id} value={country.id}>
                                  {country.name} ({country.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={codeForm.control}
                      name="codeType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-code-type">
                                <SelectValue placeholder="Select code type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CPT">CPT Code</SelectItem>
                              <SelectItem value="ICD10">ICD-10 Code</SelectItem>
                              <SelectItem value="PHARMACEUTICAL">Pharmaceutical Code</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={codeForm.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code</FormLabel>
                            <FormControl>
                              <Input placeholder="99213" {...field} data-testid="input-medical-code" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={codeForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input placeholder="Office Visit" {...field} data-testid="input-code-category" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={codeForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Detailed description of the medical code" 
                              {...field} 
                              data-testid="textarea-code-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={codeForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="150.00" 
                              {...field} 
                              data-testid="input-code-amount"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCodeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createCodeMutation.isPending || updateCodeMutation.isPending}
                        data-testid="button-save-code"
                      >
                        {editingCode ? "Update" : "Create"} Code
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search">Search Codes</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by code or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-codes"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="country-filter">Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="w-[180px]" data-testid="select-filter-country">
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Countries</SelectItem>
                      {countries.map((country: Country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type-filter">Code Type</Label>
                  <Select value={selectedCodeType} onValueChange={setSelectedCodeType}>
                    <SelectTrigger className="w-[150px]" data-testid="select-filter-type">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="CPT">CPT</SelectItem>
                      <SelectItem value="ICD10">ICD-10</SelectItem>
                      <SelectItem value="PHARMACEUTICAL">Pharmaceutical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Codes List */}
          <Card>
            <CardContent className="pt-6">
              {codesLoading ? (
                <div className="text-center py-8">Loading medical codes...</div>
              ) : medicalCodes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No medical codes found. Add codes manually or upload a CSV file.
                </div>
              ) : (
                <div className="space-y-2">
                  {medicalCodes.map((code: MedicalCode) => (
                    <div key={code.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{code.codeType}</Badge>
                          <span className="font-mono font-medium">{code.code}</span>
                          {code.category && (
                            <Badge variant="secondary" className="text-xs">{code.category}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{code.description}</p>
                        {code.amount && (
                          <p className="text-sm font-medium mt-1">${code.amount.toFixed(2)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditCode(code)}
                          data-testid={`button-edit-code-${code.code}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteCodeMutation.mutate(code.id)}
                          data-testid={`button-delete-code-${code.code}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bulk Upload Medical Codes</h2>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Upload medical codes in bulk using a CSV file. The file should contain columns: codeType, code, description, category, amount.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...uploadForm}>
                <form onSubmit={uploadForm.handleSubmit(handleUploadSubmit)} className="space-y-4">
                  <FormField
                    control={uploadForm.control}
                    name="countryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Country</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-upload-country">
                              <SelectValue placeholder="Select country for upload" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country: Country) => (
                              <SelectItem key={country.id} value={country.id}>
                                {country.name} ({country.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={uploadForm.control}
                    name="file"
                    render={({ field: { onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>CSV File</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={(e) => onChange(e.target.files)}
                            {...field}
                            data-testid="input-csv-file"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={uploadCodesMutation.isPending}
                    data-testid="button-upload-csv"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadCodesMutation.isPending ? "Uploading..." : "Upload CSV"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>CSV Format Requirements:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Headers: codeType, code, description, category (optional), amount (optional)</li>
                  <li>codeType values: CPT, ICD10, PHARMACEUTICAL</li>
                  <li>code: Unique identifier for the medical code</li>
                  <li>description: Detailed description of the code</li>
                  <li>category: Optional category/specialty classification</li>
                  <li>amount: Optional standard pricing amount</li>
                </ul>
                <p className="mt-4"><strong>Example rows:</strong></p>
                <code className="block bg-muted p-2 rounded text-xs">
                  CPT,99213,Office Visit Level 3,Office Visit,150.00<br/>
                  ICD10,Z00.00,General Adult Medical Examination,Preventive,0.00<br/>
                  PHARMACEUTICAL,NDC123456,Generic Medication,Antibiotics,25.99
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <h2 className="text-xl font-semibold">Upload History</h2>
          
          <Card>
            <CardContent className="pt-6">
              {uploadsLoading ? (
                <div className="text-center py-8">Loading upload history...</div>
              ) : uploads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No uploads yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {uploads.map((upload: CodeUpload) => (
                    <div key={upload.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{upload.fileName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Uploaded on {new Date(upload.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={
                          upload.status === "completed" ? "default" : 
                          upload.status === "failed" ? "destructive" : 
                          "secondary"
                        }>
                          {upload.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <span className="font-medium">Processed:</span> {upload.recordsProcessed}
                        </div>
                        <div>
                          <span className="font-medium">Imported:</span> {upload.recordsImported}
                        </div>
                        <div>
                          <span className="font-medium">Skipped:</span> {upload.recordsSkipped}
                        </div>
                      </div>
                      {upload.errors.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-destructive">Errors:</p>
                          <ul className="text-xs text-muted-foreground mt-1">
                            {upload.errors.slice(0, 3).map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                            {upload.errors.length > 3 && (
                              <li>• ... and {upload.errors.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}