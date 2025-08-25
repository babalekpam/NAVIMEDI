import { useState, useEffect } from "react";
import { Check, ChevronDown, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  region: string;
  country: string;
  popular?: boolean;
}

interface CurrencySelectorProps {
  value?: string;
  onValueChange: (currency: string) => void;
  placeholder?: string;
  className?: string;
  showCountryFlags?: boolean;
  showRegions?: boolean;
  disabled?: boolean;
  autoDetectLocation?: boolean;
}

// Comprehensive currency list with African currencies highlighted
const currencies: Currency[] = [
  // Major Global Currencies
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", region: "North America", country: "United States", popular: true },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", region: "Europe", country: "Eurozone", popular: true },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", region: "Europe", country: "United Kingdom", popular: true },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", region: "Asia", country: "Japan", popular: true },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭", region: "Europe", country: "Switzerland" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦", region: "North America", country: "Canada" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", region: "Oceania", country: "Australia" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", region: "Asia", country: "China" },

  // African Currencies - Comprehensive List
  { code: "DZD", name: "Algerian Dinar", symbol: "DA", flag: "🇩🇿", region: "Africa", country: "Algeria", popular: true },
  { code: "AOA", name: "Angolan Kwanza", symbol: "Kz", flag: "🇦🇴", region: "Africa", country: "Angola", popular: true },
  { code: "XOF", name: "West African CFA Franc", symbol: "CFA", flag: "🌍", region: "Africa", country: "West Africa (8 countries)", popular: true },
  { code: "BWP", name: "Botswana Pula", symbol: "P", flag: "🇧🇼", region: "Africa", country: "Botswana" },
  { code: "BIF", name: "Burundian Franc", symbol: "FBu", flag: "🇧🇮", region: "Africa", country: "Burundi" },
  { code: "XAF", name: "Central African CFA Franc", symbol: "FCFA", flag: "🌍", region: "Africa", country: "Central Africa (6 countries)", popular: true },
  { code: "CVE", name: "Cape Verdean Escudo", symbol: "$", flag: "🇨🇻", region: "Africa", country: "Cape Verde" },
  { code: "KMF", name: "Comorian Franc", symbol: "CF", flag: "🇰🇲", region: "Africa", country: "Comoros" },
  { code: "CDF", name: "Congolese Franc", symbol: "FC", flag: "🇨🇩", region: "Africa", country: "Democratic Republic of Congo" },
  { code: "DJF", name: "Djiboutian Franc", symbol: "Fdj", flag: "🇩🇯", region: "Africa", country: "Djibouti" },
  { code: "EGP", name: "Egyptian Pound", symbol: "£", flag: "🇪🇬", region: "Africa", country: "Egypt", popular: true },
  { code: "ERN", name: "Eritrean Nakfa", symbol: "Nfk", flag: "🇪🇷", region: "Africa", country: "Eritrea" },
  { code: "SZL", name: "Eswatini Lilangeni", symbol: "L", flag: "🇸🇿", region: "Africa", country: "Eswatini" },
  { code: "ETB", name: "Ethiopian Birr", symbol: "Br", flag: "🇪🇹", region: "Africa", country: "Ethiopia", popular: true },
  { code: "GMD", name: "Gambian Dalasi", symbol: "D", flag: "🇬🇲", region: "Africa", country: "Gambia" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", flag: "🇬🇭", region: "Africa", country: "Ghana", popular: true },
  { code: "GNF", name: "Guinean Franc", symbol: "FG", flag: "🇬🇳", region: "Africa", country: "Guinea" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪", region: "Africa", country: "Kenya", popular: true },
  { code: "LSL", name: "Lesotho Loti", symbol: "L", flag: "🇱🇸", region: "Africa", country: "Lesotho" },
  { code: "LRD", name: "Liberian Dollar", symbol: "L$", flag: "🇱🇷", region: "Africa", country: "Liberia" },
  { code: "LYD", name: "Libyan Dinar", symbol: "LD", flag: "🇱🇾", region: "Africa", country: "Libya" },
  { code: "MGA", name: "Malagasy Ariary", symbol: "Ar", flag: "🇲🇬", region: "Africa", country: "Madagascar" },
  { code: "MWK", name: "Malawian Kwacha", symbol: "MK", flag: "🇲🇼", region: "Africa", country: "Malawi" },
  { code: "MRU", name: "Mauritanian Ouguiya", symbol: "UM", flag: "🇲🇷", region: "Africa", country: "Mauritania" },
  { code: "MUR", name: "Mauritian Rupee", symbol: "₨", flag: "🇲🇺", region: "Africa", country: "Mauritius" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "MAD", flag: "🇲🇦", region: "Africa", country: "Morocco", popular: true },
  { code: "MZN", name: "Mozambican Metical", symbol: "MT", flag: "🇲🇿", region: "Africa", country: "Mozambique" },
  { code: "NAD", name: "Namibian Dollar", symbol: "N$", flag: "🇳🇦", region: "Africa", country: "Namibia" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", region: "Africa", country: "Nigeria", popular: true },
  { code: "RWF", name: "Rwandan Franc", symbol: "RF", flag: "🇷🇼", region: "Africa", country: "Rwanda" },
  { code: "STN", name: "São Tomé and Príncipe Dobra", symbol: "Db", flag: "🇸🇹", region: "Africa", country: "São Tomé and Príncipe" },
  { code: "SCR", name: "Seychellois Rupee", symbol: "₨", flag: "🇸🇨", region: "Africa", country: "Seychelles" },
  { code: "SLE", name: "Sierra Leonean Leone", symbol: "Le", flag: "🇸🇱", region: "Africa", country: "Sierra Leone" },
  { code: "SOS", name: "Somali Shilling", symbol: "Sh.So.", flag: "🇸🇴", region: "Africa", country: "Somalia" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", region: "Africa", country: "South Africa", popular: true },
  { code: "SSP", name: "South Sudanese Pound", symbol: "SSP", flag: "🇸🇸", region: "Africa", country: "South Sudan" },
  { code: "SDG", name: "Sudanese Pound", symbol: "ج.س.", flag: "🇸🇩", region: "Africa", country: "Sudan" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", flag: "🇹🇿", region: "Africa", country: "Tanzania", popular: true },
  { code: "TND", name: "Tunisian Dinar", symbol: "د.ت", flag: "🇹🇳", region: "Africa", country: "Tunisia", popular: true },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh", flag: "🇺🇬", region: "Africa", country: "Uganda", popular: true },
  { code: "ZMW", name: "Zambian Kwacha", symbol: "ZK", flag: "🇿🇲", region: "Africa", country: "Zambia" },
  { code: "ZWL", name: "Zimbabwean Dollar", symbol: "Z$", flag: "🇿🇼", region: "Africa", country: "Zimbabwe" }
];

// Country-based currency detection
const detectCurrencyFromLocation = (): string => {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = navigator.language || 'en-US';
    
    // Basic location-based currency detection
    const countryCode = locale.split('-')[1]?.toUpperCase();
    const currencyMap: Record<string, string> = {
      'US': 'USD', 'GB': 'GBP', 'CA': 'CAD', 'AU': 'AUD', 'JP': 'JPY',
      'NG': 'NGN', 'ZA': 'ZAR', 'KE': 'KES', 'GH': 'GHS', 'EG': 'EGP',
      'MA': 'MAD', 'TN': 'TND', 'DZ': 'DZD', 'AO': 'AOA', 'ET': 'ETB',
      'TZ': 'TZS', 'UG': 'UGX', 'RW': 'RWF', 'BW': 'BWP', 'MU': 'MUR'
    };
    
    return currencyMap[countryCode || ''] || 'USD';
  } catch {
    return 'USD';
  }
};

export function CurrencySelector({
  value,
  onValueChange,
  placeholder = "Select currency...",
  className,
  showCountryFlags = true,
  showRegions = true,
  disabled = false,
  autoDetectLocation = true
}: CurrencySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Auto-detect currency on mount
  useEffect(() => {
    if (autoDetectLocation && !value) {
      const detectedCurrency = detectCurrencyFromLocation();
      onValueChange(detectedCurrency);
    }
  }, [autoDetectLocation, value, onValueChange]);

  const selectedCurrency = currencies.find(currency => currency.code === value);
  
  // Group currencies by region
  const popularCurrencies = currencies.filter(c => c.popular);
  const africaCurrencies = currencies.filter(c => c.region === "Africa");
  const otherCurrencies = currencies.filter(c => c.region !== "Africa" && !c.popular);

  // Filter currencies based on search
  const filterCurrencies = (currencyList: Currency[]) => {
    if (!searchValue) return currencyList;
    return currencyList.filter(currency =>
      currency.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      currency.code.toLowerCase().includes(searchValue.toLowerCase()) ||
      currency.country.toLowerCase().includes(searchValue.toLowerCase())
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            {selectedCurrency ? (
              <>
                {showCountryFlags && <span className="text-lg">{selectedCurrency.flag}</span>}
                <span className="font-medium">{selectedCurrency.code}</span>
                <span className="text-sm text-muted-foreground">{selectedCurrency.symbol}</span>
                <span className="text-xs text-muted-foreground max-w-32 truncate">
                  {selectedCurrency.name}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search currencies..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>No currency found.</CommandEmpty>
            
            {/* Auto-detected location hint */}
            {autoDetectLocation && !value && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground border-b">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span>Auto-detected: {detectCurrencyFromLocation()}</span>
                </div>
              </div>
            )}

            {/* Popular Currencies */}
            <CommandGroup heading="Popular Currencies">
              {filterCurrencies(popularCurrencies).map((currency) => (
                <CommandItem
                  key={currency.code}
                  value={currency.code}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue.toUpperCase());
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 py-2"
                >
                  {showCountryFlags && <span className="text-lg">{currency.flag}</span>}
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency.code}</span>
                      <span className="text-sm font-medium">{currency.symbol}</span>
                      {currency.region === "Africa" && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">Africa</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{currency.name}</span>
                    <span className="text-xs text-muted-foreground">{currency.country}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === currency.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>

            {/* African Currencies */}
            <CommandGroup heading="African Currencies">
              {filterCurrencies(africaCurrencies).map((currency) => (
                <CommandItem
                  key={currency.code}
                  value={currency.code}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue.toUpperCase());
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 py-2"
                >
                  {showCountryFlags && <span className="text-lg">{currency.flag}</span>}
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency.code}</span>
                      <span className="text-sm font-medium">{currency.symbol}</span>
                      <Badge variant="outline" className="text-xs px-1.5 py-0 border-green-200 text-green-700 bg-green-50">
                        Africa
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{currency.name}</span>
                    <span className="text-xs text-muted-foreground">{currency.country}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === currency.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>

            {/* Other Currencies */}
            {filterCurrencies(otherCurrencies).length > 0 && (
              <CommandGroup heading="Other Currencies">
                {filterCurrencies(otherCurrencies).map((currency) => (
                  <CommandItem
                    key={currency.code}
                    value={currency.code}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue.toUpperCase());
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 py-2"
                  >
                    {showCountryFlags && <span className="text-lg">{currency.flag}</span>}
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{currency.code}</span>
                        <span className="text-sm font-medium">{currency.symbol}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{currency.name}</span>
                      <span className="text-xs text-muted-foreground">{currency.country}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === currency.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}