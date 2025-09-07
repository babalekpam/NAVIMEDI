import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Globe, Plus, Search, AlertCircle, RefreshCw, Download, Upload, Edit2 } from "lucide-react";

interface Country {
  id: string;
  code: string;
  name: string;
  currencyCode: string;
  cptCodeSystem: string;
  icd10CodeSystem: string;
  pharmaceuticalCodeSystem: string;
}

interface MedicalCode {
  id: string;
  countryId: string;
  codeType: string;
  code: string;
  description: string;
  category?: string;
  amount?: number;
}

export default function AdminMedicalCodesSimple() {
  console.log("AdminMedicalCodesSimple component rendering...");
  
  const [activeTab, setActiveTab] = useState("countries");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCodeType, setSelectedCodeType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedUploadCountry, setSelectedUploadCountry] = useState("");
  const [editFormData, setEditFormData] = useState({
    currencyCode: "",
    cptCodeSystem: "",
    icd10CodeSystem: "",
    pharmaceuticalCodeSystem: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Template download function
  const downloadTemplate = () => {
    const csvContent = "codeType,code,description,category,amount\nCPT,99213,Office Visit Level 3,Office Visit,150.00\nICD10,Z00.00,General Adult Medical Examination,Preventive,0.00\nPHARMACEUTICAL,NDC123456,Generic Medication,Antibiotics,25.99\nCPT,99214,Office Visit Level 4,Office Visit,200.00\nICD10,M79.1,Myalgia,Musculoskeletal,0.00";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "medical-codes-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Handle country edit
  const handleEditCountry = (country: Country) => {
    setEditingCountry(country);
    setEditFormData({
      currencyCode: country.currencyCode,
      cptCodeSystem: country.cptCodeSystem,
      icd10CodeSystem: country.icd10CodeSystem,
      pharmaceuticalCodeSystem: country.pharmaceuticalCodeSystem
    });
    setIsEditDialogOpen(true);
  };

  // Country update mutation
  const updateCountryMutation = useMutation({
    mutationFn: async (data: { id: string; updates: any }) => {
      const response = await fetch(`/api/admin/countries/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(data.updates)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update country: ${response.status} ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/countries"] });
      toast({
        title: "Success!",
        description: "Country configuration updated successfully",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update country configuration",
        variant: "destructive",
      });
      console.error("Update error:", error);
    }
  });

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; countryId: string }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('countryId', data.countryId);
      
      const response = await fetch('/api/admin/medical-codes/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Upload success data:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/medical-codes"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/medical-codes"] });
      toast({
        title: "Upload Successful!",
        description: `Upload completed. Check medical codes tab for imported data.`,
      });
      setUploadFile(null);
      setSelectedUploadCountry("");
      // Switch to medical codes tab to show results
      setActiveTab("codes");
    },
    onError: (error: any) => {
      let errorMessage = "Failed to upload medical codes. Please check file format.";
      
      // Extract actual error message from the server response
      if (error.message && error.message.includes('Upload failed:')) {
        try {
          const responseText = error.message.split('Upload failed:')[1].trim();
          const serverError = JSON.parse(responseText.split(' ').slice(1).join(' '));
          if (serverError.instructions) {
            errorMessage = serverError.instructions;
          } else if (serverError.error) {
            errorMessage = serverError.error;
          }
        } catch (e) {
          // If parsing fails, check for specific Numbers file error
          if (uploadFile?.name.endsWith('.numbers')) {
            errorMessage = "Please open your Numbers file and use File > Export To > CSV to convert it, then upload the CSV file.";
          }
        }
      } else if (uploadFile?.name.endsWith('.numbers')) {
        errorMessage = "Please open your Numbers file and use File > Export To > CSV to convert it, then upload the CSV file.";
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Upload error:", error);
    }
  });

  // Handle file upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
      console.log("File selected:", file.name);
    }
  };

  // Countries query with proper error handling
  const { 
    data: countries = [], 
    isLoading: countriesLoading, 
    error: countriesError,
    refetch: refetchCountries
  } = useQuery({
    queryKey: ["/api/admin/countries"],
    queryFn: () => apiRequest("/api/admin/countries"),
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Medical codes query with conditional loading
  const { 
    data: medicalCodes = [], 
    isLoading: codesLoading, 
    error: codesError,
    refetch: refetchCodes
  } = useQuery({
    queryKey: ["/api/admin/medical-codes", selectedCountry, selectedCodeType, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCountry && selectedCountry !== "all-countries") {
        params.append("countryId", selectedCountry);
      }
      if (selectedCodeType !== "ALL") params.append("codeType", selectedCodeType);
      if (searchTerm) params.append("search", searchTerm);
      return apiRequest(`/api/admin/medical-codes?${params}`);
    },
    enabled: countries.length > 0, // Only load after countries are available
    retry: false // Don't retry to avoid blank pages
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-600" />
            Global Medical Codes Management - SIMPLIFIED
          </h1>
          <p className="text-muted-foreground mt-2">
            Debugging the Medical Codes tab blank page issue
          </p>
        </div>
      </div>

      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        ✅ <strong>SUCCESS!</strong> If you can see this message, the component is rendering properly.
      </div>

      <Tabs value={activeTab} onValueChange={(value) => {
        console.log("Tab changed to:", value);
        setActiveTab(value);
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="codes">Medical Codes</TabsTrigger>
          <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
          <TabsTrigger value="history">Upload History</TabsTrigger>
        </TabsList>

        <TabsContent value="countries" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Countries & Regions</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Country
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Countries Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              {countriesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading countries...</span>
                </div>
              ) : countriesError ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600">Failed to load countries</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => refetchCountries()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : countries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No countries found. Add countries to manage medical codes.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Showing all {countries.length} countries. Click "Edit" to customize medical coding systems for each country.
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {countries.map((country: Country) => (
                      <Card key={country.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{country.code}</Badge>
                              <span className="truncate">{country.name}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleEditCountry(country)}
                              data-testid={`button-edit-country-${country.code}`}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1 text-xs">
                            <div><span className="font-medium">Currency:</span> {country.currencyCode}</div>
                            <div><span className="font-medium">CPT System:</span> <span className="text-blue-600">{country.cptCodeSystem}</span></div>
                            <div><span className="font-medium">ICD System:</span> <span className="text-green-600">{country.icd10CodeSystem}</span></div>
                            <div><span className="font-medium">Pharma System:</span> <span className="text-purple-600">{country.pharmaceuticalCodeSystem}</span></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Country Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Country Medical Systems</DialogTitle>
                <DialogDescription>
                  Configure medical coding systems for {editingCountry?.name}
                </DialogDescription>
              </DialogHeader>
              {editingCountry && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country-code">Country Code</Label>
                      <Input
                        id="country-code"
                        value={editingCountry.code}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency Code</Label>
                      <Input
                        id="currency"
                        value={editFormData.currencyCode}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, currencyCode: e.target.value }))}
                        placeholder="USD, EUR, GBP..."
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cpt-system">CPT Code System</Label>
                    <Input
                      id="cpt-system"
                      value={editFormData.cptCodeSystem}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, cptCodeSystem: e.target.value }))}
                      placeholder="e.g., AMA CPT, Local CPT, Custom CPT..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="icd-system">ICD-10 Code System</Label>
                    <Input
                      id="icd-system"
                      value={editFormData.icd10CodeSystem}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, icd10CodeSystem: e.target.value }))}
                      placeholder="e.g., WHO ICD-10, ICD-10-CM, Local ICD..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pharma-system">Pharmaceutical Code System</Label>
                    <Input
                      id="pharma-system"
                      value={editFormData.pharmaceuticalCodeSystem}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, pharmaceuticalCodeSystem: e.target.value }))}
                      placeholder="e.g., NDC, ATC, Local Drug Codes..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        if (editingCountry) {
                          updateCountryMutation.mutate({
                            id: editingCountry.id,
                            updates: editFormData
                          });
                        }
                      }}
                      disabled={updateCountryMutation.isPending}
                    >
                      {updateCountryMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="codes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Medical Codes</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Code
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search medical codes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-codes"
                  />
                </div>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger data-testid="select-filter-country">
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-countries">All Countries</SelectItem>
                    {countries.map((country: Country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name} ({country.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCodeType} onValueChange={setSelectedCodeType}>
                  <SelectTrigger data-testid="select-filter-code-type">
                    <SelectValue placeholder="Code Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="CPT">CPT Codes</SelectItem>
                    <SelectItem value="ICD10">ICD-10 Codes</SelectItem>
                    <SelectItem value="PHARMACEUTICAL">Pharmaceutical</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedCountry("all-countries");
                    setSelectedCodeType("ALL");
                    setSearchTerm("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Medical Codes List */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Codes Database</CardTitle>
            </CardHeader>
            <CardContent>
              {countries.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-amber-600">Please wait for countries to load first</p>
                  <p className="text-sm text-muted-foreground mt-1">Medical codes require country configuration</p>
                </div>
              ) : codesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading medical codes...</span>
                </div>
              ) : codesError ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 font-medium">Authentication Required</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {codesError.message?.includes('401') || codesError.message?.includes('403') 
                        ? 'Please login as super admin to view medical codes' 
                        : 'Failed to load medical codes'}
                    </p>
                    <div className="flex gap-2 justify-center mt-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = '/login'}
                      >
                        Login Again
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => refetchCodes()}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  </div>
                </div>
              ) : medicalCodes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No medical codes found for current filters.</p>
                  <p className="text-sm mt-1">Try removing filters or upload a CSV file.</p>
                  <div className="mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedCountry("all-countries");
                        setSelectedCodeType("ALL");
                        setSearchTerm("");
                      }}
                    >
                      Show All Medical Codes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {medicalCodes.slice(0, 20).map((code: MedicalCode) => (
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
                        <Button variant="ghost" size="sm" data-testid={`button-edit-code-${code.code}`}>
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {medicalCodes.length > 20 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      Showing 20 of {medicalCodes.length} codes. Use filters to narrow results.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bulk Upload Medical Codes</h2>
            <Button 
              variant="outline"
              onClick={downloadTemplate}
              data-testid="button-download-template"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-lg font-medium text-gray-700">Upload Medical Codes CSV</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Drag and drop your CSV file here, or click to select file
                  </p>
                  <div>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,.numbers"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button 
                      className="mt-4" 
                      onClick={() => document.getElementById('file-upload')?.click()}
                      data-testid="button-choose-file"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </div>

                {/* File Selection Status */}
                {uploadFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-3">File Ready for Upload:</h4>
                    <div className="space-y-3">
                      <p className="text-sm text-green-700">
                        <span className="font-medium">{uploadFile.name}</span> ({(uploadFile.size / 1024).toFixed(1)} KB)
                      </p>
                      
                      {/* Country Selection for Upload */}
                      <div className="space-y-2">
                        <Label htmlFor="upload-country">Select Country for Medical Codes:</Label>
                        <Select value={selectedUploadCountry} onValueChange={setSelectedUploadCountry}>
                          <SelectTrigger id="upload-country">
                            <SelectValue placeholder="Choose country for these medical codes" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country: Country) => (
                              <SelectItem key={country.id} value={country.id}>
                                {country.name} ({country.code}) - {country.cptCodeSystem}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          onClick={() => {
                            if (!selectedUploadCountry) {
                              toast({
                                title: "Country Required",
                                description: "Please select a country for the medical codes",
                                variant: "destructive",
                              });
                              return;
                            }
                            uploadMutation.mutate({ 
                              file: uploadFile, 
                              countryId: selectedUploadCountry 
                            });
                          }}
                          disabled={!selectedUploadCountry || uploadMutation.isPending}
                        >
                          {uploadMutation.isPending ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload to {selectedUploadCountry ? countries.find(c => c.id === selectedUploadCountry)?.name : "Country"}
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setUploadFile(null);
                            setSelectedUploadCountry("");
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* File Format Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">CSV File Requirements:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><span className="font-medium">Format:</span> codeType, code, description, category, amount</p>
                    <p><span className="font-medium">Code Types:</span> CPT, ICD10, PHARMACEUTICAL</p>
                    <p><span className="font-medium">File Size:</span> Maximum 10MB</p>
                    <p><span className="font-medium">Supported:</span> CSV, Excel (.xlsx, .xls), Numbers (.numbers)</p>
                    <p><span className="font-medium">Encoding:</span> UTF-8 recommended</p>
                  </div>
                </div>

                {/* Sample Data Preview */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">Sample Data Preview:</h4>
                  <div className="font-mono text-xs bg-white border border-gray-300 rounded p-3 overflow-x-auto">
                    <div className="text-gray-600">codeType,code,description,category,amount</div>
                    <div>CPT,99213,Office Visit Level 3,Office Visit,150.00</div>
                    <div>ICD10,Z00.00,General Adult Medical Examination,Preventive,0.00</div>
                    <div>PHARMACEUTICAL,NDC123456,Generic Medication,Antibiotics,25.99</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Download the template above to get started with the correct format.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upload History</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No upload history available</p>
                <p className="text-sm mt-1">Upload medical codes to see history here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}