import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ShoppingCart } from 'lucide-react';

export default function SupplierMarketplaceTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Building2 className="w-16 h-16 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Supplier Marketplace
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Medical Device Vendor Portal - Access Your Dashboard
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-6">
                Welcome to the NaviMED Supplier Marketplace! This is where medical device vendors 
                can manage their advertisements and connect with healthcare providers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Login to Dashboard
                </Button>
                <Button size="lg" variant="outline">
                  Register as Supplier
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Features Available:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Create and manage medical device advertisements</li>
                <li>• View performance analytics and metrics</li>
                <li>• Respond to healthcare provider inquiries</li>
                <li>• Access marketplace insights and reports</li>
                <li>• Manage company profile and certifications</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}