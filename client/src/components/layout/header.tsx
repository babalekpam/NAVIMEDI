import { Bell, ChevronDown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useLocation } from "wouter";
import { TenantSwitcher } from "@/components/tenant/tenant-switcher";

export const Header = () => {
  const { user, logout } = useAuth();
  const { tenant } = useTenant();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  if (!user) return null;

  const userInitials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Tenant Branding */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-600">NAVIMED</h1>
                <p className="text-xs text-gray-500">{tenant?.name || 'Loading...'}</p>
              </div>
            </div>
          </div>

          {/* Global Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => setLocation("/dashboard")}
              className="text-blue-600 border-b-2 border-blue-600 px-1 pb-4 text-sm font-medium"
            >
              Dashboard
            </button>
            {user.role === "super_admin" ? (
              // Platform Owner Navigation
              <>
                <button 
                  onClick={() => setLocation("/tenant-management")}
                  className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
                >
                  Tenants
                </button>
                <button 
                  onClick={() => setLocation("/user-roles")}
                  className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
                >
                  Users
                </button>
                <button 
                  onClick={() => setLocation("/audit-logs")}
                  className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
                >
                  Audit
                </button>
              </>
            ) : (
              // Clinical/Tenant User Navigation
              <>
                <button 
                  onClick={() => setLocation("/patients")}
                  className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
                >
                  Patients
                </button>
                {/* Show appointments for all except pharmacy users */}
                {user.role !== "pharmacist" && (
                  <button 
                    onClick={() => setLocation("/appointments")}
                    className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
                  >
                    Appointments
                  </button>
                )}
                <button 
                  onClick={() => setLocation("/prescriptions")}
                  className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
                >
                  Prescriptions
                </button>
                {/* Lab Orders prominently placed for pharmacy users */}
                <button 
                  onClick={() => setLocation("/lab-orders")}
                  className={`px-1 pb-4 text-sm font-medium ${
                    user.role === "pharmacist" 
                      ? "text-blue-600 border-b-2 border-blue-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Lab Orders
                </button>
                <button 
                  onClick={() => setLocation("/billing")}
                  className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
                >
                  Billing
                </button>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
                3
              </Badge>
            </Button>
            
            {/* Tenant Switcher */}
            <TenantSwitcher />
            
            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 hover:bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.role.replace('_', ' ')}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Security
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Audit Logs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
