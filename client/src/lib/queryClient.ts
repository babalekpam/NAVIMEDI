import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { offlineStorage } from "./offline-storage";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
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
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
