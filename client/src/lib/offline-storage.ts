// Offline storage utility for seamless offline operation
export class OfflineStorage {
  private static instance: OfflineStorage;
  
  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  // Check if offline mode is enabled
  isOfflineEnabled(): boolean {
    return localStorage.getItem('offlineEnabled') === 'true';
  }

  // Check if we're currently online
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Get data from offline storage or fetch from server
  async getData(endpoint: string, fallbackToServer = true): Promise<any> {
    const offlineKey = `offline_${endpoint.replace('/api/', '').replace('/', '_')}`;
    
    // If offline mode is enabled and we have offline data, use it
    if (this.isOfflineEnabled()) {
      const offlineData = localStorage.getItem(offlineKey);
      if (offlineData) {
        try {
          return JSON.parse(offlineData);
        } catch (error) {
          console.error('Error parsing offline data:', error);
        }
      }
    }

    // If online and fallback is allowed, fetch from server
    if (this.isOnline() && fallbackToServer) {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Cache the data for offline use if offline mode is enabled
          if (this.isOfflineEnabled()) {
            localStorage.setItem(offlineKey, JSON.stringify(data));
          }
          
          return data;
        }
      } catch (error) {
        console.error('Error fetching from server:', error);
      }
    }

    // Return empty array if no data available
    return [];
  }

  // Store data for offline use
  storeOfflineData(endpoint: string, data: any): void {
    const offlineKey = `offline_${endpoint.replace('/api/', '').replace('/', '_')}`;
    localStorage.setItem(offlineKey, JSON.stringify(data));
  }

  // Add pending change for sync
  addPendingChange(type: string, data: any): void {
    try {
      const pending = localStorage.getItem('pendingSync');
      const changes = pending ? JSON.parse(pending) : [];
      
      changes.push({
        id: Date.now().toString(),
        type,
        data,
        timestamp: new Date().toISOString()
      });
      
      localStorage.setItem('pendingSync', JSON.stringify(changes));
      localStorage.setItem('pendingChanges', changes.length.toString());
    } catch (error) {
      console.error('Error adding pending change:', error);
    }
  }

  // Get all offline data keys
  getOfflineDataKeys(): string[] {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('offline_')) {
        keys.push(key);
      }
    }
    return keys;
  }

  // Calculate storage usage in MB
  getStorageUsage(): number {
    let totalSize = 0;
    this.getOfflineDataKeys().forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        totalSize += data.length;
      }
    });
    return Math.round(totalSize / (1024 * 1024) * 100) / 100; // MB with 2 decimal places
  }

  // Clear all offline data
  clearOfflineData(): void {
    this.getOfflineDataKeys().forEach(key => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('offlineEnabled');
    localStorage.removeItem('lastSyncTime');
    localStorage.removeItem('pendingSync');
    localStorage.removeItem('pendingChanges');
  }
}

export const offlineStorage = OfflineStorage.getInstance();