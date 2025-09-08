import { ArrowLeft, Clock, Users, AlertTriangle, CheckCircle, HelpCircle, Search, Settings, Wifi, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

export function TroubleshootingGuide() {
  const troubleshootingCategories = [
    {
      category: "Login & Authentication",
      icon: Settings,
      issues: [
        {
          problem: "Cannot log into the system",
          symptoms: ["Invalid credentials error", "Account locked message", "Page won't load"],
          solutions: [
            "Verify username and password are correct",
            "Check caps lock and ensure proper case",
            "Clear browser cache and cookies",
            "Try incognito/private browsing mode",
            "Contact administrator for account unlock"
          ],
          severity: "High"
        },
        {
          problem: "Session times out frequently", 
          symptoms: ["Automatic logout", "Lost work/data", "Login screen appears unexpectedly"],
          solutions: [
            "Check system session timeout settings",
            "Avoid prolonged inactivity",
            "Save work frequently",
            "Contact IT to adjust timeout settings"
          ],
          severity: "Medium"
        }
      ]
    },
    {
      category: "Patient Management",
      icon: Users,
      issues: [
        {
          problem: "Cannot find patient records",
          symptoms: ["Search returns no results", "Patient appears missing", "Incomplete search results"],
          solutions: [
            "Try different search criteria (name, DOB, MRN)",
            "Check for spelling variations or nicknames",
            "Verify patient exists in correct organization",
            "Check if patient was merged or transferred",
            "Contact administrator for data verification"
          ],
          severity: "High"
        },
        {
          problem: "Duplicate patient records",
          symptoms: ["Multiple entries for same patient", "Conflicting information", "Merge warnings"],
          solutions: [
            "Do not create new record if unsure",
            "Report duplicate to data management team",
            "Use patient merge functionality",
            "Verify with patient before proceeding"
          ],
          severity: "Medium"
        }
      ]
    },
    {
      category: "System Performance",
      icon: Database,
      issues: [
        {
          problem: "System running slowly",
          symptoms: ["Pages load slowly", "Delays in response", "Timeout errors"],
          solutions: [
            "Check internet connection speed",
            "Clear browser cache and restart",
            "Close unnecessary browser tabs",
            "Report persistent issues to IT support",
            "Use wired connection if possible"
          ],
          severity: "Medium"
        },
        {
          problem: "Features not working properly",
          symptoms: ["Buttons don't respond", "Forms won't submit", "Error messages appear"],
          solutions: [
            "Refresh the page (F5 or Ctrl+R)",
            "Log out and log back in",
            "Try different browser",
            "Disable browser extensions",
            "Contact support with error details"
          ],
          severity: "High"
        }
      ]
    }
  ];

  const commonErrors = [
    {
      code: "AUTH001",
      message: "Authentication failed",
      description: "Invalid username or password provided",
      solution: "Verify credentials and try again. Contact administrator if account is locked."
    },
    {
      code: "NET002", 
      message: "Network connection timeout",
      description: "Unable to connect to server within specified time limit",
      solution: "Check internet connection. Try refreshing the page or contact IT support."
    },
    {
      code: "DATA003",
      message: "Database connection error", 
      description: "Cannot establish connection to database server",
      solution: "This is a system-level issue. Contact technical support immediately."
    },
    {
      code: "PERM004",
      message: "Insufficient permissions",
      description: "User does not have required permissions for this action",
      solution: "Contact administrator to verify and adjust user permissions."
    }
  ];

  const faqItems = [
    {
      question: "How do I reset my password?",
      answer: "Click 'Forgot Password' on login screen, enter your email, and follow instructions sent to your email. Contact IT support if you don't receive the email within 15 minutes."
    },
    {
      question: "Why can't I access certain features?",
      answer: "Access is controlled by user roles and permissions. Contact your administrator to verify your role assignments and request additional permissions if needed."
    },
    {
      question: "How do I report a system bug or issue?",
      answer: "Use the built-in feedback system (Help → Report Issue) or email support@navimedi.com with detailed description, screenshots, and steps to reproduce the issue."
    },
    {
      question: "What browsers are supported?",
      answer: "NaviMED works best with Chrome, Firefox, Safari, and Edge (latest versions). Internet Explorer is not supported. Ensure JavaScript is enabled."
    },
    {
      question: "How do I save my work if the system is slow?",
      answer: "Save frequently using Ctrl+S. Most forms auto-save drafts every 2 minutes. Look for 'Draft saved' indicator. If system freezes, don't refresh until you see confirmation."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <Link href="/support/documentation">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Documentation
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Troubleshooting Guide & FAQ</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Quick Reference</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>All Users</span>
              </div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Problem Resolution
              </Badge>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search for solutions, error codes, or keywords..." 
                className="pl-10 max-w-md"
              />
            </div>
          </div>

          <Tabs defaultValue="troubleshooting" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
              <TabsTrigger value="errors">Error Codes</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="contact">Get Help</TabsTrigger>
            </TabsList>

            <TabsContent value="troubleshooting" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Common Issues & Solutions</CardTitle>
                  <CardDescription>
                    Step-by-step solutions for frequently encountered problems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {troubleshootingCategories.map((category, index) => {
                      const IconComponent = category.icon;
                      return (
                        <div key={index} className="border rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <IconComponent className="w-6 h-6 text-blue-600" />
                            <h3 className="text-lg font-semibold">{category.category}</h3>
                          </div>
                          
                          <div className="space-y-6">
                            {category.issues.map((issue, idx) => (
                              <div key={idx} className="border-l-4 border-gray-200 pl-6">
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="font-medium text-gray-900">{issue.problem}</h4>
                                  <Badge 
                                    variant={issue.severity === 'High' ? 'destructive' : 'secondary'}
                                    className="ml-2"
                                  >
                                    {issue.severity}
                                  </Badge>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-medium text-sm text-red-700 mb-2">Symptoms:</h5>
                                    <ul className="space-y-1">
                                      {issue.symptoms.map((symptom, sIdx) => (
                                        <li key={sIdx} className="flex items-center gap-2 text-sm">
                                          <AlertTriangle className="w-3 h-3 text-red-500" />
                                          {symptom}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h5 className="font-medium text-sm text-green-700 mb-2">Solutions:</h5>
                                    <ul className="space-y-1">
                                      {issue.solutions.map((solution, sIdx) => (
                                        <li key={sIdx} className="flex items-start gap-2 text-sm">
                                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                                          {solution}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Still Need Help?</h4>
                      <p className="text-blue-800 text-sm mb-3">
                        If you can't find a solution to your problem, don't hesitate to contact our support team.
                      </p>
                      <div className="flex gap-3">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Contact Support
                        </Button>
                        <Button size="sm" variant="outline" className="border-blue-300 text-blue-700">
                          Submit Bug Report
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="errors" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Error Code Reference</CardTitle>
                  <CardDescription>
                    Common error codes and their solutions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {commonErrors.map((error, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <Badge variant="outline" className="font-mono">
                                {error.code}
                              </Badge>
                              <h4 className="font-medium">{error.message}</h4>
                            </div>
                            <p className="text-sm text-gray-600">{error.description}</p>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 p-3 rounded border border-green-200">
                          <h5 className="font-medium text-green-800 mb-1">Solution:</h5>
                          <p className="text-green-700 text-sm">{error.solution}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Error Code Format</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>AUTH:</strong> Authentication and login related errors</p>
                      <p><strong>NET:</strong> Network and connectivity issues</p>
                      <p><strong>DATA:</strong> Database and data processing errors</p>
                      <p><strong>PERM:</strong> Permission and authorization errors</p>
                      <p><strong>SYS:</strong> System and application errors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Quick answers to common questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {faqItems.map((faq, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                        <p className="text-gray-600 text-sm">{faq.answer}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-800 mb-2">Can't Find Your Question?</h4>
                    <p className="text-yellow-700 text-sm mb-3">
                      Our knowledge base is constantly growing. If you have a question that's not covered here, 
                      please contact support and we'll add it to help future users.
                    </p>
                    <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700">
                      Suggest New FAQ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Get Additional Help</CardTitle>
                  <CardDescription>
                    Multiple ways to get the support you need
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Support Channels</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Settings className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-sm">Technical Support</h5>
                            <p className="text-xs text-gray-600">support@navimedi.com</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-sm">Training Support</h5>
                            <p className="text-xs text-gray-600">training@navimedi.com</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <HelpCircle className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-sm">General Inquiries</h5>
                            <p className="text-xs text-gray-600">info@navimedi.com</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Support Hours</h4>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Monday - Friday:</span>
                          <span>8:00 AM - 6:00 PM EST</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Saturday:</span>
                          <span>9:00 AM - 2:00 PM EST</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sunday:</span>
                          <span>Emergency support only</span>
                        </div>
                      </div>

                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <h5 className="font-medium text-red-800 mb-1">Emergency Support</h5>
                        <p className="text-red-700 text-sm">
                          For critical system outages affecting patient care, 
                          call emergency hotline: (555) 123-4567
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Before Contacting Support</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Please have the following information ready:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Your username and organization</li>
                        <li>Description of the issue and steps to reproduce</li>
                        <li>Any error messages or codes</li>
                        <li>Browser type and version</li>
                        <li>Screenshots if applicable</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}