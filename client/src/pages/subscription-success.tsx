import { useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Crown, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionSuccess() {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Welcome to NaviMED!",
      description: "Your subscription is now active. Enjoy all premium features!",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Welcome to NaviMED!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-300">
                  Your subscription is now active. You have full access to all healthcare platform features.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm">
                <p className="font-medium mb-2">Your subscription includes:</p>
                <ul className="text-left space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• Unlimited patient records</li>
                  <li>• Advanced reporting</li>
                  <li>• Priority support</li>
                  <li>• All premium features</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <Button asChild className="w-full" data-testid="button-start-using">
                  <Link href="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Start Using NaviMED
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full" data-testid="button-manage-subscription">
                  <Link href="/billing">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Subscription
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