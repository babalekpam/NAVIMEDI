import { apiRequest } from "./queryClient";

export interface LoginCredentials {
  username: string;
  password: string;
  tenantId: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return response.json();
  },

  register: async (userData: any): Promise<{ message: string; user: AuthUser }> => {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    return response.json();
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  },

  getStoredToken: (): string | null => {
    return localStorage.getItem("auth_token");
  },

  getStoredUser: (): AuthUser | null => {
    const storedUser = localStorage.getItem("auth_user");
    return storedUser ? JSON.parse(storedUser) : null;
  },

  setStoredAuth: (token: string, user: AuthUser) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  },

  hasRole: (user: AuthUser | null, allowedRoles: string[]): boolean => {
    return user ? allowedRoles.includes(user.role) : false;
  },

  canAccessTenantManagement: (user: AuthUser | null): boolean => {
    return authApi.hasRole(user, ["super_admin", "tenant_admin"]);
  },

  canPrescribe: (user: AuthUser | null): boolean => {
    return authApi.hasRole(user, ["physician", "nurse"]);
  },

  canOrderLabs: (user: AuthUser | null): boolean => {
    return authApi.hasRole(user, ["physician", "nurse"]);
  },

  canManageBilling: (user: AuthUser | null): boolean => {
    return authApi.hasRole(user, ["billing_staff", "physician", "tenant_admin"]);
  },

  canViewAuditLogs: (user: AuthUser | null): boolean => {
    return authApi.hasRole(user, ["tenant_admin", "super_admin"]);
  }
};
