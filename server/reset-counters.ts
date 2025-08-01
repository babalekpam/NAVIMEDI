import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { 
  patients, prescriptions, appointments, labOrders, labResults, 
  vitalSigns, insuranceClaims, patientInsurance, visitSummaries,
  medicalCommunications, patientCheckIns, auditLogs, patientAssignments,
  healthAnalyses, labBills, pharmacyReceipts, reports
} from '../shared/schema.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const db = drizzle(pool);

async function resetCounters() {
  try {
    console.log('🔄 Starting counter reset process...');
    
    // Delete all data tables while preserving tenants, users, and admin accounts
    await db.delete(healthAnalyses);
    console.log('✅ Cleared health analyses');
    
    await db.delete(reports);
    console.log('✅ Cleared reports');
    
    await db.delete(auditLogs);
    console.log('✅ Cleared audit logs');
    
    await db.delete(patientCheckIns);
    console.log('✅ Cleared patient check-ins');
    
    await db.delete(medicalCommunications);
    console.log('✅ Cleared medical communications');
    
    await db.delete(visitSummaries);
    console.log('✅ Cleared visit summaries');
    
    await db.delete(patientAssignments);
    console.log('✅ Cleared patient assignments');
    
    await db.delete(insuranceClaims);
    console.log('✅ Cleared insurance claims');
    
    await db.delete(patientInsurance);
    console.log('✅ Cleared patient insurance records');
    
    await db.delete(vitalSigns);
    console.log('✅ Cleared vital signs');
    
    await db.delete(labResults);
    console.log('✅ Cleared lab results');
    
    await db.delete(labBills);
    console.log('✅ Cleared lab bills');
    
    await db.delete(labOrders);
    console.log('✅ Cleared lab orders');
    
    await db.delete(pharmacyReceipts);
    console.log('✅ Cleared pharmacy receipts');
    
    await db.delete(prescriptions);
    console.log('✅ Cleared prescriptions');
    
    await db.delete(appointments);
    console.log('✅ Cleared appointments');
    
    await db.delete(patients);
    console.log('✅ Cleared patients');
    
    console.log('🎉 All counters reset to zero successfully!');
    console.log('🏥 Tenants, users, and admin accounts preserved');
    
  } catch (error) {
    console.error('❌ Error resetting counters:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetCounters();