import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Shield, 
  Globe, 
  Palette, 
  Wifi, 
  Users, 
  Database,
  Phone,
  Mail,
  ArrowLeft
} from "lucide-react";

const pricingPlans = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small clinics and practices",
    monthlyPrice: 49.99,
    yearlyPrice: 510.99,
    savings: "17%",
    features: {
      maxUsers: 5,
      maxPatients: 100,
      storageGb: 1,
      apiCalls: 1000,
      multiLanguage: false,
      whiteLabel: false,
      offline: false,
      advancedReports: false,
      prioritySupport: false,
      customIntegrations: false
    },
    color: "border-blue-200",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    popular: false
  },
  {
    id: "professional", 
    name: "Professional",
    description: "Ideal for growing healthcare organizations",
    monthlyPrice: 119.99,
    yearlyPrice: 1210.99,
    savings: "17%",
    features: {
      maxUsers: 25,
      maxPatients: 1000,
      storageGb: 10,
      apiCalls: 10000,
      multiLanguage: true,
      whiteLabel: false,
      offline: true,
      advancedReports: true,
      prioritySupport: false,
      customIntegrations: false
    },
    color: "border-emerald-200",
    buttonColor: "bg-emerald-600 hover:bg-emerald-700",
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise", 
    description: "For large hospitals and health systems",
    monthlyPrice: 319.99,
    yearlyPrice: 3210.99,
    savings: "17%",
    features: {
      maxUsers: 100,
      maxPatients: 10000,
      storageGb: 100,
      apiCalls: 100000,
      multiLanguage: true,
      whiteLabel: false,
      offline: true,
      advancedReports: true,
      prioritySupport: true,
      customIntegrations: true
    },
    color: "border-purple-200",
    buttonColor: "bg-purple-600 hover:bg-purple-700",
    popular: false
  },
  {
    id: "white_label",
    name: "White Label",
    description: "Full customization and branding control",
    monthlyPrice: 1019.99,
    yearlyPrice: 10210.99,
    savings: "17%",
    features: {
      maxUsers: "Unlimited",
      maxPatients: "Unlimited", 
      storageGb: "Unlimited",
      apiCalls: "Unlimited",
      multiLanguage: true,
      whiteLabel: true,
      offline: true,
      advancedReports: true,
      prioritySupport: true,
      customIntegrations: true
    },
    color: "border-gold-200",
    buttonColor: "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700",
    popular: false
  }
];

const features = [
  {
    category: "Core Features",
    items: [
      { name: "Patient Management", icon: Users },
      { name: "Appointment Scheduling", icon: Users },
      { name: "Prescription Management", icon: Users },
      { name: "Billing & Claims", icon: Users },
      { name: "Lab Integration", icon: Users },
      { name: "Basic Reports", icon: Users }
    ]
  },
  {
    category: "Advanced Features", 
    items: [
      { name: "Multi-Language Support", icon: Globe, requiresPro: true },
      { name: "Offline Mode", icon: Wifi, requiresPro: true },
      { name: "Advanced Analytics", icon: Database, requiresPro: true },
      { name: "White Label Branding", icon: Palette, requiresWhiteLabel: true },
      { name: "Custom Integrations", icon: Zap, requiresEnterprise: true },
      { name: "Priority Support", icon: Phone, requiresEnterprise: true }
    ]
  }
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-emerald-700 to-blue-700 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Flexible pricing for healthcare organizations of all sizes. Start with a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isYearly ? 'font-semibold text-emerald-600' : 'text-slate-600'}`}>
              Monthly
            </span>
            <Switch 
              checked={isYearly} 
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-emerald-600"
            />
            <span className={`text-sm ${isYearly ? 'font-semibold text-emerald-600' : 'text-slate-600'}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge className="bg-emerald-100 text-emerald-800 ml-2">
                Save up to 17%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pricingPlans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.color} ${plan.popular ? 'ring-2 ring-emerald-500' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-emerald-600 text-white px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <p className="text-sm text-slate-600">{plan.description}</p>
                
                <div className="mt-4">
                  <div className="text-3xl font-bold">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    <span className="text-base font-normal text-slate-600">
                      {isYearly ? '/year' : '/month'}
                    </span>
                  </div>
                  {isYearly && (
                    <div className="text-sm text-emerald-600 font-medium">
                      Save {plan.savings} vs monthly
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Core Features */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm">
                      {typeof plan.features.maxUsers === 'number' ? `Up to ${plan.features.maxUsers} users` : plan.features.maxUsers}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm">
                      {typeof plan.features.maxPatients === 'number' ? `${plan.features.maxPatients} patients` : plan.features.maxPatients}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm">
                      {typeof plan.features.storageGb === 'number' ? `${plan.features.storageGb}GB storage` : plan.features.storageGb}
                    </span>
                  </div>
                </div>

                <hr className="my-4" />

                {/* Feature List */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {plan.features.multiLanguage ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-sm">Multi-language support</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {plan.features.offline ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-sm">Offline mode</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {plan.features.whiteLabel ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-sm">White label branding</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {plan.features.prioritySupport ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-sm">Priority support</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/register" className="block">
                    <Button className={`w-full ${plan.buttonColor}`}>
                      Start Free Trial
                    </Button>
                  </Link>
                  <p className="text-xs text-center text-slate-500 mt-2">
                    14-day free trial • No credit card required
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Features</th>
                  <th className="text-center py-3 px-4">Starter</th>
                  <th className="text-center py-3 px-4">Professional</th>
                  <th className="text-center py-3 px-4">Enterprise</th>
                  <th className="text-center py-3 px-4">White Label</th>
                </tr>
              </thead>
              <tbody>
                {features.map((category) => (
                  <React.Fragment key={category.category}>
                    <tr>
                      <td colSpan={5} className="py-4 px-4 font-semibold text-slate-700 bg-slate-50">
                        {category.category}
                      </td>
                    </tr>
                    {category.items.map((feature, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4 flex items-center gap-2">
                          <feature.icon className="w-4 h-4 text-slate-600" />
                          {feature.name}
                        </td>
                        <td className="text-center py-3 px-4">
                          {!feature.requiresPro && !feature.requiresEnterprise && !feature.requiresWhiteLabel ? (
                            <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-slate-400 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {!feature.requiresEnterprise && !feature.requiresWhiteLabel ? (
                            <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-slate-400 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {!feature.requiresWhiteLabel ? (
                            <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-slate-400 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">Can I change plans later?</h3>
              <p className="text-slate-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate the billing.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">What happens to my data if I cancel?</h3>
              <p className="text-slate-600">Your data remains accessible for 30 days after cancellation. You can export your data at any time during this period.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">Do you offer custom enterprise solutions?</h3>
              <p className="text-slate-600">Yes, we offer custom solutions for large healthcare systems. Contact our sales team to discuss your specific requirements.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">Is my data secure and HIPAA compliant?</h3>
              <p className="text-slate-600">Yes, all plans include enterprise-grade security, encryption, and full HIPAA compliance with business associate agreements.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl text-slate-600 mb-8">
            Join thousands of healthcare organizations using NAVIMED
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 px-8">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}