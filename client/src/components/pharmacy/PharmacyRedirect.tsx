import { useEffect } from 'react';

export default function PharmacyRedirect() {
  useEffect(() => {
    // Redirect to the modern pharmacy interface
    window.location.href = '/api/pharmacy-dashboard';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Redirecting to Modern Pharmacy Interface</h2>
        <p className="text-gray-500">Please wait...</p>
      </div>
    </div>
  );
}