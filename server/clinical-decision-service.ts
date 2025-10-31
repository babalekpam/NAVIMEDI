/**
 * Clinical Decision Support Service
 * 
 * Provides intelligent clinical decision support functions for:
 * - Drug-drug, drug-food, drug-condition interaction checking
 * - Patient allergy verification
 * - Dosage validation based on patient conditions
 * - Duplicate therapy detection
 * - Clinical alert generation and management
 * 
 * All functions follow HIPAA compliance and medical best practices.
 */

import { storage } from "./storage";
import type { InsertClinicalAlert } from "@shared/schema";

export interface ClinicalCheckResult {
  hasAlerts: boolean;
  alerts: ClinicalAlertData[];
  severity: 'critical' | 'major' | 'moderate' | 'minor' | 'none';
  canProceed: boolean; // false for critical alerts
}

export interface ClinicalAlertData {
  type: 'drug_interaction' | 'allergy' | 'dosage' | 'duplicate_therapy' | 'contraindication';
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  title: string;
  message: string;
  recommendations: string;
  clinicalImpact?: string;
  managementStrategy?: string;
}

export interface PrescriptionCheckRequest {
  patientId: string;
  tenantId: string;
  drugName: string;
  dosage: string;
  frequency: string;
  prescriberId: string;
  patientConditions?: string[]; // 'renal', 'hepatic', 'pediatric', 'geriatric', 'pregnancy'
}

/**
 * Check for drug-drug interactions
 * Compares new medication against all existing patient medications
 */
export async function checkDrugInteractions(
  patientId: string,
  tenantId: string,
  newDrug: string,
  existingMedications?: string[]
): Promise<ClinicalAlertData[]> {
  const alerts: ClinicalAlertData[] = [];

  try {
    // If no existing medications provided, get them from patient's active prescriptions
    let medicationsToCheck = existingMedications || [];
    
    if (!existingMedications) {
      const prescriptions = await storage.getPrescriptionsByPatient(patientId, tenantId);
      // Only check active prescriptions (not cancelled or fully dispensed long ago)
      const activePrescriptions = prescriptions.filter(p => 
        p.status !== 'cancelled' && p.status !== 'dispensed'
      );
      medicationsToCheck = activePrescriptions.map(p => p.medicationName);
    }

    // Check interactions with each existing medication
    for (const existingDrug of medicationsToCheck) {
      const interaction = await storage.checkDrugInteraction(newDrug, existingDrug);
      
      if (interaction) {
        alerts.push({
          type: 'drug_interaction',
          severity: interaction.severityLevel as 'critical' | 'major' | 'moderate' | 'minor',
          title: `Drug Interaction: ${newDrug} ↔ ${existingDrug}`,
          message: interaction.description,
          recommendations: interaction.managementStrategy,
          clinicalImpact: interaction.clinicalImpact,
          managementStrategy: interaction.managementStrategy
        });
      }
    }

    return alerts;
  } catch (error) {
    console.error('Error checking drug interactions:', error);
    return [];
  }
}

/**
 * Check if patient has allergies to the prescribed medication
 */
export async function checkAllergies(
  patientId: string,
  tenantId: string,
  drugName: string
): Promise<ClinicalAlertData[]> {
  const alerts: ClinicalAlertData[] = [];

  try {
    const allergies = await storage.getPatientAllergies(patientId, tenantId);
    
    for (const allergy of allergies) {
      // Check if the drug name matches the allergen (case-insensitive, partial match)
      if (drugName.toLowerCase().includes(allergy.allergen.toLowerCase()) ||
          allergy.allergen.toLowerCase().includes(drugName.toLowerCase())) {
        
        const severity = allergy.severity === 'life_threatening' ? 'critical' :
                        allergy.severity === 'severe' ? 'major' :
                        allergy.severity === 'moderate' ? 'moderate' : 'minor';

        alerts.push({
          type: 'allergy',
          severity: severity as 'critical' | 'major' | 'moderate' | 'minor',
          title: `⚠️ ALLERGY ALERT: ${allergy.allergen}`,
          message: `Patient has documented ${allergy.severity} allergy to ${allergy.allergen}. Reaction: ${allergy.reaction}`,
          recommendations: `Do not prescribe ${drugName}. Consider alternative medication. Document override reason if absolutely necessary.`,
          clinicalImpact: `Previous reaction: ${allergy.reaction}. Severity: ${allergy.severity}.`
        });
      }
    }

    return alerts;
  } catch (error) {
    console.error('Error checking patient allergies:', error);
    return [];
  }
}

/**
 * Validate dosage based on patient conditions and standard dosing guidelines
 */
