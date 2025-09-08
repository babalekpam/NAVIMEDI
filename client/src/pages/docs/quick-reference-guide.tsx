import { ArrowLeft, Clock, Users, Download, Search, Keyboard, User, Calendar, FileText, Pill, TestTube, CreditCard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

export default function QuickReferenceGuide() {
  const keyboardShortcuts = [
    { action: "Quick Search", shortcut: "Ctrl + K", description: "Open global search dialog" },
    { action: "New Patient", shortcut: "Ctrl + N", description: "Create new patient record" },
    { action: "Save Current Form", shortcut: "Ctrl + S", description: "Save current form/document" },
    { action: "Print Current Page", shortcut: "Ctrl + P", description: "Print current page or report" },
    { action: "Go to Dashboard", shortcut: "Alt + D", description: "Navigate to main dashboard" },
    { action: "Logout", shortcut: "Ctrl + Alt + L", description: "Logout from current session" },
    { action: "Help Center", shortcut: "F1", description: "Open help center" },
    { action: "Refresh Data", shortcut: "F5", description: "Refresh current page data" }
  ];

  const quickActions = [
    {
      category: "Patient Management",
      icon: User,
      actions: [
        { name: "Register New Patient", path: "Patients → New Registration", time: "3-5 min" },
        { name: "Search Patient Records", path: "Patients → Search", time: "< 1 min" },
        { name: "Update Patient Info", path: "Patient Profile → Edit", time: "2-3 min" },
        { name: "View Medical History", path: "Patient Profile → History", time: "< 1 min" }
      ]
    },
    {
      category: "Appointments",
      icon: Calendar,
      actions: [
        { name: "Schedule Appointment", path: "Calendar → New Appointment", time: "2-3 min" },
        { name: "Check Availability", path: "Calendar → View Schedule", time: "< 1 min" },
        { name: "Reschedule Appointment", path: "Calendar → Edit Appointment", time: "1-2 min" },
        { name: "Cancel Appointment", path: "Calendar → Cancel", time: "< 1 min" }
      ]
    },
    {
      category: "Clinical Documentation",
      icon: FileText,
      actions: [
        { name: "Create SOAP Note", path: "Clinical → New Note", time: "5-10 min" },
        { name: "Update Treatment Plan", path: "Clinical → Treatment Plan", time: "3-5 min" },
        { name: "Review Lab Results", path: "Clinical → Lab Results", time: "2-3 min" },
        { name: "Sign Documents", path: "Clinical → Pending Signatures", time: "1-2 min" }
      ]
    },
    {
      category: "Prescriptions",
      icon: Pill,
      actions: [
        { name: "Create E-Prescription", path: "Prescriptions → New", time: "3-4 min" },
        { name: "Check Drug Interactions", path: "Prescriptions → Interaction Check", time: "< 1 min" },
        { name: "Refill Request", path: "Prescriptions → Refills", time: "1-2 min" },
        { name: "View Prescription History", path: "Patient → Medications", time: "< 1 min" }
      ]
    }
  ];

  const commonCodes = [
    {
      category: "ICD-10 Diagnosis Codes (Most Common)",
      codes: [
        { code: "Z00.00", description: "Encounter for general adult medical exam" },
        { code: "I10", description: "Essential hypertension" },
        { code: "E11.9", description: "Type 2 diabetes mellitus without complications" },
        { code: "M79.3", description: "Panniculitis, unspecified" },
        { code: "J06.9", description: "Acute upper respiratory infection, unspecified" }
      ]
    },
    {
      category: "CPT Procedure Codes (Most Common)",
      codes: [
        { code: "99213", description: "Office visit, established patient, low complexity" },
        { code: "99214", description: "Office visit, established patient, moderate complexity" },
        { code: "99215", description: "Office visit, established patient, high complexity" },
        { code: "99203", description: "Office visit, new patient, low complexity" },
        { code: "99204", description: "Office visit, new patient, moderate complexity" }
      ]
    }
  ];

  const systemStatus = [
    { indicator: "Green", meaning: "System operating normally", action: "Continue normal operations" },
    { indicator: "Yellow", meaning: "Minor issues or maintenance", action: "Save work frequently, expect delays" },
    { indicator: "Red", meaning: "System outage or major issues", action: "Contact support immediately" },
    { indicator: "Blue", meaning: "Scheduled maintenance", action: "Plan accordingly, save work" }
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Quick Reference Guide & Cheat Sheets</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Quick Reference</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>All Users</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Printable Guides
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="shortcuts" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
              <TabsTrigger value="actions">Quick Actions</TabsTrigger>
              <TabsTrigger value="codes">Medical Codes</TabsTrigger>
              <TabsTrigger value="status">System Status</TabsTrigger>
              <TabsTrigger value="downloads">Downloads</TabsTrigger>
            </TabsList>

            <TabsContent value="shortcuts" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Keyboard className="w-5 h-5" />
                    Keyboard Shortcuts
                  </CardTitle>
                  <CardDescription>
                    Speed up your workflow with these keyboard shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Navigation & General</h4>
                      {keyboardShortcuts.slice(0, 4).map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-sm">{shortcut.action}</span>
                            <p className="text-xs text-gray-600">{shortcut.description}</p>
                          </div>
                          <Badge variant="outline" className="font-mono text-xs">
                            {shortcut.shortcut}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">System & Help</h4>
                      {keyboardShortcuts.slice(4).map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-sm">{shortcut.action}</span>
                            <p className="text-xs text-gray-600">{shortcut.description}</p>
                          </div>
                          <Badge variant="outline" className="font-mono text-xs">
                            {shortcut.shortcut}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Pro Tips</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Use Ctrl+K for universal search - works from any page</li>
                      <li>• Hold Shift while clicking navigation links to open in new tab</li>
                      <li>• Use Tab key to navigate between form fields quickly</li>
                      <li>• Press Escape to cancel most dialogs and forms</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Common Actions Quick Reference</CardTitle>
                  <CardDescription>
                    Step-by-step paths for frequently performed tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {quickActions.map((category, index) => {
                      const IconComponent = category.icon;
                      return (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-4">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                            <h4 className="font-medium">{category.category}</h4>
                          </div>
                          
                          <div className="space-y-3">
                            {category.actions.map((action, idx) => (
                              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-medium text-sm">{action.name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {action.time}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 font-mono">{action.path}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">Efficiency Tips</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium">Time-Saving Habits</h5>
                        <ul className="text-green-800 space-y-1">
                          <li>• Use templates for common documentation</li>
                          <li>• Bookmark frequently used pages</li>
                          <li>• Keep patient search window open</li>
                          <li>• Use auto-complete features</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium">Workflow Optimization</h5>
                        <ul className="text-green-800 space-y-1">
                          <li>• Group similar tasks together</li>
                          <li>• Review pending items at start of shift</li>
                          <li>• Use batch operations when available</li>
                          <li>• Save drafts frequently</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="codes" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Coding Quick Reference</CardTitle>
                  <CardDescription>
                    Common ICD-10 and CPT codes for quick lookup
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {commonCodes.map((category, index) => (
                      <div key={index}>
                        <h4 className="font-medium text-gray-900 mb-3">{category.category}</h4>
                        <div className="space-y-2">
                          {category.codes.map((code, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              <Badge variant="outline" className="font-mono font-bold">
                                {code.code}
                              </Badge>
                              <span className="text-sm flex-1">{code.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h5 className="font-medium text-yellow-800 mb-2">Coding Best Practices</h5>
                      <ul className="text-yellow-700 text-sm space-y-1">
                        <li>• Always use the most specific code available</li>
                        <li>• Verify codes with current year updates</li>
                        <li>• Include all relevant diagnoses</li>
                        <li>• Check for required modifiers</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h5 className="font-medium text-red-800 mb-2">Common Coding Errors</h5>
                      <ul className="text-red-700 text-sm space-y-1">
                        <li>• Using outdated or invalid codes</li>
                        <li>• Missing required additional diagnoses</li>
                        <li>• Incorrect modifier usage</li>
                        <li>• Insufficient documentation support</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>System Status Indicators</CardTitle>
                  <CardDescription>
                    Understanding system status and appropriate responses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemStatus.map((status, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className={`w-4 h-4 rounded-full ${
                          status.indicator === 'Green' ? 'bg-green-500' :
                          status.indicator === 'Yellow' ? 'bg-yellow-500' :
                          status.indicator === 'Red' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium">{status.indicator} Status</span>
                            <span className="text-sm text-gray-600">{status.meaning}</span>
                          </div>
                          <p className="text-sm text-gray-700">
                            <strong>Action:</strong> {status.action}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                    <h4 className="font-medium mb-3">Status Check Locations</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium">In-App Indicators</h5>
                        <ul className="text-gray-600 space-y-1">
                          <li>• Top navigation bar (system status icon)</li>
                          <li>• Dashboard health widget</li>
                          <li>• Footer status indicator</li>
                          <li>• Notification panel alerts</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium">External Resources</h5>
                        <ul className="text-gray-600 space-y-1">
                          <li>• Status page: status.navimedi.com</li>
                          <li>• Support email notifications</li>
                          <li>• Mobile app push notifications</li>
                          <li>• Social media updates (@NaviMedHealth)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="downloads" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Downloadable Quick Reference Materials
                  </CardTitle>
                  <CardDescription>
                    Printable guides and cheat sheets for offline reference
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Essential Quick Guides</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium text-sm">Keyboard Shortcuts Card</span>
                            <p className="text-xs text-gray-600">Printable reference card (PDF)</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium text-sm">Common Medical Codes</span>
                            <p className="text-xs text-gray-600">ICD-10 & CPT reference (PDF)</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium text-sm">Quick Actions Flowchart</span>
                            <p className="text-xs text-gray-600">Visual workflow guide (PDF)</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium text-sm">Troubleshooting Checklist</span>
                            <p className="text-xs text-gray-600">Problem-solving guide (PDF)</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Role-Specific Guides</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium text-sm">Physician Quick Reference</span>
                            <p className="text-xs text-gray-600">Clinical workflow shortcuts</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium text-sm">Nurse Station Guide</span>
                            <p className="text-xs text-gray-600">Patient care workflows</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium text-sm">Administrative Staff Guide</span>
                            <p className="text-xs text-gray-600">Registration & billing</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium text-sm">Pharmacy Quick Reference</span>
                            <p className="text-xs text-gray-600">Prescription workflows</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Usage Recommendations</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium">Print & Display</h5>
                        <ul className="text-blue-800 space-y-1">
                          <li>• Post keyboard shortcuts near workstations</li>
                          <li>• Keep medical codes reference handy</li>
                          <li>• Share quick guides with new team members</li>
                          <li>• Update guides when system changes</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium">Digital Use</h5>
                        <ul className="text-blue-800 space-y-1">
                          <li>• Save PDFs to desktop for quick access</li>
                          <li>• Bookmark this page for online reference</li>
                          <li>• Use mobile devices for offline access</li>
                          <li>• Share links with colleagues</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download Complete Reference Pack
                    </Button>
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