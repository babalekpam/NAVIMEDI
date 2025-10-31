import { storage } from "./storage";
import type { InsertInventoryAlert, InventoryItem, InventoryBatch } from "@shared/schema";

export class InventoryService {
  /**
   * Look up item by barcode
   */
  async scanBarcode(barcode: string, tenantId: string): Promise<InventoryItem | undefined> {
    return await storage.findInventoryByBarcode(barcode, tenantId);
  }

  /**
   * Find items expiring within the specified number of days
   */
  async checkExpiringItems(tenantId: string, daysThreshold: number = 30): Promise<InventoryItem[]> {
    const allItems = await storage.getInventoryItems(tenantId);
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return allItems.filter(item => {
      if (!item.expirationDate) return false;
      const expiryDate = new Date(item.expirationDate);
      const today = new Date();
      return expiryDate > today && expiryDate <= thresholdDate;
    });
  }

  /**
   * Find expired items
   */
  async checkExpiredItems(tenantId: string): Promise<InventoryItem[]> {
    const allItems = await storage.getInventoryItems(tenantId);
    const today = new Date();

    return allItems.filter(item => {
      if (!item.expirationDate) return false;
      const expiryDate = new Date(item.expirationDate);
      return expiryDate < today;
    });
  }

  /**
   * Find items below minimum stock level
   */
  async checkLowStock(tenantId: string): Promise<InventoryItem[]> {
    const allItems = await storage.getInventoryItems(tenantId);

    return allItems.filter(item => {
      if (!item.minStockLevel) return false;
      return item.currentStock < item.minStockLevel;
    });
  }

  /**
   * Check if items need reordering based on reorder point
   */
  async checkReorderPoints(tenantId: string): Promise<InventoryItem[]> {
    const allItems = await storage.getInventoryItems(tenantId);

    return allItems.filter(item => {
      if (!item.reorderPoint) return false;
      return item.currentStock <= item.reorderPoint;
    });
  }

  /**
   * Generate automated reorder suggestions
   */
  async generateReorderSuggestions(tenantId: string): Promise<Array<{
    item: InventoryItem;
    suggestedQuantity: number;
    reason: string;
  }>> {
    const itemsNeedingReorder = await this.checkReorderPoints(tenantId);
    const autoReorderRules = await storage.getAutoReorderRules(tenantId);

    return itemsNeedingReorder.map(item => {
      const rule = autoReorderRules.find(r => r.inventoryItemId === item.id && r.enabled);
      const suggestedQuantity = rule?.reorderQuantity || item.reorderQuantity || 100;

      return {
        item,
        suggestedQuantity,
        reason: `Stock level (${item.currentStock}) below reorder point (${item.reorderPoint})`
      };
    });
  }

  /**
   * Create an inventory alert
   */
  async createAlert(
    tenantId: string,
    inventoryItemId: number | null,
    alertType: "low_stock" | "expiring_soon" | "expired" | "recall",
    severity: "low" | "normal" | "high" | "urgent" | "emergency",
    message: string
  ): Promise<void> {
    const alert: InsertInventoryAlert = {
      tenantId,
      inventoryItemId,
      alertType,
      severity,
      message,
      triggeredAt: new Date()
    };

    await storage.createInventoryAlert(alert);
  }

  /**
   * Calculate variance for inventory audit
   */
  calculateVariance(expected: number, actual: number): {
    variance: number;
    percentageVariance: number;
    status: 'match' | 'overage' | 'shortage';
  } {
    const variance = actual - expected;
    const percentageVariance = expected > 0 ? (variance / expected) * 100 : 0;
    
    let status: 'match' | 'overage' | 'shortage';
    if (variance === 0) {
      status = 'match';
    } else if (variance > 0) {
      status = 'overage';
    } else {
      status = 'shortage';
    }

    return {
      variance,
      percentageVariance,
      status
    };
  }

