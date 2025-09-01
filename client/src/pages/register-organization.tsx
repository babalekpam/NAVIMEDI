import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, ArrowLeft, CheckCircle, CreditCard, FileText, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import navimedLogo from "@assets/JPG_1753663321927.jpg";
import { useStripe, useElements, Elements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

// Multi-step registration component
function RegistrationSteps() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [setupIntent, setSetupIntent] = useState<string | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();

  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
    country: "",
    description: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Organization name is required";
    }
    if (!formData.organizationType) {
      newErrors.organizationType = "Organization type is required";
    }
    if (!formData.adminFirstName.trim()) {
      newErrors.adminFirstName = "First name is required";
    }
    if (!formData.adminLastName.trim()) {
      newErrors.adminLastName = "Last name is required";
    }
    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      newErrors.adminEmail = "Please enter a valid email address";
    }
    if (!formData.adminPassword) {
      newErrors.adminPassword = "Password is required";
    } else if (formData.adminPassword.length < 6) {
      newErrors.adminPassword = "Password must be at least 6 characters";
    }
    if (formData.adminPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create setup intent for payment method collection
  useEffect(() => {
    if (currentStep === 2 && !setupIntent) {
      fetch('/api/create-setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.adminEmail,
          name: `${formData.adminFirstName} ${formData.adminLastName}` 
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.clientSecret) {
          setSetupIntent(data.clientSecret);
        }
      })
      .catch(err => {
        console.error('Setup intent error:', err);
        toast({
          title: "Payment Setup Error",
          description: "Unable to initialize payment setup. Please try again.",
          variant: "destructive",
        });
        setCurrentStep(1); // Go back to step 1
      });
    }
  }, [currentStep, setupIntent, formData.adminEmail, formData.adminFirstName, formData.adminLastName, toast]);

  const handleStepNext = () => {
    if (currentStep === 1 && validateForm()) {
      setCurrentStep(2);
    }
  };

  const handlePaymentSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast({
        title: "Payment Error",
        description: "Payment system not initialized. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setIsLoading(false);
      return;
    }

    try {
      const { error, setupIntent: confirmedSetupIntent } = await stripe.confirmCardSetup(
        setupIntent!,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${formData.adminFirstName} ${formData.adminLastName}`,
              email: formData.adminEmail,
            },
          },
        }
      );

      if (error) {
        toast({
          title: "Payment Setup Failed",
          description: error.message || "Unable to set up payment method. Please try again.",
          variant: "destructive",
        });
      } else if (confirmedSetupIntent?.payment_method) {
        setPaymentMethodId(confirmedSetupIntent.payment_method as string);
        // Now complete the registration with payment method
        await completeRegistration(confirmedSetupIntent.payment_method as string);
      }
    } catch (err) {
      console.error('Payment setup error:', err);
      toast({
        title: "Payment Setup Error",
        description: "Unable to set up payment method. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeRegistration = async (paymentMethodId: string) => {
    try {
      const response = await fetch('/api/register-organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationName: formData.organizationName,
          organizationType: formData.organizationType,
          adminFirstName: formData.adminFirstName,
          adminLastName: formData.adminLastName,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          country: formData.country,
          description: formData.description,
          paymentMethodId: paymentMethodId
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Registration Successful!",
          description: "Your organization has been registered with payment method. Your free trial starts now!",
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          setLocation('/login');
        }, 3000);
      } else {
        const errorData = await response.json();
        toast({
          title: "Registration Failed",
          description: errorData.message || "There was an error completing your registration. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your organization <strong>{formData.organizationName}</strong> has been successfully registered with payment method.
            </p>
            <p className="text-sm text-emerald-600 font-medium mb-4">
              🎉 Your free trial has started!
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You can now sign in with your admin credentials:<br/>
              <strong>Email:</strong> {formData.adminEmail}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/login" className="flex-1">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" data-testid="button-signin-now">
                  Sign In Now
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full" data-testid="button-back-home">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step Progress Indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
          currentStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
        }`}>
          <FileText className="w-4 h-4" />
        </div>
        <div className={`w-16 h-1 rounded ${currentStep >= 2 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
        <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
          currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
        }`}>
          <CreditCard className="w-4 h-4" />
        </div>
      </div>
      <div className="flex justify-between w-full max-w-xs mt-2 text-xs text-gray-500">
        <span>Organization</span>
        <span>Payment</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-emerald-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Register Your Organization</h1>
          </div>
          <p className="text-gray-600">
            Join NAVIMED and start your free trial with secure payment setup
          </p>
        </div>

        <StepIndicator />

        {/* Step 1: Organization Details */}
        {currentStep === 1 && (
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <img src={navimedLogo} alt="NaviMed" className="h-10 w-10 rounded-lg object-contain" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Organization Details</CardTitle>
              <CardDescription>Tell us about your healthcare organization</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleStepNext(); }} className="space-y-6">
                {/* Organization Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization Name *</Label>
                    <Input
                      id="organizationName"
                      placeholder="Enter organization name"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      className={errors.organizationName ? "border-red-500" : ""}
                      data-testid="input-organization-name"
                    />
                    {errors.organizationName && (
                      <p className="text-sm text-red-600">{errors.organizationName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizationType">Organization Type *</Label>
                    <Select value={formData.organizationType} onValueChange={(value) => setFormData({ ...formData, organizationType: value })}>
                      <SelectTrigger className={errors.organizationType ? "border-red-500" : ""} data-testid="select-organization-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hospital">Hospital</SelectItem>
                        <SelectItem value="pharmacy">Pharmacy</SelectItem>
                        <SelectItem value="laboratory">Laboratory</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.organizationType && (
                      <p className="text-sm text-red-600">{errors.organizationType}</p>
                    )}
                  </div>
                </div>

                {/* Admin Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Administrator Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminFirstName">First Name *</Label>
                      <Input
                        id="adminFirstName"
                        placeholder="Enter first name"
                        value={formData.adminFirstName}
                        onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
                        className={errors.adminFirstName ? "border-red-500" : ""}
                        data-testid="input-admin-first-name"
                      />
                      {errors.adminFirstName && (
                        <p className="text-sm text-red-600">{errors.adminFirstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminLastName">Last Name *</Label>
                      <Input
                        id="adminLastName"
                        placeholder="Enter last name"
                        value={formData.adminLastName}
                        onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
                        className={errors.adminLastName ? "border-red-500" : ""}
                        data-testid="input-admin-last-name"
                      />
                      {errors.adminLastName && (
                        <p className="text-sm text-red-600">{errors.adminLastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email Address *</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      className={errors.adminEmail ? "border-red-500" : ""}
                      data-testid="input-admin-email"
                    />
                    {errors.adminEmail && (
                      <p className="text-sm text-red-600">{errors.adminEmail}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminPassword">Password *</Label>
                      <Input
                        id="adminPassword"
                        type="password"
                        placeholder="Enter password"
                        value={formData.adminPassword}
                        onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                        className={errors.adminPassword ? "border-red-500" : ""}
                        data-testid="input-admin-password"
                      />
                      {errors.adminPassword && (
                        <p className="text-sm text-red-600">{errors.adminPassword}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className={errors.confirmPassword ? "border-red-500" : ""}
                        data-testid="input-confirm-password"
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        placeholder="(555) 123-4567"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className={errors.phoneNumber ? "border-red-500" : ""}
                        data-testid="input-phone-number"
                      />
                      {errors.phoneNumber && (
                        <p className="text-sm text-red-600">{errors.phoneNumber}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                        <SelectTrigger data-testid="select-country">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USA">United States</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="UK">United Kingdom</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Spain">Spain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter organization address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={2}
                      data-testid="textarea-address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your organization"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    data-testid="textarea-description"
                  />
                </div>

                {/* Next Button */}
                <div className="pt-6">
                  <Button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={isLoading}
                    data-testid="button-next-step"
                  >
                    Next: Setup Payment Method
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <p className="text-sm text-gray-600 text-center mt-4">
                    Already have an account?{" "}
                    <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Payment Method Setup */}
        {currentStep === 2 && (
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-emerald-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Setup Payment Method</CardTitle>
              <CardDescription>Add a payment method to start your free trial</CardDescription>
            </CardHeader>
            <CardContent>
              {!setupIntent ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
                  <p className="text-gray-600 mt-4">Setting up payment processing...</p>
                </div>
              ) : (
                <form onSubmit={handlePaymentSetup} className="space-y-6">
                  <Alert>
                    <CreditCard className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Free Trial Information:</strong> You won't be charged during your free trial period. 
                      We require a payment method to automatically continue your service after the trial ends.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                    <div className="p-4 border rounded-lg bg-white">
                      <CardElement 
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#424770',
                              '::placeholder': {
                                color: '#aab7c4',
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={isLoading || !stripe || !elements}
                      data-testid="button-setup-payment"
                    >
                      {isLoading ? "Setting up payment..." : "Complete Registration & Start Trial"}
                    </Button>
                    
                    <Button 
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setCurrentStep(1)}
                      disabled={isLoading}
                      data-testid="button-back-step"
                    >
                      Back to Organization Details
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Main component with Stripe Elements wrapper
export default function RegisterOrganization() {
  // Check if Stripe is configured
  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment System Unavailable</h2>
            <p className="text-gray-600 mb-6">
              Payment processing is not currently configured. Please contact support.
            </p>
            <Link href="/">
              <Button variant="outline" data-testid="button-back-home">
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <RegistrationSteps />
    </Elements>
  );
}