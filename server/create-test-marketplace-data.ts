import { db } from "./db";
import { storage } from "./storage";

async function createTestMarketplaceData() {
  try {
    console.log("🏥 Creating test marketplace data...");

    // Step 1: Find or create a supplier tenant
    let supplierTenant = await storage.getTenantBySubdomain("medtech-solutions");
    
    if (!supplierTenant) {
      supplierTenant = await storage.createTenant({
        name: "MedTech Solutions Inc.",
        type: "hospital", // Using hospital type for now as medical_supplier enum needs DB update
        subdomain: "medtech-solutions-" + Date.now(), // Add timestamp to make unique
        address: "123 Medical Supply Drive",
        city: "San Francisco",
        state: "CA",
        zipCode: "94105",
        country: "USA",
        contactEmail: "admin@medtechsolutions.com",
        contactPhone: "+1-555-MEDTECH"
      });
      console.log("✅ Created new supplier tenant:", supplierTenant.name);
    } else {
      console.log("✅ Using existing supplier tenant:", supplierTenant.name);
    }

    // Step 2: Find or create supplier admin user
    let supplierAdmin = await storage.getUserByEmail("sarah@medtechsolutions.com", supplierTenant.id);
    
    if (!supplierAdmin) {
      supplierAdmin = await storage.createUser({
        tenantId: supplierTenant.id,
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah@medtechsolutions.com",
        username: "medtech_admin_" + Date.now(), // Make unique
        passwordHash: "$2b$10$rOvtTNjsP7z1HJYSv5vF4uI8QvOmKwz6nqz6Y6nH7P8jKmZx1Xz2y", // password
        role: "tenant_admin", // Using tenant_admin role
        isActive: true
      });
      console.log("✅ Created new supplier admin user:", supplierAdmin.email);
    } else {
      console.log("✅ Using existing supplier admin user:", supplierAdmin.email);
    }

    // Step 3: Skip supplier profile creation for now and focus on products
    console.log("⏭️ Skipping medical supplier profile creation for now");

    // Step 4: Create sample marketplace products 
    const products = [
      {
        supplierTenantId: supplierTenant.id,
        name: "Advanced Digital Stethoscope",
        sku: "MTS-STETHO-001",
        description: "High-quality digital stethoscope with noise cancellation, Bluetooth connectivity, and recording capabilities. Perfect for accurate cardiac and pulmonary assessments.",
        shortDescription: "Digital stethoscope with Bluetooth and recording features",
        category: "Diagnostic Equipment",
        subcategory: "Stethoscopes",
        brand: "MedTech Pro",
        manufacturer: "MedTech Solutions Inc.",
        price: "299.99",
        currency: "USD",
        compareAtPrice: "399.99",
        costPrice: "150.00",
        stockQuantity: 50,
        lowStockThreshold: 10,
        trackInventory: true,
        backordersAllowed: false,
        status: "active",
        isActive: true,
        isFeatured: true,
        requiresPrescription: false,
        specifications: {
          "Weight": "180g",
          "Battery Life": "12 hours",
          "Connectivity": "Bluetooth 5.0",
          "Warranty": "2 years"
        },
        features: ["Noise cancellation", "Bluetooth connectivity", "Mobile app integration", "Recording capability"],
        imageUrls: ["/api/placeholder/product1.jpg"],
        documentUrls: ["/api/docs/stethoscope-manual.pdf"],
        regulatoryApprovals: ["FDA 510(k)", "CE Marking"],
        certifications: ["ISO 13485"],
        warrantyPeriod: "2 years",
        complianceNotes: "FDA registered medical device",
        metaTitle: "Advanced Digital Stethoscope - MedTech Pro",
        metaDescription: "Professional digital stethoscope with Bluetooth connectivity and recording capabilities for healthcare professionals.",
        searchKeywords: ["stethoscope", "digital", "bluetooth", "medical", "diagnostic"],
        weight: "0.18",
        dimensions: {
          length: 28,
          width: 5,
          height: 3,
          unit: "cm"
        },
        shippingClass: "standard",
        leadTimeDays: 3
      },
      {
        supplierTenantId: supplierTenant.id,
        name: "Portable Ultrasound Machine",
        sku: "MTS-ULTRA-002",
        description: "Compact, portable ultrasound system with high-resolution imaging, multiple probe compatibility, and wireless connectivity. Ideal for point-of-care diagnostics.",
        shortDescription: "Portable ultrasound system with wireless connectivity",
        category: "Diagnostic Equipment",
        subcategory: "Ultrasound",
        brand: "MedTech Pro",
        manufacturer: "MedTech Solutions Inc.",
        price: "12999.99",
        currency: "USD",
        compareAtPrice: "15999.99",
        costPrice: "8500.00",
        stockQuantity: 5,
        lowStockThreshold: 2,
        trackInventory: true,
        backordersAllowed: true,
        status: "active",
        isActive: true,
        isFeatured: true,
        requiresPrescription: false,
        specifications: {
          "Display": "15.6-inch touchscreen",
          "Battery Life": "4 hours continuous",
          "Weight": "4.2 kg",
          "Connectivity": "WiFi, USB, HDMI"
        },
        features: ["High-resolution imaging", "Multiple probe support", "Cloud storage", "Wireless connectivity"],
        imageUrls: ["/api/placeholder/ultrasound.jpg"],
        documentUrls: ["/api/docs/ultrasound-manual.pdf", "/api/docs/ultrasound-specs.pdf"],
        regulatoryApprovals: ["FDA 510(k)", "Health Canada", "CE Marking"],
        certifications: ["ISO 13485", "IEC 60601"],
        warrantyPeriod: "3 years",
        complianceNotes: "FDA Class II medical device",
        metaTitle: "Portable Ultrasound Machine - MedTech Pro",
        metaDescription: "Professional portable ultrasound system with wireless connectivity for point-of-care diagnostics.",
        searchKeywords: ["ultrasound", "portable", "diagnostic", "imaging", "medical"],
        weight: "4.20",
        dimensions: {
          length: 38,
          width: 28,
          height: 15,
          unit: "cm"
        },
        shippingClass: "fragile",
        leadTimeDays: 7
      },
      {
        supplierTenantId: supplierTenant.id,
        name: "Surgical Instrument Set - Premium",
        sku: "MTS-SURG-003",
        description: "Complete surgical instrument set with 25 high-grade stainless steel instruments. Includes forceps, scissors, scalpels, and clamps in a sterile case.",
        shortDescription: "Complete 25-piece surgical instrument set",
        category: "Surgical Instruments",
        subcategory: "Instrument Sets",
        brand: "MedTech Pro",
        manufacturer: "MedTech Solutions Inc.",
        price: "899.99",
        currency: "USD",
        compareAtPrice: "1199.99",
        costPrice: "450.00",
        stockQuantity: 25,
        lowStockThreshold: 5,
        trackInventory: true,
        backordersAllowed: false,
        status: "active",
        isActive: true,
        isFeatured: false,
        requiresPrescription: true,
        specifications: {
          "Material": "316L Stainless Steel",
          "Pieces": "25 instruments",
          "Case": "Sterilization compatible",
          "Finish": "Mirror polished"
        },
        features: ["Premium stainless steel", "Autoclave compatible", "Ergonomic design", "Sterile packaging"],
        imageUrls: ["/api/placeholder/surgical-set.jpg"],
        documentUrls: ["/api/docs/surgical-instruments-manual.pdf"],
        regulatoryApprovals: ["FDA 510(k)", "CE Marking"],
        certifications: ["ISO 13485"],
        warrantyPeriod: "5 years",
        complianceNotes: "FDA Class I medical device",
        metaTitle: "Premium Surgical Instrument Set - 25 Pieces",
        metaDescription: "Professional surgical instrument set with 25 high-grade stainless steel instruments for medical procedures.",
        searchKeywords: ["surgical", "instruments", "stainless", "sterile", "medical"],
        weight: "2.50",
        dimensions: {
          length: 35,
          width: 25,
          height: 8,
          unit: "cm"
        },
        shippingClass: "standard",
        leadTimeDays: 5
      }
    ];

    console.log("🛒 Creating marketplace products...");
    
    for (const productData of products) {
      const product = await storage.createMarketplaceProduct(productData);
      console.log(`✅ Created product: ${product.name} (${product.sku})`);
    }

    console.log("🎉 Test marketplace data created successfully!");
    console.log("");
    console.log("📋 Summary:");
    console.log(`- Supplier Tenant: ${supplierTenant.name}`);
    console.log(`- Supplier Admin: ${supplierAdmin.email}`);
    console.log(`- Products Created: ${products.length}`);
    console.log("");
    console.log("🔐 Test Login Credentials:");
    console.log("- Email: sarah@medtechsolutions.com");
    console.log("- Username: medtech_admin");
    console.log("- Password: password");
    console.log("");
    console.log("🌐 API Endpoints Available:");
    console.log("- GET /api/marketplace/products - Browse product catalog");
    console.log("- GET /api/supplier/products - Supplier product management");
    console.log("- POST /api/marketplace/orders - Create orders");
    console.log("- GET /supplier-dashboard-direct - Supplier dashboard");

  } catch (error) {
    console.error("❌ Error creating test marketplace data:", error);
    throw error;
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestMarketplaceData()
    .then(() => {
      console.log("✅ Marketplace setup complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Failed to create marketplace data:", error);
      process.exit(1);
    });
}

export { createTestMarketplaceData };