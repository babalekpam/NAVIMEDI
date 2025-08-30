import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurrencySettings } from "@/components/ui/currency-settings";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/contexts/tenant-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useTenantCurrencies, useAllCurrencies, useAfricanCurrencies, useConvertCurrency, formatCurrencyAmount } from "@/hooks/useCurrency";
import { 
  Globe, 
  TrendingUp, 
  Calculator, 
  Coins,
  MapPin,
  ArrowRightLeft,
  DollarSign,
  BarChart3,
  Settings
} from "lucide-react";

export function CurrencyManagementPage() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for currency converter
  const [convertAmount, setConvertAmount] = useState("");
  const [convertFromCurrency, setConvertFromCurrency] = useState("USD");
  const [convertToCurrency, setConvertToCurrency] = useState("NGN");
  const [conversionResult, setConversionResult] = useState<any>(null);
  
  // Fetch data
  const { data: tenantCurrencies, isLoading: tenantLoading } = useTenantCurrencies();
  const { data: allCurrencies, isLoading: allLoading } = useAllCurrencies();
  const { data: africanCurrencies, isLoading: africanLoading } = useAfricanCurrencies();
  const { convertCurrency } = useConvertCurrency();

  // Handle currency conversion
  const handleConversion = async () => {
    if (!convertAmount || !convertFromCurrency || !convertToCurrency) {
      toast({
        title: "Missing Information",
        description: "Please fill in all conversion fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(convertAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    const result = await convertCurrency(amount, convertFromCurrency, convertToCurrency);
    if (result) {
      setConversionResult(result);
      toast({
        title: "Conversion Complete",
        description: `Converted ${formatCurrencyAmount(amount, convertFromCurrency)} to ${formatCurrencyAmount(result.convertedAmount, convertToCurrency)}`,
      });
    } else {
      toast({
        title: "Conversion Failed",
        description: "Unable to convert between these currencies at this time",
        variant: "destructive",
      });
    }
  };

  const isAdmin = user?.role === 'tenant_admin' || user?.role === 'director' || user?.role === 'super_admin';

  return (
    <div className="container mx-auto py-6 space-y-8" data-testid="page-currency-management">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" data-testid="heading-currency-management">
            <Globe className="h-8 w-8 text-blue-600" />
            Multi-Currency Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive currency support for international healthcare operations
          </p>
        </div>
        
        {tenant && (
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              <DollarSign className="h-3 w-3 mr-1" />
              Base: {tenant.baseCurrency || 'USD'}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {tenant.type?.toUpperCase()}
            </Badge>
          </div>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="converter" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Converter
          </TabsTrigger>
          <TabsTrigger value="african" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            African Currencies
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Current Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-green-600" />
                  Current Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tenantLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Base Currency</Label>
                      <p className="text-lg font-semibold">{tenantCurrencies?.baseCurrency || 'USD'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Supported Currencies</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tenantCurrencies?.supportedCurrencies?.map((currency: any) => (
                          <Badge key={currency.code} variant="outline" className="text-xs">
                            {currency.code}
                          </Badge>
                        )) || <Badge variant="outline">USD</Badge>}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Available Currencies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Platform Currencies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{allCurrencies?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Total supported currencies</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-green-600">{africanCurrencies?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">African currencies</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calculator className="h-4 w-4 mr-2" />
                  Currency Converter
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  African Currencies
                </Button>
                {isAdmin && (
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Currency Settings
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Exchange Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Popular Currency Exchange Rates
                <Badge variant="outline" className="ml-2">Live</Badge>
              </CardTitle>
              <CardDescription>
                Current exchange rates for commonly used currencies (Base: USD)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', rate: '1,515.50' },
                  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', rate: '18.45' },
                  { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪', rate: '129.25' },
                  { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭', rate: '15.20' },
                  { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬', rate: '48.75' },
                  { code: 'MAD', name: 'Moroccan Dirham', flag: '🇲🇦', rate: '9.85' },
                  { code: 'TND', name: 'Tunisian Dinar', flag: '🇹🇳', rate: '3.15' },
                  { code: 'EUR', name: 'Euro', flag: '🇪🇺', rate: '0.92' }
                ].map((currency) => (
                  <div key={currency.code} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{currency.flag}</span>
                      <span className="font-semibold text-sm">{currency.code}</span>
                    </div>
                    <p className="text-lg font-bold text-green-600">{currency.rate}</p>
                    <p className="text-xs text-muted-foreground truncate">{currency.name}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Exchange rates are indicative and updated regularly. Actual rates may vary.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currency Converter Tab */}
        <TabsContent value="converter" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-blue-600" />
                Currency Converter
              </CardTitle>
              <CardDescription>
                Convert amounts between different currencies using current exchange rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="convert-amount">Amount</Label>
                  <Input
                    id="convert-amount"
                    type="number"
                    placeholder="Enter amount..."
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(e.target.value)}
                    data-testid="input-convert-amount"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>From Currency</Label>
                  <CurrencySelector
                    value={convertFromCurrency}
                    onValueChange={setConvertFromCurrency}
                    placeholder="Select currency..."
                    data-testid="selector-from-currency"
                  />
                </div>

                <div className="space-y-2">
                  <Label>To Currency</Label>
                  <CurrencySelector
                    value={convertToCurrency}
                    onValueChange={setConvertToCurrency}
                    placeholder="Select currency..."
                    data-testid="selector-to-currency"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center">
                <Button 
                  onClick={handleConversion}
                  className="flex items-center gap-2"
                  data-testid="button-convert"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Convert Currency
                </Button>
              </div>

              {conversionResult && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <div className="text-3xl font-bold text-green-800">
                        {formatCurrencyAmount(conversionResult.convertedAmount, conversionResult.targetCurrency)}
                      </div>
                      <p className="text-green-700">
                        {formatCurrencyAmount(conversionResult.originalAmount, conversionResult.originalCurrency)} = {formatCurrencyAmount(conversionResult.convertedAmount, conversionResult.targetCurrency)}
                      </p>
                      <p className="text-sm text-green-600">
                        Exchange Rate: 1 {conversionResult.originalCurrency} = {conversionResult.exchangeRate.toFixed(4)} {conversionResult.targetCurrency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Converted on {new Date(conversionResult.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* African Currencies Tab */}
        <TabsContent value="african" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-green-600" />
                African Currencies
              </CardTitle>
              <CardDescription>
                Comprehensive support for all major African currencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {africanLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse p-4 bg-gray-100 rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {africanCurrencies?.map((currency: any) => (
                    <Card key={currency.code} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold">{currency.code}</span>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Africa
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-sm">{currency.name}</h3>
                          <p className="text-sm text-muted-foreground">{currency.country}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-mono">{currency.symbol}</span>
                            <span className="text-xs text-muted-foreground">
                              {currency.decimalPlaces || 2} decimal places
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) || (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      <MapPin className="mx-auto h-8 w-8 mb-2" />
                      <p>Loading African currencies...</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* African Currency Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular African Currencies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', desc: 'Most populous African country' },
                    { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', desc: 'Largest African economy' },
                    { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪', desc: 'East African financial hub' },
                    { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬', desc: 'North African gateway' },
                  ].map((currency) => (
                    <div key={currency.code} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <span className="text-xl">{currency.flag}</span>
                      <div className="flex-1">
                        <p className="font-medium">{currency.code} - {currency.name}</p>
                        <p className="text-sm text-muted-foreground">{currency.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Regional Currency Unions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800">West African CFA Franc (XOF)</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Used in 8 countries: Benin, Burkina Faso, Côte d'Ivoire, Guinea-Bissau, Mali, Niger, Senegal, Togo
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800">Central African CFA Franc (XAF)</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Used in 6 countries: Cameroon, Central African Republic, Chad, Republic of Congo, Equatorial Guinea, Gabon
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Admin Settings Tab */}
        {isAdmin && (
          <TabsContent value="settings" className="space-y-6">
            <CurrencySettings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}