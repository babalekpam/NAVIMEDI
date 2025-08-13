import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const UNIFIED_STORAGE_KEY = 'unified_appointments';
const DR_SMITH_ID = '5fe10688-b38e-458e-b38b-bf8a2507b19a';
const DR_BROWN_ID = '9049628e-cd05-4bd6-b08e-ee923c6dec10';
const SARAH_WILLIAMS_ID = 'patient-2';
const JOHN_DOE_ID = 'patient-1';

interface UnifiedAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  type: string;
  reason: string;
  priority: string;
  status: string;
  createdBy: string;
  createdById: string;
  createdAt: string;
  tenantId: string;
}

export default function TestUnifiedAppointments() {
  const [appointments, setAppointments] = useState<UnifiedAppointment[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const log = (message: string, type: string = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  const getUnifiedAppointments = (): UnifiedAppointment[] => {
    try {
      let data = localStorage.getItem(UNIFIED_STORAGE_KEY);
      if (!data) data = sessionStorage.getItem(UNIFIED_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      log(`Error reading appointments: ${error}`, 'error');
      return [];
    }
  };

  const saveUnifiedAppointments = (appointmentList: UnifiedAppointment[]) => {
    try {
      const data = JSON.stringify(appointmentList);
      localStorage.setItem(UNIFIED_STORAGE_KEY, data);
      sessionStorage.setItem(UNIFIED_STORAGE_KEY, data);
      
      // Broadcast sync event
      const syncEvent = new CustomEvent('appointmentSyncEvent', { 
        detail: { appointments: appointmentList, timestamp: Date.now() } 
      });
      window.dispatchEvent(syncEvent);
      
      log(`Saved ${appointmentList.length} appointments to storage`, 'success');
      return true;
    } catch (error) {
      log(`Error saving appointments: ${error}`, 'error');
      return false;
    }
  };

  const createUnifiedAppointment = (data: Partial<UnifiedAppointment>) => {
    const currentAppointments = getUnifiedAppointments();
    
    const newAppointment: UnifiedAppointment = {
      id: `unified_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'scheduled',
      priority: 'normal',
      tenantId: 'metro-general',
      ...data
    } as UnifiedAppointment;
    
    const updatedAppointments = [...currentAppointments, newAppointment];
    saveUnifiedAppointments(updatedAppointments);
    
    log(`Created appointment: ${newAppointment.patientName} → ${newAppointment.doctorName}`, 'success');
    log(`Date: ${newAppointment.date} at ${newAppointment.time}`, 'info');
    log(`Created by: ${newAppointment.createdBy}`, 'info');
    
    setAppointments(updatedAppointments);
    return newAppointment.id;
  };

  // Test appointment creators
  const createPatientAppointment = () => {
    log('Creating appointment from Patient Portal...', 'info');
    createUnifiedAppointment({
      patientId: SARAH_WILLIAMS_ID,
      patientName: 'Sarah Williams',
      patientEmail: 'sarah.williams@email.com',
      patientPhone: '(555) 234-5678',
      doctorId: DR_SMITH_ID,
      doctorName: 'Dr. Michael Smith',
      doctorSpecialization: 'Internal Medicine',
      date: '2025-08-13',
      time: '14:30',
      type: 'Consultation',
      reason: 'Follow-up appointment for test results',
      createdBy: 'patient',
      createdById: SARAH_WILLIAMS_ID
    });
  };

  const createDoctorAppointment = () => {
    log('Creating appointment from Doctor Portal...', 'info');
    createUnifiedAppointment({
      patientId: JOHN_DOE_ID,
      patientName: 'John Doe',
      patientEmail: 'john.doe@email.com',
      patientPhone: '(555) 123-4567',
      doctorId: DR_SMITH_ID,
      doctorName: 'Dr. Michael Smith',
      doctorSpecialization: 'Internal Medicine',
      date: '2025-08-13',
      time: '16:00',
      type: 'Physical Examination',
      reason: 'Annual physical checkup',
      createdBy: 'doctor',
      createdById: DR_SMITH_ID
    });
  };

  const createReceptionistAppointment = () => {
    log('Creating appointment from Receptionist Dashboard...', 'info');
    createUnifiedAppointment({
      patientId: 'patient-4',
      patientName: 'Emily Brown',
      patientEmail: 'emily.brown@email.com',
      patientPhone: '(555) 456-7890',
      doctorId: DR_SMITH_ID,
      doctorName: 'Dr. Michael Smith',
      doctorSpecialization: 'Internal Medicine',
      date: '2025-08-14',
      time: '09:00',
      type: 'Consultation',
      reason: 'Patient called to schedule routine checkup',
      createdBy: 'receptionist',
      createdById: 'receptionist-001'
    });
  };

  const clearAllAppointments = () => {
    if (confirm('Are you sure you want to clear ALL appointments? This cannot be undone.')) {
      localStorage.removeItem(UNIFIED_STORAGE_KEY);
      sessionStorage.removeItem(UNIFIED_STORAGE_KEY);
      localStorage.removeItem('realtime_appointments');
      localStorage.removeItem('nav_appointments');
      localStorage.removeItem('appointment_backup');
      
      log('All appointments cleared from storage', 'warning');
      setAppointments([]);
      
      // Broadcast clear event
      window.dispatchEvent(new CustomEvent('appointmentSyncEvent', { 
        detail: { appointments: [], timestamp: Date.now() } 
      }));
    }
  };

  const refreshStats = () => {
    const currentAppointments = getUnifiedAppointments();
    setAppointments(currentAppointments);
    log(`Statistics updated: ${currentAppointments.length} total appointments`, 'info');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Listen for real-time events
  useEffect(() => {
    const handleSyncEvent = (event: any) => {
      log(`Received sync event: ${event.detail.appointments.length} appointments`, 'success');
      setAppointments(event.detail.appointments);
    };

    window.addEventListener('appointmentSyncEvent', handleSyncEvent);
    
    // Initialize
    const initialAppointments = getUnifiedAppointments();
    setAppointments(initialAppointments);
    log('Unified Appointment Test System Loaded', 'success');
    log(`Dr. Smith ID: ${DR_SMITH_ID}`, 'info');
    log(`Sarah Williams ID: ${SARAH_WILLIAMS_ID}`, 'info');

    return () => {
      window.removeEventListener('appointmentSyncEvent', handleSyncEvent);
    };
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const drSmithCount = appointments.filter(apt => apt.doctorId === DR_SMITH_ID).length;
  const sarahCount = appointments.filter(apt => apt.patientId === SARAH_WILLIAMS_ID).length;
  const todayCount = appointments.filter(apt => apt.date === today).length;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">🏥 Unified Appointment System Test</h1>
        <p className="text-lg text-gray-600">Testing real-time synchronization between Patient Portal, Doctor Portal, and Receptionist Dashboard</p>
      </div>

      {/* Statistics Dashboard */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>📊 System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-lg text-center">
              <div className="text-3xl font-bold mb-2">{appointments.length}</div>
              <div className="text-sm opacity-90">Total Appointments</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-blue-600 text-white p-6 rounded-lg text-center">
              <div className="text-3xl font-bold mb-2">{drSmithCount}</div>
              <div className="text-sm opacity-90">Dr. Smith's Appointments</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-lg text-center">
              <div className="text-3xl font-bold mb-2">{sarahCount}</div>
              <div className="text-sm opacity-90">Sarah Williams' Appointments</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-lg text-center">
              <div className="text-3xl font-bold mb-2">{todayCount}</div>
              <div className="text-sm opacity-90">Today's Appointments</div>
            </div>
          </div>
          <div className="flex gap-4">
            <Button onClick={refreshStats}>🔄 Refresh Statistics</Button>
            <Button onClick={clearAllAppointments} variant="destructive">🗑️ Clear All Data</Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>🧪 Create Test Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6">Test the unified system by creating appointments from different user types:</p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">👤 Patient Portal Simulation</h3>
              <div className="flex gap-4 flex-wrap">
                <Button onClick={createPatientAppointment} className="bg-green-600 hover:bg-green-700">
                  📱 Book as Patient (Sarah Williams)
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">👨‍⚕️ Doctor Portal Simulation</h3>
              <div className="flex gap-4 flex-wrap">
                <Button onClick={createDoctorAppointment} className="bg-blue-600 hover:bg-blue-700">
                  🩺 Schedule as Dr. Smith
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">🏢 Receptionist Dashboard Simulation</h3>
              <div className="flex gap-4 flex-wrap">
                <Button onClick={createReceptionistAppointment} className="bg-yellow-600 hover:bg-yellow-700">
                  📋 Schedule as Receptionist
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Appointments Display */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>📅 Current Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No appointments found. Create some using the buttons above!</p>
          ) : (
            <div className="space-y-4">
              {appointments
                .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
                .map(apt => (
                  <div key={apt.id} className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">{apt.patientName} → {apt.doctorName}</h3>
                        <p className="mb-1"><strong>Type:</strong> {apt.type} | <strong>Reason:</strong> {apt.reason}</p>
                        <p className="mb-2"><strong>Date:</strong> {new Date(apt.date + 'T' + apt.time).toLocaleString()}</p>
                        <div className="text-sm text-gray-600">
                          <span>Created by: <strong>{apt.createdBy}</strong></span> | 
                          <span> Priority: <strong>{apt.priority}</strong></span> | 
                          <span> Status: <strong>{apt.status}</strong></span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>ID: {apt.id}</div>
                        <div>Created: {new Date(apt.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Portal Links */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>🔗 Test in Actual Portals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">After creating appointments above, test them in the real portals:</p>
          <div className="flex gap-4 flex-wrap">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <a href="/patient-portal" target="_blank">👤 Open Patient Portal</a>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <a href="/doctor-portal-fixed" target="_blank">👨‍⚕️ Open Doctor Portal</a>
            </Button>
            <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
              <a href="/receptionist-dashboard" target="_blank">🏢 Open Receptionist Dashboard</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Event Log */}
      <Card>
        <CardHeader>
          <CardTitle>📡 Real-time Event Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-80 overflow-y-auto">
            {logs.length === 0 ? (
              <div>No events logged yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
          <Button onClick={clearLogs} className="mt-4">🧹 Clear Logs</Button>
        </CardContent>
      </Card>
    </div>
  );
}