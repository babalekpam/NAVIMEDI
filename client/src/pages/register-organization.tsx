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
    currency: "",
    language: "",
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
    if (!formData.currency) {
      newErrors.currency = "Please select your organization's base currency";
    }
    if (!formData.language) {
      newErrors.language = "Please select your organization's primary language";
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
          // Handle demo mode when Stripe is not configured
          if (data.testMode) {
            toast({
              title: "Demo Mode",
              description: data.message || "Registration will proceed in demo mode",
            });
          }
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
    setIsLoading(true);

    try {
      // Check if we're in demo mode (Stripe not configured)
      if (setupIntent === 'demo_setup_intent_test_mode') {
        // Skip payment setup and proceed to registration in demo mode
        await completeRegistration('demo_payment_method');
        return;
      }
    
      if (!stripe || !elements) {
        toast({
          title: "Payment Error",
          description: "Payment system not initialized. Please refresh and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setIsLoading(false);
        return;
      }

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
          currency: formData.currency,
          language: formData.language,
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
                          {/* North America */}
                          <SelectItem value="USA">United States</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Mexico">Mexico</SelectItem>

                          {/* Europe */}
                          <SelectItem value="UK">United Kingdom</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Spain">Spain</SelectItem>
                          <SelectItem value="Italy">Italy</SelectItem>
                          <SelectItem value="Netherlands">Netherlands</SelectItem>
                          <SelectItem value="Belgium">Belgium</SelectItem>
                          <SelectItem value="Switzerland">Switzerland</SelectItem>
                          <SelectItem value="Austria">Austria</SelectItem>
                          <SelectItem value="Sweden">Sweden</SelectItem>
                          <SelectItem value="Norway">Norway</SelectItem>
                          <SelectItem value="Denmark">Denmark</SelectItem>
                          <SelectItem value="Finland">Finland</SelectItem>
                          <SelectItem value="Poland">Poland</SelectItem>

                          {/* Africa - Comprehensive Coverage */}
                          <SelectItem value="Algeria">Algeria</SelectItem>
                          <SelectItem value="Angola">Angola</SelectItem>
                          <SelectItem value="Benin">Benin</SelectItem>
                          <SelectItem value="Botswana">Botswana</SelectItem>
                          <SelectItem value="Burkina Faso">Burkina Faso</SelectItem>
                          <SelectItem value="Burundi">Burundi</SelectItem>
                          <SelectItem value="Cameroon">Cameroon</SelectItem>
                          <SelectItem value="Cape Verde">Cape Verde</SelectItem>
                          <SelectItem value="Central African Republic">Central African Republic</SelectItem>
                          <SelectItem value="Chad">Chad</SelectItem>
                          <SelectItem value="Comoros">Comoros</SelectItem>
                          <SelectItem value="Democratic Republic of Congo">Democratic Republic of Congo</SelectItem>
                          <SelectItem value="Republic of Congo">Republic of Congo</SelectItem>
                          <SelectItem value="Cote d'Ivoire">Côte d'Ivoire</SelectItem>
                          <SelectItem value="Djibouti">Djibouti</SelectItem>
                          <SelectItem value="Egypt">Egypt</SelectItem>
                          <SelectItem value="Equatorial Guinea">Equatorial Guinea</SelectItem>
                          <SelectItem value="Eritrea">Eritrea</SelectItem>
                          <SelectItem value="Eswatini">Eswatini</SelectItem>
                          <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                          <SelectItem value="Gabon">Gabon</SelectItem>
                          <SelectItem value="Gambia">Gambia</SelectItem>
                          <SelectItem value="Ghana">Ghana</SelectItem>
                          <SelectItem value="Guinea">Guinea</SelectItem>
                          <SelectItem value="Guinea-Bissau">Guinea-Bissau</SelectItem>
                          <SelectItem value="Kenya">Kenya</SelectItem>
                          <SelectItem value="Lesotho">Lesotho</SelectItem>
                          <SelectItem value="Liberia">Liberia</SelectItem>
                          <SelectItem value="Libya">Libya</SelectItem>
                          <SelectItem value="Madagascar">Madagascar</SelectItem>
                          <SelectItem value="Malawi">Malawi</SelectItem>
                          <SelectItem value="Mali">Mali</SelectItem>
                          <SelectItem value="Mauritania">Mauritania</SelectItem>
                          <SelectItem value="Mauritius">Mauritius</SelectItem>
                          <SelectItem value="Morocco">Morocco</SelectItem>
                          <SelectItem value="Mozambique">Mozambique</SelectItem>
                          <SelectItem value="Namibia">Namibia</SelectItem>
                          <SelectItem value="Niger">Niger</SelectItem>
                          <SelectItem value="Nigeria">Nigeria</SelectItem>
                          <SelectItem value="Rwanda">Rwanda</SelectItem>
                          <SelectItem value="Sao Tome and Principe">São Tomé and Príncipe</SelectItem>
                          <SelectItem value="Senegal">Senegal</SelectItem>
                          <SelectItem value="Seychelles">Seychelles</SelectItem>
                          <SelectItem value="Sierra Leone">Sierra Leone</SelectItem>
                          <SelectItem value="Somalia">Somalia</SelectItem>
                          <SelectItem value="South Africa">South Africa</SelectItem>
                          <SelectItem value="South Sudan">South Sudan</SelectItem>
                          <SelectItem value="Sudan">Sudan</SelectItem>
                          <SelectItem value="Tanzania">Tanzania</SelectItem>
                          <SelectItem value="Togo">Togo</SelectItem>
                          <SelectItem value="Tunisia">Tunisia</SelectItem>
                          <SelectItem value="Uganda">Uganda</SelectItem>
                          <SelectItem value="Zambia">Zambia</SelectItem>
                          <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>

                          {/* Asia */}
                          <SelectItem value="China">China</SelectItem>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="Japan">Japan</SelectItem>
                          <SelectItem value="South Korea">South Korea</SelectItem>
                          <SelectItem value="Singapore">Singapore</SelectItem>
                          <SelectItem value="Thailand">Thailand</SelectItem>
                          <SelectItem value="Malaysia">Malaysia</SelectItem>
                          <SelectItem value="Indonesia">Indonesia</SelectItem>
                          <SelectItem value="Philippines">Philippines</SelectItem>
                          <SelectItem value="Vietnam">Vietnam</SelectItem>
                          <SelectItem value="Pakistan">Pakistan</SelectItem>
                          <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                          <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                          <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                          <SelectItem value="UAE">United Arab Emirates</SelectItem>
                          <SelectItem value="Qatar">Qatar</SelectItem>
                          <SelectItem value="Kuwait">Kuwait</SelectItem>
                          <SelectItem value="Bahrain">Bahrain</SelectItem>
                          <SelectItem value="Oman">Oman</SelectItem>
                          <SelectItem value="Jordan">Jordan</SelectItem>
                          <SelectItem value="Lebanon">Lebanon</SelectItem>
                          <SelectItem value="Turkey">Turkey</SelectItem>
                          <SelectItem value="Israel">Israel</SelectItem>

                          {/* Oceania */}
                          <SelectItem value="Australia">Australia</SelectItem>
                          <SelectItem value="New Zealand">New Zealand</SelectItem>
                          <SelectItem value="Fiji">Fiji</SelectItem>
                          <SelectItem value="Papua New Guinea">Papua New Guinea</SelectItem>

                          {/* South America */}
                          <SelectItem value="Brazil">Brazil</SelectItem>
                          <SelectItem value="Argentina">Argentina</SelectItem>
                          <SelectItem value="Chile">Chile</SelectItem>
                          <SelectItem value="Colombia">Colombia</SelectItem>
                          <SelectItem value="Peru">Peru</SelectItem>
                          <SelectItem value="Venezuela">Venezuela</SelectItem>
                          <SelectItem value="Ecuador">Ecuador</SelectItem>
                          <SelectItem value="Uruguay">Uruguay</SelectItem>
                          <SelectItem value="Paraguay">Paraguay</SelectItem>
                          <SelectItem value="Bolivia">Bolivia</SelectItem>

                          {/* Additional European Countries */}
                          <SelectItem value="Portugal">Portugal</SelectItem>
                          <SelectItem value="Greece">Greece</SelectItem>
                          <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                          <SelectItem value="Hungary">Hungary</SelectItem>
                          <SelectItem value="Romania">Romania</SelectItem>
                          <SelectItem value="Bulgaria">Bulgaria</SelectItem>
                          <SelectItem value="Croatia">Croatia</SelectItem>
                          <SelectItem value="Slovenia">Slovenia</SelectItem>
                          <SelectItem value="Slovakia">Slovakia</SelectItem>
                          <SelectItem value="Estonia">Estonia</SelectItem>
                          <SelectItem value="Latvia">Latvia</SelectItem>
                          <SelectItem value="Lithuania">Lithuania</SelectItem>
                          <SelectItem value="Ireland">Ireland</SelectItem>
                          <SelectItem value="Iceland">Iceland</SelectItem>
                          <SelectItem value="Luxembourg">Luxembourg</SelectItem>

                          {/* Additional Asian Countries */}
                          <SelectItem value="Kazakhstan">Kazakhstan</SelectItem>
                          <SelectItem value="Uzbekistan">Uzbekistan</SelectItem>
                          <SelectItem value="Mongolia">Mongolia</SelectItem>
                          <SelectItem value="Myanmar">Myanmar</SelectItem>
                          <SelectItem value="Cambodia">Cambodia</SelectItem>
                          <SelectItem value="Laos">Laos</SelectItem>
                          <SelectItem value="Nepal">Nepal</SelectItem>
                          <SelectItem value="Bhutan">Bhutan</SelectItem>
                          <SelectItem value="Maldives">Maldives</SelectItem>
                          <SelectItem value="Afghanistan">Afghanistan</SelectItem>
                          <SelectItem value="Iran">Iran</SelectItem>
                          <SelectItem value="Iraq">Iraq</SelectItem>
                          <SelectItem value="Syria">Syria</SelectItem>
                          <SelectItem value="Yemen">Yemen</SelectItem>

                          {/* Caribbean & Central America */}
                          <SelectItem value="Jamaica">Jamaica</SelectItem>
                          <SelectItem value="Cuba">Cuba</SelectItem>
                          <SelectItem value="Dominican Republic">Dominican Republic</SelectItem>
                          <SelectItem value="Haiti">Haiti</SelectItem>
                          <SelectItem value="Puerto Rico">Puerto Rico</SelectItem>
                          <SelectItem value="Trinidad and Tobago">Trinidad and Tobago</SelectItem>
                          <SelectItem value="Barbados">Barbados</SelectItem>
                          <SelectItem value="Guatemala">Guatemala</SelectItem>
                          <SelectItem value="Costa Rica">Costa Rica</SelectItem>
                          <SelectItem value="Panama">Panama</SelectItem>
                          <SelectItem value="Honduras">Honduras</SelectItem>
                          <SelectItem value="El Salvador">El Salvador</SelectItem>
                          <SelectItem value="Nicaragua">Nicaragua</SelectItem>
                          <SelectItem value="Belize">Belize</SelectItem>

                          {/* Other */}
                          <SelectItem value="Russia">Russia</SelectItem>
                          <SelectItem value="Ukraine">Ukraine</SelectItem>
                          <SelectItem value="Belarus">Belarus</SelectItem>
                          <SelectItem value="Moldova">Moldova</SelectItem>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                          <SelectItem value="Armenia">Armenia</SelectItem>
                          <SelectItem value="Azerbaijan">Azerbaijan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Base Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                        <SelectTrigger data-testid="select-currency">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Major Global Currencies */}
                          <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                          <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound (£)</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar (C$)</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar (A$)</SelectItem>
                          <SelectItem value="CHF">CHF - Swiss Franc (₣)</SelectItem>
                          <SelectItem value="JPY">JPY - Japanese Yen (¥)</SelectItem>
                          <SelectItem value="CNY">CNY - Chinese Yuan (¥)</SelectItem>

                          {/* African Currencies */}
                          <SelectItem value="NGN">NGN - Nigerian Naira (₦)</SelectItem>
                          <SelectItem value="ZAR">ZAR - South African Rand (R)</SelectItem>
                          <SelectItem value="GHS">GHS - Ghanaian Cedi (₵)</SelectItem>
                          <SelectItem value="KES">KES - Kenyan Shilling (KSh)</SelectItem>
                          <SelectItem value="TZS">TZS - Tanzanian Shilling (TSh)</SelectItem>
                          <SelectItem value="UGX">UGX - Ugandan Shilling (USh)</SelectItem>
                          <SelectItem value="EGP">EGP - Egyptian Pound (ج.م)</SelectItem>
                          <SelectItem value="MAD">MAD - Moroccan Dirham (DH)</SelectItem>
                          <SelectItem value="TND">TND - Tunisian Dinar (د.ت)</SelectItem>
                          <SelectItem value="XOF">XOF - West African CFA Franc (₣)</SelectItem>
                          <SelectItem value="XAF">XAF - Central African CFA Franc (₣)</SelectItem>
                          <SelectItem value="ETB">ETB - Ethiopian Birr (Br)</SelectItem>
                          <SelectItem value="RWF">RWF - Rwandan Franc (₣)</SelectItem>
                          <SelectItem value="ZMW">ZMW - Zambian Kwacha (ZK)</SelectItem>
                          <SelectItem value="BWP">BWP - Botswana Pula (P)</SelectItem>
                          <SelectItem value="NAD">NAD - Namibian Dollar (N$)</SelectItem>
                          <SelectItem value="SZL">SZL - Swazi Lilangeni (L)</SelectItem>
                          <SelectItem value="LSL">LSL - Lesotho Loti (L)</SelectItem>
                          <SelectItem value="MZN">MZN - Mozambican Metical (MT)</SelectItem>
                          <SelectItem value="AOA">AOA - Angolan Kwanza (Kz)</SelectItem>

                          {/* Middle East & Asia */}
                          <SelectItem value="AED">AED - UAE Dirham (د.إ)</SelectItem>
                          <SelectItem value="SAR">SAR - Saudi Riyal (ر.س)</SelectItem>
                          <SelectItem value="QAR">QAR - Qatari Riyal (ر.ق)</SelectItem>
                          <SelectItem value="KWD">KWD - Kuwaiti Dinar (د.ك)</SelectItem>
                          <SelectItem value="BHD">BHD - Bahraini Dinar (د.ب)</SelectItem>
                          <SelectItem value="OMR">OMR - Omani Rial (ر.ع.)</SelectItem>
                          <SelectItem value="JOD">JOD - Jordanian Dinar (د.ا)</SelectItem>
                          <SelectItem value="LBP">LBP - Lebanese Pound (ل.ل)</SelectItem>
                          <SelectItem value="TRY">TRY - Turkish Lira (₺)</SelectItem>
                          <SelectItem value="ILS">ILS - Israeli Shekel (₪)</SelectItem>
                          <SelectItem value="INR">INR - Indian Rupee (₹)</SelectItem>
                          <SelectItem value="PKR">PKR - Pakistani Rupee (₨)</SelectItem>
                          <SelectItem value="BDT">BDT - Bangladeshi Taka (৳)</SelectItem>
                          <SelectItem value="LKR">LKR - Sri Lankan Rupee (₨)</SelectItem>
                          <SelectItem value="SGD">SGD - Singapore Dollar (S$)</SelectItem>
                          <SelectItem value="MYR">MYR - Malaysian Ringgit (RM)</SelectItem>
                          <SelectItem value="THB">THB - Thai Baht (฿)</SelectItem>
                          <SelectItem value="IDR">IDR - Indonesian Rupiah (Rp)</SelectItem>
                          <SelectItem value="PHP">PHP - Philippine Peso (₱)</SelectItem>
                          <SelectItem value="VND">VND - Vietnamese Dong (₫)</SelectItem>
                          <SelectItem value="KRW">KRW - South Korean Won (₩)</SelectItem>

                          {/* Latin America */}
                          <SelectItem value="BRL">BRL - Brazilian Real (R$)</SelectItem>
                          <SelectItem value="ARS">ARS - Argentine Peso ($)</SelectItem>
                          <SelectItem value="CLP">CLP - Chilean Peso ($)</SelectItem>
                          <SelectItem value="COP">COP - Colombian Peso ($)</SelectItem>
                          <SelectItem value="PEN">PEN - Peruvian Sol (S/)</SelectItem>
                          <SelectItem value="MXN">MXN - Mexican Peso ($)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.currency && (
                        <p className="text-sm text-red-600">{errors.currency}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Primary Language</Label>
                      <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                        <SelectTrigger data-testid="select-language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español (Spanish)</SelectItem>
                          <SelectItem value="fr">Français (French)</SelectItem>
                          <SelectItem value="de">Deutsch (German)</SelectItem>
                          <SelectItem value="it">Italiano (Italian)</SelectItem>
                          <SelectItem value="pt">Português (Portuguese)</SelectItem>
                          <SelectItem value="ar">العربية (Arabic)</SelectItem>
                          <SelectItem value="sw">Kiswahili (Swahili)</SelectItem>
                          <SelectItem value="am">አማርኛ (Amharic)</SelectItem>
                          <SelectItem value="yo">Yorùbá (Yoruba)</SelectItem>
                          <SelectItem value="ig">Igbo</SelectItem>
                          <SelectItem value="ha">Hausa</SelectItem>
                          <SelectItem value="zu">isiZulu (Zulu)</SelectItem>
                          <SelectItem value="xh">isiXhosa (Xhosa)</SelectItem>
                          <SelectItem value="af">Afrikaans</SelectItem>
                          <SelectItem value="ru">Русский (Russian)</SelectItem>
                          <SelectItem value="ja">日本語 (Japanese)</SelectItem>
                          <SelectItem value="ko">한국어 (Korean)</SelectItem>
                          <SelectItem value="zh">中文 (Chinese)</SelectItem>
                          <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                          <SelectItem value="tr">Türkçe (Turkish)</SelectItem>
                          <SelectItem value="pl">Polski (Polish)</SelectItem>
                          <SelectItem value="nl">Nederlands (Dutch)</SelectItem>
                          <SelectItem value="sv">Svenska (Swedish)</SelectItem>
                          <SelectItem value="da">Dansk (Danish)</SelectItem>
                          <SelectItem value="no">Norsk (Norwegian)</SelectItem>
                          <SelectItem value="fi">Suomi (Finnish)</SelectItem>
                          <SelectItem value="he">עברית (Hebrew)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.language && (
                        <p className="text-sm text-red-600">{errors.language}</p>
                      )}
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
              ) : setupIntent === 'demo_setup_intent_test_mode' ? (
                // Demo mode - no payment collection needed
                <form onSubmit={handlePaymentSetup} className="space-y-6">
                  <Alert className="bg-blue-50 border-blue-200">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Demo Mode Active:</strong> Payment processing is not configured. 
                      Your registration will proceed without payment collection for testing purposes.
                    </AlertDescription>
                  </Alert>

                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Complete Registration</h3>
                    <p className="text-gray-600">
                      Your organization details have been validated. Click below to complete registration and start your trial.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={isLoading}
                      data-testid="button-complete-demo-registration"
                    >
                      {isLoading ? "Completing registration..." : "Complete Registration & Start Trial"}
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