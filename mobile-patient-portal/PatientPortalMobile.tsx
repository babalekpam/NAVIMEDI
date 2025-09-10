import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MessageCircle, 
  FileText, 
  Pill, 
  Activity, 
  User, 
  Shield, 
  Heart, 
  Thermometer, 
  Clock,
  LogOut,
  Phone,
  Mail,
  Download,
  Plus,
  Search,
  Settings,
  Bell
} from 'lucide-react';

// Mobile-optimized Patient Portal Component for NaviMED
export default function PatientPortalMobile() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  // Patient data states
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [messages, setMessages] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [bills, setBills] = useState([]);
  
  // Mobile API base URL - connects to NaviMED platform
  const API_BASE_URL = 'https://navimedi.org/api';
  
  // API Key for mobile app authentication
  const MOBILE_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
  
  // Initialize patient session
  useEffect(() => {
    initializePatientSession();
  }, []);

  const initializePatientSession = async () => {
    try {
      const token = localStorage.getItem('patient_auth_token');
      const userData = localStorage.getItem('patient_user_data');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
        await loadPatientData(token);
      }
    } catch (error) {
      console.error('Session initialization error:', error);
    }
    setIsLoading(false);
  };

  // Mobile API request helper
  const mobileApiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('patient_auth_token');
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Mobile-App': 'NaviMED-Patient-Portal',
        'X-Mobile-API-Key': MOBILE_API_KEY,
        'X-App-Version': '1.0.0',
        ...options.headers
      }
    };

    if (options.body) {
      defaultOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle token expiration
        handleLogout();
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  };

  // Load all patient data
  const loadPatientData = async (token) => {
    try {
      const [
        profileData,
        appointmentsData,
        prescriptionsData,
        labResultsData,
        messagesData,
        healthTrackingData,
        billsData
      ] = await Promise.allSettled([
        mobileApiRequest('/patient/profile'),
        mobileApiRequest('/patient/appointments'),
        mobileApiRequest('/patient/prescriptions'),
        mobileApiRequest('/patient/lab-results'),
        mobileApiRequest('/medical-communications'),
        mobileApiRequest('/patient/health-tracking'),
        mobileApiRequest('/patient/bills')
      ]);

      // Handle successful responses
      if (appointmentsData.status === 'fulfilled') setAppointments(appointmentsData.value || []);
      if (prescriptionsData.status === 'fulfilled') setPrescriptions(prescriptionsData.value || []);
      if (labResultsData.status === 'fulfilled') setLabResults(labResultsData.value || []);
      if (messagesData.status === 'fulfilled') setMessages(messagesData.value || []);
      if (healthTrackingData.status === 'fulfilled') setHealthData(healthTrackingData.value || {});
      if (billsData.status === 'fulfilled') setBills(billsData.value || []);

    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  };

  // Patient authentication
  const handleLogin = async (email, password, tenantId = 'SAINT PAUL') => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Mobile-App': 'NaviMED-Patient-Portal'
        },
        body: JSON.stringify({
          email,
          password,
          tenantId,
          userType: 'patient'
        })
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      // Store auth data
      localStorage.setItem('patient_auth_token', data.token);
      localStorage.setItem('patient_user_data', JSON.stringify(data.user));
      
      setUser(data.user);
      await loadPatientData(data.token);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('patient_auth_token');
    localStorage.removeItem('patient_user_data');
    setUser(null);
    setActiveSection('overview');
  };

  // Send message to healthcare provider
  const sendMessage = async (messageData) => {
    try {
      await mobileApiRequest('/medical-communications', {
        method: 'POST',
        body: {
          ...messageData,
          patientId: user?.id,
          type: 'patient_message'
        }
      });
      
      // Reload messages
      const updatedMessages = await mobileApiRequest('/medical-communications');
      setMessages(updatedMessages || []);
      
      return { success: true };
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false, error: error.message };
    }
  };

  // Book appointment
  const bookAppointment = async (appointmentData) => {
    try {
      await mobileApiRequest('/appointments', {
        method: 'POST',
        body: {
          ...appointmentData,
          patientId: user?.id,
          status: 'requested'
        }
      });
      
      // Reload appointments
      const updatedAppointments = await mobileApiRequest('/patient/appointments');
      setAppointments(updatedAppointments || []);
      
      return { success: true };
    } catch (error) {
      console.error('Book appointment error:', error);
      return { success: false, error: error.message };
    }
  };

  // Download lab result
  const downloadLabResult = async (labResultId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patient/lab-results/${labResultId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('patient_auth_token')}`,
          'X-Mobile-App': 'NaviMED-Patient-Portal'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        // Handle file download for mobile
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Lab_Result_${labResultId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  // Mobile Login Screen
  const renderLogin = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-blue-600">NaviMED</h1>
          <p className="text-gray-600">Patient Portal</p>
        </div>
        
        <PatientLoginForm onLogin={handleLogin} isLoading={isLoading} />
      </div>
    </div>
  );

  // Mobile Dashboard Overview
  const renderOverview = () => (
    <div className="space-y-6 p-4">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
        <h2 className="text-xl font-bold mb-2">Welcome, {user?.firstName}!</h2>
        <p className="text-blue-100">Your health dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-900">
            {appointments.filter(a => new Date(a.appointmentDate) > new Date()).length}
          </p>
          <p className="text-sm text-green-800">Upcoming</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <Pill className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-900">
            {prescriptions.filter(p => ['prescribed', 'ready'].includes(p.status)).length}
          </p>
          <p className="text-sm text-blue-800">Active Rx</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <FileText className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-900">
            {labResults.filter(l => l.status === 'completed').length}
          </p>
          <p className="text-sm text-purple-800">Results</p>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <MessageCircle className="h-6 w-6 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-orange-900">
            {messages.filter(m => !m.isRead).length}
          </p>
          <p className="text-sm text-orange-800">New Messages</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setActiveSection('appointments')}
            className="flex flex-col items-center p-3 bg-blue-50 rounded-lg"
          >
            <Calendar className="h-6 w-6 text-blue-600 mb-1" />
            <span className="text-sm text-blue-800">Appointments</span>
          </button>
          
          <button 
            onClick={() => setActiveSection('messages')}
            className="flex flex-col items-center p-3 bg-green-50 rounded-lg"
          >
            <MessageCircle className="h-6 w-6 text-green-600 mb-1" />
            <span className="text-sm text-green-800">Messages</span>
          </button>
          
          <button 
            onClick={() => setActiveSection('results')}
            className="flex flex-col items-center p-3 bg-purple-50 rounded-lg"
          >
            <FileText className="h-6 w-6 text-purple-600 mb-1" />
            <span className="text-sm text-purple-800">Test Results</span>
          </button>
          
          <button 
            onClick={() => setActiveSection('medications')}
            className="flex flex-col items-center p-3 bg-orange-50 rounded-lg"
          >
            <Pill className="h-6 w-6 text-orange-600 mb-1" />
            <span className="text-sm text-orange-800">Medications</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      {appointments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Recent Appointments</h3>
          {appointments.slice(0, 3).map((appointment) => (
            <div key={appointment.id} className="border-l-4 border-blue-500 pl-3 py-2 mb-3">
              <p className="font-medium">{appointment.type}</p>
              <p className="text-sm text-gray-600">
                {new Date(appointment.appointmentDate).toLocaleDateString()}
              </p>
              <span className={`inline-block px-2 py-1 text-xs rounded ${
                appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {appointment.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Mobile Navigation
  const renderNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {[
          { id: 'overview', icon: Activity, label: 'Home' },
          { id: 'appointments', icon: Calendar, label: 'Appointments' },
          { id: 'messages', icon: MessageCircle, label: 'Messages' },
          { id: 'results', icon: FileText, label: 'Results' },
          { id: 'medications', icon: Pill, label: 'Medications' }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col items-center py-1 px-3 rounded ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Main mobile app layout
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return renderLogin();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="h-6 w-6 text-blue-600 mr-2" />
          <h1 className="text-lg font-semibold text-blue-600">NaviMED</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Bell className="h-5 w-5 text-gray-600" />
          <User className="h-5 w-5 text-gray-600" />
          <button onClick={handleLogout}>
            <LogOut className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'appointments' && <AppointmentsList appointments={appointments} onBookAppointment={bookAppointment} />}
        {activeSection === 'messages' && <MessagesList messages={messages} onSendMessage={sendMessage} />}
        {activeSection === 'results' && <LabResultsList labResults={labResults} onDownload={downloadLabResult} />}
        {activeSection === 'medications' && <MedicationsList prescriptions={prescriptions} />}
      </div>

      {/* Bottom Navigation */}
      {renderNavigation()}
    </div>
  );
}

// Login Form Component
function PatientLoginForm({ onLogin, isLoading }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await onLogin(formData.email, formData.password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
      
      {/* Quick test login buttons */}
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-2">Quick test login:</p>
        <button
          type="button"
          onClick={() => {
            setFormData({ email: 'john.patient@example.com', password: 'password123' });
            setTimeout(() => onLogin('john.patient@example.com', 'password123'), 100);
          }}
          className="text-xs text-blue-600 underline"
        >
          Use Test Patient Account
        </button>
      </div>
    </form>
  );
}

// Appointments List Component
function AppointmentsList({ appointments, onBookAppointment }) {
  const [showBookForm, setShowBookForm] = useState(false);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Appointments</h2>
        <button
          onClick={() => setShowBookForm(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
        >
          <Plus className="h-4 w-4 inline mr-1" />
          Book
        </button>
      </div>

      <div className="space-y-3">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{appointment.type}</p>
                <p className="text-sm text-gray-600">
                  {new Date(appointment.appointmentDate).toLocaleDateString()} at{' '}
                  {new Date(appointment.appointmentDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {appointment.providerFirstName && (
                  <p className="text-sm text-gray-500">
                    Dr. {appointment.providerFirstName} {appointment.providerLastName}
                  </p>
                )}
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {appointment.status}
              </span>
            </div>
          </div>
        ))}
        
        {appointments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No appointments scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Messages List Component
function MessagesList({ messages, onSendMessage }) {
  const [showComposeForm, setShowComposeForm] = useState(false);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Messages</h2>
        <button
          onClick={() => setShowComposeForm(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
        >
          <Plus className="h-4 w-4 inline mr-1" />
          New
        </button>
      </div>

      <div className="space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="font-medium">{message.subject}</p>
              {!message.isRead && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{message.message}</p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>From: {message.senderName}</span>
              <span>{new Date(message.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No messages</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Lab Results List Component
function LabResultsList({ labResults, onDownload }) {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Test Results</h2>

      <div className="space-y-3">
        {labResults.map((result) => (
          <div key={result.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium">{result.testName}</p>
                <p className="text-sm text-gray-600">
                  {new Date(result.orderedDate).toLocaleDateString()}
                </p>
                <span className={`inline-block px-2 py-1 text-xs rounded mt-2 ${
                  result.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {result.status}
                </span>
              </div>
              {result.status === 'completed' && (
                <button
                  onClick={() => onDownload(result.id)}
                  className="text-blue-600 p-2"
                >
                  <Download className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
        
        {labResults.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No test results</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Medications List Component
function MedicationsList({ prescriptions }) {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">My Medications</h2>

      <div className="space-y-3">
        {prescriptions.map((prescription) => (
          <div key={prescription.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium">{prescription.medicationName}</p>
                <p className="text-sm text-gray-600">
                  {prescription.dosage} • {prescription.frequency}
                </p>
                <p className="text-sm text-gray-500">
                  Prescribed: {new Date(prescription.prescriptionDate).toLocaleDateString()}
                </p>
                <span className={`inline-block px-2 py-1 text-xs rounded mt-2 ${
                  prescription.status === 'dispensed' ? 'bg-green-100 text-green-800' :
                  prescription.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {prescription.status}
                </span>
              </div>
            </div>
            {prescription.instructions && (
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">{prescription.instructions}</p>
              </div>
            )}
          </div>
        ))}
        
        {prescriptions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Pill className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No medications</p>
          </div>
        )}
      </div>
    </div>
  );
}