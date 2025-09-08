import { ArrowLeft, Clock, Users, Play, CheckCircle, ArrowRight, User, Stethoscope, Pill, TestTube, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

export function WorkflowTrainingModules() {
  const workflows = [
    {
      id: "patient-admission",
      title: "Patient Admission Workflow",
      icon: User,
      duration: "45 minutes",
      difficulty: "Beginner",
      description: "Complete patient admission process from registration to care plan creation",
      steps: [
        "Patient arrival and registration",
        "Insurance verification and eligibility check",
        "Medical history collection and review",
        "Initial assessment and vital signs",
        "Care team assignment and care plan initiation",
        "Documentation and communication setup"
      ],
      roles: ["Reception Staff", "Nurses", "Physicians"]
    },
    {
      id: "clinical-documentation",
      title: "Clinical Documentation Workflow",
      icon: Stethoscope,
      duration: "60 minutes", 
      difficulty: "Intermediate",
      description: "Comprehensive clinical documentation from patient encounter to discharge summary",
      steps: [
        "Patient encounter preparation and review",
        "SOAP note creation and documentation",
        "Diagnosis coding (ICD-10) and procedure codes (CPT)",
        "Treatment plan documentation and orders",
        "Provider authentication and signature",
        "Quality review and submission"
      ],
      roles: ["Physicians", "Nurse Practitioners", "Clinical Staff"]
    },
    {
      id: "prescription-management",
      title: "Prescription Management Workflow", 
      icon: Pill,
      duration: "50 minutes",
      difficulty: "Intermediate",
      description: "End-to-end prescription process from prescribing to pharmacy fulfillment",
      steps: [
        "Medication review and allergy checks",
        "Electronic prescription creation",
        "Drug interaction and formulary verification",
        "Prior authorization handling (if required)",
        "Pharmacy routing and transmission",
        "Patient notification and pickup coordination"
      ],
      roles: ["Physicians", "Pharmacists", "Pharmacy Technicians"]
    },
    {
      id: "lab-order-processing",
      title: "Laboratory Order Processing",
      icon: TestTube,
      duration: "40 minutes",
      difficulty: "Intermediate", 
      description: "Laboratory test ordering, processing, and result management workflow",
      steps: [
        "Laboratory test selection and ordering",
        "Patient preparation and scheduling",
        "Specimen collection and processing",
        "Laboratory analysis and quality control",
        "Result review and clinical correlation",
        "Provider notification and patient communication"
      ],
      roles: ["Physicians", "Lab Technicians", "Nurses"]
    },
    {
      id: "billing-insurance",
      title: "Billing & Insurance Claims",
      icon: CreditCard,
      duration: "70 minutes",
      difficulty: "Advanced",
      description: "Complete revenue cycle from service delivery to payment collection",
      steps: [
        "Charge capture and coding verification",
        "Insurance claim preparation and submission",
        "Claim status monitoring and follow-up",
        "Denial management and resubmission",
        "Payment posting and reconciliation",
        "Patient billing and collection procedures"
      ],
      roles: ["Billing Staff", "Medical Coders", "Revenue Cycle Managers"]
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Workflow-Based Training Modules</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>4-8 hours per workflow</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Role-Specific Training</span>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Interactive Training
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="admission">Admission</TabsTrigger>
              <TabsTrigger value="clinical">Clinical</TabsTrigger>
              <TabsTrigger value="pharmacy">Pharmacy</TabsTrigger>
              <TabsTrigger value="laboratory">Laboratory</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Training Program Overview</CardTitle>
                  <CardDescription>
                    Learn healthcare workflows through hands-on, step-by-step training modules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p>
                      These workflow training modules provide comprehensive, hands-on training for core 
                      healthcare processes within the NaviMED platform. Each module follows real-world 
                      scenarios and includes interactive exercises, checkpoints, and role-specific guidance.
                    </p>
                    <h4>Training Approach</h4>
                    <ul>
                      <li><strong>Scenario-Based:</strong> Real patient cases and situations</li>
                      <li><strong>Step-by-Step:</strong> Detailed guidance through each process</li>
                      <li><strong>Interactive:</strong> Hands-on practice with system navigation</li>
                      <li><strong>Role-Specific:</strong> Customized content for different healthcare roles</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflows.map((workflow, index) => {
                  const IconComponent = workflow.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <IconComponent className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{workflow.title}</CardTitle>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">{workflow.duration}</Badge>
                              <Badge variant="outline" className="text-xs">{workflow.difficulty}</Badge>
                            </div>
                          </div>
                        </div>
                        <CardDescription className="text-sm">{workflow.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-sm mb-2">Key Steps:</h5>
                            <ul className="space-y-1">
                              {workflow.steps.slice(0, 3).map((step, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-xs">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  {step}
                                </li>
                              ))}
                              {workflow.steps.length > 3 && (
                                <li className="text-xs text-gray-500 ml-5">
                                  +{workflow.steps.length - 3} more steps
                                </li>
                              )}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm mb-2">Target Roles:</h5>
                            <div className="flex flex-wrap gap-1">
                              {workflow.roles.map((role, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="admission" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Patient Admission Workflow Training
                  </CardTitle>
                  <CardDescription>
                    Master the complete patient admission process from arrival to care plan initiation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Training Scenario</h3>
                    <p className="text-blue-800 text-sm">
                      <strong>Patient:</strong> Sarah Johnson, 45-year-old presenting for scheduled surgery<br/>
                      <strong>Insurance:</strong> Blue Cross Blue Shield PPO<br/>
                      <strong>Situation:</strong> Pre-operative admission for gallbladder surgery
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="border-l-4 border-green-500 pl-6">
                      <h3 className="text-lg font-semibold mb-3">Step 1: Patient Arrival and Registration</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Actions to Perform:</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                                <div>
                                  <p className="font-medium text-sm">Greet Patient</p>
                                  <p className="text-xs text-gray-600">Welcome patient and verify appointment</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                                <div>
                                  <p className="font-medium text-sm">Verify Identity</p>
                                  <p className="text-xs text-gray-600">Check photo ID and confirm DOB</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                                <div>
                                  <p className="font-medium text-sm">Update Demographics</p>
                                  <p className="text-xs text-gray-600">Verify address, phone, emergency contact</p>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
                                <div>
                                  <p className="font-medium text-sm">Collect Documents</p>
                                  <p className="text-xs text-gray-600">Insurance cards, consent forms</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">5</span>
                                <div>
                                  <p className="font-medium text-sm">Take Photo</p>
                                  <p className="text-xs text-gray-600">Update patient photo for identification</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">6</span>
                                <div>
                                  <p className="font-medium text-sm">Issue Wristband</p>
                                  <p className="text-xs text-gray-600">Print and apply patient identification</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <h5 className="font-medium text-yellow-800 mb-1">Practice Exercise</h5>
                          <p className="text-yellow-700 text-sm">
                            Navigate to Patient Registration → New Admission. Practice entering 
                            Sarah Johnson's information using the provided scenario data. 
                            Verify each field is completed accurately before proceeding.
                          </p>
                        </div>

                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                          <h5 className="font-medium text-red-800 mb-1">Common Mistakes to Avoid</h5>
                          <ul className="text-red-700 text-sm space-y-1">
                            <li>• Skipping identity verification steps</li>
                            <li>• Not updating emergency contact information</li>
                            <li>• Failing to collect current insurance cards</li>
                            <li>• Missing required consent form signatures</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-6">
                      <h3 className="text-lg font-semibold mb-3">Step 2: Insurance Verification</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Verification Process:</h4>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <ArrowRight className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">Access Insurance Verification module</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <ArrowRight className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">Enter insurance information from card</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <ArrowRight className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">Run real-time eligibility check</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <ArrowRight className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">Verify coverage for scheduled procedure</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <ArrowRight className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">Calculate patient responsibility (copay/deductible)</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <ArrowRight className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">Obtain pre-authorization if required</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-3 border rounded-lg">
                            <h5 className="font-medium text-sm mb-2">Coverage Status Codes</h5>
                            <ul className="text-xs space-y-1">
                              <li>• <span className="text-green-600">Active:</span> Coverage confirmed</li>
                              <li>• <span className="text-yellow-600">Pending:</span> Verification in progress</li>
                              <li>• <span className="text-red-600">Inactive:</span> No coverage found</li>
                              <li>• <span className="text-blue-600">Secondary:</span> Additional coverage</li>
                            </ul>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <h5 className="font-medium text-sm mb-2">Required Documentation</h5>
                            <ul className="text-xs space-y-1">
                              <li>• Primary insurance card (front/back)</li>
                              <li>• Secondary insurance (if applicable)</li>
                              <li>• Pre-authorization letters</li>
                              <li>• Referral documentation</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-6">
                      <h3 className="text-lg font-semibold mb-3">Steps 3-6: Completion Checklist</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-medium">Medical History & Assessment</h4>
                          <ul className="space-y-2">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">Allergies and adverse reactions</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">Current medications and dosages</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">Vital signs and initial assessment</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">Previous surgical history</span>
                            </li>
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-medium">Care Team & Documentation</h4>
                          <ul className="space-y-2">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">Assign primary care team</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">Create initial care plan</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">Set up communication preferences</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">Complete admission documentation</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-green-900 mb-3">Workflow Assessment</h3>
                      <p className="text-green-800 text-sm mb-4">
                        Complete the patient admission scenario with 100% accuracy to pass this module.
                      </p>
                      <div className="flex gap-4">
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Play className="w-4 h-4 mr-2" />
                          Start Interactive Practice
                        </Button>
                        <Button variant="outline" className="border-green-300 text-green-700">
                          Download Workflow Guide
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clinical" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    Clinical Documentation Workflow
                  </CardTitle>
                  <CardDescription>Advanced clinical documentation and coding practices</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    This module covers advanced clinical documentation workflows including SOAP notes, 
                    diagnosis coding, and provider authentication procedures.
                  </p>
                  <Button variant="outline">View Clinical Workflow Details</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pharmacy" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    Prescription Management Workflow
                  </CardTitle>
                  <CardDescription>End-to-end prescription processing and pharmacy coordination</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Learn the complete prescription management process from electronic prescribing 
                    to pharmacy fulfillment and patient notification.
                  </p>
                  <Button variant="outline">View Pharmacy Workflow Details</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="laboratory" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5" />
                    Laboratory Order Processing
                  </CardTitle>
                  <CardDescription>Lab test ordering, processing, and result management</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Master laboratory workflows from test ordering and specimen collection 
                    to result interpretation and provider communication.
                  </p>
                  <Button variant="outline">View Laboratory Workflow Details</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Billing & Insurance Claims Workflow
                  </CardTitle>
                  <CardDescription>Complete revenue cycle management and claims processing</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Advanced training on billing workflows, insurance claims processing, 
                    denial management, and revenue cycle optimization.
                  </p>
                  <Button variant="outline">View Billing Workflow Details</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}