import { db } from "./db";
import { currencies, exchangeRates, tenants } from "../shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  region: string;
  country: string;
}

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  timestamp: Date;
}

// Format currency amount with proper symbol and decimal places
export async function formatCurrency(amount: string | number, currencyCode: string, currencyInfo?: CurrencyInfo): Promise<string> {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const info = currencyInfo || await getCurrencyInfo(currencyCode);
  
  if (!info) {
    return `${currencyCode} ${numAmount.toFixed(2)}`;
  }

  const formatted = numAmount.toFixed(info.decimalPlaces);
  
  // Handle different currency symbol positions
  switch (currencyCode) {
    case 'USD':
    case 'CAD':
    case 'AUD':
    case 'LRD':
    case 'NAD':
    case 'ZWL':
      return `${info.symbol}${formatted}`;
    case 'EUR':
      return `${formatted} ${info.symbol}`;
    case 'GBP':
    case 'EGP':
    case 'SSP':
      return `${info.symbol}${formatted}`;
    case 'NGN':
      return `${info.symbol}${formatted}`;
    case 'ZAR':
      return `R ${formatted}`;
    case 'KES':
    case 'TZS':
    case 'UGX':
    case 'SOS':
      return `${info.symbol} ${formatted}`;
    case 'XOF':
    case 'XAF':
      return `${formatted} ${info.symbol}`;
    default:
      return `${info.symbol} ${formatted}`;
  }
}

// Get currency information from database
export async function getCurrencyInfo(currencyCode: string): Promise<CurrencyInfo | null> {
  try {
    const [currency] = await db.select()
      .from(currencies)
      .where(and(
        eq(currencies.code, currencyCode as any),
        eq(currencies.isActive, true)
      ));
    
    if (!currency) return null;
    
    return {
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      decimalPlaces: currency.decimalPlaces || 2,
      region: currency.region || '',
      country: currency.country || ''
    };
  } catch (error) {
    console.error('Error fetching currency info:', error);
    return null;
  }
}

// Get tenant's supported currencies
export async function getTenantCurrencies(tenantId: string): Promise<string[]> {
  try {
    const [tenant] = await db.select()
      .from(tenants)
      .where(eq(tenants.id, tenantId));
    
    if (!tenant) return ['USD'];
    
    const supportedCurrencies = tenant.supportedCurrencies as string[] || ['USD'];
    return supportedCurrencies;
  } catch (error) {
    console.error('Error fetching tenant currencies:', error);
    return ['USD'];
  }
}

// Get tenant's base currency
export async function getTenantBaseCurrency(tenantId: string): Promise<string> {
  try {
    const [tenant] = await db.select()
      .from(tenants)
      .where(eq(tenants.id, tenantId));
    
    return tenant?.baseCurrency || 'USD';
  } catch (error) {
    console.error('Error fetching tenant base currency:', error);
    return 'USD';
  }
}

// Convert currency amounts
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<ConversionResult | null> {
  try {
    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: amount,
        targetCurrency: toCurrency,
        exchangeRate: 1,
        timestamp: new Date()
      };
    }

    // Get exchange rate (prefer direct rate, fallback to USD conversion)
    let rate = 1;
    
    // Try direct conversion
    const [directRate] = await db.select()
      .from(exchangeRates)
      .where(and(
        eq(exchangeRates.baseCurrency, fromCurrency as any),
        eq(exchangeRates.targetCurrency, toCurrency as any),
        eq(exchangeRates.isActive, true)
      ))
      .orderBy(desc(exchangeRates.validFrom))
      .limit(1);

    if (directRate) {
      rate = parseFloat(directRate.rate);
    } else {
      // Fallback to USD conversion
      const [fromCurrencyInfo] = await db.select()
        .from(currencies)
        .where(eq(currencies.code, fromCurrency as any));
        
      const [toCurrencyInfo] = await db.select()
        .from(currencies)
        .where(eq(currencies.code, toCurrency as any));

      if (fromCurrencyInfo && toCurrencyInfo) {
        const fromUsdRate = parseFloat(fromCurrencyInfo.exchangeRateToUSD);
        const toUsdRate = parseFloat(toCurrencyInfo.exchangeRateToUSD);
        
        // Convert: amount -> USD -> target currency
        rate = fromUsdRate / toUsdRate;
      } else {
        return null;
      }
    }

    const convertedAmount = amount * rate;

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount: convertedAmount,
      targetCurrency: toCurrency,
      exchangeRate: rate,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error converting currency:', error);
    return null;
  }
}

// Get all African currencies
export async function getAfricanCurrencies(): Promise<CurrencyInfo[]> {
  try {
    const africanCurrencies = await db.select()
      .from(currencies)
      .where(and(
        eq(currencies.region, 'Africa'),
        eq(currencies.isActive, true)
      ));

    return africanCurrencies.map(c => ({
      code: c.code,
      name: c.name,
      symbol: c.symbol,
      decimalPlaces: c.decimalPlaces || 2,
      region: c.region || '',
      country: c.country || ''
    }));
  } catch (error) {
    console.error('Error fetching African currencies:', error);
    return [];
  }
}

// Get all supported currencies
export async function getAllCurrencies(): Promise<CurrencyInfo[]> {
  try {
    const allCurrencies = await db.select()
      .from(currencies)
      .where(eq(currencies.isActive, true));

    return allCurrencies.map(c => ({
      code: c.code,
      name: c.name,
      symbol: c.symbol,
      decimalPlaces: c.decimalPlaces || 2,
      region: c.region || '',
      country: c.country || ''
    }));
  } catch (error) {
    console.error('Error fetching all currencies:', error);
    return [];
  }
}

// Update exchange rates (can be called from external API or manual input)
export async function updateExchangeRate(
  baseCurrency: string,
  targetCurrency: string,
  rate: number,
  provider: string = 'manual'
): Promise<boolean> {
  try {
    await db.insert(exchangeRates).values({
      baseCurrency: baseCurrency as any,
      targetCurrency: targetCurrency as any,
      rate: rate.toString(),
      provider,
      validFrom: new Date(),
      isActive: true
    });
    
    return true;
  } catch (error) {
    console.error('Error updating exchange rate:', error);
    return false;
  }
}