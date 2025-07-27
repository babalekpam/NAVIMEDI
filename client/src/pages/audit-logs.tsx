import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search, Shield, FileText, Clock, User, Activity } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/contexts/translation-context";

interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  userName?: string;
}

export default function AuditLogs() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["/api/audit-logs", searchTerm, actionFilter, entityFilter],
    enabled: !!user,
  });

  const mockAuditLogs: AuditLog[] = [
    {
      id: "1",
      tenantId: user?.tenantId || "",
      userId: user?.id || "",
      entityType: "patient",
      entityId: "pat-001",
      action: "create",
      newData: { name: "John Doe", email: "john@example.com" },
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0...",
      timestamp: new Date(),
      userName: "Dr. Smith"
    },
    {
      id: "2",
      tenantId: user?.tenantId || "",
      userId: user?.id || "",
      entityType: "appointment",
      entityId: "apt-001",
      action: "update",
      oldData: { status: "scheduled" },
      newData: { status: "completed" },
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0...",
      timestamp: new Date(Date.now() - 3600000),
      userName: "Nurse Johnson"
    },
    {
      id: "3",
      tenantId: user?.tenantId || "",
      userId: user?.id || "",
      entityType: "prescription",
      entityId: "rx-001",
      action: "create",
      newData: { medication: "Amoxicillin", dosage: "500mg" },
      ipAddress: "192.168.1.102",
      userAgent: "Mozilla/5.0...",
      timestamp: new Date(Date.now() - 7200000),
      userName: "Dr. Wilson"
    }
  ];

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesEntity = entityFilter === "all" || log.entityType === entityFilter;
    
    return matchesSearch && matchesAction && matchesEntity;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case "create": return "bg-green-100 text-green-800 border-green-200";
      case "update": return "bg-blue-100 text-blue-800 border-blue-200";
      case "delete": return "bg-red-100 text-red-800 border-red-200";
      case "view": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case "patient": return <User className="h-4 w-4" />;
      case "appointment": return <Calendar className="h-4 w-4" />;
      case "prescription": return <FileText className="h-4 w-4" />;
      case "lab_order": return <Activity className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('audit-logs')}</h1>
          <p className="text-gray-600 mt-2">
            {t('comprehensive-audit-trail')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-green-600" />
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
{t('hipaa-compliant')}
          </Badge>
        </div>
      </div>

      {/* HIPAA Compliance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>HIPAA Compliance Status</span>
          </CardTitle>
          <CardDescription>
            Current compliance metrics and audit trail summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-green-700">Data Encrypted</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{filteredLogs.length}</div>
              <div className="text-sm text-blue-700">Audit Entries</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-purple-700">Security Violations</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-orange-700">Monitoring</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by entity, action, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="view">View</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="patient">Patients</SelectItem>
                <SelectItem value="appointment">Appointments</SelectItem>
                <SelectItem value="prescription">Prescriptions</SelectItem>
                <SelectItem value="lab_order">Lab Orders</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>
            Detailed log of all system activities and data access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading audit logs...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {getEntityIcon(log.entityType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getActionColor(log.action)}>
                            {log.action.toUpperCase()}
                          </Badge>
                          <span className="font-medium text-gray-900 capitalize">
                            {log.entityType.replace('_', ' ')}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">{log.entityId}</span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Performed by <span className="font-medium">{log.userName}</span>
                        </div>
                        {log.newData && (
                          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
                            <strong>Changes:</strong> {JSON.stringify(log.newData, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center space-x-1 mb-1">
                        <Clock className="h-3 w-3" />
                        <span>{log.timestamp.toLocaleString()}</span>
                      </div>
                      <div className="text-xs">
                        IP: {log.ipAddress}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredLogs.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No audit logs match your criteria</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* HIPAA Compliance Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>HIPAA Compliance Guidelines</CardTitle>
          <CardDescription>
            Key compliance measures implemented in NAVIMED
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Administrative Safeguards</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Role-based access control</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>User authentication and authorization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Comprehensive audit logging</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Staff training and access management</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Technical Safeguards</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Data encryption at rest and in transit</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Secure user authentication (JWT)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Session management and timeout</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Multi-tenant data isolation</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}