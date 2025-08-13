// Simple, reliable appointment synchronization system
interface Appointment {
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

const STORAGE_KEY = 'nav_appointments';

// Force clear and reset
const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
  console.log("✅ Storage cleared");
};

// Get all appointments with force refresh
const getAppointments = (): Appointment[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const appointments = data ? JSON.parse(data) : [];
    console.log(`📋 Retrieved ${appointments.length} appointments:`, appointments);
    return appointments;
  } catch (error) {
    console.error("❌ Error reading appointments:", error);
    return [];
  }
};

// Add appointment with immediate save
const addAppointment = (appointment: Omit<Appointment, 'id' | 'createdAt'>): string => {
  const newAppointment: Appointment = {
    ...appointment,
    id: `appt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };

  console.log("🔄 Adding appointment:", newAppointment);
  console.log("📊 Doctor ID being saved:", newAppointment.doctorId);
  
  const appointments = getAppointments();
  appointments.push(newAppointment);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    console.log("✅ Appointment saved successfully");
    console.log(`📊 Total appointments: ${appointments.length}`);
    console.log("🔍 Saved appointment with doctorId:", newAppointment.doctorId);
    
    // Verify immediately after save
    const verification = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const found = verification.find((apt: Appointment) => apt.id === newAppointment.id);
    console.log("✅ Verification - appointment exists:", !!found);
    if (found) {
      console.log("✅ Verification - doctorId matches:", found.doctorId === newAppointment.doctorId);
    }
    
    // Dispatch custom event for real-time sync
    window.dispatchEvent(new CustomEvent('appointmentAdded', { 
      detail: newAppointment 
    }));
    
    return newAppointment.id;
  } catch (error) {
    console.error("❌ Failed to save appointment:", error);
    return "";
  }
};

// Get appointments for specific doctor
const getDoctorAppointments = (doctorId: string): Appointment[] => {
  const appointments = getAppointments();
  console.log(`🔍 Searching for doctorId: "${doctorId}"`);
  console.log(`📋 All appointments:`, appointments);
  
  const filtered = appointments.filter(apt => {
    console.log(`⚖️ Comparing "${apt.doctorId}" === "${doctorId}": ${apt.doctorId === doctorId}`);
    return apt.doctorId === doctorId;
  });
  
  console.log(`👨‍⚕️ Doctor ${doctorId} filtered appointments:`, filtered);
  return filtered;
};

// Get appointments for specific patient  
const getPatientAppointments = (patientId: string): Appointment[] => {
  const appointments = getAppointments();
  return appointments.filter(apt => apt.patientId === patientId);
};

export const AppointmentSync = {
  clearStorage,
  getAppointments,
  addAppointment,
  getDoctorAppointments,
  getPatientAppointments
};

export type { Appointment };