import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Crown, AlertCircle, CheckCircle, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PaymentDemo() {
  const hasStripeKey = !!import.meta.env.VITE_STRIPE_PUBLIC_KEY;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment System Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Test the Stripe payment integration for NaviMED Healthcare Platform
          </p>
        </div>

        {!hasStripeKey && (
          <Alert className="max-w-2xl mx-auto mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Stripe Configuration Required:</strong> To fully test payments, you need to add your Stripe keys:
              <br />• VITE_STRIPE_PUBLIC_KEY (starts with 'pk_')
              <br />• STRIPE_SECRET_KEY (starts with 'sk_')
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* One-time Payment */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>One-Time Payment</CardTitle>
              <CardDescription>
                Pay for individual healthcare services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">$50.00</div>
                <div className="text-sm text-gray-500">Healthcare service payment</div>
              </div>
              
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Secure payment processing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Instant transaction confirmation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Receipt generation</span>
                </li>
              </ul>
              
              <Button asChild className="w-full" data-testid="button-test-checkout">
                <Link href="/checkout">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Test Checkout
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Subscription Payment */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                Monthly Subscription
                <Badge variant="secondary">Popular</Badge>
              </CardTitle>
              <CardDescription>
                Full access to healthcare platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  $29.99<span className="text-lg font-normal text-gray-500">/month</span>
                </div>
                <div className="text-sm text-gray-500">Billed monthly</div>
              </div>
              
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>All platform features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Unlimited patient records</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
              
              <Button asChild className="w-full" data-testid="button-test-subscribe">
                <Link href="/subscribe">
                  <Crown className="w-4 h-4 mr-2" />
                  Test Subscription
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-2xl mx-auto mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Payment System Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">✅ Implemented Features:</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                    <li>• Stripe payment integration</li>
                    <li>• Secure checkout forms</li>
                    <li>• Subscription management</li>
                    <li>• Database schema updates</li>
                    <li>• Payment confirmation pages</li>
                    <li>• Error handling</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">🔄 Next Steps:</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                    <li>• Add correct Stripe secret key (sk_)</li>
                    <li>• Test payment processing</li>
                    <li>• Configure webhook endpoints</li>
                    <li>• Add invoice generation</li>
                    <li>• Integrate with billing system</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" asChild data-testid="button-back-dashboard">
            <Link href="/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}