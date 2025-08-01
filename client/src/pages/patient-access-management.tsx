import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientAccessRequestManager } from '@/components/patient/PatientAccessRequestManager';
import { Shield, Activity, FileText, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function PatientAccessManagement() {
  const { user } = useAuth();
  
  // Fetch audit logs for compliance tracking
  const { data: auditLogs = [], isLoading: auditLoading } = useQuery<any[]>({
    queryKey: ['/api/patient-access-audit'],
    enabled: ['tenant_admin', 'director', 'super_admin'].includes(user?.role || '')
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  const canViewAuditLogs = ['tenant_admin', 'director', 'super_admin'].includes(user.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Patient Access Management</h1>
        <p className="text-gray-600 mt-2">
          Manage multi-doctor patient data separation and access control for enhanced security and compliance
        </p>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">Secure</p>
                <p className="text-sm text-gray-600">Multi-Doctor Separation</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">HIPAA</p>
                <p className="text-sm text-gray-600">Compliant Access</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">Audit</p>
                <p className="text-sm text-gray-600">Trail Logging</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">Protected</p>
                <p className="text-sm text-gray-600">Patient Privacy</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="access-requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="access-requests">Access Requests</TabsTrigger>
          {canViewAuditLogs && (
            <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          )}
          <TabsTrigger value="security-info">Security Information</TabsTrigger>
        </TabsList>

        <TabsContent value="access-requests">
          <PatientAccessRequestManager userRole={user.role} />
        </TabsContent>

        {canViewAuditLogs && (
          <TabsContent value="audit-logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Patient Access Audit Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auditLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading audit logs...</p>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No audit logs found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {auditLogs.map((log: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{log.actionType}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-sm text-gray-600">{log.resourceType}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(log.accessedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Doctor ID: {log.doctorId}</p>
                          <p>Patient ID: {log.patientId}</p>
                          <p>Access Method: {log.accessMethod}</p>
                          {log.ipAddress && <p>IP Address: {log.ipAddress}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="security-info">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Compliance Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Multi-Doctor Patient Data Separation</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• <strong>Strict Access Control:</strong> Physicians can only access patients assigned to them directly</p>
                  <p>• <strong>Request-Based Access:</strong> Access to other patients requires approval through the request system</p>
                  <p>• <strong>Time-Limited Access:</strong> Approved access requests have configurable expiration times</p>
                  <p>• <strong>Audit Trail:</strong> All patient data access is logged for compliance and security monitoring</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Access Request Process</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>1. <strong>Request Submission:</strong> Physicians submit access requests with detailed justification</p>
                  <p>2. <strong>Administrative Review:</strong> Tenant administrators or directors review and approve/deny requests</p>
                  <p>3. <strong>Temporary Access:</strong> Approved access is granted for specified duration (1-72 hours)</p>
                  <p>4. <strong>Automatic Expiration:</strong> Access automatically expires after the specified time period</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Compliance Features</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• <strong>HIPAA Compliance:</strong> Minimum necessary access principle enforced</p>
                  <p>• <strong>Audit Logging:</strong> Comprehensive logging of all patient data access activities</p>
                  <p>• <strong>Access Justification:</strong> Required reason documentation for all access requests</p>
                  <p>• <strong>Administrative Oversight:</strong> Multiple approval levels for sensitive access requests</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Security Best Practices</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Always provide detailed justification for access requests</li>
                  <li>• Request only the minimum access level needed (read, write, or full)</li>
                  <li>• Set appropriate expiration times based on clinical necessity</li>
                  <li>• Review and audit access logs regularly for compliance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}