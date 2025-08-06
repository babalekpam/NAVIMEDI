import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, DollarSign, MapPin, TrendingUp, Zap, Calculator } from "lucide-react";
import CurrencyDisplay from "@/components/currency-display";
import { useTenantCurrencies, useAllCurrencies, useAfricanCurrencies } from "@/hooks/useCurrency";
import { useQuery } from "@tanstack/react-query";

interface LocationInfo {
  location?: {
    country?: string;
    region?: string;
  };
  suggestedCurrency?: string;
  region?: string;
}

export default function CurrencyDemo() {
  const [testAmount, setTestAmount] = useState<number>(1000);
  const { data: tenantCurrencies, isLoading: tenantLoading } = useTenantCurrencies();
  const { data: allCurrencies, isLoading: allLoading } = useAllCurrencies();
  const { data: africanCurrencies, isLoading: africanLoading } = useAfricanCurrencies();
  
  const { data: locationInfo } = useQuery<LocationInfo>({
    queryKey: ["/api/location"],
    retry: false,
  });

  const [selectedAmount, setSelectedAmount] = useState(500);

  if (tenantLoading || allLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Multi-Currency System Demo</h1>
          <p className="text-muted-foreground">
            Comprehensive currency management for global healthcare operations
          </p>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Base Currency</p>
                <p className="font-semibold">{tenantCurrencies?.baseCurrency || 'USD'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Supported</p>
                <p className="font-semibold">{tenantCurrencies?.supportedCurrencies?.length || 0} Currencies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="font-semibold">{allCurrencies?.length || 0} Global</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">African Focus</p>
                <p className="font-semibold">{africanCurrencies?.length || 0} Currencies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Detection Info */}
      {locationInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Detected Location & Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Country</p>
                <p className="font-semibold">{locationInfo.location?.country || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Suggested Currency</p>
                <Badge variant="default">{locationInfo.suggestedCurrency}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Region</p>
                <p className="font-semibold">{locationInfo.region}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="display" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="display">Currency Display</TabsTrigger>
          <TabsTrigger value="converter">Currency Converter</TabsTrigger>
          <TabsTrigger value="african">African Currencies</TabsTrigger>
          <TabsTrigger value="global">Global Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="display" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interactive Amount Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Test Amount Input
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Amount to Display</label>
                    <Input
                      type="number"
                      value={selectedAmount}
                      onChange={(e) => setSelectedAmount(parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Formatted Display:</p>
                    <CurrencyDisplay amount={selectedAmount} compact />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Full Currency Display */}
            <div className="space-y-4">
              <CurrencyDisplay 
                amount={selectedAmount} 
                showConverter={true} 
                showSettings={true} 
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="converter" className="space-y-6">
          <CurrencyDisplay 
            amount={1000} 
            showConverter={true} 
            showSettings={false} 
          />
        </TabsContent>

        <TabsContent value="african" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>African Currencies ({africanCurrencies?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {africanCurrencies ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {africanCurrencies.map((currency) => (
                    <div key={currency.code} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{currency.code}</p>
                          <p className="text-sm text-muted-foreground">{currency.name}</p>
                          <p className="text-xs text-muted-foreground">{currency.country}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{currency.symbol}</p>
                          <Badge variant="outline" className="text-xs">
                            {currency.decimalPlaces} dp
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Loading African currencies...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="global" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>All Available Currencies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {allCurrencies?.map((currency) => (
                    <div key={currency.code} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm">{currency.code}</span>
                        <span className="font-semibold">{currency.symbol}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{currency.name}</p>
                        <p className="text-xs text-muted-foreground">{currency.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Currency Regions</CardTitle>
              </CardHeader>
              <CardContent>
                {allCurrencies && (
                  <div className="space-y-3">
                    {Array.from(new Set(allCurrencies.map(c => c.region))).map(region => {
                      const regionCurrencies = allCurrencies.filter(c => c.region === region);
                      return (
                        <div key={region}>
                          <p className="font-medium mb-2">{region}</p>
                          <div className="flex flex-wrap gap-1">
                            {regionCurrencies.map(currency => (
                              <Badge key={currency.code} variant="secondary" className="text-xs">
                                {currency.code}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}