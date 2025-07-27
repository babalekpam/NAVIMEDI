import { db } from "./db";
import { tenants, users } from "../shared/schema";
import { sql, lt, and, eq, isNull } from "drizzle-orm";

export class TrialSuspensionService {
  private interval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.startService();
  }

  startService() {
    // Check every hour for expired trials
    this.interval = setInterval(async () => {
      await this.checkAndSuspendExpiredTrials();
    }, 60 * 60 * 1000); // 1 hour

    // Also run once on startup
    this.checkAndSuspendExpiredTrials();
    
    console.log('[TRIAL SERVICE] ✓ Trial suspension service started - checking every hour');
  }

  stopService() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('[TRIAL SERVICE] ✓ Trial suspension service stopped');
    }
  }

  async checkAndSuspendExpiredTrials() {
    try {
      const now = new Date();
      console.log(`[TRIAL SERVICE] Checking for expired trials at ${now.toISOString()}`);

      // Find tenants with expired trials that haven't been suspended yet
      const expiredTrials = await db
        .select({
          id: tenants.id,
          name: tenants.name,
          subdomain: tenants.subdomain,
          trialEndDate: tenants.trialEndDate,
          subscriptionStatus: tenants.subscriptionStatus
        })
        .from(tenants)
        .where(
          and(
            eq(tenants.subscriptionStatus, 'trial'),
            lt(tenants.trialEndDate, sql`NOW()`),
            eq(tenants.isActive, true),
            // Only check tenants that haven't been checked in the last hour
            sql`(${tenants.lastSuspensionCheck} IS NULL OR ${tenants.lastSuspensionCheck} < NOW() - INTERVAL '1 hour')`
          )
        );

      console.log(`[TRIAL SERVICE] Found ${expiredTrials.length} expired trial accounts`);

      for (const tenant of expiredTrials) {
        await this.suspendTenant(tenant.id, tenant.name, tenant.subdomain);
      }

      // Update suspension check timestamp for all tenants we examined
      if (expiredTrials.length > 0) {
        await db
          .update(tenants)
          .set({ 
            lastSuspensionCheck: sql`NOW()` 
          })
          .where(
            sql`${tenants.id} IN (${sql.join(expiredTrials.map(t => sql`${t.id}`), sql`, `)})`
          );
      }

    } catch (error) {
      console.error('[TRIAL SERVICE] Error checking expired trials:', error);
    }
  }

  async suspendTenant(tenantId: string, tenantName: string, subdomain: string) {
    try {
      console.log(`[TRIAL SERVICE] Suspending tenant: ${tenantName} (${subdomain})`);

      // Update tenant status to suspended
      await db
        .update(tenants)
        .set({
          subscriptionStatus: 'suspended',
          isActive: false,
          suspendedAt: sql`NOW()`,
          suspensionReason: 'Trial period expired - please upgrade to continue using the service'
        })
        .where(eq(tenants.id, tenantId));

      // Deactivate all users in the tenant (except super_admin)
      await db
        .update(users)
        .set({ isActive: false })
        .where(
          and(
            eq(users.tenantId, tenantId),
            sql`${users.role} != 'super_admin'`
          )
        );

      console.log(`[TRIAL SERVICE] ✓ Successfully suspended tenant: ${tenantName}`);
      
      // In a real application, you would send an email notification here
      console.log(`[TRIAL SERVICE] 📧 Would send suspension notification email to tenant: ${tenantName}`);

    } catch (error) {
      console.error(`[TRIAL SERVICE] Error suspending tenant ${tenantName}:`, error);
    }
  }

  async reactivateTenant(tenantId: string, subscriptionPlan: string = 'professional') {
    try {
      console.log(`[TRIAL SERVICE] Reactivating tenant with plan: ${subscriptionPlan}`);

      // Reactivate tenant
      await db
        .update(tenants)
        .set({
          subscriptionStatus: 'active',
          isActive: true,
          suspendedAt: null,
          suspensionReason: null
        })
        .where(eq(tenants.id, tenantId));

      // Reactivate all users in the tenant
      await db
        .update(users)
        .set({ isActive: true })
        .where(eq(users.tenantId, tenantId));

      console.log(`[TRIAL SERVICE] ✓ Successfully reactivated tenant`);

    } catch (error) {
      console.error(`[TRIAL SERVICE] Error reactivating tenant:`, error);
      throw error;
    }
  }

  async extendTrial(tenantId: string, daysToExtend: number = 14) {
    try {
      console.log(`[TRIAL SERVICE] Extending trial by ${daysToExtend} days for tenant`);

      await db
        .update(tenants)
        .set({
          trialEndDate: sql`${tenants.trialEndDate} + INTERVAL '${sql.raw(daysToExtend.toString())} days'`
        })
        .where(eq(tenants.id, tenantId));

      console.log(`[TRIAL SERVICE] ✓ Successfully extended trial`);

    } catch (error) {
      console.error(`[TRIAL SERVICE] Error extending trial:`, error);
      throw error;
    }
  }

  async getTrialStatus(tenantId: string) {
    try {
      const tenant = await db
        .select({
          id: tenants.id,
          name: tenants.name,
          trialStartDate: tenants.trialStartDate,
          trialEndDate: tenants.trialEndDate,
          subscriptionStatus: tenants.subscriptionStatus,
          suspendedAt: tenants.suspendedAt,
          suspensionReason: tenants.suspensionReason,
          isActive: tenants.isActive
        })
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      if (tenant.length === 0) {
        return null;
      }

      const tenantData = tenant[0];
      const now = new Date();
      const trialEndDate = tenantData.trialEndDate ? new Date(tenantData.trialEndDate) : new Date();
      const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        ...tenantData,
        daysRemaining,
        isTrialExpired: now > trialEndDate,
        isTrialActive: tenantData.subscriptionStatus === 'trial' && now <= trialEndDate
      };

    } catch (error) {
      console.error(`[TRIAL SERVICE] Error getting trial status:`, error);
      throw error;
    }
  }
}

// Singleton instance
export const trialSuspensionService = new TrialSuspensionService();