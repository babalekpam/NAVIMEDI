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
    
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Role update failed:", response.status, errorText);
        
        if (errorText.includes("<!DOCTYPE") || errorText.includes("<html")) {
          throw new Error("Session expired - please refresh and login again");
        }
        
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Update failed: ${response.status}`);
      }

      const result = await response.json();
      console.log("Role update successful:", result);
      
      toast({
        title: "Role Updated",
        description: `${userName} is now ${newRole.replace('_', ' ')}`,
      });
      
      onSuccess();
      
    } catch (error) {
      console.error("Role update error:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Unknown error",
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