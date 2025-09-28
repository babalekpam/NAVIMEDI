import { ArrowLeft, HelpCircle, Phone, Mail, MessageCircle, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo-head";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function HelpCenter() {
  const faqCategories = [
    {
      title: "Getting Started",
      questions: [
        "How do I set up my account?",
        "How do I add users to my organization?",
        "What are the system requirements?",
        "How do I import existing data?"
      ]
    },
    {
      title: "Billing & Payments",
      questions: [
        "How do I update my payment method?",
        "When will I be charged?",
        "How do I download invoices?",
        "What happens if my trial expires?"
      ]
    },
    {
      title: "Technical Support",
      questions: [
        "How do I reset my password?",
        "Why can't I access certain features?",
        "How do I troubleshoot login issues?",
        "How do I report a bug?"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <SEOHead
        title="NaviMED Help Center - Support & FAQ | Healthcare Software Documentation"
        description="Get help with NaviMED healthcare platform. Find answers to common questions, troubleshooting guides, billing support, and technical documentation for hospitals and pharmacies."
        keywords="NaviMED help, healthcare software support, medical platform FAQ, technical support, billing help, user documentation, troubleshooting guide"
        canonicalUrl="https://navimedi.org/support/help-center"
        ogImage="https://navimedi.org/images/navimed-support-og.jpg"
      />
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-3">
                <img src={navimedLogo} alt="NaviMed" className="h-10 w-10 rounded-lg object-contain" />
                <span className="text-2xl font-bold text-blue-600">NAVIMED</span>
              </div>
            </Link>
            <Link href="/"><Button variant="ghost"><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Button></Link>
          </div>
        </div>
      </header>

      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Find answers to your questions and get the support you need to succeed with NAVIMED.
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search help articles..." className="pl-10" />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
              <div className="space-y-8">
                {faqCategories.map((category, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{category.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {category.questions.map((question, idx) => (
                          <li key={idx}>
                            <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline">
                              {question}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-8">Contact Support</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <Phone className="w-8 h-8 text-blue-600 mb-2" />
                    <CardTitle className="text-lg">Phone Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-3">Call our support team directly</p>
                    <p className="font-semibold">314-472-3839</p>
                    <p className="text-sm text-gray-500">Mon-Fri, 8AM-6PM CST</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Mail className="w-8 h-8 text-emerald-600 mb-2" />
                    <CardTitle className="text-lg">Email Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-3">Send us a detailed message</p>
                    <p className="font-semibold">support@navimedi.com</p>
                    <p className="text-sm text-gray-500">Response within 2 hours</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <MessageCircle className="w-8 h-8 text-purple-600 mb-2" />
                    <CardTitle className="text-lg">Live Chat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-3">Chat with support agents</p>
                    <Button className="w-full">Start Live Chat</Button>
                    <p className="text-sm text-gray-500 mt-2">Available 24/7</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}