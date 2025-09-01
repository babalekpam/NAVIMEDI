import { useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PaymentSuccess() {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Payment Successful!",
      description: "Your payment has been processed successfully.",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
                Payment Successful!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600 dark:text-gray-300">
                Thank you for your payment. Your transaction has been processed successfully.
              </p>
              
              <div className="space-y-3">
                <Button asChild className="w-full" data-testid="button-back-dashboard">
                  <Link href="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full" data-testid="button-view-billing">
                  <Link href="/billing">
                    <Receipt className="w-4 h-4 mr-2" />
                    View Billing History
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}