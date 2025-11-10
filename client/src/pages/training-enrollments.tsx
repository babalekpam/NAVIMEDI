import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { GraduationCap, Mail, Phone, Building2, Briefcase, Calendar, ArrowLeft, Search, Download } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { format } from "date-fns";

interface TrainingEnrollment {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  organization: string | null;
  jobRole: string | null;
  trainingLevel: string;
  status: string;
  enrollmentDate: string;
  startDate: string | null;
  completionDate: string | null;
  notes: string | null;
}

export default function TrainingEnrollments() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: enrollments, isLoading } = useQuery<TrainingEnrollment[]>({
    queryKey: ['/api/training/enrollments']
  });

  const filteredEnrollments = enrollments?.filter(enrollment => 
    enrollment.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    enrollment.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    enrollment.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    enrollment.jobRole?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'foundation':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Foundation</Badge>;
      case 'intermediate':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Intermediate</Badge>;
      case 'advanced':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">Advanced</Badge>;
      case 'all_levels':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">All Levels</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const exportToCSV = () => {
    if (!enrollments || enrollments.length === 0) return;

    const headers = ['Full Name', 'Email', 'Phone', 'Organization', 'Job Role', 'Training Level', 'Status', 'Enrollment Date'];
    const csvData = enrollments.map(e => [
      e.fullName,
      e.email,
      e.phone || '',
      e.organization || '',
      e.jobRole || '',
      e.trainingLevel,
      e.status,
      format(new Date(e.enrollmentDate), 'yyyy-MM-dd HH:mm')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-enrollments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: enrollments?.length || 0,
    enrolled: enrollments?.filter(e => e.status === 'enrolled').length || 0,
    inProgress: enrollments?.filter(e => e.status === 'in_progress').length || 0,
    completed: enrollments?.filter(e => e.status === 'completed').length || 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="mx-auto px-6" style={{maxWidth: '1600px'}}>
        <div className="mb-6">
          <Link href="/super-admin-dashboard">
            <Button variant="ghost" className="mb-4" data-testid="button-back-dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3" data-testid="text-page-title">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                Training Enrollments
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2" data-testid="text-page-description">
                Manage and track all NaviMED training program enrollments
              </p>
            </div>
            <Button 
              onClick={exportToCSV} 
              disabled={!enrollments || enrollments.length === 0}
              className="flex items-center gap-2"
              data-testid="button-export-csv"
            >
              <Download className="h-4 w-4" />
              Export to CSV
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card data-testid="card-stat-total">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900 dark:text-white" data-testid="text-stat-total">
                {stats.total}
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-enrolled">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Enrolled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600" data-testid="text-stat-enrolled">
                {stats.enrolled}
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-progress">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600" data-testid="text-stat-progress">
                {stats.inProgress}
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-completed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600" data-testid="text-stat-completed">
                {stats.completed}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Enrollments Table */}
        <Card data-testid="card-enrollments-table">
          <CardHeader>
            <CardTitle>All Enrollments</CardTitle>
            <CardDescription>
              View and manage all training program enrollments
            </CardDescription>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, organization, or job role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-enrollments"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                Loading enrollments...
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                {searchQuery ? 'No enrollments match your search.' : 'No training enrollments yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Job Role</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Enrollment Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id} data-testid={`row-enrollment-${enrollment.id}`}>
                        <TableCell className="font-medium" data-testid={`text-name-${enrollment.id}`}>
                          {enrollment.fullName}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm" data-testid={`text-email-${enrollment.id}`}>
                              <Mail className="h-3 w-3 text-slate-400" />
                              {enrollment.email}
                            </div>
                            {enrollment.phone && (
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400" data-testid={`text-phone-${enrollment.id}`}>
                                <Phone className="h-3 w-3 text-slate-400" />
                                {enrollment.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-org-${enrollment.id}`}>
                          {enrollment.organization ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-3 w-3 text-slate-400" />
                              {enrollment.organization}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell data-testid={`text-role-${enrollment.id}`}>
                          {enrollment.jobRole ? (
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-3 w-3 text-slate-400" />
                              {enrollment.jobRole}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell data-testid={`badge-level-${enrollment.id}`}>
                          {getLevelBadge(enrollment.trainingLevel)}
                        </TableCell>
                        <TableCell data-testid={`badge-status-${enrollment.id}`}>
                          <Badge className={getStatusColor(enrollment.status)}>
                            {enrollment.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-date-${enrollment.id}`}>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {format(new Date(enrollment.enrollmentDate), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
