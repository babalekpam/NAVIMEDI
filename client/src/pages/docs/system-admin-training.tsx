import { ArrowLeft, Clock, Users, Shield, Settings, Database, Network, Monitor, Key, AlertTriangle, CheckCircle, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

export default function SystemAdminTraining() {
  const adminModules = [
    {
      title: "System Setup & Configuration",
      duration: "4 hours",
      difficulty: "Intermediate",
      topics: [
        "Initial system configuration",
        "Organization setup and branding",
        "Multi-tenant architecture management",
        "System preferences and defaults"
      ]
    },
    {
      title: "User Management & Security",
      duration: "3 hours", 
      difficulty: "Advanced",
      topics: [
        "User account creation and management",
        "Role-based access control (RBAC)",
        "Security policies and compliance",
        "Password and authentication management"
      ]
    },
    {
      title: "Data Management & Backup",
      duration: "3.5 hours",
      difficulty: "Advanced", 
      topics: [
        "Database administration",
        "Backup and recovery procedures",
        "Data migration and import/export",
        "Data retention policies"
      ]
    },
    {
      title: "Integration & APIs",
      duration: "4.5 hours",
      difficulty: "Expert",
      topics: [
        "Third-party system integration",
        "API configuration and management",
        "HL7 and FHIR standards",
        "Custom integration development"
      ]
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">System Administrator Training</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>15-20 hours total</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Advanced Level</span>
              </div>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Administrative Access Required
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="data">Data Mgmt</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Administrator Training Program
                  </CardTitle>
                  <CardDescription>
                    Comprehensive training for NaviMED system administrators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p>
                      This training program prepares system administrators to effectively manage, 
                      configure, and maintain the NaviMED healthcare platform. Covering everything 
                      from initial setup to advanced integrations and security management.
                    </p>
                    <h4>Prerequisites</h4>
                    <ul>
                      <li>System administrator privileges in NaviMED</li>
                      <li>Basic understanding of healthcare IT systems</li>
                      <li>Knowledge of database concepts and network administration</li>
                      <li>HIPAA compliance training certification</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                {adminModules.map((module, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{module.duration}</Badge>
                        <Badge variant={module.difficulty === 'Expert' ? 'destructive' : 'outline'}>
                          {module.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {module.topics.map((topic, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-2">Important Notice</h4>
                      <p className="text-yellow-800 text-sm">
                        System administration training requires a dedicated training environment. 
                        Contact support@navimedi.com to schedule access to a sandbox environment 
                        before beginning this training program.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="setup" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cog className="w-5 h-5" />
                    System Setup & Configuration
                  </CardTitle>
                  <CardDescription>Initial system configuration and organization setup</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-lg font-semibold mb-3">1. Initial System Configuration</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">System Requirements Verification</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h5 className="font-medium">Minimum Requirements</h5>
                              <ul className="text-gray-600 space-y-1">
                                <li>• 8GB RAM minimum</li>
                                <li>• 100GB storage space</li>
                                <li>• SSL certificate installed</li>
                                <li>• Database server configured</li>
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium">Recommended Specifications</h5>
                              <ul className="text-gray-600 space-y-1">
                                <li>• 16GB RAM or higher</li>
                                <li>• 500GB SSD storage</li>
                                <li>• Load balancer configured</li>
                                <li>• Redundant backup systems</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Environment Variables Configuration</h4>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
                          <pre>{`# Core Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/navimed
JWT_SECRET=your-secure-jwt-secret
ENCRYPTION_KEY=your-256-bit-encryption-key

# Email Configuration  
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@navimedi.com

# Security Settings
SESSION_TIMEOUT=30
MAX_LOGIN_ATTEMPTS=5
CORS_ORIGIN=https://your-domain.com`}</pre>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-lg font-semibold mb-3">2. Organization Setup</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Multi-Tenant Configuration</h4>
                        <div className="space-y-3">
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h5 className="font-medium text-green-800 mb-2">Tenant Configuration Steps</h5>
                            <ol className="text-green-700 text-sm space-y-1 list-decimal list-inside">
                              <li>Access Admin Panel → Organization Management</li>
                              <li>Create new tenant with unique identifier</li>
                              <li>Configure organization details and branding</li>
                              <li>Set up department structure and hierarchies</li>
                              <li>Configure billing and subscription settings</li>
                              <li>Initialize default user roles and permissions</li>
                            </ol>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">White Label Configuration</h4>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="p-3 border rounded-lg">
                            <h5 className="font-medium text-sm">Branding</h5>
                            <ul className="text-xs text-gray-600 mt-1 space-y-1">
                              <li>• Custom logo upload</li>
                              <li>• Color scheme customization</li>
                              <li>• Domain configuration</li>
                            </ul>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <h5 className="font-medium text-sm">Features</h5>
                            <ul className="text-xs text-gray-600 mt-1 space-y-1">
                              <li>• Module enablement</li>
                              <li>• Custom workflows</li>
                              <li>• Integration settings</li>
                            </ul>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <h5 className="font-medium text-sm">Compliance</h5>
                            <ul className="text-xs text-gray-600 mt-1 space-y-1">
                              <li>• Regulatory settings</li>
                              <li>• Audit configurations</li>
                              <li>• Data retention policies</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Hands-On Exercise</h4>
                    <p className="text-blue-700 text-sm">
                      Set up a complete test organization with custom branding, configure three departments 
                      (Emergency, Cardiology, Pharmacy), and create initial admin user accounts with 
                      appropriate role assignments.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security & User Management
                  </CardTitle>
                  <CardDescription>Advanced security configuration and user administration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="border-l-4 border-red-500 pl-6">
                    <h3 className="text-lg font-semibold mb-3">Security Policies & Compliance</h3>
                    <div className="space-y-4">
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-2">Critical Security Settings</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-sm">Authentication</h5>
                            <ul className="text-red-700 text-xs space-y-1">
                              <li>• Multi-factor authentication enforcement</li>
                              <li>• Password complexity requirements</li>
                              <li>• Session timeout configurations</li>
                              <li>• Account lockout policies</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm">Data Protection</h5>
                            <ul className="text-red-700 text-xs space-y-1">
                              <li>• Encryption at rest and in transit</li>
                              <li>• Data masking configurations</li>
                              <li>• Audit trail settings</li>
                              <li>• Access logging and monitoring</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Role-Based Access Control (RBAC)</h4>
                        <div className="space-y-3">
                          <div className="grid md:grid-cols-4 gap-3">
                            <div className="p-3 border rounded-lg text-center">
                              <h5 className="font-medium text-sm">Super Admin</h5>
                              <p className="text-xs text-gray-600">Full system access</p>
                            </div>
                            <div className="p-3 border rounded-lg text-center">
                              <h5 className="font-medium text-sm">Org Admin</h5>
                              <p className="text-xs text-gray-600">Organization management</p>
                            </div>
                            <div className="p-3 border rounded-lg text-center">
                              <h5 className="font-medium text-sm">Dept Admin</h5>
                              <p className="text-xs text-gray-600">Department oversight</p>
                            </div>
                            <div className="p-3 border rounded-lg text-center">
                              <h5 className="font-medium text-sm">End User</h5>
                              <p className="text-xs text-gray-600">Operational access</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-6">
                    <h3 className="text-lg font-semibold mb-3">User Account Management</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Bulk User Operations</h4>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h5 className="font-medium">Import/Export</h5>
                              <ul className="text-yellow-700 space-y-1">
                                <li>• CSV template for bulk import</li>
                                <li>• User data export procedures</li>
                                <li>• Validation and error handling</li>
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium">Lifecycle Management</h5>
                              <ul className="text-yellow-700 space-y-1">
                                <li>• Automated onboarding workflows</li>
                                <li>• Access review and recertification</li>
                                <li>• Deactivation and archival procedures</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Data Management & Backup
                  </CardTitle>
                  <CardDescription>Database administration and data protection strategies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="border-l-4 border-purple-500 pl-6">
                    <h3 className="text-lg font-semibold mb-3">Database Administration</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Performance Monitoring</h4>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <h5 className="font-medium">Query Performance</h5>
                              <ul className="text-purple-700 space-y-1">
                                <li>• Slow query identification</li>
                                <li>• Index optimization</li>
                                <li>• Query plan analysis</li>
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium">Resource Usage</h5>
                              <ul className="text-purple-700 space-y-1">
                                <li>• Memory utilization</li>
                                <li>• Storage growth trends</li>
                                <li>• Connection pooling</li>
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium">Maintenance Tasks</h5>
                              <ul className="text-purple-700 space-y-1">
                                <li>• Regular VACUUM operations</li>
                                <li>• Statistics updates</li>
                                <li>• Log file management</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Backup and Recovery Procedures</h4>
                        <div className="space-y-3">
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
                            <h5 className="font-medium mb-2">Automated Backup Script</h5>
                            <pre>{`#!/bin/bash
# Daily backup script for NaviMED database

DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/navimed"
DB_NAME="navimed_production"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform database backup
pg_dump -h localhost -U postgres $DB_NAME | gzip > $BACKUP_DIR/navimed_backup_$DATE.sql.gz

# Clean up backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: navimed_backup_$DATE.sql.gz"`}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-indigo-500 pl-6">
                    <h3 className="text-lg font-semibold mb-3">Data Migration & Import/Export</h3>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Supported Formats</h4>
                          <ul className="text-sm space-y-1">
                            <li>• CSV (Patient data, user lists)</li>
                            <li>• HL7 (Clinical messages)</li>
                            <li>• FHIR (Healthcare resources)</li>
                            <li>• JSON (Configuration data)</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Migration Tools</h4>
                          <ul className="text-sm space-y-1">
                            <li>• Built-in migration wizard</li>
                            <li>• Data validation utilities</li>
                            <li>• Rollback procedures</li>
                            <li>• Progress tracking dashboard</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integration" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="w-5 h-5" />
                    Integration & API Management
                  </CardTitle>
                  <CardDescription>Third-party integrations and API configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-lg font-semibold mb-3">API Configuration</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">API Key Management</h4>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="space-y-3">
                            <div>
                              <h5 className="font-medium text-green-800">Creating API Keys</h5>
                              <ol className="text-green-700 text-sm list-decimal list-inside space-y-1">
                                <li>Access Admin Panel → API Management</li>
                                <li>Click "Generate New API Key"</li>
                                <li>Set scope and permissions</li>
                                <li>Configure rate limits and expiration</li>
                                <li>Document key purpose and owner</li>
                              </ol>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded border border-yellow-300">
                              <p className="text-yellow-800 text-sm">
                                <strong>Security Note:</strong> API keys should be rotated every 90 days 
                                and immediately revoked if compromised.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Common Integration Patterns</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-3 border rounded-lg">
                            <h5 className="font-medium text-sm">EHR Systems</h5>
                            <ul className="text-xs text-gray-600 mt-1 space-y-1">
                              <li>• Epic MyChart integration</li>
                              <li>• Cerner PowerChart connection</li>
                              <li>• Allscripts API setup</li>
                            </ul>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <h5 className="font-medium text-sm">Lab Systems</h5>
                            <ul className="text-xs text-gray-600 mt-1 space-y-1">
                              <li>• Quest Diagnostics API</li>
                              <li>• LabCorp Connect integration</li>
                              <li>• Local lab system bridges</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-lg font-semibold mb-3">HL7 and FHIR Standards</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Message Configuration</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h5 className="font-medium">HL7 v2.x</h5>
                            <ul className="text-blue-700 space-y-1">
                              <li>• ADT (Admission/Discharge/Transfer)</li>
                              <li>• ORM (Order messages)</li>
                              <li>• ORU (Observation results)</li>
                              <li>• MDM (Medical document management)</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium">FHIR R4</h5>
                            <ul className="text-blue-700 space-y-1">
                              <li>• Patient resource management</li>
                              <li>• Observation and DiagnosticReport</li>
                              <li>• Medication and MedicationRequest</li>
                              <li>• Appointment and Schedule</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    System Monitoring & Maintenance
                  </CardTitle>
                  <CardDescription>Performance monitoring and proactive system maintenance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="border-l-4 border-orange-500 pl-6">
                    <h3 className="text-lg font-semibold mb-3">Performance Monitoring Dashboard</h3>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="p-4 bg-orange-50 rounded-lg text-center">
                          <Monitor className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                          <h4 className="font-medium text-sm">System Health</h4>
                          <p className="text-xs text-gray-600">CPU, Memory, Disk</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                          <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <h4 className="font-medium text-sm">Database Performance</h4>
                          <p className="text-xs text-gray-600">Queries, Connections</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg text-center">
                          <Network className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <h4 className="font-medium text-sm">Network Traffic</h4>
                          <p className="text-xs text-gray-600">Bandwidth, Latency</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg text-center">
                          <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                          <h4 className="font-medium text-sm">User Activity</h4>
                          <p className="text-xs text-gray-600">Logins, Sessions</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Alert Configuration</h4>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="space-y-3">
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <h5 className="font-medium text-orange-800">Critical Alerts</h5>
                                <ul className="text-orange-700 space-y-1">
                                  <li>• System downtime (immediate)</li>
                                  <li>• Database connection failures</li>
                                  <li>• Security breach attempts</li>
                                  <li>• Data backup failures</li>
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium text-orange-800">Warning Alerts</h5>
                                <ul className="text-orange-700 space-y-1">
                                  <li>• High CPU/Memory usage ({'>'}80%)</li>
                                  <li>• Slow database queries ({'>'}5s)</li>
                                  <li>• Low disk space ({'<'}20%)</li>
                                  <li>• Failed login attempts ({'>'}5)</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-teal-500 pl-6">
                    <h3 className="text-lg font-semibold mb-3">Maintenance Procedures</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Regular Maintenance Tasks</h4>
                        <div className="bg-teal-50 p-4 rounded-lg">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <h5 className="font-medium text-teal-800">Daily</h5>
                              <ul className="text-teal-700 text-sm space-y-1">
                                <li>• Review system alerts</li>
                                <li>• Check backup status</li>
                                <li>• Monitor active sessions</li>
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium text-teal-800">Weekly</h5>
                              <ul className="text-teal-700 text-sm space-y-1">
                                <li>• Database performance review</li>
                                <li>• Security log analysis</li>
                                <li>• User access audit</li>
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium text-teal-800">Monthly</h5>
                              <ul className="text-teal-700 text-sm space-y-1">
                                <li>• System updates and patches</li>
                                <li>• Capacity planning review</li>
                                <li>• Disaster recovery testing</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-8 bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Administrator Certification</h3>
                <p className="text-red-800 text-sm mb-4">
                  Complete all training modules and pass the comprehensive administrator 
                  certification exam to become a certified NaviMED system administrator.
                </p>
                <div className="flex justify-center gap-4">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Schedule Certification Exam
                  </Button>
                  <Button variant="outline" className="border-red-300 text-red-700">
                    Download Study Guide
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