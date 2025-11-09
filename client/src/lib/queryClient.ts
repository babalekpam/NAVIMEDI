import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { offlineStorage } from "./offline-storage";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const contentType = res.headers.get('content-type');
    let errorMessage = res.statusText;
    
    try {
      if (contentType?.includes('application/json')) {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || res.statusText;
      } else {
        const text = await res.text();
        // If it's HTML (like an error page), extract a meaningful message
        if (text.includes('<!DOCTYPE') || text.includes('<html>')) {
          errorMessage = 'Server returned an error page. Please check your connection and try again.';
        } else {
          errorMessage = text || res.statusText;
        }
      }
    } catch (parseError) {
      console.warn('Failed to parse error response:', parseError);
      errorMessage = res.statusText;
    }
    
    // Handle authentication errors specifically
    if (res.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      errorMessage = 'Authentication failed. Please log in again.';
      // Don't redirect immediately, let the component handle it
    }
    
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    auth?: boolean; // Whether to send auth token (default: true)
  }
): Promise<any> {
  const shouldAuth = options?.auth !== false; // Default to true if not specified
  const token = shouldAuth ? localStorage.getItem("auth_token") : null;
  
  // Clear corrupted tokens (only if we're checking auth)
  if (shouldAuth && token && (token === 'undefined' || token === 'null' || token.length < 10)) {
    console.warn('Clearing corrupted token:', token?.substring(0, 20));
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.location.href = '/login';
    throw new Error('Invalid token - redirecting to login');
  }
  
  const method = options?.method || 'GET';
  const data = options?.body;
  
  // Log when skipping auth for debugging
  if (!shouldAuth) {
    console.log(`🔓 Public endpoint request (no auth): ${method} ${url}`);
  }
  
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

  const responseText = await res.text();
  
  if (!res.ok) {
    const contentType = res.headers.get('content-type');
    let errorMessage = res.statusText;
    
    try {
      if (contentType?.includes('application/json')) {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || res.statusText;
      } else {
        // If it's HTML (like an error page), extract a meaningful message
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<html>')) {
          errorMessage = 'Server returned an error page. Please check your connection and try again.';
        } else {
          errorMessage = responseText || res.statusText;
        }
      }
    } catch (parseError) {
      console.warn('Failed to parse error response:', parseError);
      errorMessage = res.statusText;
    }
    
    // Handle authentication errors specifically
    if (res.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      errorMessage = 'Authentication failed. Please log in again.';
    }
    
    throw new Error(`${res.status}: ${errorMessage}`);
  }
  
  // Try to parse as JSON
  try {
    return JSON.parse(responseText);
  } catch (parseError: unknown) {
    const err = parseError as Error;
    throw new Error(`Failed to parse JSON response: ${err.message}`);
  }
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
      refetchOnWindowFocus: true,
      staleTime: 0, // Always fetch fresh data on every request
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
