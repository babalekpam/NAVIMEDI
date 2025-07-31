import { useEffect } from "react";
import { useLocation } from "wouter";
import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { useAuth } from "@/hooks/use-auth";

export default function ChangePasswordPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      setLocation("/login");
      return;
    }

    // If user doesn't need to change password, redirect to dashboard
    if (!user.mustChangePassword && !user.isTemporaryPassword) {
      setLocation("/dashboard");
      return;
    }
  }, [user, setLocation]);

  const handleSuccess = () => {
    // After successful password change, redirect to dashboard
    setLocation("/dashboard");
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <ChangePasswordForm 
          onSuccess={handleSuccess}
          isTemporary={user.isTemporaryPassword}
        />
      </div>
    </div>
  );
}