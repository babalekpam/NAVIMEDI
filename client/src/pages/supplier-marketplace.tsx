import { useState, useEffect } from 'react';
import SupplierLogin from './supplier-login';
import SupplierDashboard from './supplier-dashboard';

export default function SupplierMarketplace() {
  const [supplier, setSupplier] = useState(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if supplier is already logged in
    const storedToken = localStorage.getItem('supplierToken');
    const storedSupplier = localStorage.getItem('supplierData');
    
    if (storedToken && storedSupplier) {
      try {
        setToken(storedToken);
        setSupplier(JSON.parse(storedSupplier));
      } catch (error) {
        console.error('Error parsing stored supplier data:', error);
        localStorage.removeItem('supplierToken');
        localStorage.removeItem('supplierData');
      }
    }
    
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (supplierData: any, tokenData: string) => {
    setSupplier(supplierData);
    setToken(tokenData);
  };

  const handleLogout = () => {
    setSupplier(null);
    setToken(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show dashboard if supplier is logged in, otherwise show login
  if (supplier && token) {
    return <SupplierDashboard supplier={supplier} onLogout={handleLogout} />;
  }

  return <SupplierLogin onLoginSuccess={handleLoginSuccess} />;
}