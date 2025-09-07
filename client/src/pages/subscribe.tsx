import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/subscription-success',
      },
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Subscription Successful",
        description: "Welcome to NaviMED Healthcare Platform!",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Subscribe to NaviMED {selectedPlan?.name}
          <Badge variant="secondary">
            ${selectedPlan?.price}/{selectedPlan?.interval === 'yearly' ? 'year' : 'month'}
          </Badge>
        </CardTitle>
        <CardDescription>
          {selectedPlan?.description}
          {selectedPlan?.savings && (
            <span className="block text-emerald-600 font-medium mt-1">
              Save {selectedPlan.savings} with yearly billing
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <p className="font-medium mb-3">{selectedPlan?.name} plan includes:</p>
            <ul className="space-y-2">
              {selectedPlan?.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />
          <Button 
            type="submit" 
            disabled={!stripe || isLoading}
            className="w-full"
            data-testid="button-subscribe"
          >
            {isLoading ? "Processing..." : "Subscribe Now"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const { toast } = useToast();

  // Healthcare pricing plans (matches server and pricing page)
  const healthcarePricingPlans = {
    starter: { 
      name: "Starter", 
      monthlyPrice: 49.99, 
      yearlyPrice: 510.99, 
      description: "Perfect for small clinics and practices",
      features: ["5 users", "100 patients", "1GB storage", "Basic support"]
    },
    professional: { 
      name: "Professional", 
      monthlyPrice: 119.99, 
      yearlyPrice: 1210.99, 
      description: "Ideal for growing healthcare organizations",
      features: ["25 users", "1000 patients", "10GB storage", "Advanced reports", "Priority support"]
    }, 
    enterprise: { 
      name: "Enterprise", 
      monthlyPrice: 319.99, 
      yearlyPrice: 3210.99, 
      description: "For large hospitals and health systems",
      features: ["100 users", "10000 patients", "100GB storage", "Custom integrations", "24/7 support"]
    },
    white_label: { 
      name: "White Label", 
      monthlyPrice: 1019.99, 
      yearlyPrice: 10210.99, 
      description: "Full customization and branding control",
      features: ["Unlimited users", "Unlimited patients", "Unlimited storage", "White label branding", "Dedicated support"]
    }
  };

  // Get plan and interval from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('plan') || 'professional';
  const interval = urlParams.get('interval') || 'monthly';

  // Check if Stripe is properly configured
  const isStripeConfigured = !!import.meta.env.VITE_STRIPE_PUBLIC_KEY && !!stripePromise;

  useEffect(() => {
    if (!isStripeConfigured) {
      setError("Stripe subscription processing is not configured. Please contact administrator.");
      setIsLoading(false);
      return;
    }

    // Validate plan selection
    if (!healthcarePricingPlans[planId as keyof typeof healthcarePricingPlans]) {
      setError(`Invalid plan selected: ${planId}. Please go back and select a valid plan.`);
      setIsLoading(false);
      return;
    }

    const plan = healthcarePricingPlans[planId as keyof typeof healthcarePricingPlans];
    setSelectedPlan({
      ...plan,
      id: planId,
      interval,
      price: interval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice,
      savings: interval === 'yearly' ? '17%' : null
    });

    // Create subscription with selected plan
    apiRequest("POST", "/api/get-or-create-subscription", {
      planId,
      interval
    })
      .then((data) => {
        console.log("✅ Subscription created for plan:", planId, "interval:", interval, "amount:", data.amount);
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Subscription error:", err);
        setError("Subscription processing is currently unavailable. Please try again later.");
        setIsLoading(false);
        toast({
          title: "Subscription Setup Error",
          description: "Subscription processing is currently unavailable",
          variant: "destructive",
        });
      });
  }, [toast, isStripeConfigured, planId, interval]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Subscription Unavailable</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            NaviMED Healthcare Subscription
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Join thousands of healthcare professionals using our platform
          </p>
        </div>
        
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <SubscribeForm />
        </Elements>
      </div>
    </div>
  );
}