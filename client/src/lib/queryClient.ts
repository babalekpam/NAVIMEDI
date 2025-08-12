import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { offlineStorage } from "./offline-storage";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Helper function to check if token is expired (with 30 second buffer)
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    // Add small buffer to account for network delays
    const bufferTime = 30; // 30 seconds buffer
    return payload.exp < (currentTime - bufferTime);
  } catch (error) {
    console.warn('Failed to parse token:', error);
    return true;
  }
}

export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  }
): Promise<any> {
  const token = localStorage.getItem("auth_token");
  
  // Clear corrupted tokens
  if (token && (token === 'undefined' || token === 'null' || token.length < 10)) {
    console.warn('Clearing corrupted token:', token?.substring(0, 20));
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.location.href = '/login';
    throw new Error('Invalid token - redirecting to login');
  }
  
  // Note: Removed proactive token expiration checking to prevent premature logouts
  // Let the server handle token validation with 401 responses instead
  
  const method = options?.method || 'GET';
  const data = options?.body;
  
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options?.headers || {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Handle expired tokens (401 responses)
  if (res.status === 401) {
    console.warn('Token expired or invalid, redirecting to login');
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.location.href = '/login';
    throw new Error('Token expired - redirecting to login');
  }

  // Handle non-JSON responses (likely HTML error pages)
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    if (text.includes('<!DOCTYPE')) {
      // If we get HTML response and have a token, it's likely expired
      if (token) {
        console.warn('Received HTML response with token present - token likely expired');
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        
        // For patient portal users, try to redirect to patient login
        const currentPath = window.location.pathname;
        if (currentPath.includes('patient') || currentPath.includes('telemedicine')) {
          window.location.href = '/patient-login';
        } else {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Redirecting to login...');
      }
      throw new Error('Unexpected HTML response - possible routing issue. Please refresh and try again.');
    }
    throw new Error(`Unexpected response type: ${contentType}`);
  }

  await throwIfResNotOk(res);
  return res.json();
}

// Legacy function for backward compatibility
export async function legacyApiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = localStorage.getItem("auth_token");
  
  // Clear corrupted tokens
  if (token && (token === 'undefined' || token === 'null' || token.length < 10)) {
    console.warn('Clearing corrupted token:', token?.substring(0, 20));
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.location.href = '/login';
    throw new Error('Invalid token - redirecting to login');
  }
  
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const endpoint = queryKey.join("/") as string;
    
    // Try to get data from offline storage first if offline mode is enabled
    if (offlineStorage.isOfflineEnabled() && !offlineStorage.isOnline()) {
      const offlineData = await offlineStorage.getData(endpoint, false);
      if (offlineData && offlineData.length > 0) {
        return offlineData;
      }
    }

    const token = localStorage.getItem("auth_token");
    
    // Clear corrupted tokens
    if (token && (token === 'undefined' || token === 'null' || token.length < 10)) {
      console.warn('Clearing corrupted token in query:', token?.substring(0, 20));
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      throw new Error('Invalid token format');
    }
    
    const headers: Record<string, string> = {
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };

    try {
      const res = await fetch(endpoint, {
        headers,
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      
      // Cache data for offline use if offline mode is enabled
      if (offlineStorage.isOfflineEnabled()) {
        offlineStorage.storeOfflineData(endpoint, data);
      }
      
      return data;
    } catch (error) {
      // If fetch fails and we have offline data, return it
      if (offlineStorage.isOfflineEnabled()) {
        const offlineData = await offlineStorage.getData(endpoint, false);
        if (offlineData && offlineData.length > 0) {
          console.log('Using offline data due to fetch error:', endpoint);
          return offlineData;
        }
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes - much better than Infinity
      gcTime: 10 * 60 * 1000, // 10 minutes cache time
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (error?.message?.includes('401') || error?.message?.includes('403')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: false,
    },
  },
});
