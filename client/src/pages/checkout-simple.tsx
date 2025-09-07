import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

function PaymentForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || 'An error occurred');
    } else {
      setMessage("An unexpected error occurred.");
    }

    setLoading(false);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Payment</CardTitle>
        <CardDescription>Healthcare service payment - $50.00</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border rounded-lg p-4 bg-white">
            <PaymentElement />
          </div>
          
          <Button 
            disabled={loading || !stripe || !elements} 
            type="submit"
            className="w-full"
          >
            {loading ? 'Processing...' : 'Pay $50.00'}
          </Button>
          
          {message && (
            <div className="text-red-600 text-sm text-center">
              {message}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export default function CheckoutSimple() {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('🚀 Starting payment setup...');
    console.log('🔑 Stripe key exists:', !!import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    console.log('🔑 Stripe key preview:', import.meta.env.VITE_STRIPE_PUBLIC_KEY?.substring(0, 20) + '...');
    
    // Add a small delay to ensure everything is ready
    const timer = setTimeout(() => {
      console.log('📞 Making API request to create payment intent...');
      
      apiRequest("/api/create-payment-intent", { 
        method: "POST", 
        body: { amount: 50.00 } 
      })
      .then((data) => {
        console.log('🔥 PAYMENT INTENT SUCCESS:', data);
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          console.log('✅ Client secret set, should render form now');
        } else {
          throw new Error('No client secret in response');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('💥 PAYMENT ERROR:', err);
        setError(`Failed to initialize payment: ${err.message}`);
        setLoading(false);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold">Setting up payment...</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Payment Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#0570de',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Healthcare Payment
          </h1>
          <p className="text-gray-600">
            Secure payment processing
          </p>
        </div>

        {clientSecret && (
          <Elements stripe={stripePromise} options={options}>
            <PaymentForm clientSecret={clientSecret} />
          </Elements>
        )}
      </div>
    </div>
  );
}