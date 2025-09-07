import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const CheckoutForm = () => {
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
        return_url: window.location.origin + '/payment-success',
      },
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Payment - $50.00</CardTitle>
        <CardDescription>
          Secure payment processing for healthcare services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <PaymentElement />
          </div>
          <Button 
            type="submit" 
            disabled={!stripe || isLoading}
            className="w-full"
            data-testid="button-submit-payment"
          >
            {isLoading ? "Processing..." : "Pay $50.00"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const CheckoutWrapper = ({ clientSecret }: { clientSecret: string }) => {
  if (!stripePromise || !clientSecret) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Payment Setup Error</CardTitle>
          <CardDescription>Unable to initialize payment system</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    // Check if Stripe is properly configured
    if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY || !stripePromise) {
      setError("Stripe payment processing is not configured. Please contact administrator.");
      setIsLoading(false);
      return;
    }

    // Create PaymentIntent
    apiRequest("/api/create-payment-intent", { 
      method: "POST", 
      body: { amount: 50.00 } 
    })
      .then((data) => {
        console.log("✅ Payment intent response:", data);
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error("No client secret received");
        }
      })
      .catch((err) => {
        console.error("❌ Payment setup failed:", err);
        setError("Unable to set up payment. Please try again.");
        toast({
          title: "Payment Setup Error",
          description: "Unable to initialize payment processing",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Healthcare Services Payment
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Setting up secure payment processing...
            </p>
          </div>
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="flex justify-center items-center p-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
              <span className="ml-3 text-gray-600">Preparing payment...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Payment Unavailable</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Healthcare Services Payment
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Secure payment processing for your healthcare needs
          </p>
        </div>
        
        {clientSecret && (
          <CheckoutWrapper clientSecret={clientSecret} />
        )}
      </div>
    </div>
  );
}