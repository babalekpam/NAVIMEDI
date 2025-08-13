// Unified appointment system for all user types (patients, doctors, receptionists)
interface UnifiedAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization?: string;
  date: string;
  time: string;
  type: string;
  reason: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  priority?: 'normal' | 'high' | 'urgent';
  notes?: string;
  createdAt: string;
  createdBy: string; // 'patient' | 'doctor' | 'receptionist'
  createdById: string; // ID of who created the appointment
  tenantId: string; // Hospital/clinic ID for multi-tenant support
}

const UNIFIED_STORAGE_KEY = 'unified_appointments';
const BACKUP_STORAGE_KEY = 'unified_appointments_backup';
const SYNC_EVENT_KEY = 'appointmentSyncEvent';

// Centralized event system
const appointmentEventTarget = new EventTarget();

class UnifiedAppointmentManager {
  private static instance: UnifiedAppointmentManager;
  
  public static getInstance(): UnifiedAppointmentManager {
    if (!UnifiedAppointmentManager.instance) {
      UnifiedAppointmentManager.instance = new UnifiedAppointmentManager();
    }
    return UnifiedAppointmentManager.instance;
  }

  // Get all appointments with multi-storage fallback
  getAppointments(): UnifiedAppointment[] {
    try {
      let data = localStorage.getItem(UNIFIED_STORAGE_KEY);
      if (!data) data = sessionStorage.getItem(UNIFIED_STORAGE_KEY);
      if (!data) data = localStorage.getItem(BACKUP_STORAGE_KEY);
      
      const appointments = data ? JSON.parse(data) : [];
      console.log(`📋 [UNIFIED] Retrieved ${appointments.length} appointments from storage`);
      return appointments;
    } catch (error) {
      console.error("❌ [UNIFIED] Error reading appointments:", error);
      return [];
    }
  }

  // Save to multiple storage locations for reliability
  private saveAppointments(appointments: UnifiedAppointment[]): void {
    try {
      const data = JSON.stringify(appointments);
      localStorage.setItem(UNIFIED_STORAGE_KEY, data);
      sessionStorage.setItem(UNIFIED_STORAGE_KEY, data);
      localStorage.setItem(BACKUP_STORAGE_KEY, data);
      
      console.log(`💾 [UNIFIED] Saved ${appointments.length} appointments to storage`);
      
      // Broadcast sync event
      this.broadcastSync(appointments);
    } catch (error) {
      console.error("❌ [UNIFIED] Failed to save appointments:", error);
    }
  }

  // Broadcast appointment changes to all listeners
  private broadcastSync(appointments: UnifiedAppointment[]): void {
    const syncEvent = new CustomEvent(SYNC_EVENT_KEY, { 
      detail: { appointments, timestamp: Date.now() } 
    });
    
    appointmentEventTarget.dispatchEvent(syncEvent);
    window.dispatchEvent(syncEvent);
    
    // Also trigger storage events for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: UNIFIED_STORAGE_KEY,
      newValue: JSON.stringify(appointments),
      storageArea: localStorage
    }));
    
    console.log(`📡 [UNIFIED] Broadcasted sync event to all listeners`);
  }

  // Create appointment (works for all user types)
  createAppointment(data: {
    patientId: string;
    patientName: string;
    patientEmail?: string;
    patientPhone?: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialization?: string;
    date: string;
    time: string;
    type: string;
    reason: string;
    status?: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
    priority?: 'normal' | 'high' | 'urgent';
    notes?: string;
    createdBy: 'patient' | 'doctor' | 'receptionist';
    createdById: string;
    tenantId?: string;
  }): string {
    const appointments = this.getAppointments();
    
    const newAppointment: UnifiedAppointment = {
      id: `unified_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'scheduled',
      priority: 'normal',
      tenantId: 'metro-general', // Default tenant
      ...data
    };

    console.log(`🚀 [UNIFIED] Creating appointment:`, newAppointment);
    console.log(`👤 Created by: ${data.createdBy} (${data.createdById})`);
    console.log(`🏥 Patient: ${data.patientName} → Doctor: ${data.doctorName}`);
    console.log(`📅 Date/Time: ${data.date} at ${data.time}`);
    
    appointments.push(newAppointment);
    this.saveAppointments(appointments);
    
    return newAppointment.id;
  }

  // Get appointments for specific doctor
  getDoctorAppointments(doctorId: string): UnifiedAppointment[] {
    const appointments = this.getAppointments();
    console.log(`🔍 [UNIFIED] Filtering appointments for doctor: ${doctorId}`);
    
    const filtered = appointments.filter(apt => {
      const match = apt.doctorId === doctorId;
      console.log(`⚖️ "${apt.doctorId}" === "${doctorId}": ${match}`);
      return match;
    });
    
    console.log(`👨‍⚕️ [UNIFIED] Found ${filtered.length} appointments for doctor ${doctorId}`);
    return filtered;
  }

  // Get appointments for specific patient
  getPatientAppointments(patientId: string): UnifiedAppointment[] {
    const appointments = this.getAppointments();
    const filtered = appointments.filter(apt => apt.patientId === patientId);
    console.log(`👤 [UNIFIED] Found ${filtered.length} appointments for patient ${patientId}`);
    return filtered;
  }

  // Get all appointments for today (useful for receptionists)
  getTodayAppointments(): UnifiedAppointment[] {
    const appointments = this.getAppointments();
    const today = new Date().toISOString().split('T')[0];
    
    const todayAppts = appointments.filter(apt => apt.date === today);
    console.log(`📅 [UNIFIED] Found ${todayAppts.length} appointments for today (${today})`);
    return todayAppts;
  }

  // Update appointment status
  updateAppointmentStatus(appointmentId: string, status: UnifiedAppointment['status']): boolean {
    const appointments = this.getAppointments();
    const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
    
    if (appointmentIndex === -1) {
      console.error(`❌ [UNIFIED] Appointment ${appointmentId} not found`);
      return false;
    }
    
    appointments[appointmentIndex].status = status;
    this.saveAppointments(appointments);
    
    console.log(`✅ [UNIFIED] Updated appointment ${appointmentId} status to ${status}`);
    return true;
  }

  // Subscribe to appointment changes
  subscribe(callback: (appointments: UnifiedAppointment[]) => void): () => void {
    const handler = (event: any) => {
      console.log(`📨 [UNIFIED] Received sync event`);
      callback(this.getAppointments());
    };
    
    appointmentEventTarget.addEventListener(SYNC_EVENT_KEY, handler);
    window.addEventListener(SYNC_EVENT_KEY, handler);
    window.addEventListener('storage', handler);
    
    return () => {
      appointmentEventTarget.removeEventListener(SYNC_EVENT_KEY, handler);
      window.removeEventListener(SYNC_EVENT_KEY, handler);
      window.removeEventListener('storage', handler);
    };
  }

  // Clear all appointments (for testing)
  clearAll(): void {
    localStorage.removeItem(UNIFIED_STORAGE_KEY);
    sessionStorage.removeItem(UNIFIED_STORAGE_KEY);
    localStorage.removeItem(BACKUP_STORAGE_KEY);
    
    // Also clear old storage keys
    localStorage.removeItem('realtime_appointments');
    localStorage.removeItem('nav_appointments');
    localStorage.removeItem('appointment_backup');
    
    console.log(`🗑️ [UNIFIED] All appointment storage cleared`);
    this.broadcastSync([]);
  }
}

// Export singleton instance
export const UnifiedAppointments = UnifiedAppointmentManager.getInstance();
export type { UnifiedAppointment };