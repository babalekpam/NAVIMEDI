/**
 * Seed Script: Clinical Decision Support Data
 * 
 * This script populates the database with common drug interaction rules
 * and dosage warnings for the Clinical Decision Support system.
 * 
 * Run with: npx tsx server/seed-clinical-data.ts
 */

import { db } from "./db";
import { drugInteractionRules, dosageWarnings } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedClinicalData() {
  console.log("🏥 Seeding Clinical Decision Support Data...\n");

  try {
    // Clear existing data
    console.log("Clearing existing clinical data...");
    await db.delete(drugInteractionRules);
    await db.delete(dosageWarnings);
    console.log("✓ Cleared existing data\n");

    // Drug Interaction Rules (30 common interactions)
    console.log("Adding drug interaction rules...");
    
    const interactions = [
      // Critical Interactions
      {
        drugName1: "Warfarin",
        drugName2: "Aspirin",
        severityLevel: "critical" as const,
        interactionType: "drug_drug" as const,
        description: "Concurrent use significantly increases bleeding risk due to antiplatelet and anticoagulant effects",
        clinicalImpact: "Major bleeding events including gastrointestinal hemorrhage, intracranial bleeding. Risk increases 2-3 fold.",
        managementStrategy: "Avoid combination if possible. If necessary, use lowest effective aspirin dose (81mg) and monitor INR closely. Consider alternative antiplatelet agent.",
        sourceReference: "FDA Drug Safety Communication, ACC/AHA Guidelines"
      },
      {
        drugName1: "MAO Inhibitors",
        drugName2: "SSRIs",
        severityLevel: "critical" as const,
        interactionType: "drug_drug" as const,
        description: "Risk of serotonin syndrome - potentially life-threatening condition",
        clinicalImpact: "Serotonin syndrome symptoms: agitation, confusion, rapid heart rate, high blood pressure, dilated pupils, tremor, hyperthermia, seizures",
        managementStrategy: "Contraindicated. Allow 14-day washout period after discontinuing MAO inhibitor before starting SSRI. Allow 5 weeks after stopping fluoxetine.",
        sourceReference: "FDA Black Box Warning"
      },
      {
        drugName1: "Methotrexate",
        drugName2: "NSAIDs",
        severityLevel: "critical" as const,
        interactionType: "drug_drug" as const,
        description: "NSAIDs reduce renal clearance of methotrexate, increasing toxicity risk",
        clinicalImpact: "Severe methotrexate toxicity: bone marrow suppression, hepatotoxicity, nephrotoxicity, gastrointestinal ulceration",
        managementStrategy: "Avoid NSAIDs during high-dose methotrexate therapy. If unavoidable, closely monitor methotrexate levels, CBC, renal and hepatic function.",
        sourceReference: "Clinical Pharmacology Guidelines"
      },
      {
        drugName1: "ACE Inhibitors",
        drugName2: "Potassium Supplements",
        severityLevel: "critical" as const,
        interactionType: "drug_drug" as const,
        description: "Both increase serum potassium levels, risk of hyperkalemia",
        clinicalImpact: "Severe hyperkalemia can cause cardiac arrhythmias, muscle weakness, and cardiac arrest",
        managementStrategy: "Avoid routine potassium supplementation. Monitor serum potassium closely if combination necessary. Educate patient to avoid potassium-rich foods.",
        sourceReference: "ACC/AHA Heart Failure Guidelines"
      },
      {
        drugName1: "Clarithromycin",
        drugName2: "Statins",
        severityLevel: "critical" as const,
        interactionType: "drug_drug" as const,
        description: "Clarithromycin inhibits CYP3A4, dramatically increasing statin levels",
        clinicalImpact: "Severe rhabdomyolysis, acute renal failure, myoglobinuria. Risk especially high with simvastatin and lovastatin.",
        managementStrategy: "Temporarily discontinue statin during clarithromycin course, or use azithromycin alternative. If continuation necessary, use lowest statin dose.",
        sourceReference: "FDA Drug Safety Communication"
      },

      // Major Interactions
      {
        drugName1: "Digoxin",
        drugName2: "Amiodarone",
        severityLevel: "major" as const,
        interactionType: "drug_drug" as const,
        description: "Amiodarone increases digoxin levels by 70-100%",
        clinicalImpact: "Digoxin toxicity: nausea, vomiting, visual disturbances, arrhythmias",
        managementStrategy: "Reduce digoxin dose by 50% when starting amiodarone. Monitor digoxin levels and adjust accordingly.",
        sourceReference: "Clinical Pharmacology"
      },
      {
        drugName1: "Lithium",
        drugName2: "Thiazide Diuretics",
        severityLevel: "major" as const,
        interactionType: "drug_drug" as const,
        description: "Thiazides decrease lithium clearance, increasing blood levels",
        clinicalImpact: "Lithium toxicity: tremor, confusion, seizures, renal impairment",
        managementStrategy: "Monitor lithium levels closely. May need to reduce lithium dose by 25-50%. Consider loop diuretic alternative.",
        sourceReference: "Psychopharmacology Guidelines"
      },
      {
        drugName1: "Carbamazepine",
        drugName2: "Oral Contraceptives",
        severityLevel: "major" as const,
        interactionType: "drug_drug" as const,
        description: "Carbamazepine induces CYP3A4, reducing contraceptive efficacy",
        clinicalImpact: "Contraceptive failure, unintended pregnancy",
        managementStrategy: "Recommend higher-dose contraceptive (50mcg estrogen) or alternative contraception method. Counsel patient about pregnancy risk.",
        sourceReference: "ACOG Guidelines"
      },
      {
        drugName1: "Allopurinol",
        drugName2: "Azathioprine",
        severityLevel: "major" as const,
        interactionType: "drug_drug" as const,
        description: "Allopurinol inhibits xanthine oxidase, reducing azathioprine metabolism",
        clinicalImpact: "Severe bone marrow suppression, pancytopenia, increased infection risk",
        managementStrategy: "Reduce azathioprine dose to 25% of usual dose. Monitor CBC weekly initially, then monthly.",
        sourceReference: "Transplant Medicine Guidelines"
      },
      {
        drugName1: "Ciprofloxacin",
        drugName2: "Theophylline",
        severityLevel: "major" as const,
        interactionType: "drug_drug" as const,
        description: "Ciprofloxacin inhibits theophylline metabolism",
        clinicalImpact: "Theophylline toxicity: nausea, tachycardia, seizures, arrhythmias",
        managementStrategy: "Reduce theophylline dose by 30-50%. Monitor theophylline levels. Consider alternative antibiotic.",
        sourceReference: "Respiratory Medicine Guidelines"
      },
      {
        drugName1: "Metformin",
        drugName2: "Contrast Dye",
        severityLevel: "major" as const,
        interactionType: "drug_condition" as const,
        description: "Contrast media can impair renal function, increasing metformin accumulation",
        clinicalImpact: "Lactic acidosis - potentially fatal metabolic complication",
        managementStrategy: "Hold metformin 48 hours before and after contrast procedure. Check renal function before restarting.",
        sourceReference: "Radiology Safety Guidelines"
      },
      {
        drugName1: "Beta-blockers",
        drugName2: "Calcium Channel Blockers",
        severityLevel: "major" as const,
        interactionType: "drug_drug" as const,
        description: "Additive effects on cardiac conduction and contractility",
        clinicalImpact: "Severe bradycardia, heart block, hypotension, heart failure exacerbation",
        managementStrategy: "Use with extreme caution. Monitor heart rate, blood pressure, and ECG. Avoid non-dihydropyridine calcium blockers.",
        sourceReference: "Cardiology Guidelines"
      },

      // Moderate Interactions
      {
        drugName1: "Fluoxetine",
        drugName2: "Tramadol",
        severityLevel: "moderate" as const,
        interactionType: "drug_drug" as const,
        description: "Both drugs lower seizure threshold and affect serotonin",
        clinicalImpact: "Increased risk of seizures and serotonin syndrome",
        managementStrategy: "Monitor closely for symptoms. Consider alternative analgesic. Educate patient about warning signs.",
        sourceReference: "Pain Management Guidelines"
      },
      {
        drugName1: "Prednisone",
        drugName2: "NSAIDs",
        severityLevel: "moderate" as const,
        interactionType: "drug_drug" as const,
        description: "Both increase risk of gastrointestinal ulceration and bleeding",
        clinicalImpact: "Peptic ulcer disease, GI bleeding",
        managementStrategy: "Consider PPI prophylaxis if combination necessary. Use lowest effective doses. Monitor for GI symptoms.",
        sourceReference: "Gastroenterology Guidelines"
      },
      {
        drugName1: "Levothyroxine",
        drugName2: "Calcium Supplements",
        severityLevel: "moderate" as const,
        interactionType: "drug_drug" as const,
        description: "Calcium binds to levothyroxine, reducing absorption",
        clinicalImpact: "Reduced thyroid hormone levels, hypothyroidism symptoms",
        managementStrategy: "Separate administration by at least 4 hours. Take levothyroxine on empty stomach. Monitor TSH.",
        sourceReference: "Endocrinology Guidelines"
      },
      {
        drugName1: "Antacids",
        drugName2: "Fluoroquinolones",
        severityLevel: "moderate" as const,
        interactionType: "drug_drug" as const,
        description: "Metal cations in antacids chelate with fluoroquinolones",
        clinicalImpact: "Significantly reduced antibiotic absorption and efficacy",
        managementStrategy: "Take fluoroquinolone 2 hours before or 6 hours after antacid. Consider H2-blocker alternative.",
        sourceReference: "Infectious Disease Guidelines"
      },
      {
        drugName1: "Alcohol",
        drugName2: "Metronidazole",
        severityLevel: "moderate" as const,
        interactionType: "drug_drug" as const,
        description: "Disulfiram-like reaction when combined with alcohol",
        clinicalImpact: "Severe nausea, vomiting, flushing, headache, abdominal cramps",
        managementStrategy: "Advise complete alcohol avoidance during treatment and 48 hours after last dose.",
        sourceReference: "Clinical Pharmacology"
      },
      {
        drugName1: "Grapefruit Juice",
        drugName2: "Simvastatin",
        severityLevel: "moderate" as const,
        interactionType: "drug_food" as const,
        description: "Grapefruit inhibits CYP3A4, increasing statin levels",
        clinicalImpact: "Increased risk of myopathy and rhabdomyolysis",
        managementStrategy: "Avoid grapefruit juice entirely. If patient insists, limit to 1 small glass and monitor CK levels.",
        sourceReference: "FDA Consumer Update"
      },
      {
        drugName1: "Propranolol",
        drugName2: "Epinephrine",
        severityLevel: "moderate" as const,
        interactionType: "drug_drug" as const,
        description: "Beta-blockade unopposed alpha effects of epinephrine",
        clinicalImpact: "Severe hypertension, bradycardia, possible stroke",
        managementStrategy: "Use caution in anaphylaxis treatment. May need higher epinephrine doses. Monitor blood pressure closely.",
        sourceReference: "Allergy and Immunology Guidelines"
      },

      // Additional Common Interactions
      {
        drugName1: "Sildenafil",
        drugName2: "Nitrates",
        severityLevel: "critical" as const,
        interactionType: "drug_drug" as const,
        description: "Additive vasodilation leads to severe hypotension",
        clinicalImpact: "Life-threatening hypotension, syncope, myocardial infarction",
        managementStrategy: "Absolutely contraindicated. Screen all patients for nitrate use before prescribing PDE5 inhibitors.",
        sourceReference: "FDA Black Box Warning"
      },
      {
        drugName1: "Amoxicillin",
        drugName2: "Oral Contraceptives",
        severityLevel: "moderate" as const,
        interactionType: "drug_drug" as const,
        description: "Antibiotics may reduce contraceptive efficacy by altering gut flora",
        clinicalImpact: "Potential contraceptive failure, unintended pregnancy",
        managementStrategy: "Recommend backup contraception during antibiotic course and 7 days after. Counsel about pregnancy risk.",
        sourceReference: "Family Planning Guidelines"
      },
      {
        drugName1: "Benzodiazepines",
        drugName2: "Opioids",
        severityLevel: "critical" as const,
        interactionType: "drug_drug" as const,
        description: "Additive CNS and respiratory depression",
        clinicalImpact: "Severe respiratory depression, coma, death",
        managementStrategy: "Avoid combination if possible. If necessary, use lowest doses, limit duration, closely monitor. Have naloxone available.",
        sourceReference: "FDA Boxed Warning, CDC Opioid Guidelines"
      },
      {
        drugName1: "Tetracyclines",
        drugName2: "Dairy Products",
        severityLevel: "moderate" as const,
        interactionType: "drug_food" as const,
        description: "Calcium in dairy products chelates with tetracyclines",
        clinicalImpact: "Reduced antibiotic absorption and therapeutic failure",
        managementStrategy: "Take tetracycline 1 hour before or 2 hours after meals. Avoid dairy products during treatment.",
        sourceReference: "Antibiotic Prescribing Guidelines"
      },
      {
        drugName1: "Phenytoin",
        drugName2: "Folic Acid",
        severityLevel: "moderate" as const,
        interactionType: "drug_drug" as const,
        description: "Folic acid may decrease phenytoin levels",
        clinicalImpact: "Reduced seizure control, breakthrough seizures",
        managementStrategy: "Monitor phenytoin levels when starting folic acid. May need dose adjustment.",
        sourceReference: "Neurology Guidelines"
      },
      {
        drugName1: "Insulin",
        drugName2: "Corticosteroids",
        severityLevel: "major" as const,
        interactionType: "drug_drug" as const,
        description: "Corticosteroids cause hyperglycemia",
        clinicalImpact: "Significantly elevated blood glucose, diabetic ketoacidosis risk",
        managementStrategy: "Increase insulin dose by 20-50%. Monitor blood glucose closely (4-6 times daily). Adjust as needed.",
        sourceReference: "Diabetes Management Guidelines"
      },
      {
        drugName1: "ACE Inhibitors",
        drugName2: "NSAIDs",
        severityLevel: "major" as const,
        interactionType: "drug_drug" as const,
        description: "NSAIDs reduce antihypertensive effect and impair renal function",
        clinicalImpact: "Acute renal failure, hyperkalemia, reduced blood pressure control",
        managementStrategy: "Avoid NSAIDs if possible. If necessary, monitor renal function and potassium closely. Use lowest NSAID dose.",
        sourceReference: "Hypertension Guidelines"
      },
      {
        drugName1: "St. John's Wort",
        drugName2: "Warfarin",
        severityLevel: "major" as const,
        interactionType: "drug_drug" as const,
        description: "St. John's Wort induces CYP enzymes, reducing warfarin effect",
        clinicalImpact: "Reduced anticoagulation, increased clotting risk",
        managementStrategy: "Avoid herbal supplement. If patient insists on use, monitor INR closely and adjust warfarin dose.",
        sourceReference: "Anticoagulation Management Guidelines"
      },
      {
        drugName1: "Clopidogrel",
        drugName2: "Omeprazole",
        severityLevel: "major" as const,
        interactionType: "drug_drug" as const,
        description: "Omeprazole inhibits CYP2C19, reducing clopidogrel activation",
        clinicalImpact: "Reduced antiplatelet effect, increased cardiovascular events",
        managementStrategy: "Use pantoprazole as alternative PPI. If omeprazole necessary, separate dosing by 12 hours.",
        sourceReference: "Cardiology Guidelines"
      },
      {
        drugName1: "Ketoconazole",
        drugName2: "Antihistamines",
        severityLevel: "major" as const,
        interactionType: "drug_drug" as const,
        description: "Ketoconazole inhibits metabolism of certain antihistamines",
        clinicalImpact: "QT prolongation, torsades de pointes, cardiac arrest",
        managementStrategy: "Avoid terfenadine and astemizole. Use second-generation antihistamines (cetirizine, loratadine).",
        sourceReference: "FDA Drug Safety Communication"
      }
    ];

    await db.insert(drugInteractionRules).values(interactions);
    console.log(`✓ Added ${interactions.length} drug interaction rules\n`);

    // Dosage Warnings (15 common warnings)
    console.log("Adding dosage warnings...");
    
    const warnings = [
      // Renal Dosing Adjustments
      {
        drugName: "Gabapentin",
        minDose: 100,
        maxDose: 300,
        unit: "mg",
        frequency: "once daily",
        patientCondition: "renal" as const,
        warningMessage: "Dose adjustment required for renal impairment (CrCl <60 mL/min)",
        adjustmentRecommendation: "CrCl 30-59: 300mg BID; CrCl 15-29: 300mg daily; CrCl <15: 300mg every other day. Reduce doses by 50% in elderly."
      },
      {
        drugName: "Enoxaparin",
        minDose: 1,
        maxDose: 1,
        unit: "mg/kg",
        frequency: "once daily",
        patientCondition: "renal" as const,
        warningMessage: "Dose reduction required for severe renal impairment (CrCl <30 mL/min)",
        adjustmentRecommendation: "For CrCl <30: reduce dose to 1mg/kg once daily (instead of twice daily). Monitor anti-Xa levels. Consider UFH alternative."
      },
      {
        drugName: "Metformin",
        minDose: 500,
        maxDose: 1000,
        unit: "mg",
        frequency: "twice daily",
        patientCondition: "renal" as const,
        warningMessage: "Contraindicated if eGFR <30 mL/min. Use with caution if eGFR 30-45 mL/min",
        adjustmentRecommendation: "eGFR 30-45: Do not initiate, may continue at reduced dose with close monitoring. eGFR <30: Contraindicated due to lactic acidosis risk."
      },

      // Hepatic Dosing Adjustments
      {
        drugName: "Atorvastatin",
        minDose: 10,
        maxDose: 20,
        unit: "mg",
        frequency: "daily",
        patientCondition: "hepatic" as const,
        warningMessage: "Contraindicated in active liver disease or unexplained elevated transaminases",
        adjustmentRecommendation: "Start with lowest dose (10mg). Monitor LFTs at baseline, 12 weeks, and annually. Discontinue if ALT >3x ULN persistently."
      },
      {
        drugName: "Warfarin",
        minDose: 1,
        maxDose: 5,
        unit: "mg",
        frequency: "daily",
        patientCondition: "hepatic" as const,
        warningMessage: "Reduced synthesis of clotting factors in liver disease increases bleeding risk",
        adjustmentRecommendation: "Start with lower doses (1-2mg). Monitor INR more frequently (every 2-3 days initially). Target lower INR range if possible."
      },

      // Pediatric Dosing
      {
        drugName: "Acetaminophen",
        minDose: 10,
        maxDose: 15,
        unit: "mg/kg",
        frequency: "every 4-6 hours",
        patientCondition: "pediatric" as const,
        warningMessage: "Dosing in children must be weight-based. Maximum 75mg/kg/day or 4g/day (whichever is less)",
        adjustmentRecommendation: "Neonates: 10-15mg/kg/dose Q6-8h. Infants/children: 10-15mg/kg/dose Q4-6h. Do not exceed 5 doses in 24 hours."
      },
      {
        drugName: "Amoxicillin",
        minDose: 20,
        maxDose: 45,
        unit: "mg/kg",
        frequency: "divided BID-TID",
        patientCondition: "pediatric" as const,
        warningMessage: "Higher doses required for resistant infections and otitis media",
        adjustmentRecommendation: "Standard infections: 20-25mg/kg/day divided BID. Resistant infections: 40-45mg/kg/day divided BID. Max: 1000mg/dose."
      },

      // Geriatric Dosing
      {
        drugName: "Morphine",
        minDose: 2.5,
        maxDose: 5,
        unit: "mg",
        frequency: "every 4 hours PRN",
        patientCondition: "geriatric" as const,
        warningMessage: "Start low and go slow in elderly. Increased sensitivity and slower metabolism",
        adjustmentRecommendation: "Start with 2.5mg PO Q4h PRN (50% of usual adult dose). Titrate slowly. Monitor for respiratory depression, confusion."
      },
      {
        drugName: "Benzodiazepines",
        minDose: 0.25,
        maxDose: 0.5,
        unit: "mg",
        frequency: "as needed",
        patientCondition: "geriatric" as const,
        warningMessage: "Beers Criteria: Avoid in elderly due to fall risk, cognitive impairment, delirium",
        adjustmentRecommendation: "If absolutely necessary, use short-acting agents at lowest doses. Lorazepam 0.25-0.5mg. Consider non-pharmacologic alternatives first."
      },

      // Pregnancy Dosing
      {
        drugName: "Levothyroxine",
        minDose: 1.6,
        maxDose: 2,
        unit: "mcg/kg",
        frequency: "daily",
        patientCondition: "pregnancy" as const,
        warningMessage: "Thyroid hormone requirements increase 25-50% during pregnancy",
        adjustmentRecommendation: "Increase dose by 25-30% as soon as pregnancy confirmed. Monitor TSH every 4 weeks in first half, then every 6-8 weeks."
      },
      {
        drugName: "Insulin",
        minDose: null,
        maxDose: null,
        unit: "units",
        frequency: "variable",
        patientCondition: "pregnancy" as const,
        warningMessage: "Insulin requirements change dramatically during pregnancy",
        adjustmentRecommendation: "1st trimester: may decrease. 2nd/3rd: increase 50-100%. Frequent SMBG required. Target fasting <95, 1hr <140, 2hr <120."
      },

      // Weight-Based Dosing
      {
        drugName: "Enoxaparin (Treatment)",
        minDose: 1,
        maxDose: 1,
        unit: "mg/kg",
        frequency: "twice daily",
        patientCondition: "other" as const,
        warningMessage: "Weight-based dosing required. Maximum dose: 100mg per injection",
        adjustmentRecommendation: "Treatment DVT/PE: 1mg/kg Q12h or 1.5mg/kg daily. Prophylaxis: 40mg daily (30mg if CrCl <30). Adjust for extremes of weight."
      },
      {
        drugName: "Vancomycin",
        minDose: 15,
        maxDose: 20,
        unit: "mg/kg",
        frequency: "every 8-12 hours",
        patientCondition: "other" as const,
        warningMessage: "Requires therapeutic drug monitoring. Target trough 10-20 mcg/mL depending on indication",
        adjustmentRecommendation: "Loading: 25-30mg/kg. Maintenance: 15-20mg/kg Q8-12h. Adjust based on levels and renal function. Monitor trough before 4th dose."
      },

      // High-Risk Medications
      {
        drugName: "Digoxin",
        minDose: 0.0625,
        maxDose: 0.25,
        unit: "mg",
        frequency: "daily",
        patientCondition: "geriatric" as const,
        warningMessage: "Narrow therapeutic index. Elderly at higher risk of toxicity",
        adjustmentRecommendation: "Elderly: start 0.0625-0.125mg daily. Target level 0.5-1.0 ng/mL (lower than traditional range). Monitor renal function, potassium."
      },
      {
        drugName: "Lithium",
        minDose: 300,
        maxDose: 600,
        unit: "mg",
        frequency: "twice daily",
        patientCondition: "other" as const,
        warningMessage: "Narrow therapeutic index. Requires regular monitoring of levels and renal function",
        adjustmentRecommendation: "Start 300mg BID-TID. Target level 0.6-1.2 mEq/L. Check level weekly until stable, then monthly. Monitor TSH, creatinine q6months."
      }
    ];

    await db.insert(dosageWarnings).values(warnings);
    console.log(`✓ Added ${warnings.length} dosage warnings\n`);

    console.log("✅ Clinical Decision Support data seeded successfully!\n");
    console.log("Summary:");
    console.log(`  - ${interactions.length} Drug Interaction Rules`);
    console.log(`  - ${warnings.length} Dosage Warnings`);
    console.log("\nData includes:");
    console.log("  - Critical, Major, and Moderate severity interactions");
    console.log("  - Drug-drug, drug-food, and drug-condition interactions");
    console.log("  - Dosing guidance for renal, hepatic, pediatric, geriatric, and pregnancy conditions");
    console.log("  - Evidence-based management strategies");
    
  } catch (error) {
    console.error("❌ Error seeding clinical data:", error);
    throw error;
  }
}

// Run the seed function
seedClinicalData()
  .then(() => {
    console.log("\n🎉 Seed completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seed failed:", error);
    process.exit(1);
  });
