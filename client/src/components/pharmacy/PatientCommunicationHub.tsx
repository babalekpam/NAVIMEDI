import { useState } from 'react';
import { 
  MessageSquare, Phone, Mail, Bell, Calendar, Clock, 
  CheckCircle, AlertCircle, Users, Send, Smartphone, 
  Video, FileText, QrCode
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface PatientMessage {
  id: string;
  patientName: string;
  patientId: string;
  message: string;
  timestamp: string;
  type: 'sms' | 'email' | 'call' | 'app';
  status: 'sent' | 'delivered' | 'read' | 'replied';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'reminder' | 'ready' | 'consultation' | 'insurance' | 'general';
}

interface CommunicationTemplate {
  id: string;
  name: string;
  category: string;
  message: string;
  channels: ('sms' | 'email' | 'call' | 'app')[];
}

export function PatientCommunicationHub() {
  const [selectedTab, setSelectedTab] = useState<'messages' | 'send' | 'templates' | 'analytics'>('messages');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['sms']);

  const recentMessages: PatientMessage[] = [
    {
      id: 'MSG001',
      patientName: 'Sarah Johnson',
      patientId: 'P12345',
      message: 'Your prescription for Metformin is ready for pickup. Please bring your ID.',
      timestamp: '2025-08-02 14:30',
      type: 'sms',
      status: 'read',
      priority: 'normal',
      category: 'ready'
    },
    {
      id: 'MSG002',
      patientName: 'Mike Chen',
      patientId: 'P12346',
      message: 'Insurance pre-authorization required for Insulin Glargine. Please call us.',
      timestamp: '2025-08-02 13:45',
      type: 'email',
      status: 'delivered',
      priority: 'high',
      category: 'insurance'
    },
    {
      id: 'MSG003',
      patientName: 'Emma Davis',
      patientId: 'P12347',
      message: 'Medication consultation scheduled for tomorrow at 2 PM.',
      timestamp: '2025-08-02 12:15',
      type: 'app',
      status: 'replied',
      priority: 'normal',
      category: 'consultation'
    },
    {
      id: 'MSG004',
      patientName: 'John Smith',
      patientId: 'P12348',
      message: 'Reminder: Take your blood pressure medication at 8 AM daily.',
      timestamp: '2025-08-02 08:00',
      type: 'sms',
      status: 'delivered',
      priority: 'normal',
      category: 'reminder'
    }
  ];

  const communicationTemplates: CommunicationTemplate[] = [
    {
      id: 'T001',
      name: 'Prescription Ready',
      category: 'Pickup Notifications',
      message: 'Hi {patient_name}, your prescription for {medication} is ready for pickup. Please bring your ID and insurance card. Hours: 9 AM - 9 PM.',
      channels: ['sms', 'email', 'app']
    },
    {
      id: 'T002',
      name: 'Insurance Issue',
      category: 'Insurance',
      message: 'Hi {patient_name}, there\'s an issue with your insurance coverage for {medication}. Please call us at {pharmacy_phone} to discuss alternatives.',
      channels: ['call', 'email']
    },
    {
      id: 'T003',
      name: 'Medication Reminder',
      category: 'Adherence',
      message: 'Reminder: It\'s time to take your {medication}. Consistency is key to your health. Reply STOP to unsubscribe.',
      channels: ['sms', 'app']
    },
    {
      id: 'T004',
      name: 'Consultation Booking',
      category: 'Services',
      message: 'Hello {patient_name}, would you like to schedule a medication therapy management consultation? Reply YES or call {pharmacy_phone}.',
      channels: ['sms', 'email', 'call']
    },
    {
      id: 'T005',
      name: 'Refill Reminder',
      category: 'Refills',
      message: 'Hi {patient_name}, your {medication} prescription expires soon. Reply with your preferred pickup date or call to schedule.',
      channels: ['sms', 'email', 'app']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-blue-600 bg-blue-50';
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'read': return 'text-purple-600 bg-purple-50';
      case 'replied': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'normal': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'sms': return <Smartphone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      case 'app': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ready': return 'text-green-700 bg-green-100';
      case 'reminder': return 'text-blue-700 bg-blue-100';
      case 'consultation': return 'text-purple-700 bg-purple-100';
      case 'insurance': return 'text-orange-700 bg-orange-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const handleSendMessage = () => {
    // Implementation for sending message
    console.log('Sending message:', {
      patient: selectedPatient,
      message: messageText,
      channels: selectedChannels,
      template: selectedTemplate
    });
    
    // Reset form
    setMessageText('');
    setSelectedPatient('');
    setSelectedTemplate('');
  };

  const communicationStats = {
    totalSent: 1247,
    deliveryRate: 94.8,
    responseRate: 23.4,
    avgResponseTime: '2.5 hours'
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Patient Communication Hub
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={selectedTab === 'messages' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('messages')}
            >
              Messages
            </Button>
            <Button
              size="sm"
              variant={selectedTab === 'send' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('send')}
            >
              Send
            </Button>
            <Button
              size="sm"
              variant={selectedTab === 'templates' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('templates')}
            >
              Templates
            </Button>
            <Button
              size="sm"
              variant={selectedTab === 'analytics' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('analytics')}
            >
              Analytics
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {selectedTab === 'messages' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>12 delivered today</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>3 pending responses</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span>1 failed delivery</span>
              </div>
            </div>

            <div className="space-y-3">
              {recentMessages.map((message) => (
                <div key={message.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getChannelIcon(message.type)}
                        <span className="font-medium">{message.patientName}</span>
                      </div>
                      <Badge className={getCategoryColor(message.category)}>
                        {message.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(message.priority)}>
                        {message.priority}
                      </Badge>
                      <Badge className={getStatusColor(message.status)}>
                        {message.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{message.message}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Patient ID: {message.patientId}</span>
                    <span>{message.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'send' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Select Patient</label>
                <Input
                  placeholder="Search patient by name or ID..."
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Use Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select a template...</option>
                  {communicationTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <Textarea
                placeholder="Type your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Communication Channels</label>
              <div className="flex gap-4">
                {[
                  { id: 'sms', label: 'SMS', icon: <Smartphone className="w-4 h-4" /> },
                  { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
                  { id: 'call', label: 'Call', icon: <Phone className="w-4 h-4" /> },
                  { id: 'app', label: 'App', icon: <MessageSquare className="w-4 h-4" /> }
                ].map((channel) => (
                  <Button
                    key={channel.id}
                    size="sm"
                    variant={selectedChannels.includes(channel.id) ? 'default' : 'outline'}
                    onClick={() => {
                      if (selectedChannels.includes(channel.id)) {
                        setSelectedChannels(selectedChannels.filter(c => c !== channel.id));
                      } else {
                        setSelectedChannels([...selectedChannels, channel.id]);
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    {channel.icon}
                    {channel.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Schedule Later
              </Button>
            </div>
          </div>
        )}

        {selectedTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Message Templates</h3>
              <Button size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>

            <div className="space-y-4">
              {communicationTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Use</Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{template.message}</p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Channels:</span>
                    {template.channels.map((channel) => (
                      <div key={channel} className="flex items-center gap-1 text-xs text-gray-600">
                        {getChannelIcon(channel)}
                        <span>{channel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Messages Sent</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{communicationStats.totalSent}</p>
                <p className="text-xs text-blue-600">This month</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Delivery Rate</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{communicationStats.deliveryRate}%</p>
                <p className="text-xs text-green-600">Successfully delivered</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Response Rate</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">{communicationStats.responseRate}%</p>
                <p className="text-xs text-purple-600">Patients responding</p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Avg Response Time</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">{communicationStats.avgResponseTime}</p>
                <p className="text-xs text-orange-600">Patient response time</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4">Channel Performance</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">SMS</span>
                    </div>
                    <span className="text-sm font-medium">96.2% delivery</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Email</span>
                    </div>
                    <span className="text-sm font-medium">89.5% delivery</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">App Notification</span>
                    </div>
                    <span className="text-sm font-medium">98.7% delivery</span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4">Message Categories</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Prescription Ready</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medication Reminders</span>
                    <span className="text-sm font-medium">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Insurance Issues</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Consultations</span>
                    <span className="text-sm font-medium">12%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}