export async function checkDosage(
  drugName: string,
  dosage: string,
  frequency: string,
  patientConditions?: string[]
): Promise<ClinicalAlertData[]> {
  const alerts: ClinicalAlertData[] = [];

  try {
    // Extract numeric dose from dosage string (e.g., "500mg" -> 500)
    const doseMatch = dosage.match(/(\d+\.?\d*)/);
    const doseValue = doseMatch ? parseFloat(doseMatch[1]) : null;

    if (!doseValue) {
      // Cannot validate without numeric dose
      return alerts;
    }

    // Check for condition-specific dosage warnings
    if (patientConditions && patientConditions.length > 0) {
      for (const condition of patientConditions) {
        const warning = await storage.getDosageWarning(drugName, condition);
        
        if (warning) {
          const minDose = warning.minDose ? parseFloat(warning.minDose) : null;
          const maxDose = warning.maxDose ? parseFloat(warning.maxDose) : null;

          let needsWarning = false;
          let warningType = '';

          if (minDose && doseValue < minDose) {
            needsWarning = true;
            warningType = 'below minimum';
          } else if (maxDose && doseValue > maxDose) {
            needsWarning = true;
            warningType = 'above maximum';
          }

          if (needsWarning) {
            alerts.push({
              type: 'dosage',
              severity: 'major',
              title: `Dosage Warning: ${drugName} for ${condition} patient`,
              message: `Prescribed dose ${dosage} is ${warningType} recommended range for ${condition} patients. ${warning.warningMessage}`,
              recommendations: warning.adjustmentRecommendation || 'Review dosage and adjust based on patient condition.',
              clinicalImpact: warning.warningMessage
            });
          } else if (minDose || maxDose) {
            // Dose is within range but still show guidance
            alerts.push({
              type: 'dosage',
              severity: 'minor',
              title: `Dosage Guidance: ${drugName} for ${condition} patient`,
              message: `Recommended range for ${condition} patients: ${minDose ? minDose + warning.unit : '(no min)'} to ${maxDose ? maxDose + warning.unit : '(no max)'}`,
              recommendations: warning.adjustmentRecommendation || 'Current dose is within acceptable range. Monitor patient response.',
              clinicalImpact: warning.warningMessage
            });
          }
        }
      }
    }

    // Check general dosage warnings (no specific condition)
    const generalWarnings = await storage.getDosageWarnings(drugName);
    for (const warning of generalWarnings) {
      if (!warning.patientCondition) {
        const minDose = warning.minDose ? parseFloat(warning.minDose) : null;
        const maxDose = warning.maxDose ? parseFloat(warning.maxDose) : null;

        if (maxDose && doseValue > maxDose) {
          alerts.push({
            type: 'dosage',
            severity: 'major',
            title: `Dosage Exceeds Maximum: ${drugName}`,
            message: `Prescribed dose ${dosage} exceeds maximum recommended dose of ${maxDose}${warning.unit}. ${warning.warningMessage}`,
            recommendations: warning.adjustmentRecommendation || 'Reduce dose to within recommended range.',
            clinicalImpact: warning.warningMessage
          });
        }
      }
    }

    return alerts;
  } catch (error) {
    console.error('Error checking dosage:', error);
    return [];
  }
}

/**
 * Detect duplicate therapy - medications treating the same condition
 */
export async function checkDuplicateTherapy(
  patientId: string,
  tenantId: string,
  drugName: string
): Promise<ClinicalAlertData[]> {
  const alerts: ClinicalAlertData[] = [];

  try {
    const prescriptions = await storage.getPrescriptionsByPatient(patientId, tenantId);
    const activePrescriptions = prescriptions.filter(p => 
      p.status !== 'cancelled' && p.status !== 'dispensed'
    );

    // Simple duplicate detection - check if exact same medication already prescribed
    const duplicates = activePrescriptions.filter(p => 
      p.medicationName.toLowerCase() === drugName.toLowerCase()
    );

    if (duplicates.length > 0) {
      alerts.push({
        type: 'duplicate_therapy',
        severity: 'moderate',
        title: `Duplicate Therapy: ${drugName}`,
        message: `Patient already has active prescription(s) for ${drugName}. ${duplicates.length} active prescription(s) found.`,
        recommendations: 'Verify patient is not already taking this medication. Consider adjusting existing prescription instead of adding new one.',
        clinicalImpact: 'Risk of medication overdose and duplication of therapy.'
      });
    }

    // Check for similar drug classes (simplified - in production, use drug classification database)
    // For now, we'll do basic string matching for common drug classes
    const drugClassPatterns: { [key: string]: string[] } = {
      'Statins': ['statin', 'atorvastatin', 'simvastatin', 'rosuvastatin', 'pravastatin'],
      'ACE Inhibitors': ['pril', 'lisinopril', 'enalapril', 'ramipril'],
      'ARBs': ['sartan', 'losartan', 'valsartan', 'irbesartan'],
      'Beta Blockers': ['olol', 'metoprolol', 'atenolol', 'propranolol'],
      'Benzodiazepines': ['pam', 'lam', 'diazepam', 'lorazepam', 'alprazolam'],
      'PPIs': ['prazole', 'omeprazole', 'esomeprazole', 'pantoprazole'],
      'SSRIs': ['fluoxetine', 'sertraline', 'escitalopram', 'citalopram'],
      'NSAIDs': ['ibuprofen', 'naproxen', 'diclofenac', 'celecoxib']
    };

    for (const [className, patterns] of Object.entries(drugClassPatterns)) {
      const newDrugInClass = patterns.some(pattern => 
        drugName.toLowerCase().includes(pattern.toLowerCase())
      );

      if (newDrugInClass) {
        const existingInClass = activePrescriptions.filter(p =>
          patterns.some(pattern => p.medicationName.toLowerCase().includes(pattern.toLowerCase())) &&
          p.medicationName.toLowerCase() !== drugName.toLowerCase()
        );

        if (existingInClass.length > 0) {
          alerts.push({
            type: 'duplicate_therapy',
            severity: 'moderate',
            title: `Duplicate Drug Class: ${className}`,
            message: `Patient already taking ${existingInClass[0].medicationName} (${className}). Adding ${drugName} may result in duplicate therapy.`,
            recommendations: `Review need for multiple ${className} medications. Consider discontinuing existing medication if switching, or ensure combination is intentional.`,
            clinicalImpact: 'Potential for additive side effects and increased risk of adverse events.'
          });
        }
      }
    }

    return alerts;
  } catch (error) {
    console.error('Error checking duplicate therapy:', error);
    return [];
  }
}

