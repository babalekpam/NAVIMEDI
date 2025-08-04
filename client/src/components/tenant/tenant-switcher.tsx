import { Building2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTenant } from "@/contexts/tenant-context-fixed";
import { useAuth } from "@/hooks/useAuth";

export const TenantSwitcher = () => {
  const { tenant, availableTenants, switchTenant } = useTenant();
  const { user } = useAuth();

  if (!tenant || !user) return null;

  // Super admins can switch between any tenant
  // Other users are locked to their tenant
  const canSwitchTenants = user.role === "super_admin" && availableTenants.length > 1;

  if (!canSwitchTenants) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
        <Building2 className="h-4 w-4 text-gray-600" />
        <div className="text-sm">
          <p className="font-medium text-gray-900 truncate max-w-32">
            {tenant.name}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {tenant.type?.replace('_', ' ') || 'Organization'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-50">
          <Building2 className="h-4 w-4 text-gray-600" />
          <div className="text-sm text-left">
            <p className="font-medium text-gray-900 truncate max-w-32">
              {tenant.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {tenant.type?.replace('_', ' ') || 'Organization'}
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableTenants.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => switchTenant(t.id)}
            className="flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{t.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {t.type.replace('_', ' ')}
              </p>
            </div>
            {t.id === tenant.id && (
              <Badge variant="secondary" className="ml-2">
                Current
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
