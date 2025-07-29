// Geographic location to currency mapping for automatic currency assignment
export interface CountryCurrencyMapping {
  country: string;
  currency: string;
  region: string;
  supportedCurrencies: string[];
}

// Comprehensive country-to-currency mapping
export const COUNTRY_CURRENCY_MAP: CountryCurrencyMapping[] = [
  // North America
  { country: "United States", currency: "USD", region: "North America", supportedCurrencies: ["USD", "CAD"] },
  { country: "Canada", currency: "CAD", region: "North America", supportedCurrencies: ["CAD", "USD"] },
  { country: "Mexico", currency: "MXN", region: "North America", supportedCurrencies: ["MXN", "USD"] },

  // Europe
  { country: "Germany", currency: "EUR", region: "Europe", supportedCurrencies: ["EUR", "USD"] },
  { country: "France", currency: "EUR", region: "Europe", supportedCurrencies: ["EUR", "USD"] },
  { country: "Spain", currency: "EUR", region: "Europe", supportedCurrencies: ["EUR", "USD"] },
  { country: "Italy", currency: "EUR", region: "Europe", supportedCurrencies: ["EUR", "USD"] },
  { country: "United Kingdom", currency: "GBP", region: "Europe", supportedCurrencies: ["GBP", "EUR", "USD"] },
  { country: "Switzerland", currency: "CHF", region: "Europe", supportedCurrencies: ["CHF", "EUR", "USD"] },

  // Africa - West Africa
  { country: "Nigeria", currency: "NGN", region: "Africa", supportedCurrencies: ["NGN", "USD", "EUR"] },
  { country: "Ghana", currency: "GHS", region: "Africa", supportedCurrencies: ["GHS", "USD", "EUR"] },
  { country: "Senegal", currency: "XOF", region: "Africa", supportedCurrencies: ["XOF", "EUR", "USD"] },
  { country: "Mali", currency: "XOF", region: "Africa", supportedCurrencies: ["XOF", "EUR", "USD"] },
  { country: "Burkina Faso", currency: "XOF", region: "Africa", supportedCurrencies: ["XOF", "EUR", "USD"] },
  { country: "Ivory Coast", currency: "XOF", region: "Africa", supportedCurrencies: ["XOF", "EUR", "USD"] },
  { country: "Guinea", currency: "GNF", region: "Africa", supportedCurrencies: ["GNF", "EUR", "USD"] },
  { country: "Sierra Leone", currency: "SLL", region: "Africa", supportedCurrencies: ["SLL", "USD", "EUR"] },
  { country: "Liberia", currency: "LRD", region: "Africa", supportedCurrencies: ["LRD", "USD"] },
  { country: "Gambia", currency: "GMD", region: "Africa", supportedCurrencies: ["GMD", "EUR", "USD"] },
  { country: "Cape Verde", currency: "CVE", region: "Africa", supportedCurrencies: ["CVE", "EUR", "USD"] },
  { country: "Togo", currency: "XOF", region: "Africa", supportedCurrencies: ["XOF", "EUR", "USD"] },
  { country: "Benin", currency: "XOF", region: "Africa", supportedCurrencies: ["XOF", "EUR", "USD"] },

  // Africa - East Africa
  { country: "Kenya", currency: "KES", region: "Africa", supportedCurrencies: ["KES", "USD", "EUR"] },
  { country: "Tanzania", currency: "TZS", region: "Africa", supportedCurrencies: ["TZS", "USD", "EUR"] },
  { country: "Uganda", currency: "UGX", region: "Africa", supportedCurrencies: ["UGX", "USD", "EUR"] },
  { country: "Rwanda", currency: "RWF", region: "Africa", supportedCurrencies: ["RWF", "USD", "EUR"] },
  { country: "Burundi", currency: "BIF", region: "Africa", supportedCurrencies: ["BIF", "USD", "EUR"] },
  { country: "Ethiopia", currency: "ETB", region: "Africa", supportedCurrencies: ["ETB", "USD", "EUR"] },
  { country: "Somalia", currency: "SOS", region: "Africa", supportedCurrencies: ["SOS", "USD"] },
  { country: "Djibouti", currency: "DJF", region: "Africa", supportedCurrencies: ["DJF", "USD", "EUR"] },

  // Africa - North Africa
  { country: "Egypt", currency: "EGP", region: "Africa", supportedCurrencies: ["EGP", "USD", "EUR"] },
  { country: "Libya", currency: "LYD", region: "Africa", supportedCurrencies: ["LYD", "USD", "EUR"] },
  { country: "Tunisia", currency: "TND", region: "Africa", supportedCurrencies: ["TND", "EUR", "USD"] },
  { country: "Algeria", currency: "DZD", region: "Africa", supportedCurrencies: ["DZD", "EUR", "USD"] },
  { country: "Morocco", currency: "MAD", region: "Africa", supportedCurrencies: ["MAD", "EUR", "USD"] },
  { country: "Sudan", currency: "SDG", region: "Africa", supportedCurrencies: ["SDG", "USD", "EUR"] },
  { country: "South Sudan", currency: "SSP", region: "Africa", supportedCurrencies: ["SSP", "USD"] },

  // Africa - Southern Africa
  { country: "South Africa", currency: "ZAR", region: "Africa", supportedCurrencies: ["ZAR", "USD", "EUR"] },
  { country: "Botswana", currency: "BWP", region: "Africa", supportedCurrencies: ["BWP", "USD", "ZAR"] },
  { country: "Namibia", currency: "NAD", region: "Africa", supportedCurrencies: ["NAD", "ZAR", "USD"] },
  { country: "Zimbabwe", currency: "ZWL", region: "Africa", supportedCurrencies: ["ZWL", "USD", "ZAR"] },
  { country: "Zambia", currency: "ZMW", region: "Africa", supportedCurrencies: ["ZMW", "USD", "ZAR"] },
  { country: "Malawi", currency: "MWK", region: "Africa", supportedCurrencies: ["MWK", "USD", "ZAR"] },
  { country: "Mozambique", currency: "MZN", region: "Africa", supportedCurrencies: ["MZN", "USD", "ZAR"] },
  { country: "Angola", currency: "AOA", region: "Africa", supportedCurrencies: ["AOA", "USD", "EUR"] },

  // Africa - Central Africa
  { country: "Cameroon", currency: "XAF", region: "Africa", supportedCurrencies: ["XAF", "EUR", "USD"] },
  { country: "Central African Republic", currency: "XAF", region: "Africa", supportedCurrencies: ["XAF", "EUR", "USD"] },
  { country: "Chad", currency: "XAF", region: "Africa", supportedCurrencies: ["XAF", "EUR", "USD"] },
  { country: "Republic of the Congo", currency: "XAF", region: "Africa", supportedCurrencies: ["XAF", "EUR", "USD"] },
  { country: "Democratic Republic of the Congo", currency: "CDF", region: "Africa", supportedCurrencies: ["CDF", "USD", "EUR"] },
  { country: "Equatorial Guinea", currency: "XAF", region: "Africa", supportedCurrencies: ["XAF", "EUR", "USD"] },
  { country: "Gabon", currency: "XAF", region: "Africa", supportedCurrencies: ["XAF", "EUR", "USD"] },

  // Asia
  { country: "Japan", currency: "JPY", region: "Asia", supportedCurrencies: ["JPY", "USD"] },
  { country: "China", currency: "CNY", region: "Asia", supportedCurrencies: ["CNY", "USD"] },
  { country: "India", currency: "INR", region: "Asia", supportedCurrencies: ["INR", "USD"] },
  { country: "South Korea", currency: "KRW", region: "Asia", supportedCurrencies: ["KRW", "USD"] },
  { country: "Singapore", currency: "SGD", region: "Asia", supportedCurrencies: ["SGD", "USD"] },
  { country: "Thailand", currency: "THB", region: "Asia", supportedCurrencies: ["THB", "USD"] },
  { country: "Malaysia", currency: "MYR", region: "Asia", supportedCurrencies: ["MYR", "USD"] },
  { country: "Indonesia", currency: "IDR", region: "Asia", supportedCurrencies: ["IDR", "USD"] },
  { country: "Philippines", currency: "PHP", region: "Asia", supportedCurrencies: ["PHP", "USD"] },
  { country: "Vietnam", currency: "VND", region: "Asia", supportedCurrencies: ["VND", "USD"] },

  // Australia & Oceania
  { country: "Australia", currency: "AUD", region: "Oceania", supportedCurrencies: ["AUD", "USD"] },
  { country: "New Zealand", currency: "NZD", region: "Oceania", supportedCurrencies: ["NZD", "AUD", "USD"] },

  // Middle East
  { country: "United Arab Emirates", currency: "AED", region: "Middle East", supportedCurrencies: ["AED", "USD"] },
  { country: "Saudi Arabia", currency: "SAR", region: "Middle East", supportedCurrencies: ["SAR", "USD"] },
  { country: "Qatar", currency: "QAR", region: "Middle East", supportedCurrencies: ["QAR", "USD"] },
  { country: "Kuwait", currency: "KWD", region: "Middle East", supportedCurrencies: ["KWD", "USD"] },
  { country: "Bahrain", currency: "BHD", region: "Middle East", supportedCurrencies: ["BHD", "USD"] },
  { country: "Oman", currency: "OMR", region: "Middle East", supportedCurrencies: ["OMR", "USD"] },
  { country: "Israel", currency: "ILS", region: "Middle East", supportedCurrencies: ["ILS", "USD"] },
  { country: "Jordan", currency: "JOD", region: "Middle East", supportedCurrencies: ["JOD", "USD"] },
  { country: "Lebanon", currency: "LBP", region: "Middle East", supportedCurrencies: ["LBP", "USD"] }
];

