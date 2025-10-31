type OfflineCallback = (isOnline: boolean) => void;
type QueuedRequest = {
  id: string;
  url: string;
  method: string;
  body?: any;
  timestamp: number;
};

class OfflineHandler {
  private isOnline: boolean = navigator.onLine;
  private callbacks: Set<OfflineCallback> = new Set();
  private requestQueue: QueuedRequest[] = [];
  private readonly STORAGE_KEY = 'navimed-offline-queue';

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Load queued requests from localStorage
    this.loadQueue();

    // If online, process any queued requests
    if (this.isOnline) {
      this.processQueue();
    }
  }

  private handleOnline = () => {
    console.log('[Offline Handler] Connection restored');
    this.isOnline = true;
    this.notifyCallbacks(true);
    this.processQueue();
  };

  private handleOffline = () => {
    console.log('[Offline Handler] Connection lost');
    this.isOnline = false;
    this.notifyCallbacks(false);
  };

  private notifyCallbacks(isOnline: boolean) {
    this.callbacks.forEach(callback => {
      try {
        callback(isOnline);
      } catch (error) {
        console.error('[Offline Handler] Callback error:', error);
      }
    });
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.requestQueue = JSON.parse(stored);
        console.log(`[Offline Handler] Loaded ${this.requestQueue.length} queued requests`);
      }
    } catch (error) {
      console.error('[Offline Handler] Failed to load queue:', error);
      this.requestQueue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.requestQueue));
    } catch (error) {
      console.error('[Offline Handler] Failed to save queue:', error);
    }
  }

  private async processQueue() {
    if (this.requestQueue.length === 0) {
      return;
    }

    console.log(`[Offline Handler] Processing ${this.requestQueue.length} queued requests`);

    const queue = [...this.requestQueue];
    this.requestQueue = [];
    this.saveQueue();

    for (const request of queue) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: request.body ? JSON.stringify(request.body) : undefined,
        });

        if (response.ok) {
          console.log(`[Offline Handler] Successfully synced request: ${request.id}`);
        } else {
          console.error(`[Offline Handler] Failed to sync request ${request.id}:`, response.status);
          // Re-queue failed requests
          this.requestQueue.push(request);
        }
      } catch (error) {
        console.error(`[Offline Handler] Error syncing request ${request.id}:`, error);
        // Re-queue failed requests
        this.requestQueue.push(request);
      }
    }

    this.saveQueue();
  }

  /**
   * Subscribe to online/offline status changes
   */
  subscribe(callback: OfflineCallback): () => void {
    this.callbacks.add(callback);
    // Immediately call with current status
    callback(this.isOnline);

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Get current online status
   */
  getStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Queue a request to be sent when connection is restored
   */
  queueRequest(url: string, method: string = 'POST', body?: any): string {
    const request: QueuedRequest = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      method,
      body,
      timestamp: Date.now(),
    };

    this.requestQueue.push(request);
    this.saveQueue();

    console.log(`[Offline Handler] Queued request: ${request.id}`);

    return request.id;
  }

  /**
   * Get the number of queued requests
   */
  getQueueLength(): number {
    return this.requestQueue.length;
  }

  /**
   * Clear all queued requests
   */
  clearQueue() {
    this.requestQueue = [];
    this.saveQueue();
    console.log('[Offline Handler] Queue cleared');
  }

  /**
   * Manually trigger queue processing
   */
  async syncNow() {
    if (!this.isOnline) {
      console.warn('[Offline Handler] Cannot sync while offline');
      return;
    }

    await this.processQueue();
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.callbacks.clear();
  }
}

// Create singleton instance
const offlineHandler = new OfflineHandler();

export default offlineHandler;

// Export utility functions
export const isOnline = () => offlineHandler.getStatus();
export const subscribeToNetworkStatus = (callback: OfflineCallback) => offlineHandler.subscribe(callback);
export const queueOfflineRequest = (url: string, method: string = 'POST', body?: any) => 
  offlineHandler.queueRequest(url, method, body);
export const getOfflineQueueLength = () => offlineHandler.getQueueLength();
export const syncOfflineData = () => offlineHandler.syncNow();
