import { db } from "./db";
import { financialTransactions, hospitalBills, pharmacyBills, labBills, patientPayments, pharmacyReceipts } from "@shared/schema";
import type { InsertFinancialTransaction, InsertHospitalBill, InsertPharmacyBill, InsertPatientPayment, InsertPharmacyReceipt } from "@shared/schema";
import { nanoid } from "nanoid";

/**
 * Comprehensive Financial Transaction Service for Bookkeeping
 * Automatically records all financial activities across the healthcare platform
 * Ensures complete audit trail for accounting purposes
 */
export class FinancialTransactionService {
  
  /**
   * Records a pharmacy prescription sale transaction
   * Creates both a pharmacy bill and financial transaction record
   */
  async recordPharmacySale({
    tenantId,
    patientId,
    prescriptionId,
    medicationName,
    quantity,
    unitPrice,
    insuranceProvider,
    insuranceAmount,
    patientCopay,
    paymentMethod,
    paymentReference,
    recordedBy
  }: {
    tenantId: string;
    patientId: string;
    prescriptionId: string;
    medicationName: string;
    quantity: number;
    unitPrice: number;
    insuranceProvider?: string;
    insuranceAmount?: number;
    patientCopay: number;
    paymentMethod: string;
    paymentReference?: string;
    recordedBy: string;
  }) {
    const totalAmount = quantity * unitPrice;
    const billNumber = `PH-${Date.now()}-${nanoid(6)}`;
    const transactionNumber = `TXN-PH-${Date.now()}-${nanoid(8)}`;

    // Create pharmacy bill
    const pharmacyBill: InsertPharmacyBill = {
      tenantId,
      patientId,
      prescriptionId,
      billNumber,
      amount: totalAmount.toString(),
      description: `Prescription for ${medicationName} - Qty: ${quantity}`,
      status: "paid",
      medicationName,
      quantity,
      unitPrice: unitPrice.toString(),
      insuranceProvider,
      insuranceAmount: (insuranceAmount || 0).toString(),
      patientCopay: patientCopay.toString(),
      generatedBy: recordedBy
    };

    const [createdBill] = await db.insert(pharmacyBills).values(pharmacyBill).returning();

    // Record financial transaction for insurance payment (if any)
    if (insuranceAmount && insuranceAmount > 0) {
      const insuranceTransaction: InsertFinancialTransaction = {
        tenantId,
        transactionNumber: `${transactionNumber}-INS`,
        transactionType: "insurance_payment",
        category: "pharmacy_sale",
        amount: insuranceAmount.toString(),
        description: `Insurance payment for ${medicationName} prescription`,
        patientId,
        billId: createdBill.id,
        paymentMethod: "insurance",
        paymentReference: `INS-${prescriptionId}`,
        accountCode: "4001", // Insurance Revenue
        debitAccount: "1200", // Accounts Receivable - Insurance
        creditAccount: "4001", // Insurance Revenue
        status: "completed",
        transactionDate: new Date(),
        postedDate: new Date(),
        recordedBy
      };

      await db.insert(financialTransactions).values(insuranceTransaction);
    }

    // Record financial transaction for patient copay
    const copayTransaction: InsertFinancialTransaction = {
      tenantId,
      transactionNumber: `${transactionNumber}-COPAY`,
      transactionType: "payment",
      category: "pharmacy_sale",
      amount: patientCopay.toString(),
      description: `Patient copay for ${medicationName} prescription`,
      patientId,
      billId: createdBill.id,
      paymentMethod,
      paymentReference,
      accountCode: "4000", // Patient Revenue
      debitAccount: paymentMethod === "cash" ? "1000" : "1100", // Cash or Bank
      creditAccount: "4000", // Patient Revenue
      status: "completed",
      transactionDate: new Date(),
      postedDate: new Date(),
      recordedBy
    };

    await db.insert(financialTransactions).values(copayTransaction);

    return {
      bill: createdBill,
      transactions: [
        ...(insuranceAmount && insuranceAmount > 0 ? [1] : []),
        1
      ]
    };
  }

