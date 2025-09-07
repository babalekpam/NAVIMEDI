import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Plus, Search, AlertCircle, RefreshCw, Download, Upload } from "lucide-react";

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
      if (selectedCountry) params.append("countryId", selectedCountry);
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                              data-testid={`button-edit-country-${country.code}`}
                            >
                              <Search className="h-3 w-3" />
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
                    <SelectItem value="">All Countries</SelectItem>
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
                    setSelectedCountry("");
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
                  <p>No medical codes found.</p>
                  <p className="text-sm mt-1">Add codes manually or upload a CSV file.</p>
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
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium">Upload Medical Codes</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <Button className="mt-4">Choose File</Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>CSV format: codeType, code, description, category, amount</p>
                  <p>Maximum file size: 10MB. Supported formats: CSV, Excel</p>
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