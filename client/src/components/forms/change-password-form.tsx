import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Lock, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters long"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordFormProps {
  onSuccess?: () => void;
  isTemporary?: boolean;
}

export function ChangePasswordForm({ onSuccess, isTemporary = false }: ChangePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsLoading(true);

      await apiRequest("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });

      reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900 w-fit">
          {isTemporary ? (
            <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          ) : (
            <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          )}
        </div>
        <CardTitle className="text-2xl">
          {isTemporary ? "Change Temporary Password" : "Change Password"}
        </CardTitle>
        <CardDescription>
          {isTemporary 
            ? "For security reasons, you must create a new password before continuing."
            : "Update your password to keep your account secure."
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isTemporary && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You are currently using a temporary password. Please create a new secure password to continue using the system.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              {...register("currentPassword")}
              error={errors.currentPassword?.message}
              placeholder="Enter your current password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              {...register("newPassword")}
              error={errors.newPassword?.message}
              placeholder="Enter your new password"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Password must be at least 8 characters long
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
              placeholder="Confirm your new password"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              "Changing Password..."
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Change Password
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}