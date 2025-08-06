import React, { useState } from "react";
import { useTenantCurrencies, useAllCurrencies, formatCurrencyAmount } from "@/hooks/useCurrency";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Globe, DollarSign, MapPin, Settings } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CurrencyDisplayProps {
  amount?: number;
  showConverter?: boolean;
  showSettings?: boolean;
  compact?: boolean;
}

export function CurrencyDisplay({ 
  amount = 100, 
  showConverter = false, 
  showSettings = false,
  compact = false 
}: CurrencyDisplayProps) {
  const { data: tenantCurrencies, isLoading } = useTenantCurrencies();
  const { data: allCurrencies } = useAllCurrencies();
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateCurrencySettings = useMutation({
    mutationFn: async ({ baseCurrency, supportedCurrencies }: { 
      baseCurrency: string; 
      supportedCurrencies: string[] 
    }) => {
      return await apiRequest("PATCH", "/api/tenant/currencies", { 
        baseCurrency, 
        supportedCurrencies 
      });
    },
    onSuccess: () => {
      toast({
        title: "Currency settings updated",
        description: "Your organization's currency preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/currencies"] });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Failed to update currency settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const convertCurrency = useMutation({
    mutationFn: async ({ fromCurrency, toCurrency }: { 
      fromCurrency: string; 
      toCurrency: string 
    }) => {
      return await apiRequest("POST", "/api/currencies/convert", {
        amount,
        fromCurrency,
        toCurrency
      });
    },
    onSuccess: (result) => {
      setConvertedAmount(result.convertedAmount);
    },
    onError: () => {
      toast({
        title: "Conversion failed",
        description: "Unable to convert currency. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-20 rounded"></div>;
  }

  if (!tenantCurrencies) {
    return <div>No currency data available</div>;
  }

  const baseCurrencyInfo = tenantCurrencies.supportedCurrencies.find(
    c => c.code === tenantCurrencies.baseCurrency
  );

  const handleCurrencyConversion = () => {
    if (selectedCurrency && selectedCurrency !== tenantCurrencies.baseCurrency) {
      convertCurrency.mutate({
        fromCurrency: tenantCurrencies.baseCurrency,
        toCurrency: selectedCurrency
      });
    }
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">
          {baseCurrencyInfo ? 
            formatCurrencyAmount(amount, tenantCurrencies.baseCurrency, baseCurrencyInfo) : 
            `${tenantCurrencies.baseCurrency} ${amount}`
          }
        </span>
        {tenantCurrencies.supportedCurrencies.length > 1 && (
          <Badge variant="secondary" className="text-xs">
            +{tenantCurrencies.supportedCurrencies.length - 1} more
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Multi-Currency Display
        </CardTitle>
        {showSettings && (
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Currency Display */}
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Base Currency</p>
              <p className="font-semibold">
                {baseCurrencyInfo?.name || tenantCurrencies.baseCurrency}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {baseCurrencyInfo ? 
                formatCurrencyAmount(amount, tenantCurrencies.baseCurrency, baseCurrencyInfo) : 
                `${tenantCurrencies.baseCurrency} ${amount}`
              }
            </p>
            <p className="text-xs text-muted-foreground">
              {baseCurrencyInfo?.country}
            </p>
          </div>
        </div>

        {/* Supported Currencies */}
        {tenantCurrencies.supportedCurrencies.length > 1 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Supported Currencies
            </p>
            <div className="flex flex-wrap gap-2">
              {tenantCurrencies.supportedCurrencies.map((currency) => (
                <Badge 
                  key={currency.code} 
                  variant={currency.code === tenantCurrencies.baseCurrency ? "default" : "secondary"}
                  className="text-xs"
                >
                  {currency.symbol} {currency.code} - {currency.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Currency Converter */}
        {showConverter && allCurrencies && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Currency Converter</p>
            <div className="flex gap-2">
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select target currency" />
                </SelectTrigger>
                <SelectContent>
                  {allCurrencies
                    .filter(c => c.code !== tenantCurrencies.baseCurrency)
                    .map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleCurrencyConversion}
                disabled={!selectedCurrency || convertCurrency.isPending}
              >
                Convert
              </Button>
            </div>
            
            {convertedAmount !== null && selectedCurrency && (
              <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                <p className="text-sm">
                  <strong>
                    {formatCurrencyAmount(
                      convertedAmount, 
                      selectedCurrency, 
                      allCurrencies.find(c => c.code === selectedCurrency)
                    )}
                  </strong>
                  <span className="text-muted-foreground ml-2">
                    (converted from {baseCurrencyInfo ? 
                      formatCurrencyAmount(amount, tenantCurrencies.baseCurrency, baseCurrencyInfo) : 
                      `${tenantCurrencies.baseCurrency} ${amount}`
                    })
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CurrencyDisplay;