  /**
   * Records a hospital service transaction
   * Creates both a hospital bill and financial transaction record
   */
  async recordHospitalService({
    tenantId,
    patientId,
    appointmentId,
    serviceType,
    amount,
    description,
    procedureCodes = [],
    diagnosisCodes = [],
    insuranceProvider,
    insuranceAmount,
    patientCopay,
    paymentMethod,
    paymentReference,
    recordedBy
  }: {
    tenantId: string;
    patientId: string;
    appointmentId?: string;
    serviceType: string;
    amount: number;
    description: string;
    procedureCodes?: string[];
    diagnosisCodes?: string[];
    insuranceProvider?: string;
    insuranceAmount?: number;
    patientCopay: number;
    paymentMethod: string;
    paymentReference?: string;
    recordedBy: string;
  }) {
    const billNumber = `HOS-${Date.now()}-${nanoid(6)}`;
    const transactionNumber = `TXN-HOS-${Date.now()}-${nanoid(8)}`;

    // Create hospital bill
    const hospitalBill: InsertHospitalBill = {
      tenantId,
      patientId,
      appointmentId,
      billNumber,
      amount: amount.toString(),
      description,
      status: "paid",
      serviceType: serviceType as any,
      procedureCodes,
      diagnosisCodes,
      insuranceProvider,
      insuranceAmount: (insuranceAmount || 0).toString(),
      patientCopay: patientCopay.toString(),
      generatedBy: recordedBy
    };

    const [createdBill] = await db.insert(hospitalBills).values(hospitalBill).returning();

    // Record financial transaction for insurance payment (if any)
    if (insuranceAmount && insuranceAmount > 0) {
      const insuranceTransaction: InsertFinancialTransaction = {
        tenantId,
        transactionNumber: `${transactionNumber}-INS`,
        transactionType: "insurance_payment",
        category: "hospital_service",
        amount: insuranceAmount.toString(),
        description: `Insurance payment for ${description}`,
        patientId,
        billId: createdBill.id,
        paymentMethod: "insurance",
        paymentReference: `INS-${appointmentId || createdBill.id}`,
        accountCode: "4001", // Insurance Revenue
        debitAccount: "1200", // Accounts Receivable - Insurance
        creditAccount: "4001", // Insurance Revenue
        status: "completed",
        transactionDate: new Date(),
        postedDate: new Date(),
        recordedBy
      };

      await db.insert(financialTransactions).values(insuranceTransaction);
    }

    // Record financial transaction for patient payment
    const patientTransaction: InsertFinancialTransaction = {
      tenantId,
      transactionNumber: `${transactionNumber}-PAT`,
      transactionType: "payment",
      category: "hospital_service",
      amount: patientCopay.toString(),
      description: `Patient payment for ${description}`,
      patientId,
      billId: createdBill.id,
      paymentMethod,
      paymentReference,
      accountCode: "4000", // Patient Revenue
      debitAccount: paymentMethod === "cash" ? "1000" : "1100", // Cash or Bank
      creditAccount: "4000", // Patient Revenue
      status: "completed",
      transactionDate: new Date(),
      postedDate: new Date(),
      recordedBy
    };

    await db.insert(financialTransactions).values(patientTransaction);

    return {
      bill: createdBill,
      transactions: [
        ...(insuranceAmount && insuranceAmount > 0 ? [1] : []),
        1
      ]
    };
  }

