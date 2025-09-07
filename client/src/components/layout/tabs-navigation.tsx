import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/contexts/translation-context";
import { useLocation } from "wouter";

export const TabsNavigation = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="flex space-x-8 h-12 items-center">
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
    </nav>
  );
};