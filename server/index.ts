import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import path from "path";
import { registerRoutes } from "./routes";
import { registerSimpleTestRoutes } from "./simple-test-routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { tenants, users, countries, countryMedicalCodes } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

const app = express();

// CRITICAL FIX: Enable trust proxy for Passenger/nginx deployment
// This fixes express-rate-limit ValidationError about X-Forwarded-For headers
app.set('trust proxy', 1);

// Domain and WWW Redirect Middleware (SEO optimization)
app.use((req, res, next) => {
  const host = req.headers.host || '';
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  
  // Redirect argilette.org to navimedi.org (fix Google Search Console redirect issues)
  if (host.includes('argilette.org')) {
    const cleanPath = req.url;
    return res.redirect(301, `https://navimedi.org${cleanPath}`);
  }
  
  // Redirect www.navimedi.org to navimedi.org (fix Google 404 errors)
  if (host.startsWith('www.')) {
    const nonWwwHost = host.replace('www.', '');
    return res.redirect(301, `${protocol}://${nonWwwHost}${req.url}`);
  }
  
  next();
});

// IONOS OPTIMIZATION 1: Enable selective gzip compression
// Compress static assets and non-sensitive content while protecting sensitive endpoints
app.use(compression({
  // Only compress responses larger than 1KB
  threshold: 1024,
  // Compress text-based content types
  filter: (req: Request, res: Response) => {
    // Never compress sensitive API endpoints (BREACH protection)
    const sensitiveEndpoints = [
      '/api/auth', '/api/patients', '/api/prescriptions', 
      '/api/billing', '/api/lab-orders', '/api/lab-results', 
      '/api/admin', '/api/platform'
    ];
    
    if (sensitiveEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
      return false;
    }
    
    // Never compress if response contains sensitive headers
    const sensitiveHeaders = ['authorization', 'x-auth-token', 'x-api-key'];
    if (sensitiveHeaders.some(header => req.headers[header] || res.get(header))) {
      return false;
    }
    
    // Compress static assets, public content, and non-sensitive APIs
    const compressiblePaths = [
      '/assets/', '/css/', '/js/', '/images/', '/fonts/',
      '/api/public/', '/api/marketplace/', '/api/countries/', 
      '/health', '/status', '/ping', '/', '/index.html',
      '/favicon.ico', '/robots.txt', '/sitemap.xml'
    ];
    
    // Compress if it's a compressible path or static content
    if (compressiblePaths.some(path => req.path.startsWith(path))) {
      return true;
    }
    
    // Compress based on content type for other requests
    return compression.filter(req, res);
  },
  // Compression level (1=fastest, 9=best compression)
  level: 6
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add cache control headers for API endpoints while enabling compression for static assets
app.use('/api', (req, res, next) => {
  // Only disable caching for sensitive endpoints
  const sensitiveEndpoints = [
    '/api/auth', '/api/patients', '/api/prescriptions', 
    '/api/billing', '/api/lab-orders', '/api/lab-results', 
    '/api/admin', '/api/platform'
  ];
  
  if (sensitiveEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  } else {
    // Allow some caching for non-sensitive API endpoints
    res.set({
      'Cache-Control': 'public, max-age=300', // 5 minutes cache
    });
  }
  next();
});

// IONOS OPTIMIZATION 2: Add static asset optimization headers
app.use('/assets', (req, res, next) => {
  // Enable long-term caching for static assets (fonts, images, CSS, JS)
  res.set({
    'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache
    'Expires': new Date(Date.now() + 31536000000).toUTCString(),
  });
  next();
});



// CRITICAL: Ultra-fast health check endpoints for deployment
// These MUST respond in <100ms with zero dependencies
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/status', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/ping', (req, res) => {
  res.status(200).send('ok');
});

// Root endpoint handled by frontend - health checks use other endpoints

// Additional health endpoints commonly used by deployment systems
app.get('/ready', (req, res) => {
  res.status(200).send('OK');
});

// CRITICAL: robots.txt endpoint for search engines (must be accessible)
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow cross-origin access
  res.removeHeader('X-Frame-Options'); // Remove restrictive headers for robots.txt
  res.sendFile(path.resolve(import.meta.dirname, '..', 'client', 'public', 'robots.txt'));
});

