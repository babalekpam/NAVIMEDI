import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, DollarSign, MapPin } from "lucide-react";

interface CountryInfo {
  code: string;
  name: string;
  currency: string;
  currencyName: string;
  supportedCurrencies: string[];
}

interface CountryCurrencySelectorProps {
  selectedCountry?: string;
  selectedCurrency?: string;
  onCountryChange: (countryCode: string, countryData: CountryInfo) => void;
  onCurrencyChange: (currency: string) => void;
  showCurrencyPreview?: boolean;
  focusRegion?: 'african' | 'global';
  className?: string;
}

export function CountryCurrencySelector({
  selectedCountry = '',
  selectedCurrency = '',
  onCountryChange,
  onCurrencyChange,
  showCurrencyPreview = true,
  focusRegion = 'global',
  className = ''
}: CountryCurrencySelectorProps) {
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [selectedCountryData, setSelectedCountryData] = useState<CountryInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const endpoint = focusRegion === 'african' 
          ? '/api/countries/african' 
          : '/api/countries';
        
        // For now, use static data since API might not be set up yet
        const staticCountries: CountryInfo[] = [
          // African Countries (prioritized)
          { code: 'NG', name: 'Nigeria', currency: 'NGN', currencyName: 'Nigerian Naira', supportedCurrencies: ['NGN', 'USD', 'EUR'] },
          { code: 'ZA', name: 'South Africa', currency: 'ZAR', currencyName: 'South African Rand', supportedCurrencies: ['ZAR', 'USD', 'EUR'] },
          { code: 'KE', name: 'Kenya', currency: 'KES', currencyName: 'Kenyan Shilling', supportedCurrencies: ['KES', 'USD', 'EUR'] },
          { code: 'GH', name: 'Ghana', currency: 'GHS', currencyName: 'Ghanaian Cedi', supportedCurrencies: ['GHS', 'USD', 'EUR'] },
          { code: 'EG', name: 'Egypt', currency: 'EGP', currencyName: 'Egyptian Pound', supportedCurrencies: ['EGP', 'USD', 'EUR'] },
          { code: 'MA', name: 'Morocco', currency: 'MAD', currencyName: 'Moroccan Dirham', supportedCurrencies: ['MAD', 'USD', 'EUR'] },
          { code: 'TN', name: 'Tunisia', currency: 'TND', currencyName: 'Tunisian Dinar', supportedCurrencies: ['TND', 'USD', 'EUR'] },
          { code: 'ET', name: 'Ethiopia', currency: 'ETB', currencyName: 'Ethiopian Birr', supportedCurrencies: ['ETB', 'USD', 'EUR'] },
          { code: 'TZ', name: 'Tanzania', currency: 'TZS', currencyName: 'Tanzanian Shilling', supportedCurrencies: ['TZS', 'USD', 'EUR'] },
          { code: 'UG', name: 'Uganda', currency: 'UGX', currencyName: 'Ugandan Shilling', supportedCurrencies: ['UGX', 'USD', 'EUR'] },
          { code: 'ZM', name: 'Zambia', currency: 'ZMW', currencyName: 'Zambian Kwacha', supportedCurrencies: ['ZMW', 'USD', 'EUR'] },
          { code: 'ZW', name: 'Zimbabwe', currency: 'ZWL', currencyName: 'Zimbabwean Dollar', supportedCurrencies: ['ZWL', 'USD', 'EUR'] },
          { code: 'BW', name: 'Botswana', currency: 'BWP', currencyName: 'Botswana Pula', supportedCurrencies: ['BWP', 'USD', 'ZAR'] },
          { code: 'MZ', name: 'Mozambique', currency: 'MZN', currencyName: 'Mozambican Metical', supportedCurrencies: ['MZN', 'USD', 'EUR'] },
          { code: 'MW', name: 'Malawi', currency: 'MWK', currencyName: 'Malawian Kwacha', supportedCurrencies: ['MWK', 'USD', 'EUR'] },
          { code: 'RW', name: 'Rwanda', currency: 'RWF', currencyName: 'Rwandan Franc', supportedCurrencies: ['RWF', 'USD', 'EUR'] },
          { code: 'SN', name: 'Senegal', currency: 'XOF', currencyName: 'West African CFA Franc', supportedCurrencies: ['XOF', 'USD', 'EUR'] },
          { code: 'CI', name: 'Côte d\'Ivoire', currency: 'XOF', currencyName: 'West African CFA Franc', supportedCurrencies: ['XOF', 'USD', 'EUR'] },
          { code: 'CM', name: 'Cameroon', currency: 'XAF', currencyName: 'Central African CFA Franc', supportedCurrencies: ['XAF', 'USD', 'EUR'] },
          { code: 'AO', name: 'Angola', currency: 'AOA', currencyName: 'Angolan Kwanza', supportedCurrencies: ['AOA', 'USD', 'EUR'] },
          
          // Global Countries
          { code: 'US', name: 'United States', currency: 'USD', currencyName: 'US Dollar', supportedCurrencies: ['USD', 'EUR', 'GBP'] },
          { code: 'GB', name: 'United Kingdom', currency: 'GBP', currencyName: 'British Pound Sterling', supportedCurrencies: ['GBP', 'USD', 'EUR'] },
          { code: 'CA', name: 'Canada', currency: 'CAD', currencyName: 'Canadian Dollar', supportedCurrencies: ['CAD', 'USD', 'EUR'] },
          { code: 'AU', name: 'Australia', currency: 'AUD', currencyName: 'Australian Dollar', supportedCurrencies: ['AUD', 'USD', 'EUR'] },
          { code: 'DE', name: 'Germany', currency: 'EUR', currencyName: 'Euro', supportedCurrencies: ['EUR', 'USD', 'GBP'] },
          { code: 'FR', name: 'France', currency: 'EUR', currencyName: 'Euro', supportedCurrencies: ['EUR', 'USD', 'GBP'] },
          { code: 'IT', name: 'Italy', currency: 'EUR', currencyName: 'Euro', supportedCurrencies: ['EUR', 'USD', 'GBP'] },
          { code: 'ES', name: 'Spain', currency: 'EUR', currencyName: 'Euro', supportedCurrencies: ['EUR', 'USD', 'GBP'] },
          { code: 'IN', name: 'India', currency: 'INR', currencyName: 'Indian Rupee', supportedCurrencies: ['INR', 'USD', 'EUR'] },
          { code: 'CN', name: 'China', currency: 'CNY', currencyName: 'Chinese Yuan', supportedCurrencies: ['CNY', 'USD', 'EUR'] },
          { code: 'JP', name: 'Japan', currency: 'JPY', currencyName: 'Japanese Yen', supportedCurrencies: ['JPY', 'USD', 'EUR'] },
          { code: 'BR', name: 'Brazil', currency: 'BRL', currencyName: 'Brazilian Real', supportedCurrencies: ['BRL', 'USD', 'EUR'] },
          { code: 'MX', name: 'Mexico', currency: 'MXN', currencyName: 'Mexican Peso', supportedCurrencies: ['MXN', 'USD', 'EUR'] }
        ];

        if (focusRegion === 'african') {
          setCountries(staticCountries.filter(c => 
            ['NG', 'ZA', 'KE', 'GH', 'EG', 'MA', 'TN', 'ET', 'TZ', 'UG', 'ZM', 'ZW', 'BW', 'MZ', 'MW', 'RW', 'SN', 'CI', 'CM', 'AO'].includes(c.code)
          ));
        } else {
          setCountries(staticCountries);
        }
      } catch (error) {
        console.error('Failed to load countries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, [focusRegion]);

  const handleCountrySelect = (countryCode: string) => {
    const countryData = countries.find(c => c.code === countryCode);
    if (countryData) {
      setSelectedCountryData(countryData);
      onCountryChange(countryCode, countryData);
      // Auto-select the primary currency
      if (!selectedCurrency) {
        onCurrencyChange(countryData.currency);
      }
    }
  };

  const handleCurrencySelect = (currency: string) => {
    onCurrencyChange(currency);
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Country Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Country/Region
        </label>
        <Select value={selectedCountry} onValueChange={handleCountrySelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center justify-between w-full">
                  <span>{country.name}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {country.currency}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Currency Selection */}
      {selectedCountryData && (
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Primary Currency
          </label>
          <Select value={selectedCurrency} onValueChange={handleCurrencySelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select primary currency" />
            </SelectTrigger>
            <SelectContent>
              {selectedCountryData.supportedCurrencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  <div className="flex items-center justify-between w-full">
                    <span>{currency}</span>
                    {currency === selectedCountryData.currency && (
                      <Badge variant="default" className="ml-2 text-xs">
                        Local
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Currency Preview */}
      {showCurrencyPreview && selectedCountryData && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-semibold">{selectedCountryData.name}</p>
                <p className="text-sm text-muted-foreground">
                  Primary: {selectedCountryData.currencyName} ({selectedCountryData.currency})
                </p>
              </div>
              <div className="text-right">
                <Badge variant="default">{selectedCurrency || selectedCountryData.currency}</Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedCountryData.supportedCurrencies.length} currencies supported
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CountryCurrencySelector;