import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, startOfWeek, addWeeks, subWeeks, addDays } from 'date-fns';
import { Plus, ChevronLeft, ChevronRight, Filter, Trash2, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ShiftCalendar } from '@/components/ShiftCalendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

const shiftFormSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  shiftType: z.enum(['morning', 'afternoon', 'evening', 'night', 'on-call']),
  shiftDate: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  breakMinutes: z.coerce.number().min(0).default(0),
  departmentId: z.string().optional(),
  notes: z.string().optional(),
});

type ShiftFormValues = z.infer<typeof shiftFormSchema>;

export default function StaffScheduling() {
  const { toast } = useToast();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const weekEnd = addDays(currentWeekStart, 6);

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      userId: '',
      shiftType: 'morning',
      shiftDate: format(new Date(), 'yyyy-MM-dd'),
      startTime: '08:00',
      endTime: '16:00',
      breakMinutes: 30,
      notes: '',
    },
  });

  const { data: shifts = [], isLoading: shiftsLoading } = useQuery({
    queryKey: ['/api/scheduling/shifts', currentWeekStart.toISOString(), filterUserId, filterDepartment, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: currentWeekStart.toISOString(),
        endDate: weekEnd.toISOString(),
      });
      if (filterUserId) params.append('userId', filterUserId);
      if (filterDepartment) params.append('departmentId', filterDepartment);
      if (filterStatus) params.append('status', filterStatus);
      
      const response = await fetch(`/api/scheduling/shifts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch shifts');
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

  const createShiftMutation = useMutation({
    mutationFn: async (data: ShiftFormValues) => {
      return apiRequest('/api/scheduling/shifts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: 'Shift created successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduling/shifts'] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create shift',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const updateShiftMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ShiftFormValues> }) => {
      return apiRequest(`/api/scheduling/shifts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: 'Shift updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduling/shifts'] });
      setSelectedShift(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update shift',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const deleteShiftMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/scheduling/shifts/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({ title: 'Shift deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduling/shifts'] });
      setIsDeleteDialogOpen(false);
      setSelectedShift(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete shift',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const handlePreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handleShiftClick = (shift: any) => {
    setSelectedShift(shift);
  };

  const handleConfirmShift = (id: number) => {
    updateShiftMutation.mutate({ id, data: { status: 'confirmed' } });
  };

  const handleCancelShift = (id: number) => {
    updateShiftMutation.mutate({ id, data: { status: 'cancelled' } });
  };

  const handleDeleteShift = () => {
    if (selectedShift) {
      deleteShiftMutation.mutate(selectedShift.id);
    }
  };

  const onSubmit = (data: ShiftFormValues) => {
    createShiftMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">Staff Scheduling</h1>
          <p className="text-muted-foreground dark:text-muted-foreground">Manage staff shifts and schedules</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-shift">
              <Plus className="w-4 h-4 mr-2" />
              Create Shift
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Shift</DialogTitle>
              <DialogDescription>Assign a shift to a staff member</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Staff Member</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-user">
                            <SelectValue placeholder="Select staff member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName} - {user.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shiftType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shift Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-shift-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="morning">Morning</SelectItem>
                            <SelectItem value="afternoon">Afternoon</SelectItem>
                            <SelectItem value="evening">Evening</SelectItem>
                            <SelectItem value="night">Night</SelectItem>
                            <SelectItem value="on-call">On-Call</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shiftDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-shift-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} data-testid="input-start-time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} data-testid="input-end-time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="breakMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Break (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-break-minutes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} data-testid="input-notes" />
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
                  <Button type="submit" disabled={createShiftMutation.isPending} data-testid="button-submit">
                    {createShiftMutation.isPending ? 'Creating...' : 'Create Shift'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Week of {format(currentWeekStart, 'MMM d, yyyy')}</CardTitle>
              <CardDescription>
                {format(currentWeekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousWeek} data-testid="button-previous-week">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }))} data-testid="button-today">
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextWeek} data-testid="button-next-week">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {shiftsLoading ? (
            <div className="text-center py-12" data-testid="loading-shifts">Loading shifts...</div>
          ) : (
            <ShiftCalendar
              shifts={shifts}
              startDate={currentWeekStart}
              onShiftClick={handleShiftClick}
              userMap={userMap}
            />
          )}
        </CardContent>
      </Card>

      {selectedShift && (
        <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Shift Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Staff Member</div>
                <div className="text-lg" data-testid="text-shift-user">
                  {userMap.get(selectedShift.userId)?.firstName} {userMap.get(selectedShift.userId)?.lastName}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Shift Type</div>
                  <div className="capitalize" data-testid="text-shift-type">{selectedShift.shiftType.replace('-', ' ')}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Status</div>
                  <Badge data-testid="text-shift-status">{selectedShift.status}</Badge>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Date & Time</div>
                <div data-testid="text-shift-datetime">
                  {format(new Date(selectedShift.shiftDate), 'MMM d, yyyy')} • {selectedShift.startTime} - {selectedShift.endTime}
                </div>
              </div>
              {selectedShift.notes && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Notes</div>
                  <div className="text-sm" data-testid="text-shift-notes">{selectedShift.notes}</div>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                {selectedShift.status === 'scheduled' && (
                  <Button
                    onClick={() => handleConfirmShift(selectedShift.id)}
                    disabled={updateShiftMutation.isPending}
                    data-testid="button-confirm-shift"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirm
                  </Button>
                )}
                {(selectedShift.status === 'scheduled' || selectedShift.status === 'confirmed') && (
                  <Button
                    variant="outline"
                    onClick={() => handleCancelShift(selectedShift.id)}
                    disabled={updateShiftMutation.isPending}
                    data-testid="button-cancel-shift"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={deleteShiftMutation.isPending}
                  data-testid="button-delete-shift"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shift</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this shift? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteShift} data-testid="button-confirm-delete">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
