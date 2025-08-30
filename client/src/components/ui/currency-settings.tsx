import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CurrencySelector } from "./currency-selector";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/contexts/tenant-context";
import { useAuth } from "@/contexts/auth-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Globe, TrendingUp, AlertTriangle, Check, Plus, X } from "lucide-react";

interface CurrencySettings {
  baseCurrency: string;
  supportedCurrencies: string[];
  autoDetectLocation: boolean;
  showExchangeRates: boolean;
  allowMultipleCurrencies: boolean;
  defaultDecimalPlaces: number;
}

interface TenantCurrencyData {
  baseCurrency: string;
  supportedCurrencies: string[];
}

export function CurrencySettings() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<CurrencySettings>({
    baseCurrency: 'USD',
    supportedCurrencies: ['USD'],
    autoDetectLocation: true,
    showExchangeRates: true,
    allowMultipleCurrencies: true,
    defaultDecimalPlaces: 2
  });

  // Fetch current tenant currency settings
  const { data: tenantCurrency, isLoading } = useQuery<TenantCurrencyData>({
    queryKey: ['/api/tenant/currency-settings', tenant?.id],
    enabled: !!tenant?.id,
    staleTime: 30000,
  });

  // Fetch exchange rates for supported currencies
  const { data: exchangeRates } = useQuery({
    queryKey: ['/api/currency/exchange-rates', settings.supportedCurrencies],
    enabled: settings.supportedCurrencies.length > 1 && settings.showExchangeRates,
    staleTime: 300000, // 5 minutes
  });

  // Update settings when tenant data loads
  useEffect(() => {
    if (tenantCurrency) {
      setSettings(prev => ({
        ...prev,
        baseCurrency: tenantCurrency.baseCurrency || 'USD',
        supportedCurrencies: tenantCurrency.supportedCurrencies || ['USD']
      }));
    }
  }, [tenantCurrency]);

  // Update currency settings mutation
  const updateCurrencyMutation = useMutation({
    mutationFn: async (newSettings: Partial<CurrencySettings>) => {
      return await apiRequest('PUT', '/api/tenant/currency-settings', {
        baseCurrency: newSettings.baseCurrency,
        supportedCurrencies: newSettings.supportedCurrencies,
        tenantId: tenant?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant/currency-settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tenant/current'] });
      toast({
        title: "Currency Settings Updated",
        description: "Your currency preferences have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update currency settings",
        variant: "destructive",
      });
    }
  });

  const handleBaseCurrencyChange = (currency: string) => {
    const newSettings = { 
      ...settings, 
      baseCurrency: currency,
      supportedCurrencies: settings.supportedCurrencies.includes(currency) 
        ? settings.supportedCurrencies 
        : [currency, ...settings.supportedCurrencies]
    };
    setSettings(newSettings);
  };

  const addSupportedCurrency = (currency: string) => {
    if (!settings.supportedCurrencies.includes(currency)) {
      const newSettings = {
        ...settings,
        supportedCurrencies: [...settings.supportedCurrencies, currency]
      };
      setSettings(newSettings);
    }
  };

  const removeSupportedCurrency = (currency: string) => {
    if (currency !== settings.baseCurrency && settings.supportedCurrencies.length > 1) {
      const newSettings = {
        ...settings,
        supportedCurrencies: settings.supportedCurrencies.filter(c => c !== currency)
      };
      setSettings(newSettings);
    }
  };

  const saveCurrencySettings = () => {
    updateCurrencyMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Currency Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Multi-Currency Configuration
          </CardTitle>
          <CardDescription>
            Configure your organization's currency settings and enable multi-currency support for international healthcare operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Base Currency Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Primary Currency</Label>
            <CurrencySelector
              value={settings.baseCurrency}
              onValueChange={handleBaseCurrencyChange}
              placeholder="Select your primary currency..."
              className="w-full"
              autoDetectLocation={settings.autoDetectLocation}
            />
            <p className="text-xs text-muted-foreground">
              This is your organization's main currency for financial reporting and billing.
            </p>
          </div>

          <Separator />

          {/* Multi-Currency Support */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Enable Multi-Currency Support</Label>
                <p className="text-xs text-muted-foreground">
                  Allow transactions and pricing in multiple currencies
                </p>
              </div>
              <Switch
                checked={settings.allowMultipleCurrencies}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, allowMultipleCurrencies: checked }))
                }
              />
            </div>

            {settings.allowMultipleCurrencies && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Supported Currencies</Label>
                  <CurrencySelector
                    value=""
                    onValueChange={addSupportedCurrency}
                    placeholder="Add currency..."
                    className="w-48"
                    showCountryFlags={false}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {settings.supportedCurrencies.map((currency) => (
                    <Badge
                      key={currency}
                      variant={currency === settings.baseCurrency ? "default" : "secondary"}
                      className="flex items-center gap-2 px-3 py-1"
                    >
                      <span className="font-medium">{currency}</span>
                      {currency === settings.baseCurrency && (
                        <Check className="h-3 w-3" />
                      )}
                      {currency !== settings.baseCurrency && settings.supportedCurrencies.length > 1 && (
                        <button
                          onClick={() => removeSupportedCurrency(currency)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Additional Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Auto-Detect Location</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically suggest currency based on user's location
                </p>
              </div>
              <Switch
                checked={settings.autoDetectLocation}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, autoDetectLocation: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Show Exchange Rates</Label>
                <p className="text-xs text-muted-foreground">
                  Display current exchange rates to users
                </p>
              </div>
              <Switch
                checked={settings.showExchangeRates}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, showExchangeRates: checked }))
                }
              />
            </div>
          </div>

          {/* Exchange Rates Display */}
          {settings.showExchangeRates && settings.supportedCurrencies.length > 1 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <Label className="text-sm font-medium">Current Exchange Rates</Label>
                  <Badge variant="outline" className="text-xs">
                    Base: {settings.baseCurrency}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {settings.supportedCurrencies
                    .filter(currency => currency !== settings.baseCurrency)
                    .map((currency) => (
                      <div key={currency} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-sm">{currency}</span>
                        <span className="text-sm text-muted-foreground">
                          {exchangeRates?.[currency] ? 
                            `${exchangeRates[currency].toFixed(4)}` : 
                            'Loading...'
                          }
                        </span>
                      </div>
                    ))
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Exchange rates are updated every 5 minutes from reliable financial data sources.
                </p>
              </div>
            </>
          )}

          {/* Save Button */}
          <div className="flex items-center gap-3 pt-4">
            <Button 
              onClick={saveCurrencySettings}
              disabled={updateCurrencyMutation.isPending}
              className="flex items-center gap-2"
            >
              {updateCurrencyMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Currency Settings
                </>
              )}
            </Button>
            
            {/* Status indicator */}
            {tenant && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {tenant.type?.toUpperCase()}
                </Badge>
                <span>•</span>
                <span>{tenant.name}</span>
              </div>
            )}
          </div>

          {/* African Currency Notice */}
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-600 mt-0.5">
              <Globe className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-800">
                Comprehensive African Currency Support
              </p>
              <p className="text-sm text-green-700">
                Our platform supports all major African currencies including Naira (NGN), Rand (ZAR), 
                Kenyan Shilling (KES), Egyptian Pound (EGP), and many more. Currency conversion rates 
                are updated in real-time to ensure accurate international healthcare transactions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}