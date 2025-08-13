// Real-time appointment synchronization system
interface RealTimeAppointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  reason: string;
  status: string;
  createdAt: string;
}

const STORAGE_KEY = 'realtime_appointments';
const BACKUP_KEY = 'appointment_backup';

// Real-time event system
const appointmentEvents = new EventTarget();

// Get appointments with multiple storage checks
const getAppointments = (): RealTimeAppointment[] => {
  try {
    // Try localStorage first
    let data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Try sessionStorage as backup
      data = sessionStorage.getItem(STORAGE_KEY);
    }
    if (!data) {
      // Try backup key
      data = localStorage.getItem(BACKUP_KEY);
    }
    
    const appointments = data ? JSON.parse(data) : [];
    console.log(`📱 Retrieved ${appointments.length} appointments from storage`);
    return appointments;
  } catch (error) {
    console.error("❌ Error reading appointments:", error);
    return [];
  }
};

// Save to multiple storage locations
const saveAppointments = (appointments: RealTimeAppointment[]): void => {
  try {
    const data = JSON.stringify(appointments);
    localStorage.setItem(STORAGE_KEY, data);
    sessionStorage.setItem(STORAGE_KEY, data);
    localStorage.setItem(BACKUP_KEY, data);
    console.log(`💾 Saved ${appointments.length} appointments to multiple storages`);
  } catch (error) {
    console.error("❌ Failed to save appointments:", error);
  }
};

// Add appointment with immediate broadcast
const addAppointment = (appointment: Omit<RealTimeAppointment, 'id' | 'createdAt'>): string => {
  const newAppointment: RealTimeAppointment = {
    ...appointment,
    id: `rt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };

  console.log("🚀 Adding real-time appointment:", newAppointment);
  console.log("🎯 Doctor ID:", newAppointment.doctorId);
  console.log("👤 Patient:", newAppointment.patientName);
  
  const appointments = getAppointments();
  appointments.push(newAppointment);
  saveAppointments(appointments);
  
  // Broadcast to all listeners immediately
  const customEvent = new CustomEvent('appointmentAdded', { 
    detail: newAppointment 
  });
  appointmentEvents.dispatchEvent(customEvent);
  window.dispatchEvent(customEvent);
  
  // Also trigger storage events manually
  window.dispatchEvent(new StorageEvent('storage', {
    key: STORAGE_KEY,
    newValue: JSON.stringify(appointments),
    storageArea: localStorage
  }));
  
  console.log("✅ Real-time appointment added and broadcasted");
  return newAppointment.id;
};

// Get doctor appointments with real-time filtering
const getDoctorAppointments = (doctorId: string): RealTimeAppointment[] => {
  const appointments = getAppointments();
  console.log(`🔍 Filtering for doctor: "${doctorId}"`);
  console.log("📋 All appointments:", appointments);
  
  const filtered = appointments.filter(apt => {
    const match = apt.doctorId === doctorId;
    console.log(`⚡ "${apt.doctorId}" === "${doctorId}": ${match}`);
    return match;
  });
  
  console.log(`👨‍⚕️ Found ${filtered.length} appointments for doctor ${doctorId}`);
  return filtered;
};

// Get patient appointments
const getPatientAppointments = (patientId: string): RealTimeAppointment[] => {
  const appointments = getAppointments();
  return appointments.filter(apt => apt.patientId === patientId);
};

// Subscribe to appointment changes
const subscribeToAppointments = (callback: (appointments: RealTimeAppointment[]) => void): (() => void) => {
  const handler = () => callback(getAppointments());
  
  appointmentEvents.addEventListener('appointmentAdded', handler);
  window.addEventListener('storage', handler);
  window.addEventListener('appointmentAdded', handler);
  
  return () => {
    appointmentEvents.removeEventListener('appointmentAdded', handler);
    window.removeEventListener('storage', handler);
    window.removeEventListener('appointmentAdded', handler);
  };
};

// Clear all appointments
const clearAllAppointments = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(BACKUP_KEY);
  console.log("🗑️ All appointments cleared");
  
  window.dispatchEvent(new CustomEvent('appointmentsCleared'));
};

export const RealTimeAppointments = {
  getAppointments,
  addAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  subscribeToAppointments,
  clearAllAppointments
};