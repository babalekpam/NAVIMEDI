import { Bell, ChevronDown, Building2, Wifi, WifiOff, X } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { useLocation } from "wouter";
import { TenantSwitcher } from "@/components/tenant/tenant-switcher";
import { LanguageSelector } from "@/components/language-selector";
import { useState } from "react";

interface Notification {
  id: number;
  type: 'info' | 'warning' | 'error';
  message: string;
  time: string;
  urgent?: boolean;
}

export const TabsNavigation = () => {
  const { user, logout } = useAuth();
  const { tenant } = useTenant();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleLogout = () => {
    console.log('Logout initiated from tabs navigation');
    logout();
  };

  const dismissNotification = (notificationId: number) => {
    setNotifications(prev => prev.filter((n: Notification) => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  if (!user) return null;

  const userInitials = `${user.firstName?.[0] || 'U'}${user.lastName?.[0] || 'N'}`;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-12">
        {/* Navigation Tabs */}
        <div className="flex space-x-8">
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
            // Receptionist Navigation
            <>
              <button 
                onClick={() => setLocation("/patients")}
                className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
              >
                {t('patients')}
              </button>
              <button 
                onClick={() => setLocation("/appointments")}
                className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
              >
                {t('appointments')}
              </button>
            </>
          ) : user.role === "pharmacist" ? (
            // Pharmacy Navigation
            <>
              <button 
                onClick={() => setLocation("/prescriptions")}
                className="text-blue-600 border-b-2 border-blue-600 px-1 pb-4 text-sm font-medium"
              >
                💊 Prescriptions
              </button>
              <button 
                onClick={() => setLocation("/pharmacy-inventory")}
                className="text-blue-600 border-b-2 border-blue-600 px-1 pb-4 text-sm font-medium"
              >
                📦 Inventory
              </button>
              <button 
                onClick={() => setLocation("/pharmacy-customers")}
                className="text-blue-600 border-b-2 border-blue-600 px-1 pb-4 text-sm font-medium"
              >
                👤 Customers
              </button>
              <button 
                onClick={() => setLocation("/pharmacy-billing")}
                className="text-blue-600 border-b-2 border-blue-600 px-1 pb-4 text-sm font-medium"
              >
                💳 Billing
              </button>
            </>
          ) : (
            // Default Navigation for other roles
            <>
              <button 
                onClick={() => setLocation("/patients")}
                className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
              >
                {t('patients')}
              </button>
              <button 
                onClick={() => setLocation("/appointments")}
                className="text-gray-500 hover:text-gray-700 px-1 pb-4 text-sm font-medium"
              >
                {t('appointments')}
              </button>
            </>
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <LanguageSelector compact={true} />
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative hover:bg-blue-50">
                <Bell className="h-5 w-5 text-blue-600" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white animate-pulse">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {notifications.length > 0 ? (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{notifications.length} new</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllNotifications}
                      className="text-xs hover:bg-gray-100"
                    >
                      Clear all
                    </Button>
                  </div>
                ) : (
                  <Badge variant="secondary">All clear!</Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id}
                      className="flex flex-col items-start p-3 space-y-1 cursor-pointer hover:bg-gray-50"
                      onClick={() => dismissNotification(notification.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`font-medium text-sm ${notification.urgent ? 'text-red-600' : ''}`}>
                          {notification.message}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{notification.time}</span>
                          <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tenant Switcher */}
          <TenantSwitcher />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-blue-50">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || undefined} />
                  <AvatarFallback className="bg-blue-600 text-white font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setLocation("/profile-settings")}
                className="cursor-pointer"
              >
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLocation("/profile-settings")}
                className="cursor-pointer"
              >
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};