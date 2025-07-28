import { Bell, ChevronDown, Building2, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import navimedLogo from "@assets/JPG_1753663321927.jpg";
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
import { useTranslation } from "@/contexts/translation-context";
import { useLocation } from "wouter";
import { TenantSwitcher } from "@/components/tenant/tenant-switcher";
import { LanguageSelector } from "@/components/language-selector";

export const Header = () => {
  const { user, logout } = useAuth();
  const { tenant } = useTenant();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

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
              <img src={navimedLogo} alt="NaviMed" className="h-10 w-10 rounded-lg object-contain" />
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
              {t('dashboard')}
            </button>
            {user.role === "super_admin" ? (
              // Platform Owner Navigation
              <>
                <button 
                  onClick={() => setLocation("/tenant-management")}
                  className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
                >
                  {t('tenant-management')}
                </button>
                <button 
                  onClick={() => setLocation("/user-roles")}
                  className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
                >
                  {t('user-roles')}
                </button>
                <button 
                  onClick={() => setLocation("/audit-logs")}
                  className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
                >
                  {t('audit-logs')}
                </button>
              </>
            ) : user.role === "receptionist" ? (
              // Receptionist Navigation - Minimal header, full sidebar navigation
              <>
                {/* Receptionists use sidebar navigation exclusively */}
              </>
            ) : (
              // Clinical/Tenant User Navigation
              <>
                <button 
                  onClick={() => setLocation("/patients")}
                  className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
                >
                  {t('patients')}
                </button>
                {/* Show appointments for all except pharmacy and laboratory tenant users */}
                {!(user.role === "tenant_admin" && (tenant?.type === "pharmacy" || tenant?.type === "laboratory")) && user.role !== "pharmacist" && user.role !== "lab_technician" && (
                  <button 
                    onClick={() => setLocation("/appointments")}
                    className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
                  >
                    {t('appointments')}
                  </button>
                )}
                {/* Prescriptions - hidden for laboratory users completely */}
                {tenant?.type !== "laboratory" && user.role !== "lab_technician" && (
                  <button 
                    onClick={() => setLocation("/prescriptions")}
                    className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
                  >
                    {t('prescriptions')}
                  </button>
                )}
                {/* Lab Orders - hidden for pharmacy users */}
                {!(user.role === "tenant_admin" && tenant?.type === "pharmacy") && user.role !== "pharmacist" && (
                  <button 
                    onClick={() => setLocation("/lab-orders")}
                    className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
                  >
                    {t('lab-orders')}
                  </button>
                )}
                <button 
                  onClick={() => setLocation("/billing")}
                  className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
                >
                  {t('billing')}
                </button>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSelector compact={true} />
            
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
                <DropdownMenuLabel>{t('my-account')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/profile-settings")}>
                  {t('profile-settings')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/profile-settings")}>
                  {t('security-privacy')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/audit-logs")}>
                  {t('audit-logs')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  {t('sign-out')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