/**
 * Comprehensive prescription check - runs all CDS checks
 */
export async function checkPrescription(
  request: PrescriptionCheckRequest
): Promise<ClinicalCheckResult> {
  const allAlerts: ClinicalAlertData[] = [];

  try {
    // Run all checks in parallel for efficiency
    const [interactionAlerts, allergyAlerts, dosageAlerts, duplicateAlerts] = await Promise.all([
      checkDrugInteractions(request.patientId, request.tenantId, request.drugName),
      checkAllergies(request.patientId, request.tenantId, request.drugName),
      checkDosage(request.drugName, request.dosage, request.frequency, request.patientConditions),
      checkDuplicateTherapy(request.patientId, request.tenantId, request.drugName)
    ]);

    allAlerts.push(...interactionAlerts, ...allergyAlerts, ...dosageAlerts, ...duplicateAlerts);

    // Determine overall severity - use highest severity alert
    let overallSeverity: 'critical' | 'major' | 'moderate' | 'minor' | 'none' = 'none';
    let canProceed = true;

    if (allAlerts.length > 0) {
      const severityOrder = ['critical', 'major', 'moderate', 'minor'];
      for (const sev of severityOrder) {
        if (allAlerts.some(a => a.severity === sev)) {
          overallSeverity = sev as typeof overallSeverity;
          break;
        }
      }

      // Critical alerts require override reason to proceed
      if (overallSeverity === 'critical') {
        canProceed = false;
      }
    }

    return {
      hasAlerts: allAlerts.length > 0,
      alerts: allAlerts,
      severity: overallSeverity,
      canProceed
    };
  } catch (error) {
    console.error('Error performing prescription check:', error);
    return {
      hasAlerts: false,
      alerts: [],
      severity: 'none',
      canProceed: true
    };
  }
}

/**
 * Generate and persist clinical alert in database
 */
export async function generateClinicalAlert(
  patientId: string,
  tenantId: string,
  alertData: ClinicalAlertData,
  prescriptionId: string | null,
  triggeredBy: string
): Promise<void> {
  try {
    const alert: InsertClinicalAlert = {
      tenantId,
      patientId,
      prescriptionId,
      alertType: alertData.type,
      severity: alertData.severity,
      title: alertData.title,
      message: alertData.message,
      recommendations: alertData.recommendations,
      triggeredBy,
      acknowledgedBy: null,
      dismissedReason: null
    };

    await storage.createClinicalAlert(alert);
    console.log(`Clinical alert generated: ${alertData.type} - ${alertData.severity} for patient ${patientId}`);
  } catch (error) {
    console.error('Error generating clinical alert:', error);
    throw error;
  }
}

/**
 * Generate all alerts from prescription check and save to database
 */
export async function generateAlertsFromCheck(
  patientId: string,
  tenantId: string,
  checkResult: ClinicalCheckResult,
  prescriptionId: string | null,
  triggeredBy: string
): Promise<void> {
  try {
    // Generate alerts in database for all found issues
    for (const alert of checkResult.alerts) {
      await generateClinicalAlert(patientId, tenantId, alert, prescriptionId, triggeredBy);
    }
  } catch (error) {
    console.error('Error generating alerts from check:', error);
    throw error;
  }
}
