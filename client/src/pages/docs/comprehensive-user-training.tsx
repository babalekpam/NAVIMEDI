import { ArrowLeft, Clock, Users, BookOpen, CheckCircle, AlertTriangle, Lightbulb, Target, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { TrainingEnrollmentForm } from "@/components/training-enrollment-form";

export default function ComprehensiveUserTraining() {
  const trainingModules = [
    {
      id: "foundation",
      title: "Foundation Level",
      description: "Essential skills for all healthcare staff",
      duration: "4-6 hours",
      modules: [
        "Platform Navigation & Interface",
        "Basic Patient Registration",
        "Security & Privacy Basics",
        "Documentation Standards"
      ]
    },
    {
      id: "intermediate",
      title: "Intermediate Level", 
      description: "Advanced features for daily operations",
      duration: "6-8 hours",
      modules: [
        "Advanced Patient Management",
        "Clinical Documentation",
        "Appointment Scheduling",
        "Prescription Management"
      ]
    },
    {
      id: "advanced",
      title: "Advanced Level",
      description: "Specialized workflows and optimization",
      duration: "8-10 hours", 
      modules: [
        "Laboratory Integration",
        "Billing & Insurance Claims",
        "Reporting & Analytics",
        "System Administration"
      ]
    }
  ];

  const roleBasedTraining = [
    {
      role: "Healthcare Providers",
      description: "Doctors, Nurses, Clinical Staff",
      focus: ["Patient Care", "Clinical Documentation", "Prescription Management", "Lab Orders"],
      duration: "8-12 hours"
    },
    {
      role: "Administrative Staff",
      description: "Reception, Billing, Scheduling",
      focus: ["Patient Registration", "Appointment Scheduling", "Insurance Processing", "Billing"],
      duration: "6-10 hours"
    },
    {
      role: "Pharmacy Staff",
      description: "Pharmacists, Pharmacy Technicians",
      focus: ["Prescription Processing", "Inventory Management", "Patient Counseling", "Insurance Claims"],
      duration: "6-8 hours"
    },
    {
      role: "Laboratory Staff",
      description: "Lab Technicians, Pathologists",
      focus: ["Order Processing", "Result Entry", "Quality Control", "Reporting"],
      duration: "5-7 hours"
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive User Training Program</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Full Program: 20-40 hours</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>All Skill Levels</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Comprehensive Program
              </Badge>
            </div>
            
            <div className="mb-8">
              <TrainingEnrollmentForm />
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="foundation">Foundation</TabsTrigger>
              <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="roles">Role-Based</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Training Program Overview
                  </CardTitle>
                  <CardDescription>
                    Structured learning path for mastering the NaviMED healthcare platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p>
                      This comprehensive training program is designed to ensure all healthcare staff can effectively 
                      use the NaviMED platform to improve patient care, streamline operations, and maintain compliance 
                      with healthcare regulations.
                    </p>
                    <h4>Program Structure</h4>
                    <ul>
                      <li><strong>Foundation Level:</strong> Essential skills for all users</li>
                      <li><strong>Intermediate Level:</strong> Advanced features for daily operations</li>
                      <li><strong>Advanced Level:</strong> Specialized workflows and optimization</li>
                      <li><strong>Role-Based Training:</strong> Customized modules for specific job functions</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-6">
                {trainingModules.map((module, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                      <Badge variant="secondary" className="w-fit">
                        {module.duration}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {module.modules.map((mod, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {mod}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Training Best Practices</h4>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Start with Foundation Level regardless of experience</li>
                        <li>• Complete hands-on exercises in a training environment</li>
                        <li>• Take regular breaks between modules</li>
                        <li>• Use real scenarios from your organization</li>
                        <li>• Schedule follow-up sessions for reinforcement</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="foundation" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Foundation Level Training</CardTitle>
                  <CardDescription>Essential skills for all NaviMED users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-lg font-semibold mb-3">Module 1: Platform Navigation & Interface</h3>
                    <p className="text-gray-600 mb-3">Duration: 60 minutes</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Learning Objectives:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          <li>Navigate the main dashboard and menu system</li>
                          <li>Understand user roles and permissions</li>
                          <li>Customize personal workspace and preferences</li>
                          <li>Use search and filter functions effectively</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Key Topics:</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h5 className="font-medium">Dashboard Overview</h5>
                            <ul className="text-gray-600 ml-4 space-y-1">
                              <li>• Main navigation menu</li>
                              <li>• Quick access toolbar</li>
                              <li>• Notification center</li>
                              <li>• User profile settings</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium">User Interface</h5>
                            <ul className="text-gray-600 ml-4 space-y-1">
                              <li>• Layout and design principles</li>
                              <li>• Icon meanings and functions</li>
                              <li>• Keyboard shortcuts</li>
                              <li>• Mobile responsiveness</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h5 className="font-medium text-yellow-800 mb-1">Hands-On Exercise</h5>
                        <p className="text-yellow-700 text-sm">
                          Complete a guided tour of the platform, customizing your dashboard and exploring 
                          each main menu section. Practice using search functions to find sample patient records.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-lg font-semibold mb-3">Module 2: Basic Patient Registration</h3>
                    <p className="text-gray-600 mb-3">Duration: 90 minutes</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Learning Objectives:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          <li>Register new patients accurately and efficiently</li>
                          <li>Collect and verify insurance information</li>
                          <li>Understand data validation and required fields</li>
                          <li>Handle special registration scenarios</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Registration Workflow:</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                            <div>
                              <h5 className="font-medium">Patient Demographics</h5>
                              <p className="text-sm text-gray-600">Name, DOB, address, contact information</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                            <div>
                              <h5 className="font-medium">Insurance Verification</h5>
                              <p className="text-sm text-gray-600">Primary/secondary insurance, policy verification</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                            <div>
                              <h5 className="font-medium">Emergency Contacts</h5>
                              <p className="text-sm text-gray-600">Emergency contact information and relationships</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
                            <div>
                              <h5 className="font-medium">Profile Completion</h5>
                              <p className="text-sm text-gray-600">Medical history, allergies, current medications</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-medium text-green-800 mb-1">Practice Scenario</h5>
                        <p className="text-green-700 text-sm">
                          Register three different patient types: new patient with insurance, 
                          emergency walk-in without insurance, and pediatric patient with guardian information.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-6">
                    <h3 className="text-lg font-semibold mb-3">Module 3: Security & Privacy Basics</h3>
                    <p className="text-gray-600 mb-3">Duration: 75 minutes</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">HIPAA Compliance Essentials:</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-red-600">Critical Requirements</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Minimum necessary access</li>
                              <li>• Secure password practices</li>
                              <li>• Workstation security</li>
                              <li>• Incident reporting procedures</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-green-600">Best Practices</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Regular password updates</li>
                              <li>• Screen privacy awareness</li>
                              <li>• Secure communication methods</li>
                              <li>• Audit trail understanding</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                          <div>
                            <h5 className="font-medium text-red-800 mb-1">Security Violations</h5>
                            <p className="text-red-700 text-sm mb-2">Common violations to avoid:</p>
                            <ul className="text-red-700 text-sm space-y-1">
                              <li>• Sharing login credentials</li>
                              <li>• Accessing records without authorization</li>
                              <li>• Leaving workstations unlocked</li>
                              <li>• Discussing patient information in public areas</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-6">
                    <h3 className="text-lg font-semibold mb-3">Module 4: Documentation Standards</h3>
                    <p className="text-gray-600 mb-3">Duration: 90 minutes</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Documentation Principles:</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-orange-500 mt-0.5" />
                            <div>
                              <h5 className="font-medium">Accuracy & Completeness</h5>
                              <p className="text-sm text-gray-600">Ensure all information is accurate, complete, and legible</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-orange-500 mt-0.5" />
                            <div>
                              <h5 className="font-medium">Timeliness</h5>
                              <p className="text-sm text-gray-600">Document information as close to real-time as possible</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-orange-500 mt-0.5" />
                            <div>
                              <h5 className="font-medium">Objectivity</h5>
                              <p className="text-sm text-gray-600">Use factual, objective language without personal opinions</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h5 className="font-medium text-orange-800 mb-2">Documentation Templates</h5>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h6 className="font-medium">Clinical Notes</h6>
                            <ul className="text-orange-700 space-y-1">
                              <li>• SOAP note format</li>
                              <li>• Progress notes</li>
                              <li>• Consultation reports</li>
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-medium">Administrative Notes</h6>
                            <ul className="text-orange-700 space-y-1">
                              <li>• Registration updates</li>
                              <li>• Communication logs</li>
                              <li>• Insurance changes</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-green-900 mb-3">Foundation Level Assessment</h3>
                  <p className="text-green-800 text-sm mb-4">
                    Complete all four modules and pass the assessment with 80% or higher to advance to Intermediate Level.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Platform navigation proficiency test</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Patient registration simulation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Security compliance quiz</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Documentation standards review</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="intermediate" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Intermediate Level Training</CardTitle>
                  <CardDescription>Advanced features for daily healthcare operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Module 5: Advanced Patient Management</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          Complex patient histories and multiple conditions
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          Care plan development and coordination
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          Patient portal management and communication
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          Family member and caregiver access
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Module 6: Clinical Documentation</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          Advanced SOAP note templates
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          ICD-10 and CPT coding integration
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          Voice recognition and documentation tools
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          Clinical decision support systems
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Level Training</CardTitle>
                  <CardDescription>Specialized workflows and system optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Advanced Training Modules</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-medium">Module 9: Laboratory Integration</h4>
                          <p className="text-sm text-gray-600">
                            Advanced lab order management, result interpretation, and integration 
                            with external laboratory systems.
                          </p>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-medium">Module 10: Billing & Insurance Claims</h4>
                          <p className="text-sm text-gray-600">
                            Complex billing scenarios, insurance claim processing, denial management, 
                            and revenue cycle optimization.
                          </p>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-medium">Module 11: Reporting & Analytics</h4>
                          <p className="text-sm text-gray-600">
                            Custom report generation, data analysis, performance metrics, 
                            and business intelligence dashboards.
                          </p>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-medium">Module 12: System Administration</h4>
                          <p className="text-sm text-gray-600">
                            User management, system configuration, security settings, 
                            and organizational customization.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Role-Based Training Tracks</CardTitle>
                  <CardDescription>Specialized training for different healthcare roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {roleBasedTraining.map((track, index) => (
                      <div key={index} className="border rounded-lg p-6">
                        <div className="flex items-start gap-4">
                          <User className="w-6 h-6 text-blue-500 mt-1" />
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">{track.role}</h3>
                            <p className="text-gray-600 text-sm mb-3">{track.description}</p>
                            <div className="flex items-center gap-4 mb-4">
                              <Badge variant="outline">{track.duration}</Badge>
                              <span className="text-sm text-gray-500">
                                {track.focus.length} specialized modules
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Training Focus Areas:</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {track.focus.map((area, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm">{area}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to Start Training?</h3>
                <p className="text-blue-800 text-sm mb-4">
                  Contact your system administrator or training coordinator to enroll in the 
                  comprehensive training program.
                </p>
                <div className="flex justify-center gap-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Enroll in Foundation Level
                  </Button>
                  <Button variant="outline" className="border-blue-300 text-blue-700">
                    Download Training Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}