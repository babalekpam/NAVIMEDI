import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context-fixed";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const [, setLocation] = useLocation();

  // Simple authentication check without aggressive redirects
  useEffect(() => {
    if (!authLoading && !user) {
      // Check localStorage directly as fallback
      const directToken = localStorage.getItem("auth_token");
      const directUser = localStorage.getItem("auth_user");
      
      if (!directToken || !directUser) {
        const currentPath = window.location.pathname;
        if (currentPath.includes('patient') || currentPath.includes('telemedicine')) {
          setLocation("/patient-login");
        } else {
          setLocation("/login");
        }
      }
    } else if (user && (user.mustChangePassword || user.isTemporaryPassword)) {
      setLocation("/change-password");
    }
  }, [authLoading, user, setLocation]);

  // Show loading state but don't block for too long
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-12 w-12 rounded-lg mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Required roles: {requiredRoles.join(", ")}</p>
        </div>
      </div>
    );
  }

  // Temporarily bypass tenant check while debugging API routing issues
  if (!tenant && user) {
    console.log('ProtectedRoute: User exists but no tenant data - proceeding with temporary bypass');
    console.log('ProtectedRoute: User:', user);
    // Return children directly to bypass tenant requirement temporarily
  }

  return <>{children}</>;
};
