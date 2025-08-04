import React from 'react';
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import SupplierLogin from "@/pages/supplier-login";
import SupplierDashboard from "@/pages/supplier-dashboard";
import SupplierRegister from "@/pages/supplier-register";

// Completely isolated supplier application - NO hospital dependencies
export default function SupplierApp() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState(null);

  React.useEffect(() => {
    // Check supplier authentication - completely isolated
    const userType = localStorage.getItem('userType');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('[SUPPLIER APP] Checking auth - UserType:', userType, 'Token:', !!token);
    
    if (userType === 'supplier' && token && user) {
      try {
        const userData = JSON.parse(user);
        if (userData.userType === 'supplier') {
          setCurrentUser(userData);
          setIsAuthenticated(true);
          console.log('[SUPPLIER APP] Authenticated supplier:', userData.username);
        }
      } catch (e) {
        console.error('[SUPPLIER APP] Error parsing user data:', e);
        localStorage.clear();
      }
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading supplier platform...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <Switch>
          <Route path="/supplier-login" component={SupplierLogin} />
          <Route path="/supplier-register" component={SupplierRegister} />
          <Route path="/supplier-dashboard-direct">
            {isAuthenticated ? (
              <SupplierDashboard />
            ) : (
              () => {
                window.location.replace('/supplier-login');
                return null;
              }
            )}
          </Route>
          <Route>
            {() => {
              // Default route - redirect based on auth status
              if (isAuthenticated) {
                window.location.replace('/supplier-dashboard-direct');
              } else {
                window.location.replace('/supplier-login');
              }
              return null;
            }}
          </Route>
        </Switch>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}