  /**
   * Process expired batches and update their status
   */
  async processBatchExpiry(tenantId: string): Promise<number> {
    const allItems = await storage.getInventoryItems(tenantId);
    const today = new Date();
    let processedCount = 0;

    for (const item of allItems) {
      const batches = await storage.getInventoryBatches(item.id, tenantId);
      
      for (const batch of batches) {
        if (batch.expirationDate && new Date(batch.expirationDate) < today && batch.status === 'active') {
          await storage.updateInventoryBatch(batch.id, { status: 'expired' }, tenantId);
          
          // Create alert for expired batch
          await this.createAlert(
            tenantId,
            item.id,
            'expired',
            'high',
            `Batch ${batch.batchNumber} of ${item.medicationName} has expired`
          );
          
          processedCount++;
        }
      }
    }

    return processedCount;
  }

  /**
   * Generate barcode data for printing (placeholder for future implementation)
   */
  async generateBarcodeData(itemId: number, tenantId: string): Promise<string> {
    const item = await storage.getInventoryItem(itemId, tenantId);
    
    if (!item) {
      throw new Error('Item not found');
    }

    // Placeholder: Return data URI for barcode
    // In production, you would use a library like 'bwip-js' to generate actual barcode images
    const barcode = item.barcodeNumber || `ITEM-${itemId}`;
    
    return `data:image/svg+xml;base64,${Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="80">
        <rect width="200" height="80" fill="white"/>
        <text x="100" y="40" text-anchor="middle" font-family="monospace" font-size="14">${barcode}</text>
        <text x="100" y="60" text-anchor="middle" font-family="Arial" font-size="10">${item.medicationName}</text>
      </svg>
    `).toString('base64')}`;
  }

  /**
   * Automated task: Daily expiration check
   */
  async dailyExpirationCheck(tenantId: string): Promise<void> {
    // Check items expiring in 30 days
    const expiring30 = await this.checkExpiringItems(tenantId, 30);
    for (const item of expiring30) {
      await this.createAlert(
        tenantId,
        item.id,
        'expiring_soon',
        'normal',
        `${item.medicationName} expires in 30 days (${item.expirationDate})`
      );
    }

    // Check items expiring in 14 days
    const expiring14 = await this.checkExpiringItems(tenantId, 14);
    for (const item of expiring14) {
      await this.createAlert(
        tenantId,
        item.id,
        'expiring_soon',
        'high',
        `${item.medicationName} expires in 14 days (${item.expirationDate})`
      );
    }

    // Check items expiring in 7 days
    const expiring7 = await this.checkExpiringItems(tenantId, 7);
    for (const item of expiring7) {
      await this.createAlert(
        tenantId,
        item.id,
        'expiring_soon',
        'urgent',
        `${item.medicationName} expires in 7 days (${item.expirationDate})`
      );
    }

    // Check expired items
    const expired = await this.checkExpiredItems(tenantId);
    for (const item of expired) {
      await this.createAlert(
        tenantId,
        item.id,
        'expired',
        'emergency',
        `${item.medicationName} has expired (${item.expirationDate})`
      );
    }
  }

  /**
   * Automated task: Weekly low stock alerts
   */
  async weeklyLowStockAlert(tenantId: string): Promise<void> {
    const lowStockItems = await this.checkLowStock(tenantId);
    
    for (const item of lowStockItems) {
      await this.createAlert(
        tenantId,
        item.id,
        'low_stock',
        'high',
        `${item.medicationName} stock is low: ${item.currentStock} units (minimum: ${item.minStockLevel})`
      );
    }
  }

  /**
   * Automated task: Monthly audit reminders
   */
  async monthlyAuditReminder(tenantId: string): Promise<void> {
    // Placeholder for future implementation
    // This would check when last audit was performed and create reminders
    console.log(`Monthly audit reminder for tenant ${tenantId}`);
  }

  /**
   * Automated task: Auto-reorder processing
   */
  async processAutoReorder(tenantId: string): Promise<void> {
    const suggestions = await this.generateReorderSuggestions(tenantId);
    
    // Placeholder for future implementation
    // This would automatically create purchase orders or notifications
    console.log(`Auto-reorder processing for tenant ${tenantId}: ${suggestions.length} items need reordering`);
  }
}

export const inventoryService = new InventoryService();
