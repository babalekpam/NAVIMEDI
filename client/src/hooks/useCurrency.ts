import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  region: string;
  country: string;
}

export interface TenantCurrencies {
  baseCurrency: string;
  supportedCurrencies: CurrencyInfo[];
}

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  timestamp: string;
}

// Hook to get tenant's currencies
export function useTenantCurrencies() {
  return useQuery<TenantCurrencies>({
    queryKey: ["/api/tenant/currencies"],
    retry: false,
  });
}

// Hook to get all available currencies
export function useAllCurrencies() {
  return useQuery<CurrencyInfo[]>({
    queryKey: ["/api/currencies"],
    retry: false,
  });
}

// Hook to get African currencies
export function useAfricanCurrencies() {
  return useQuery<CurrencyInfo[]>({
    queryKey: ["/api/currencies/african"],
    retry: false,
  });
}

// Format currency amount with proper symbol and decimal places
export function formatCurrencyAmount(
  amount: string | number, 
  currencyCode: string, 
  currencyInfo?: CurrencyInfo
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (!currencyInfo) {
    return `${currencyCode} ${numAmount.toFixed(2)}`;
  }

  const formatted = numAmount.toFixed(currencyInfo.decimalPlaces);
  
  // Handle different currency symbol positions
  switch (currencyCode) {
    case 'USD':
    case 'CAD':
    case 'AUD':
    case 'LRD':
    case 'NAD':
    case 'ZWL':
      return `${currencyInfo.symbol}${formatted}`;
    case 'EUR':
      return `${formatted} ${currencyInfo.symbol}`;
    case 'GBP':
    case 'EGP':
    case 'SSP':
      return `${currencyInfo.symbol}${formatted}`;
    case 'NGN':
      return `${currencyInfo.symbol}${formatted}`;
    case 'ZAR':
      return `R ${formatted}`;
    case 'KES':
    case 'TZS':
    case 'UGX':
    case 'SOS':
      return `${currencyInfo.symbol} ${formatted}`;
    case 'XOF':
    case 'XAF':
      return `${formatted} ${currencyInfo.symbol}`;
    default:
      return `${currencyInfo.symbol} ${formatted}`;
  }
}

// Hook to convert currency
export function useConvertCurrency() {
  const convertCurrency = async (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<ConversionResult | null> => {
    try {
      const response = await apiRequest("POST", "/api/currencies/convert", {
        amount,
        fromCurrency,
        toCurrency
      });
      return response;
    } catch (error) {
      console.error("Currency conversion failed:", error);
      return null;
    }
  };

  return { convertCurrency };
}

// Hook to format currency
export function useFormatCurrency() {
  const formatCurrency = async (
    amount: string | number,
    currencyCode: string
  ): Promise<string> => {
    try {
      const response = await apiRequest("POST", "/api/currencies/format", {
        amount,
        currencyCode
      });
      return response.formatted;
    } catch (error) {
      console.error("Currency formatting failed:", error);
      return `${currencyCode} ${amount}`;
    }
  };

  return { formatCurrency };
}