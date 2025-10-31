import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, differenceInDays } from 'date-fns';
import { Plus, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

const leaveRequestSchema = z.object({
  leaveType: z.enum(['vacation', 'sick', 'personal', 'bereavement', 'maternity', 'paternity']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(1, 'Reason is required'),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type LeaveRequestFormValues = z.infer<typeof leaveRequestSchema>;

const reviewFormSchema = z.object({
  status: z.enum(['approved', 'denied']),
  reviewNotes: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export default function LeaveManagement() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const form = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leaveType: 'vacation',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      reason: '',
    },
  });

  const reviewForm = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      status: 'approved',
      reviewNotes: '',
    },
  });

  const { data: leaveRequests = [], isLoading: leaveRequestsLoading } = useQuery({
    queryKey: ['/api/scheduling/leave-requests'],
    queryFn: async () => {
      const response = await fetch('/api/scheduling/leave-requests');
      if (!response.ok) throw new Error('Failed to fetch leave requests');
      return response.json();
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const userMap = new Map(users.map((user: any) => [user.id, user]));

  const createLeaveRequestMutation = useMutation({
    mutationFn: async (data: LeaveRequestFormValues) => {
      return apiRequest('/api/scheduling/leave-requests', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: 'Leave request submitted successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduling/leave-requests'] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to submit leave request',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const reviewLeaveRequestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ReviewFormValues }) => {
      return apiRequest(`/api/scheduling/leave-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: 'Leave request reviewed successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduling/leave-requests'] });
      setIsReviewDialogOpen(false);
      setSelectedRequest(null);
      reviewForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to review leave request',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: LeaveRequestFormValues) => {
    createLeaveRequestMutation.mutate(data);
  };

  const onReviewSubmit = (data: ReviewFormValues) => {
    if (selectedRequest) {
      reviewLeaveRequestMutation.mutate({ id: selectedRequest.id, data });
    }
  };

  const handleReviewRequest = (request: any) => {
    setSelectedRequest(request);
    setIsReviewDialogOpen(true);
  };

  const myRequests = leaveRequests.filter((req: any) => req.userId === users[0]?.id);
  const pendingRequests = leaveRequests.filter((req: any) => req.status === 'pending');
  const approvedRequests = leaveRequests.filter((req: any) => req.status === 'approved');

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100',
    approved: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
    denied: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
  };

  const leaveTypeColors: Record<string, string> = {
    vacation: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
    sick: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
    personal: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100',
    bereavement: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100',
    maternity: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-100',
    paternity: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100',
  };

  const getTotalDays = (startDate: string, endDate: string) => {
    return differenceInDays(new Date(endDate), new Date(startDate)) + 1;
  };

  const vacationBalance = 20;
  const vacationUsed = approvedRequests
    .filter((req: any) => req.leaveType === 'vacation')
    .reduce((sum: number, req: any) => sum + parseInt(req.totalDays || '0'), 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">Leave Management</h1>
          <p className="text-muted-foreground dark:text-muted-foreground">Request time off and manage leave requests</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-request-leave">
              <Plus className="w-4 h-4 mr-2" />
              Request Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Time Off</DialogTitle>
              <DialogDescription>Submit a leave request for approval</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="leaveType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leave Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-leave-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vacation">Vacation</SelectItem>
                          <SelectItem value="sick">Sick Leave</SelectItem>
                          <SelectItem value="personal">Personal Leave</SelectItem>
                          <SelectItem value="bereavement">Bereavement</SelectItem>
                          <SelectItem value="maternity">Maternity Leave</SelectItem>
                          <SelectItem value="paternity">Paternity Leave</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-start-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-end-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch('startDate') && form.watch('endDate') && (
                  <div className="p-3 bg-muted/50 dark:bg-muted/20 rounded-md">
                    <div className="text-sm text-muted-foreground dark:text-muted-foreground">Total Days</div>
                    <div className="text-2xl font-bold" data-testid="text-total-days">
                      {getTotalDays(form.watch('startDate'), form.watch('endDate'))} days
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Provide a reason for your leave request" data-testid="input-reason" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLeaveRequestMutation.isPending} data-testid="button-submit">
                    {createLeaveRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vacation Balance</CardTitle>
            <CardDescription>Annual vacation days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground dark:text-muted-foreground mb-1">Remaining</div>
                <div className="text-4xl font-bold text-green-600 dark:text-green-400" data-testid="text-vacation-remaining">
                  {vacationBalance - vacationUsed}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground dark:text-muted-foreground">Total</div>
                  <div className="font-medium" data-testid="text-vacation-total">{vacationBalance} days</div>
                </div>
                <div>
                  <div className="text-muted-foreground dark:text-muted-foreground">Used</div>
                  <div className="font-medium" data-testid="text-vacation-used">{vacationUsed} days</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold" data-testid="text-pending-count">
              {pendingRequests.length}
            </div>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-2">
              {pendingRequests.length === 1 ? 'request' : 'requests'} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approved Leave</CardTitle>
            <CardDescription>This year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold" data-testid="text-approved-count">
              {approvedRequests.length}
            </div>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-2">
              {approvedRequests.length === 1 ? 'request' : 'requests'} approved
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="my-requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-requests" data-testid="tab-my-requests">My Requests</TabsTrigger>
          <TabsTrigger value="team-requests" data-testid="tab-team-requests">Team Requests</TabsTrigger>
          <TabsTrigger value="calendar" data-testid="tab-calendar">Leave Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="my-requests">
          <Card>
            <CardHeader>
              <CardTitle>My Leave Requests</CardTitle>
              <CardDescription>Your leave request history</CardDescription>
            </CardHeader>
            <CardContent>
              {leaveRequestsLoading ? (
                <div className="text-center py-8" data-testid="loading-requests">Loading leave requests...</div>
              ) : myRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground dark:text-muted-foreground">
                  No leave requests yet. Click "Request Leave" to submit your first request.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myRequests.map((request: any) => (
                        <TableRow key={request.id} data-testid={`row-request-${request.id}`}>
                          <TableCell>
                            <Badge className={leaveTypeColors[request.leaveType] || ''} data-testid={`badge-type-${request.id}`}>
                              {request.leaveType}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`cell-dates-${request.id}`}>
                            {format(new Date(request.startDate), 'MMM d')} - {format(new Date(request.endDate), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell data-testid={`cell-days-${request.id}`}>{request.totalDays} days</TableCell>
                          <TableCell className="max-w-xs truncate" data-testid={`cell-reason-${request.id}`}>
                            {request.reason}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[request.status] || ''} data-testid={`badge-status-${request.id}`}>
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`cell-submitted-${request.id}`}>
                            {format(new Date(request.requestedAt), 'MMM d, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team-requests">
          <Card>
            <CardHeader>
              <CardTitle>Team Leave Requests</CardTitle>
              <CardDescription>Pending requests for approval</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground dark:text-muted-foreground">
                  No pending leave requests to review.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests.map((request: any) => {
                        const user = userMap.get(request.userId);
                        return (
                          <TableRow key={request.id} data-testid={`row-pending-${request.id}`}>
                            <TableCell data-testid={`cell-employee-${request.id}`}>
                              {user ? `${user.firstName} ${user.lastName}` : 'Unknown'}
                            </TableCell>
                            <TableCell>
                              <Badge className={leaveTypeColors[request.leaveType] || ''}>
                                {request.leaveType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(request.startDate), 'MMM d')} - {format(new Date(request.endDate), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>{request.totalDays} days</TableCell>
                            <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReviewRequest(request)}
                                data-testid={`button-review-${request.id}`}
                              >
                                Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Leave Calendar</CardTitle>
              <CardDescription>Upcoming approved leave</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvedRequests
                  .filter((req: any) => new Date(req.endDate) >= new Date())
                  .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                  .map((request: any) => {
                    const user = userMap.get(request.userId);
                    return (
                      <Card key={request.id} className="p-4" data-testid={`card-calendar-${request.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
                              <span className="font-medium" data-testid={`text-calendar-employee-${request.id}`}>
                                {user ? `${user.firstName} ${user.lastName}` : 'Unknown'}
                              </span>
                              <Badge className={leaveTypeColors[request.leaveType] || ''}>
                                {request.leaveType}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                              {format(new Date(request.startDate), 'EEEE, MMMM d, yyyy')} - {format(new Date(request.endDate), 'EEEE, MMMM d, yyyy')}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">{request.totalDays} days</span> • {request.reason}
                            </div>
                          </div>
                          <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
                            Approved
                          </Badge>
                        </div>
                      </Card>
                    );
                  })}
                {approvedRequests.filter((req: any) => new Date(req.endDate) >= new Date()).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground dark:text-muted-foreground">
                    No upcoming approved leave.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isReviewDialogOpen && selectedRequest && (
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Leave Request</DialogTitle>
              <DialogDescription>
                {userMap.get(selectedRequest.userId)?.firstName} {userMap.get(selectedRequest.userId)?.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 dark:bg-muted/20 rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground dark:text-muted-foreground">Leave Type</div>
                  <Badge className={leaveTypeColors[selectedRequest.leaveType] || ''}>
                    {selectedRequest.leaveType}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground dark:text-muted-foreground">Duration</div>
                  <div className="font-medium">
                    {format(new Date(selectedRequest.startDate), 'MMM d')} - {format(new Date(selectedRequest.endDate), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground dark:text-muted-foreground">Total Days</div>
                  <div className="font-medium">{selectedRequest.totalDays} days</div>
                </div>
                <div className="pt-2 border-t border-border dark:border-border">
                  <div className="text-sm text-muted-foreground dark:text-muted-foreground mb-1">Reason</div>
                  <div className="text-sm">{selectedRequest.reason}</div>
                </div>
              </div>

              <Form {...reviewForm}>
                <form onSubmit={reviewForm.handleSubmit(onReviewSubmit)} className="space-y-4">
                  <FormField
                    control={reviewForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Decision</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-review-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="approved">Approve</SelectItem>
                            <SelectItem value="denied">Deny</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={reviewForm.control}
                    name="reviewNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} placeholder="Add any comments or notes" data-testid="input-review-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsReviewDialogOpen(false)}
                      data-testid="button-cancel-review"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={reviewLeaveRequestMutation.isPending} data-testid="button-submit-review">
                      {reviewLeaveRequestMutation.isPending ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