// CRITICAL: sitemap.xml endpoint for search engines (must be accessible)
app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow cross-origin access
  res.removeHeader('X-Frame-Options'); // Remove restrictive headers for sitemap
  res.sendFile(path.resolve(import.meta.dirname, '..', 'client', 'public', 'sitemap.xml'));
});

app.get('/alive', (req, res) => {
  res.status(200).send('OK');
});

app.get('/liveness', (req, res) => {
  res.status(200).json({ status: 'ok', alive: true });
});

app.get('/readiness', (req, res) => {
  res.status(200).json({ status: 'ok', ready: true });
});

// Explicit deployment health check endpoint
app.get('/deployment-health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    service: 'carnet-healthcare',
    deployment: 'ready',
    timestamp: new Date().toISOString()
  });
});



app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize platform asynchronously after server starts
let platformInitialized = false;

async function initializeDefaultCountries() {
  try {
    console.log('🌍 Initializing default countries...');
    
    // Check if comprehensive countries already exist (check for African countries)
    const existingAfrican = await db.select().from(countries).where(eq(countries.code, 'NG')).limit(1);
    if (existingAfrican.length > 0) {
      console.log('✓ Comprehensive countries already initialized');
      return;
    }

    // Clear existing limited countries to make room for comprehensive list
    await db.delete(countries);
    console.log('🔄 Cleared existing countries for comprehensive update');

    // Comprehensive list of world countries with focus on Africa
    const defaultCountries = [
      // AFRICA (All 54 Countries)
      { code: 'DZ', name: 'Algeria', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'DZD', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Algiers' },
      { code: 'AO', name: 'Angola', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'AOA', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Luanda' },
      { code: 'BJ', name: 'Benin', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'XOF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Porto-Novo' },
      { code: 'BW', name: 'Botswana', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'BWP', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Gaborone' },
      { code: 'BF', name: 'Burkina Faso', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'XOF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Ouagadougou' },
      { code: 'BI', name: 'Burundi', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'BIF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Bujumbura' },
      { code: 'CV', name: 'Cape Verde', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'CVE', dateFormat: 'DD/MM/YYYY', timeZone: 'Atlantic/Cape_Verde' },
      { code: 'CM', name: 'Cameroon', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'XAF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Douala' },
      { code: 'CF', name: 'Central African Republic', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'XAF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Bangui' },
      { code: 'TD', name: 'Chad', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'XAF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Ndjamena' },
      { code: 'KM', name: 'Comoros', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'KMF', dateFormat: 'DD/MM/YYYY', timeZone: 'Indian/Comoro' },
      { code: 'CG', name: 'Congo', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'XAF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Brazzaville' },
      { code: 'CD', name: 'Democratic Republic of the Congo', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'CDF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Kinshasa' },
      { code: 'CI', name: 'Côte d\'Ivoire', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'XOF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Abidjan' },
      { code: 'DJ', name: 'Djibouti', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'DJF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Djibouti' },
      { code: 'EG', name: 'Egypt', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'EGP', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Cairo' },
      { code: 'GQ', name: 'Equatorial Guinea', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'XAF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Malabo' },
      { code: 'ER', name: 'Eritrea', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'ERN', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Asmara' },
      { code: 'SZ', name: 'Eswatini', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'SZL', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Mbabane' },
      { code: 'ET', name: 'Ethiopia', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'ETB', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Addis_Ababa' },
      { code: 'GA', name: 'Gabon', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'XAF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Libreville' },
      { code: 'GM', name: 'Gambia', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'GMD', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Banjul' },
      { code: 'GH', name: 'Ghana', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'GHS', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Accra' },
      { code: 'GN', name: 'Guinea', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'GNF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Conakry' },
      { code: 'GW', name: 'Guinea-Bissau', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'XOF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Bissau' },
      { code: 'KE', name: 'Kenya', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'KES', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Nairobi' },
      { code: 'LS', name: 'Lesotho', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'LSL', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Maseru' },
      { code: 'LR', name: 'Liberia', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'LRD', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Monrovia' },
      { code: 'LY', name: 'Libya', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'LYD', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Tripoli' },
      { code: 'MG', name: 'Madagascar', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'MGA', dateFormat: 'DD/MM/YYYY', timeZone: 'Indian/Antananarivo' },
      { code: 'MW', name: 'Malawi', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'MWK', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Blantyre' },
      { code: 'ML', name: 'Mali', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'XOF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Bamako' },
      { code: 'MR', name: 'Mauritania', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'MRU', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Nouakchott' },
      { code: 'MU', name: 'Mauritius', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'MUR', dateFormat: 'DD/MM/YYYY', timeZone: 'Indian/Mauritius' },
      { code: 'MA', name: 'Morocco', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'MAD', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Casablanca' },
      { code: 'MZ', name: 'Mozambique', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'MZN', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Maputo' },
      { code: 'NA', name: 'Namibia', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'NAD', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Windhoek' },
      { code: 'NE', name: 'Niger', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'XOF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Niamey' },
      { code: 'NG', name: 'Nigeria', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'NGN', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Lagos' },
      { code: 'RW', name: 'Rwanda', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'RWF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Kigali' },
      { code: 'ST', name: 'São Tomé and Príncipe', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'STN', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Sao_Tome' },
      { code: 'SN', name: 'Senegal', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'XOF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Dakar' },
      { code: 'SC', name: 'Seychelles', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'SCR', dateFormat: 'DD/MM/YYYY', timeZone: 'Indian/Mahe' },
      { code: 'SL', name: 'Sierra Leone', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'SLE', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Freetown' },
      { code: 'SO', name: 'Somalia', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'SOS', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Mogadishu' },
      { code: 'ZA', name: 'South Africa', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'ZAR', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Johannesburg' },
      { code: 'SS', name: 'South Sudan', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'SSP', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Juba' },
      { code: 'SD', name: 'Sudan', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'SDG', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Khartoum' },
      { code: 'TZ', name: 'Tanzania', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'TZS', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Dar_es_Salaam' },
      { code: 'TG', name: 'Togo', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'XOF', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Lome' },
      { code: 'TN', name: 'Tunisia', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'TND', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Tunis' },
      { code: 'UG', name: 'Uganda', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'UGX', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Kampala' },
      { code: 'ZM', name: 'Zambia', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'ZMW', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Lusaka' },
      { code: 'ZW', name: 'Zimbabwe', region: 'Africa', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'ZWL', dateFormat: 'DD/MM/YYYY', timeZone: 'Africa/Harare' },

      // MAJOR WORLD COUNTRIES
      // North America
      { code: 'US', name: 'United States', region: 'North America', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10-CM', pharmaceuticalCodeSystem: 'NDC', currencyCode: 'USD', dateFormat: 'MM/DD/YYYY', timeZone: 'America/New_York' },
      { code: 'CA', name: 'Canada', region: 'North America', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10-CA', pharmaceuticalCodeSystem: 'DIN', currencyCode: 'CAD', dateFormat: 'DD/MM/YYYY', timeZone: 'America/Toronto' },
      { code: 'MX', name: 'Mexico', region: 'North America', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'MXN', dateFormat: 'DD/MM/YYYY', timeZone: 'America/Mexico_City' },

      // Europe
      { code: 'GB', name: 'United Kingdom', region: 'Europe', cptCodeSystem: 'OPCS-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'BNF', currencyCode: 'GBP', dateFormat: 'DD/MM/YYYY', timeZone: 'Europe/London' },
      { code: 'DE', name: 'Germany', region: 'Europe', cptCodeSystem: 'EBM', icd10CodeSystem: 'ICD-10-GM', pharmaceuticalCodeSystem: 'PZN', currencyCode: 'EUR', dateFormat: 'DD.MM.YYYY', timeZone: 'Europe/Berlin' },
      { code: 'FR', name: 'France', region: 'Europe', cptCodeSystem: 'CCAM', icd10CodeSystem: 'CIM-10', pharmaceuticalCodeSystem: 'CIP', currencyCode: 'EUR', dateFormat: 'DD/MM/YYYY', timeZone: 'Europe/Paris' },
      { code: 'IT', name: 'Italy', region: 'Europe', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'EUR', dateFormat: 'DD/MM/YYYY', timeZone: 'Europe/Rome' },
      { code: 'ES', name: 'Spain', region: 'Europe', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'EUR', dateFormat: 'DD/MM/YYYY', timeZone: 'Europe/Madrid' },
      { code: 'NL', name: 'Netherlands', region: 'Europe', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'EUR', dateFormat: 'DD-MM-YYYY', timeZone: 'Europe/Amsterdam' },

      // Asia
      { code: 'CN', name: 'China', region: 'Asia', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'CNY', dateFormat: 'YYYY/MM/DD', timeZone: 'Asia/Shanghai' },
      { code: 'IN', name: 'India', region: 'Asia', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'INR', dateFormat: 'DD/MM/YYYY', timeZone: 'Asia/Kolkata' },
      { code: 'JP', name: 'Japan', region: 'Asia', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'JPY', dateFormat: 'YYYY/MM/DD', timeZone: 'Asia/Tokyo' },
      { code: 'KR', name: 'South Korea', region: 'Asia', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'KRW', dateFormat: 'YYYY.MM.DD', timeZone: 'Asia/Seoul' },
      { code: 'ID', name: 'Indonesia', region: 'Asia', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'IDR', dateFormat: 'DD/MM/YYYY', timeZone: 'Asia/Jakarta' },
      { code: 'TH', name: 'Thailand', region: 'Asia', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'THB', dateFormat: 'DD/MM/YYYY', timeZone: 'Asia/Bangkok' },
      { code: 'MY', name: 'Malaysia', region: 'Asia', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'MYR', dateFormat: 'DD/MM/YYYY', timeZone: 'Asia/Kuala_Lumpur' },
      { code: 'SG', name: 'Singapore', region: 'Asia', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'SGD', dateFormat: 'DD/MM/YYYY', timeZone: 'Asia/Singapore' },

      // Oceania
      { code: 'AU', name: 'Australia', region: 'Oceania', cptCodeSystem: 'MBS', icd10CodeSystem: 'ICD-10-AM', pharmaceuticalCodeSystem: 'PBS', currencyCode: 'AUD', dateFormat: 'DD/MM/YYYY', timeZone: 'Australia/Sydney' },
      { code: 'NZ', name: 'New Zealand', region: 'Oceania', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'NZD', dateFormat: 'DD/MM/YYYY', timeZone: 'Pacific/Auckland' },

      // South America
      { code: 'BR', name: 'Brazil', region: 'South America', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'BRL', dateFormat: 'DD/MM/YYYY', timeZone: 'America/Sao_Paulo' },
      { code: 'AR', name: 'Argentina', region: 'South America', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'ARS', dateFormat: 'DD/MM/YYYY', timeZone: 'America/Buenos_Aires' },
      { code: 'CL', name: 'Chile', region: 'South America', cptCodeSystem: 'CPT-4', icd10CodeSystem: 'ICD-10', pharmaceuticalCodeSystem: 'ATC', currencyCode: 'CLP', dateFormat: 'DD/MM/YYYY', timeZone: 'America/Santiago' }
    ];

    // Insert countries
    for (const country of defaultCountries) {
      await db.insert(countries).values({
        ...country,
        isActive: true
      });
      console.log(`✓ Added country: ${country.name} (${country.code})`);
    }

    console.log('✅ Default countries initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing default countries:', error);
  }
}

async function initializePlatform() {
  try {
    // Wait a moment for database to be fully ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // CRITICAL: Initialize countries FIRST (tenants require countryId)
    log("🌍 Initializing countries first...");
    await initializeDefaultCountries();
    
    // Get Nigeria country for platform tenant
    const nigeriaCountry = await db.select().from(countries).where(eq(countries.code, 'NG')).limit(1);
    if (nigeriaCountry.length === 0) {
      throw new Error("Nigeria country not found - countries initialization failed");
    }
    const countryId = nigeriaCountry[0].id;
    log(`✓ Using Nigeria (${countryId}) as platform tenant country`);
    
    // Create platform tenant (ARGILETTE) with countryId
    const existingTenant = await db.select().from(tenants).where(eq(tenants.subdomain, 'argilette')).limit(1);
    
    let platformTenant;
    const tenantResult = Array.isArray(existingTenant) ? existingTenant : [];
    if (tenantResult.length === 0) {
      const [tenant] = await db.insert(tenants).values({
        name: "ARGILETTE Platform",
        type: "hospital",
        subdomain: "argilette",
        countryId: countryId,
        settings: {
          isPlatformOwner: true,
          features: ["super_admin", "tenant_management", "multi_tenant"]
        },
        isActive: true
      }).returning();
      platformTenant = tenant;
      log("✓ Created platform tenant: ARGILETTE");
    } else {
      platformTenant = existingTenant[0];
      log("✓ Platform tenant already exists");
    }

    // Create super admin user
    const existingAdmin = await db.select().from(users).where(eq(users.email, 'abel@argilette.com')).limit(1);
    
    if (!existingAdmin || existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('Serrega1208@', 10);
      
      await db.insert(users).values({
        id: nanoid(),
        tenantId: platformTenant.id,
        username: 'abel_admin',
        email: 'abel@argilette.com',
        password: hashedPassword,
        firstName: 'Abel',
        lastName: 'Platform Admin',
        role: 'super_admin',
        isActive: true
      });
      
      log("✓ Created super admin user: abel@argilette.com");
    } else {
      log("✓ Super admin already exists");
    }
    
    platformInitialized = true;
    log("✓ Platform initialization complete");
  } catch (error) {
    log("❌ Platform initialization failed: " + error);
    console.error("Platform initialization error:", error);
    
    // Retry initialization after delay in production
    if (process.env.NODE_ENV === 'production') {
      setTimeout(() => {
        log("🔄 Retrying platform initialization...");
        initializePlatform().catch(retryError => {
          console.error("Platform initialization retry failed:", retryError);
        });
      }, 10000); // Retry after 10 seconds
    }
  }
}

(async () => {
  // Register simple test routes FIRST (no dependencies, should always work)
  registerSimpleTestRoutes(app);
  
  // VPS Deployment Release Download Endpoint
  app.get('/download/vps-release', (req, res) => {
    const filePath = path.join(import.meta.dirname, 'public', 'releases', 'navimed-vps-release.tar.gz');
    res.download(filePath, 'navimed-vps-release.tar.gz', (err) => {
      if (err) {
        console.error('Release download error:', err);
        res.status(404).send('Release file not found');
      }
    });
  });
  
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    console.error('Unhandled error:', {
      url: req.url,
      method: req.method,
      error: err.stack || err.message || err
    });

    if (!res.headersSent) {
      res.status(status).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? message : 'Internal server error'
      });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // In production, serve built static files
    const path = await import("path");
    const fs = await import("fs");
    const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
    
    if (!fs.existsSync(distPath)) {
      console.error(`Build directory not found: ${distPath}`);
      console.log("Available directories:", fs.readdirSync(path.resolve(import.meta.dirname, "..")));
    }
    
    app.use(express.static(distPath));
    
    // Serve pharmacy HTML page directly
    app.get("/pharmacy", (req, res) => {
      res.sendFile(path.join(__dirname, "public/pharmacy.html"));
    });
    
    // Serve supplier portal routes directly to React app
    app.get("/supplier-login", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
    
    app.get("/supplier-login-direct", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
    
    app.get("/supplier-dashboard-direct", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
    
    app.get("/supplier-portal", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
    
    // Catch-all handler for SPA routing
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  // CRITICAL: Proper server listening for deployment
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    log(`serving on port ${port}`);
    
    // Initialize platform in background - don't block server startup
    setTimeout(() => {
      initializePlatform().catch(error => {
        console.error("Platform initialization error:", error);
        // Continue running even if initialization fails
      });
    }, 100);
  });

  // Handle process errors gracefully - do NOT exit in production
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Log but continue running in production
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // DO NOT call process.exit() - keep server running
    console.log('Server continuing to run despite error');
  });
})();
