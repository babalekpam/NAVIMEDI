import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Clock, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TimeTracking() {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location not available:', error);
        }
      );
    }
  }, []);

  const { data: activeLog, isLoading: activeLogLoading } = useQuery({
    queryKey: ['/api/scheduling/time-logs', 'active'],
    queryFn: async () => {
      const response = await fetch('/api/scheduling/time-logs?status=clocked_in');
      if (!response.ok) throw new Error('Failed to fetch active log');
      const logs = await response.json();
      return logs.length > 0 ? logs[0] : null;
    },
    refetchInterval: 5000,
  });

  const { data: timeLogs = [], isLoading: timeLogsLoading } = useQuery({
    queryKey: ['/api/scheduling/time-logs'],
    queryFn: async () => {
      const response = await fetch('/api/scheduling/time-logs');
      if (!response.ok) throw new Error('Failed to fetch time logs');
      return response.json();
    },
  });

  const { data: summary } = useQuery({
    queryKey: ['/api/scheduling/time-logs', 'summary'],
    queryFn: async () => {
      const thisWeekLogs = timeLogs.filter((log: any) => {
        const logDate = new Date(log.clockInTime);
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return logDate >= weekStart;
      });

      const totalHours = thisWeekLogs.reduce((sum: number, log: any) => {
        return sum + (parseFloat(log.totalHours || '0'));
      }, 0);

      const overtimeHours = thisWeekLogs.reduce((sum: number, log: any) => {
        return sum + (parseFloat(log.overtimeHours || '0'));
      }, 0);

      return { totalHours, overtimeHours };
    },
    enabled: timeLogs.length > 0,
  });

  const clockInMutation = useMutation({
    mutationFn: async () => {
      const locationStr = location ? `${location.lat},${location.lng}` : null;
      return apiRequest('/api/scheduling/clock-in', {
        method: 'POST',
        body: JSON.stringify({
          location: locationStr,
        }),
      });
    },
    onSuccess: () => {
      toast({ title: 'Clocked in successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduling/time-logs'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to clock in',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async (data: { timeLogId: number; breakMinutes?: number }) => {
      const locationStr = location ? `${location.lat},${location.lng}` : null;
      return apiRequest('/api/scheduling/clock-out', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          location: locationStr,
        }),
      });
    },
    onSuccess: () => {
      toast({ title: 'Clocked out successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduling/time-logs'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to clock out',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const approveLogMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/scheduling/time-logs/${id}/approve`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      toast({ title: 'Time log approved successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduling/time-logs'] });
      setSelectedLog(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to approve time log',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const handleClockIn = () => {
    clockInMutation.mutate();
  };

  const handleClockOut = () => {
    if (activeLog) {
      clockOutMutation.mutate({
        timeLogId: activeLog.id,
        breakMinutes: 30,
      });
    }
  };

  const getElapsedTime = () => {
    if (!activeLog) return '00:00:00';
    const start = new Date(activeLog.clockInTime);
    const diff = Math.floor((currentTime.getTime() - start.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const statusColors: Record<string, string> = {
    'clocked_in': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
    'clocked_out': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100',
    'approved': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
    'disputed': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">Time Tracking</h1>
        <p className="text-muted-foreground dark:text-muted-foreground">Clock in and out, track your work hours</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Time Clock</CardTitle>
            <CardDescription>Current time: {format(currentTime, 'PPpp')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {activeLog ? (
              <div className="space-y-4">
                <div className="p-6 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium">Currently Clocked In</span>
                    </div>
                    <Badge className="bg-blue-600 dark:bg-blue-600" data-testid="status-clocked-in">Active</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground dark:text-muted-foreground">Clock In Time</div>
                    <div className="text-lg font-semibold" data-testid="text-clock-in-time">
                      {format(new Date(activeLog.clockInTime), 'PPpp')}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                    <div className="text-sm text-muted-foreground dark:text-muted-foreground mb-2">Elapsed Time</div>
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 tabular-nums" data-testid="text-elapsed-time">
                      {getElapsedTime()}
                    </div>
                  </div>
                </div>
                <Button
                  size="lg"
                  variant="destructive"
                  className="w-full h-16 text-lg"
                  onClick={handleClockOut}
                  disabled={clockOutMutation.isPending}
                  data-testid="button-clock-out"
                >
                  <Clock className="w-6 h-6 mr-2" />
                  {clockOutMutation.isPending ? 'Clocking Out...' : 'Clock Out'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Clock className="w-16 h-16 mx-auto text-muted-foreground dark:text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground dark:text-muted-foreground">Not clocked in</p>
                  {location && (
                    <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span data-testid="text-location">Location detected</span>
                    </div>
                  )}
                </div>
                <Button
                  size="lg"
                  className="w-full h-16 text-lg"
                  onClick={handleClockIn}
                  disabled={clockInMutation.isPending || activeLogLoading}
                  data-testid="button-clock-in"
                >
                  <Clock className="w-6 h-6 mr-2" />
                  {clockInMutation.isPending ? 'Clocking In...' : 'Clock In'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Week Summary</CardTitle>
            <CardDescription>Hours worked this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground dark:text-muted-foreground mb-1">Total Hours</div>
              <div className="text-3xl font-bold" data-testid="text-total-hours">
                {summary?.totalHours.toFixed(2) || '0.00'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground dark:text-muted-foreground mb-1">Overtime Hours</div>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400" data-testid="text-overtime-hours">
                {summary?.overtimeHours.toFixed(2) || '0.00'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time Log History</CardTitle>
          <CardDescription>Your recent time entries</CardDescription>
        </CardHeader>
        <CardContent>
          {timeLogsLoading ? (
            <div className="text-center py-8" data-testid="loading-time-logs">Loading time logs...</div>
          ) : timeLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground dark:text-muted-foreground">
              No time logs yet. Clock in to start tracking your time.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeLogs.map((log: any) => (
                    <TableRow key={log.id} data-testid={`row-time-log-${log.id}`}>
                      <TableCell data-testid={`cell-date-${log.id}`}>
                        {format(new Date(log.clockInTime), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell data-testid={`cell-clock-in-${log.id}`}>
                        {format(new Date(log.clockInTime), 'HH:mm')}
                      </TableCell>
                      <TableCell data-testid={`cell-clock-out-${log.id}`}>
                        {log.clockOutTime ? format(new Date(log.clockOutTime), 'HH:mm') : '-'}
                      </TableCell>
                      <TableCell data-testid={`cell-total-hours-${log.id}`}>
                        {log.totalHours ? `${parseFloat(log.totalHours).toFixed(2)}h` : '-'}
                      </TableCell>
                      <TableCell data-testid={`cell-overtime-${log.id}`}>
                        {log.overtimeHours && parseFloat(log.overtimeHours) > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            {parseFloat(log.overtimeHours).toFixed(2)}h
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={statusColors[log.status] || ''}
                          data-testid={`badge-status-${log.id}`}
                        >
                          {log.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          data-testid={`button-view-log-${log.id}`}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Time Log Details</DialogTitle>
              <DialogDescription>
                {format(new Date(selectedLog.clockInTime), 'PPP')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Clock In</div>
                  <div className="text-lg" data-testid="text-detail-clock-in">
                    {format(new Date(selectedLog.clockInTime), 'HH:mm:ss')}
                  </div>
                  {selectedLog.clockInLocation && (
                    <div className="text-xs text-muted-foreground dark:text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      Location tracked
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Clock Out</div>
                  <div className="text-lg" data-testid="text-detail-clock-out">
                    {selectedLog.clockOutTime ? format(new Date(selectedLog.clockOutTime), 'HH:mm:ss') : 'Not clocked out'}
                  </div>
                  {selectedLog.clockOutLocation && (
                    <div className="text-xs text-muted-foreground dark:text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      Location tracked
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Total Hours</div>
                  <div className="text-lg font-semibold" data-testid="text-detail-total-hours">
                    {selectedLog.totalHours ? `${parseFloat(selectedLog.totalHours).toFixed(2)}h` : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Break</div>
                  <div className="text-lg" data-testid="text-detail-break">
                    {selectedLog.breakMinutes || 0} min
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Overtime</div>
                  <div className="text-lg font-semibold text-amber-600 dark:text-amber-400" data-testid="text-detail-overtime">
                    {selectedLog.overtimeHours ? `${parseFloat(selectedLog.overtimeHours).toFixed(2)}h` : '0h'}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-2">Status</div>
                <Badge className={statusColors[selectedLog.status] || ''} data-testid="text-detail-status">
                  {selectedLog.status.replace('_', ' ')}
                </Badge>
              </div>
              {selectedLog.status === 'clocked_out' && !selectedLog.approvedBy && (
                <Button
                  className="w-full"
                  onClick={() => approveLogMutation.mutate(selectedLog.id)}
                  disabled={approveLogMutation.isPending}
                  data-testid="button-approve-log"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Time Log
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
