// Geographic location detection service for automatic currency assignment
import { getCurrencyByCountry, autoDetectCurrency, type CountryCurrencyMapping } from "./geo-currency-mapping";

export interface LocationInfo {
  ip?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  timezone?: string;
  detectedCurrency?: CountryCurrencyMapping;
}

// Detect user location from request headers
export function detectLocationFromRequest(req: any): LocationInfo {
  const locationInfo: LocationInfo = {};
  
  // Get IP address
  locationInfo.ip = req.ip || 
    req.connection?.remoteAddress || 
    req.socket?.remoteAddress ||
    (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'];

  // Get country from headers (commonly set by CDNs like Cloudflare)
  locationInfo.country = req.headers['cf-ipcountry'] || 
    req.headers['x-country'] || 
    req.headers['x-country-code'];
  
  locationInfo.countryCode = req.headers['cf-ipcountry'] || 
    req.headers['x-country-code'];
  
  locationInfo.region = req.headers['cf-region'] || 
    req.headers['x-region'];
  
  locationInfo.city = req.headers['cf-ipcity'] || 
    req.headers['x-city'];
  
  locationInfo.timezone = req.headers['cf-timezone'] || 
    req.headers['x-timezone'];

  // Detect currency based on country
  if (locationInfo.country) {
    locationInfo.detectedCurrency = getCurrencyByCountry(locationInfo.country);
  } else if (locationInfo.countryCode) {
    locationInfo.detectedCurrency = getCurrencyByCountryCode(locationInfo.countryCode);
  }

  return locationInfo;
}

// Map country codes to full country names for currency detection
function getCurrencyByCountryCode(countryCode: string): CountryCurrencyMapping | null {
  const countryCodeMap: Record<string, string> = {
    'US': 'United States',
    'CA': 'Canada',
    'MX': 'Mexico',
    'GB': 'United Kingdom', 
    'DE': 'Germany',
    'FR': 'France',
    'ES': 'Spain',
    'IT': 'Italy',
    'CH': 'Switzerland',
    'NG': 'Nigeria',
    'GH': 'Ghana',
    'KE': 'Kenya',
    'ZA': 'South Africa',
    'EG': 'Egypt',
    'TN': 'Tunisia',
    'MA': 'Morocco',
    'DZ': 'Algeria',
    'LY': 'Libya',
    'SD': 'Sudan',
    'ET': 'Ethiopia',
    'UG': 'Uganda',
    'TZ': 'Tanzania',
    'RW': 'Rwanda',
    'AO': 'Angola',
    'MZ': 'Mozambique',
    'ZM': 'Zambia',
    'BW': 'Botswana',
    'NA': 'Namibia',
    'ZW': 'Zimbabwe',
    'MW': 'Malawi',
    'CM': 'Cameroon',
    'CI': 'Ivory Coast',
    'SN': 'Senegal',
    'ML': 'Mali',
    'BF': 'Burkina Faso',
    'NE': 'Niger',
    'TD': 'Chad',
    'CF': 'Central African Republic',
    'CG': 'Republic of the Congo',
    'CD': 'Democratic Republic of the Congo',
    'GA': 'Gabon',
    'GQ': 'Equatorial Guinea',
    'JP': 'Japan',
    'CN': 'China',
    'IN': 'India',
    'KR': 'South Korea',
    'SG': 'Singapore',
    'TH': 'Thailand',
    'MY': 'Malaysia',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'VN': 'Vietnam',
    'AU': 'Australia',
    'NZ': 'New Zealand',
    'AE': 'United Arab Emirates',
    'SA': 'Saudi Arabia',
    'QA': 'Qatar',
    'KW': 'Kuwait',
    'BH': 'Bahrain',
    'OM': 'Oman',
    'IL': 'Israel',
    'JO': 'Jordan',
    'LB': 'Lebanon'
  };

  const countryName = countryCodeMap[countryCode.toUpperCase()];
  return countryName ? getCurrencyByCountry(countryName) : null;
}

// Detect language preference from request headers
export function detectLanguageFromRequest(req: any): string {
  const acceptLanguage = req.headers['accept-language'];
  if (!acceptLanguage) return 'en';

  // Parse Accept-Language header
  const languages = acceptLanguage
    .split(',')
    .map((lang: string) => {
      const [code, quality] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0].toLowerCase(), // Get base language code
        quality: quality ? parseFloat(quality) : 1.0
      };
    })
    .sort((a: any, b: any) => b.quality - a.quality);

  // Return the highest quality supported language
  const supportedLanguages = ['en', 'es', 'fr', 'de'];
  for (const lang of languages) {
    if (supportedLanguages.includes(lang.code)) {
      return lang.code;
    }
  }

  return 'en'; // Default to English
}

// Get time zone from location info
export function getTimezoneFromLocation(locationInfo: LocationInfo): string {
  if (locationInfo.timezone) {
    return locationInfo.timezone;
  }

  // Fallback timezone detection based on country
  const timezoneMap: Record<string, string> = {
    'United States': 'America/New_York',
    'Canada': 'America/Toronto',
    'Mexico': 'America/Mexico_City',
    'United Kingdom': 'Europe/London',
    'Germany': 'Europe/Berlin',
    'France': 'Europe/Paris',
    'Spain': 'Europe/Madrid',
    'Italy': 'Europe/Rome',
    'Nigeria': 'Africa/Lagos',
    'Ghana': 'Africa/Accra',
    'Kenya': 'Africa/Nairobi',
    'South Africa': 'Africa/Johannesburg',
    'Egypt': 'Africa/Cairo',
    'Tunisia': 'Africa/Tunis',
    'Morocco': 'Africa/Casablanca',
    'Japan': 'Asia/Tokyo',
    'China': 'Asia/Shanghai',
    'India': 'Asia/Kolkata',
    'Australia': 'Australia/Sydney',
    'Brazil': 'America/Sao_Paulo',
  };

  return timezoneMap[locationInfo.country || ''] || 'UTC';
}

// Auto-configure tenant settings based on detected location
export interface TenantLocationConfig {
  baseCurrency: string;
  supportedCurrencies: string[];
  defaultLanguage: string;
  timezone: string;
  region: string;
}

export function generateTenantLocationConfig(locationInfo: LocationInfo): TenantLocationConfig {
  const config: TenantLocationConfig = {
    baseCurrency: 'USD',
    supportedCurrencies: ['USD'],
    defaultLanguage: 'en',
    timezone: 'UTC',
    region: 'Unknown'
  };

  if (locationInfo.detectedCurrency) {
    config.baseCurrency = locationInfo.detectedCurrency.currency;
    config.supportedCurrencies = locationInfo.detectedCurrency.supportedCurrencies;
    config.region = locationInfo.detectedCurrency.region;
  }

  config.timezone = getTimezoneFromLocation(locationInfo);

  return config;
}