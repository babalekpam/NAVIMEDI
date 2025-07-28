import { PublicHeader } from "@/components/layout/public-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Phone, 
  Mail, 
  Clock,
  MapPin,
  MessageCircle,
  Send,
  CheckCircle
} from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/30">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Get in Touch
              </span>
              <br />
              <span className="text-slate-900">We're Here to Help</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Ready to transform your healthcare operations? Our team of experts is standing by to help you get started with NAVIMED.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-slate-900">
                Let's Build the Future of Healthcare Together
              </h2>
              <p className="text-xl text-slate-600 mb-12 leading-relaxed">
                Our healthcare technology experts are ready to help you implement 
                the perfect solution for your organization's unique needs.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Sales Team</div>
                    <div className="text-slate-600">314-472-3839</div>
                    <div className="text-sm text-slate-500">Monday - Friday, 8 AM - 6 PM CST</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Enterprise Sales</div>
                    <div className="text-slate-600">info@argilette.com</div>
                    <div className="text-sm text-slate-500">For custom solutions and partnerships</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">24/7 Technical Support</div>
                    <div className="text-slate-600">Available for all Enterprise customers</div>
                    <div className="text-sm text-slate-500">Emergency support included</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">ARGILETTE Labs</div>
                    <div className="text-slate-600">Healthcare Technology Division</div>
                    <div className="text-sm text-slate-500">Global healthcare innovation</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-12 p-6 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
                <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/register">
                    <Button className="w-full justify-start bg-emerald-600 hover:bg-emerald-700">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Start Free Trial - No Credit Card Required
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" className="w-full justify-start border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      View Pricing Plans
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <Card className="bg-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Schedule Your Personal Demo</CardTitle>
                <p className="text-slate-600">
                  Fill out the form below and we'll get back to you within 24 hours to schedule your personalized NAVIMED demonstration.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <input 
                      type="text" 
                      required
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                    <input 
                      type="text" 
                      required
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                      placeholder="Smith"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Work Email *</label>
                  <input 
                    type="email" 
                    required
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                    placeholder="john.smith@hospital.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Organization *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                    placeholder="Metro General Hospital"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Organization Type *</label>
                  <select 
                    required
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Select organization type</option>
                    <option value="hospital">Hospital</option>
                    <option value="clinic">Clinic</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="health-system">Health System</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Number of Users</label>
                  <select className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    <option value="">Select expected users</option>
                    <option value="1-10">1-10 users</option>
                    <option value="11-50">11-50 users</option>
                    <option value="51-100">51-100 users</option>
                    <option value="101-500">101-500 users</option>
                    <option value="500+">500+ users</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">How can we help you?</label>
                  <textarea 
                    rows={4}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                    placeholder="Tell us about your current challenges and what you're looking for in a healthcare management solution..."
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="newsletter" 
                    className="mt-1"
                  />
                  <label htmlFor="newsletter" className="text-sm text-slate-600">
                    I'd like to receive updates about NAVIMED features, healthcare industry insights, and best practices.
                  </label>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 py-3 text-lg">
                  Schedule Demo
                  <Send className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-xs text-slate-500 text-center">
                  By submitting this form, you agree to our privacy policy. We'll never share your information with third parties.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Quick answers to common questions about NAVIMED implementation and support
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">How quickly can we get started?</h3>
                <p className="text-slate-600">
                  Most organizations are up and running within 24-48 hours. Our automated setup process handles initial configuration, and our support team provides onboarding assistance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Do you offer data migration assistance?</h3>
                <p className="text-slate-600">
                  Yes! Our Professional and Enterprise plans include comprehensive data migration support from your existing EHR or practice management system.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Is training included?</h3>
                <p className="text-slate-600">
                  All plans include access to our comprehensive video tutorial library, documentation, and basic training. Enterprise customers receive personalized training sessions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Can I customize the platform?</h3>
                <p className="text-slate-600">
                  Yes! Professional and higher plans include white-label branding options, custom workflows, and API access for integrations with your existing systems.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">What about compliance and security?</h3>
                <p className="text-slate-600">
                  NAVIMED is HIPAA compliant, SOC 2 Type II certified, and follows all major healthcare security standards. We handle compliance so you can focus on patient care.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Do you offer custom enterprise solutions?</h3>
                <p className="text-slate-600">
                  Absolutely! Our Enterprise team works with large health systems to create custom solutions, integrations, and deployment strategies that fit your specific needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}