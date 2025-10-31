import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Calendar, Check, Plus, Trash2, Clock } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

interface PatientReminder {
  id: string;
  patientId: string;
  reminderType: string;
  title: string;
  message: string;
  scheduledFor: string;
  status: string;
  frequency: string;
  endDate: string | null;
}

export default function HealthReminders() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: user?.id || '',
    reminderType: 'medication',
    title: '',
    message: '',
    scheduledFor: '',
    frequency: 'once',
    endDate: ''
  });

  const { data: reminders = [], isLoading } = useQuery<PatientReminder[]>({
    queryKey: ['/api/patient-reminders', user?.id],
    enabled: !!user?.id
  });

  const createReminderMutation = useMutation({
    mutationFn: (data: typeof formData) => apiRequest('/api/patient-reminders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patient-reminders'] });
      setIsCreateDialogOpen(false);
      setFormData({
        patientId: user?.id || '',
        reminderType: 'medication',
        title: '',
        message: '',
        scheduledFor: '',
        frequency: 'once',
        endDate: ''
      });
      toast({
        title: "Reminder Created",
        description: "Your health reminder has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create reminder. Please try again.",
        variant: "destructive"
      });
    }
  });

  const acknowledgeReminderMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/patient-reminders/${id}/acknowledge`, {
      method: 'PATCH'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patient-reminders'] });
      toast({
        title: "Reminder Acknowledged",
        description: "The reminder has been marked as acknowledged."
      });
    }
  });

  const deleteReminderMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/patient-reminders/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patient-reminders'] });
      toast({
        title: "Reminder Deleted",
        description: "The reminder has been deleted."
      });
    }
  });

  const upcomingReminders = reminders.filter(r => 
    new Date(r.scheduledFor) >= new Date() && r.status !== 'acknowledged'
  );
  const pastReminders = reminders.filter(r => 
    new Date(r.scheduledFor) < new Date() || r.status === 'acknowledged'
  );

  const getReminderTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      medication: 'bg-blue-500',
      appointment: 'bg-green-500',
      lab: 'bg-purple-500',
      screening: 'bg-yellow-500',
      follow_up: 'bg-orange-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      acknowledged: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReminderMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2" data-testid="heading-reminders">
            <Bell className="h-8 w-8 text-blue-600" />
            Health Reminders
          </h1>
          <p className="text-gray-600">
            Manage your medication and health appointment reminders
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-reminder">
              <Plus className="h-4 w-4 mr-2" />
              Create Reminder
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-create-reminder">
            <DialogHeader>
              <DialogTitle>Create New Reminder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="reminderType">Reminder Type</Label>
                <Select 
                  value={formData.reminderType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, reminderType: value }))}
                >
                  <SelectTrigger data-testid="select-reminder-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="lab">Lab Test</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  data-testid="input-reminder-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  data-testid="textarea-reminder-message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="scheduledFor">Scheduled Date & Time</Label>
                <Input
                  id="scheduledFor"
                  type="datetime-local"
                  data-testid="input-scheduled-for"
                  value={formData.scheduledFor}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select 
                  value={formData.frequency} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger data-testid="select-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.frequency !== 'once' && (
                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    data-testid="input-end-date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={createReminderMutation.isPending} data-testid="button-submit-reminder">
                {createReminderMutation.isPending ? "Creating..." : "Create Reminder"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Reminders */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Upcoming Reminders ({upcomingReminders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : upcomingReminders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming reminders</p>
          ) : (
            <div className="space-y-4">
              {upcomingReminders.map((reminder) => (
                <div 
                  key={reminder.id} 
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
                  data-testid={`card-reminder-${reminder.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getReminderTypeColor(reminder.reminderType)}>
                        {reminder.reminderType.replace('_', ' ')}
                      </Badge>
                      <Badge className={getStatusColor(reminder.status)} variant="outline">
                        {reminder.status}
                      </Badge>
                      {reminder.frequency !== 'once' && (
                        <Badge variant="secondary">{reminder.frequency}</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1" data-testid={`text-title-${reminder.id}`}>
                      {reminder.title}
                    </h3>
                    <p className="text-gray-600 mb-2">{reminder.message}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(reminder.scheduledFor).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeReminderMutation.mutate(reminder.id)}
                      disabled={reminder.status === 'acknowledged'}
                      data-testid={`button-acknowledge-${reminder.id}`}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Acknowledge
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteReminderMutation.mutate(reminder.id)}
                      data-testid={`button-delete-${reminder.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>Past Reminders ({pastReminders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pastReminders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No past reminders</p>
          ) : (
            <div className="space-y-4">
              {pastReminders.map((reminder) => (
                <div 
                  key={reminder.id} 
                  className="flex items-start gap-4 p-4 border rounded-lg opacity-60"
                  data-testid={`card-past-reminder-${reminder.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getReminderTypeColor(reminder.reminderType)}>
                        {reminder.reminderType.replace('_', ' ')}
                      </Badge>
                      <Badge className={getStatusColor(reminder.status)} variant="outline">
                        {reminder.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{reminder.title}</h3>
                    <p className="text-gray-600 mb-2">{reminder.message}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(reminder.scheduledFor).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
