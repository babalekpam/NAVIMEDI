import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface SimpleRoleChangerProps {
  userId: string;
  currentRole: string;
  userName: string;
  onSuccess: () => void;
}

const availableRoles = [
  "tenant_admin",
  "director", 
  "physician",
  "nurse",
  "pharmacist",
  "lab_technician",
  "receptionist",
  "billing_staff"
];

export function SimpleRoleChanger({ userId, currentRole, userName, onSuccess }: SimpleRoleChangerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateRole = async (newRole: string) => {
    if (newRole === currentRole) return;
    
    setIsUpdating(true);
    console.log("🚀 Starting role update:", { userId, currentRole, newRole, userName });
    
    try {
      const token = localStorage.getItem("auth_token");
      console.log("🔑 Token check:", !!token, token?.substring(0, 20));
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("📡 Making API request to:", `/api/users/${userId}`);
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      console.log("📡 Response received:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Role update failed:", {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 200)
        });
        
        if (errorText.includes("<!DOCTYPE") || errorText.includes("<html")) {
          console.error("❌ HTML error page detected - authentication issue");
          throw new Error("Session expired - please refresh and login again");
        }
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `Update failed: ${response.status}`);
        } catch (parseError) {
          throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 100)}`);
        }
      }

      const responseText = await response.text();
      console.log("📄 Raw response text:", responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log("✅ Role update successful:", result);
      } catch (parseError) {
        console.error("❌ Failed to parse success response:", parseError);
        console.log("Raw response was:", responseText);
        throw new Error("Server returned invalid response format");
      }
      
      toast({
        title: "Role Updated",
        description: `${userName} is now ${newRole.replace('_', ' ')}`,
      });
      
      onSuccess();
      
    } catch (error) {
      console.error("❌ Complete error details:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select 
      value={currentRole} 
      onValueChange={updateRole}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-32 h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {availableRoles.map((role) => (
          <SelectItem key={role} value={role}>
            {role.replace('_', ' ').split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}