  /**
   * Records a laboratory test transaction
   * Updates existing lab bill and creates financial transaction record
   */
  async recordLabService({
    labBillId,
    tenantId,
    paymentMethod,
    paymentReference,
    recordedBy
  }: {
    labBillId: string;
    tenantId: string;
    paymentMethod: string;
    paymentReference?: string;
    recordedBy: string;
  }) {
    // Get the lab bill details
    const [labBill] = await db.select().from(labBills).where(eq(labBills.id, labBillId));
    if (!labBill) {
      throw new Error("Lab bill not found");
    }

    const transactionNumber = `TXN-LAB-${Date.now()}-${nanoid(8)}`;

    // Record financial transaction for lab payment
    const labTransaction: InsertFinancialTransaction = {
      tenantId,
      transactionNumber,
      transactionType: "payment",
      category: "lab_test",
      amount: labBill.amount,
      description: `Payment for ${labBill.description}`,
      patientId: labBill.patientId,
      billId: labBill.id,
      paymentMethod,
      paymentReference,
      accountCode: "4002", // Lab Revenue
      debitAccount: paymentMethod === "cash" ? "1000" : "1100", // Cash or Bank
      creditAccount: "4002", // Lab Revenue
      status: "completed",
      transactionDate: new Date(),
      postedDate: new Date(),
      recordedBy
    };

    await db.insert(financialTransactions).values(labTransaction);

    // Update lab bill status to paid
    await db.update(labBills)
      .set({ status: "paid" })
      .where(eq(labBills.id, labBillId));

    return {
      bill: labBill,
      transaction: labTransaction
    };
  }

  /**
   * Records a refund transaction
   */
  async recordRefund({
    tenantId,
    originalBillId,
    patientId,
    refundAmount,
    refundReason,
    paymentMethod,
    paymentReference,
    recordedBy
  }: {
    tenantId: string;
    originalBillId: string;
    patientId: string;
    refundAmount: number;
    refundReason: string;
    paymentMethod: string;
    paymentReference?: string;
    recordedBy: string;
  }) {
    const transactionNumber = `TXN-REF-${Date.now()}-${nanoid(8)}`;

    // Record refund transaction
    const refundTransaction: InsertFinancialTransaction = {
      tenantId,
      transactionNumber,
      transactionType: "refund",
      category: "refund",
      amount: refundAmount.toString(),
      description: `Refund: ${refundReason}`,
      patientId,
      billId: originalBillId,
      paymentMethod,
      paymentReference,
      accountCode: "5000", // Refunds Expense
      debitAccount: "5000", // Refunds Expense
      creditAccount: paymentMethod === "cash" ? "1000" : "1100", // Cash or Bank
      status: "completed",
      transactionDate: new Date(),
      postedDate: new Date(),
      recordedBy,
      notes: refundReason
    };

    await db.insert(financialTransactions).values(refundTransaction);

    return refundTransaction;
  }

  /**
   * Gets financial summary for a tenant (for bookkeeping reports)
   */
  async getFinancialSummary(tenantId: string, startDate?: Date, endDate?: Date) {
    const conditions = [eq(financialTransactions.tenantId, tenantId)];
    
    if (startDate) {
      conditions.push(gte(financialTransactions.transactionDate, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(financialTransactions.transactionDate, endDate));
    }

    const transactions = await db.select()
      .from(financialTransactions)
      .where(and(...conditions))
      .orderBy(desc(financialTransactions.transactionDate));

    // Calculate summary metrics
    const summary = {
      totalRevenue: 0,
      totalRefunds: 0,
      pharmacySales: 0,
      hospitalServices: 0,
      labServices: 0,
      insurancePayments: 0,
      patientPayments: 0,
      transactionCount: transactions.length
    };

    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      
      if (transaction.transactionType === "refund") {
        summary.totalRefunds += amount;
      } else {
        summary.totalRevenue += amount;
        
        if (transaction.category === "pharmacy_sale") {
          summary.pharmacySales += amount;
        } else if (transaction.category === "hospital_service") {
          summary.hospitalServices += amount;
        } else if (transaction.category === "lab_test") {
          summary.labServices += amount;
        }
        
        if (transaction.transactionType === "insurance_payment") {
          summary.insurancePayments += amount;
        } else if (transaction.transactionType === "payment") {
          summary.patientPayments += amount;
        }
      }
    });

    return {
      summary,
      transactions
    };
  }
}

// Import the eq, and, gte, lte, desc functions from drizzle-orm
import { eq, and, gte, lte, desc } from "drizzle-orm";

export const financialTransactionService = new FinancialTransactionService();