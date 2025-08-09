import { db } from "./db";
import { currencies, exchangeRates, tenants } from "../shared/schema";
import { eq } from "drizzle-orm";

const africanCurrencies = [
  // Major International (for reference)
  { code: "USD", name: "US Dollar", symbol: "$", numericCode: "840", region: "North America", country: "United States", decimalPlaces: 2, exchangeRateToUSD: "1.000000" },
  { code: "EUR", name: "Euro", symbol: "€", numericCode: "978", region: "Europe", country: "European Union", decimalPlaces: 2, exchangeRateToUSD: "0.920000" },
  { code: "GBP", name: "British Pound", symbol: "£", numericCode: "826", region: "Europe", country: "United Kingdom", decimalPlaces: 2, exchangeRateToUSD: "0.790000" },
  
  // African Currencies
  { code: "DZD", name: "Algerian Dinar", symbol: "د.ج", numericCode: "012", region: "Africa", country: "Algeria", decimalPlaces: 2, exchangeRateToUSD: "134.500000" },
  { code: "AOA", name: "Angolan Kwanza", symbol: "Kz", numericCode: "973", region: "Africa", country: "Angola", decimalPlaces: 2, exchangeRateToUSD: "825.000000" },
  { code: "XOF", name: "West African CFA Franc", symbol: "CFA", numericCode: "952", region: "Africa", country: "West Africa", decimalPlaces: 0, exchangeRateToUSD: "605.000000" },
  { code: "BWP", name: "Botswana Pula", symbol: "P", numericCode: "072", region: "Africa", country: "Botswana", decimalPlaces: 2, exchangeRateToUSD: "13.650000" },
  { code: "BIF", name: "Burundian Franc", symbol: "Fr", numericCode: "108", region: "Africa", country: "Burundi", decimalPlaces: 0, exchangeRateToUSD: "2890.000000" },
  { code: "XAF", name: "Central African CFA Franc", symbol: "FCFA", numericCode: "950", region: "Africa", country: "Central Africa", decimalPlaces: 0, exchangeRateToUSD: "605.000000" },
  { code: "CVE", name: "Cape Verdean Escudo", symbol: "$", numericCode: "132", region: "Africa", country: "Cape Verde", decimalPlaces: 2, exchangeRateToUSD: "102.000000" },
  { code: "KMF", name: "Comorian Franc", symbol: "CF", numericCode: "174", region: "Africa", country: "Comoros", decimalPlaces: 0, exchangeRateToUSD: "454.000000" },
  { code: "CDF", name: "Congolese Franc", symbol: "FC", numericCode: "976", region: "Africa", country: "DR Congo", decimalPlaces: 2, exchangeRateToUSD: "2750.000000" },
  { code: "DJF", name: "Djiboutian Franc", symbol: "Fdj", numericCode: "262", region: "Africa", country: "Djibouti", decimalPlaces: 0, exchangeRateToUSD: "178.000000" },
  { code: "EGP", name: "Egyptian Pound", symbol: "£", numericCode: "818", region: "Africa", country: "Egypt", decimalPlaces: 2, exchangeRateToUSD: "30.900000" },
  { code: "ERN", name: "Eritrean Nakfa", symbol: "Nfk", numericCode: "232", region: "Africa", country: "Eritrea", decimalPlaces: 2, exchangeRateToUSD: "15.000000" },
  { code: "SZL", name: "Swazi Lilangeni", symbol: "L", numericCode: "748", region: "Africa", country: "Eswatini", decimalPlaces: 2, exchangeRateToUSD: "18.250000" },
  { code: "ETB", name: "Ethiopian Birr", symbol: "Br", numericCode: "230", region: "Africa", country: "Ethiopia", decimalPlaces: 2, exchangeRateToUSD: "120.500000" },
  { code: "GMD", name: "Gambian Dalasi", symbol: "D", numericCode: "270", region: "Africa", country: "Gambia", decimalPlaces: 2, exchangeRateToUSD: "67.500000" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", numericCode: "936", region: "Africa", country: "Ghana", decimalPlaces: 2, exchangeRateToUSD: "15.200000" },
  { code: "GNF", name: "Guinean Franc", symbol: "Fr", numericCode: "324", region: "Africa", country: "Guinea", decimalPlaces: 0, exchangeRateToUSD: "8620.000000" },
  { code: "KES", name: "Kenyan Shilling", symbol: "Sh", numericCode: "404", region: "Africa", country: "Kenya", decimalPlaces: 2, exchangeRateToUSD: "127.500000" },
  { code: "LSL", name: "Lesotho Loti", symbol: "L", numericCode: "426", region: "Africa", country: "Lesotho", decimalPlaces: 2, exchangeRateToUSD: "18.250000" },
  { code: "LRD", name: "Liberian Dollar", symbol: "$", numericCode: "430", region: "Africa", country: "Liberia", decimalPlaces: 2, exchangeRateToUSD: "190.000000" },
  { code: "LYD", name: "Libyan Dinar", symbol: "ل.د", numericCode: "434", region: "Africa", country: "Libya", decimalPlaces: 3, exchangeRateToUSD: "4.800000" },
  { code: "MGA", name: "Malagasy Ariary", symbol: "Ar", numericCode: "969", region: "Africa", country: "Madagascar", decimalPlaces: 2, exchangeRateToUSD: "4520.000000" },
  { code: "MWK", name: "Malawian Kwacha", symbol: "K", numericCode: "454", region: "Africa", country: "Malawi", decimalPlaces: 2, exchangeRateToUSD: "1730.000000" },
  { code: "MRU", name: "Mauritanian Ouguiya", symbol: "UM", numericCode: "929", region: "Africa", country: "Mauritania", decimalPlaces: 2, exchangeRateToUSD: "37.000000" },
  { code: "MUR", name: "Mauritian Rupee", symbol: "₨", numericCode: "480", region: "Africa", country: "Mauritius", decimalPlaces: 2, exchangeRateToUSD: "46.200000" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "د.م.", numericCode: "504", region: "Africa", country: "Morocco", decimalPlaces: 2, exchangeRateToUSD: "10.100000" },
  { code: "MZN", name: "Mozambican Metical", symbol: "MT", numericCode: "943", region: "Africa", country: "Mozambique", decimalPlaces: 2, exchangeRateToUSD: "63.800000" },
  { code: "NAD", name: "Namibian Dollar", symbol: "$", numericCode: "516", region: "Africa", country: "Namibia", decimalPlaces: 2, exchangeRateToUSD: "18.250000" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", numericCode: "566", region: "Africa", country: "Nigeria", decimalPlaces: 2, exchangeRateToUSD: "1540.000000" },
  { code: "RWF", name: "Rwandan Franc", symbol: "Fr", numericCode: "646", region: "Africa", country: "Rwanda", decimalPlaces: 0, exchangeRateToUSD: "1350.000000" },
  { code: "STN", name: "São Tomé and Príncipe Dobra", symbol: "Db", numericCode: "930", region: "Africa", country: "São Tomé and Príncipe", decimalPlaces: 2, exchangeRateToUSD: "22.700000" },
  { code: "SCR", name: "Seychellois Rupee", symbol: "₨", numericCode: "690", region: "Africa", country: "Seychelles", decimalPlaces: 2, exchangeRateToUSD: "13.400000" },
  { code: "SLE", name: "Sierra Leonean Leone", symbol: "Le", numericCode: "925", region: "Africa", country: "Sierra Leone", decimalPlaces: 2, exchangeRateToUSD: "22700.000000" },
  { code: "SOS", name: "Somali Shilling", symbol: "Sh", numericCode: "706", region: "Africa", country: "Somalia", decimalPlaces: 2, exchangeRateToUSD: "570.000000" },
  { code: "ZAR", name: "South African Rand", symbol: "R", numericCode: "710", region: "Africa", country: "South Africa", decimalPlaces: 2, exchangeRateToUSD: "18.250000" },
  { code: "SSP", name: "South Sudanese Pound", symbol: "£", numericCode: "728", region: "Africa", country: "South Sudan", decimalPlaces: 2, exchangeRateToUSD: "130.200000" },
  { code: "SDG", name: "Sudanese Pound", symbol: "ج.س.", numericCode: "938", region: "Africa", country: "Sudan", decimalPlaces: 2, exchangeRateToUSD: "600.000000" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "Sh", numericCode: "834", region: "Africa", country: "Tanzania", decimalPlaces: 2, exchangeRateToUSD: "2500.000000" },
  { code: "TND", name: "Tunisian Dinar", symbol: "د.ت", numericCode: "788", region: "Africa", country: "Tunisia", decimalPlaces: 3, exchangeRateToUSD: "3.100000" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "Sh", numericCode: "800", region: "Africa", country: "Uganda", decimalPlaces: 0, exchangeRateToUSD: "3700.000000" },
  { code: "ZMW", name: "Zambian Kwacha", symbol: "K", numericCode: "967", region: "Africa", country: "Zambia", decimalPlaces: 2, exchangeRateToUSD: "27.200000" },
  { code: "ZWL", name: "Zimbabwean Dollar", symbol: "$", numericCode: "932", region: "Africa", country: "Zimbabwe", decimalPlaces: 2, exchangeRateToUSD: "322.000000" },
];

async function initializeCurrencies() {
  try {
    console.log("Initializing currencies database...");
    
    // Clear existing currencies (if any)
    await db.delete(currencies);
    
    // Insert all currencies
    for (const currency of africanCurrencies) {
      await db.insert(currencies).values({
        code: currency.code as any,
        name: currency.name,
        symbol: currency.symbol,
        numericCode: currency.numericCode,
        decimalPlaces: currency.decimalPlaces,
        region: currency.region,
        country: currency.country,
        exchangeRateToUSD: currency.exchangeRateToUSD,
        isActive: true
      });
      console.log(`✓ Added ${currency.code} - ${currency.name} (${currency.country})`);
    }
    
    console.log(`\n✓ Successfully initialized ${africanCurrencies.length} currencies`);
    
    // Update Metro General Hospital to use USD as default with some African currencies supported
    const [metroTenant] = await db.select()
      .from(tenants)
      .where(eq(tenants.subdomain, "metro-general"));
    
    if (metroTenant) {
      await db.update(tenants)
        .set({
          baseCurrency: "USD",
          supportedCurrencies: JSON.stringify(["USD", "NGN", "GHS", "KES", "ZAR", "EGP", "MAD", "TND"])
        })
        .where(eq(tenants.id, metroTenant.id));
      
      console.log("✓ Updated Metro General Hospital currency settings");
    }
    
    console.log("\n🎉 Currency initialization complete!");
    
  } catch (error) {
    console.error("Error initializing currencies:", error);
  }
}

// Commenting out automatic execution to prevent deployment exit issues
// This should be run manually when needed, not during deployment
// initializeCurrencies().then(() => {
//   console.log("Currency initialization process finished");
//   process.exit(0);
// }).catch(error => {
//   console.error("Failed to initialize currencies:", error);
//   process.exit(1);
// });

// Export the function for manual execution when needed
export { initializeCurrencies };