// Get currency information by country name
export function getCurrencyByCountry(country: string): CountryCurrencyMapping | null {
  const normalizedCountry = country.toLowerCase().trim();
  
  return COUNTRY_CURRENCY_MAP.find(mapping => 
    mapping.country.toLowerCase() === normalizedCountry ||
    mapping.country.toLowerCase().includes(normalizedCountry) ||
    normalizedCountry.includes(mapping.country.toLowerCase())
  ) || null;
}

// Get all countries in a specific region
export function getCountriesByRegion(region: string): CountryCurrencyMapping[] {
  return COUNTRY_CURRENCY_MAP.filter(mapping => 
    mapping.region.toLowerCase() === region.toLowerCase()
  );
}

// Get all African countries and their currencies
export function getAfricanCountries(): CountryCurrencyMapping[] {
  return getCountriesByRegion("Africa");
}

// Auto-detect currency based on hospital address or country
export function autoDetectCurrency(address?: string, country?: string): CountryCurrencyMapping | null {
  if (country) {
    return getCurrencyByCountry(country);
  }
  
  if (address) {
    // Try to extract country from address
    const addressLower = address.toLowerCase();
    
    for (const mapping of COUNTRY_CURRENCY_MAP) {
      const countryLower = mapping.country.toLowerCase();
      if (addressLower.includes(countryLower)) {
        return mapping;
      }
    }
    
    // Check for common country abbreviations or city names
    if (addressLower.includes('usa') || addressLower.includes('united states') || 
        addressLower.includes('new york') || addressLower.includes('california')) {
      return getCurrencyByCountry("United States");
    }
    
    if (addressLower.includes('uk') || addressLower.includes('london') || 
        addressLower.includes('manchester') || addressLower.includes('birmingham')) {
      return getCurrencyByCountry("United Kingdom");
    }
    
    if (addressLower.includes('lagos') || addressLower.includes('abuja') || 
        addressLower.includes('kano') || addressLower.includes('ibadan')) {
      return getCurrencyByCountry("Nigeria");
    }
    
    if (addressLower.includes('accra') || addressLower.includes('kumasi')) {
      return getCurrencyByCountry("Ghana");
    }
    
    if (addressLower.includes('nairobi') || addressLower.includes('mombasa')) {
      return getCurrencyByCountry("Kenya");
    }
    
    if (addressLower.includes('cairo') || addressLower.includes('alexandria')) {
      return getCurrencyByCountry("Egypt");
    }
    
    if (addressLower.includes('johannesburg') || addressLower.includes('cape town') || 
        addressLower.includes('durban') || addressLower.includes('pretoria')) {
      return getCurrencyByCountry("South Africa");
    }
  }
  
  return null;
}

// Get suggested currencies based on region
export function getSuggestedCurrencies(region: string): string[] {
  const regionCountries = getCountriesByRegion(region);
  const currencies = new Set<string>();
  
  regionCountries.forEach(country => {
    country.supportedCurrencies.forEach(currency => {
      currencies.add(currency);
    });
  });
  
  return Array.from(currencies);
}