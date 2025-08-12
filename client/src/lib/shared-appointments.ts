// Shared appointment system between patient and doctor portals
interface SharedAppointment {
  id: string;
  patientId: string;
  providerId: string;
  appointmentDate: string;
  type: string;
  reason: string;
  status: string;
  priority: string;
  bookedAt: string;
  patientName?: string;
  doctorName?: string;
}

// Initialize appointments from localStorage or use defaults
const initializeAppointments = (): SharedAppointment[] => {
  console.log("=== INITIALIZING APPOINTMENTS ===");
  
  try {
    const stored = localStorage.getItem('shared-appointments');
    console.log("localStorage content:", stored);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log("Parsed appointments:", parsed);
      return parsed;
    }
  } catch (error) {
    console.log("Error reading localStorage:", error);
  }
  
  const defaults = [
    {
      id: "appt-demo-1",
      patientId: "patient-1",
      providerId: "5fe10688-b38e-458e-b38b-bf8a2507b19a", // Dr. Michael Smith
      appointmentDate: "2024-08-15T10:00:00.000Z",
      type: "routine",
      reason: "Annual physical examination",
      status: "scheduled",
      priority: "normal",
      bookedAt: new Date().toISOString(),
      patientName: "Michael Johnson",
      doctorName: "Dr. Michael Smith"
    },
    {
      id: "appt-demo-2", 
      patientId: "patient-2",
      providerId: "5fe10688-b38e-458e-b38b-bf8a2507b19a", // Dr. Michael Smith (changed to Smith)
      appointmentDate: "2024-08-20T14:30:00.000Z",
      type: "follow-up",
      reason: "Family medicine consultation",
      status: "confirmed",
      priority: "high",
      bookedAt: new Date().toISOString(),
      patientName: "Sarah Williams",
      doctorName: "Dr. Michael Smith"
    }
  ];
  
  console.log("Using default appointments:", defaults);
  
  // Save defaults to localStorage
  try {
    localStorage.setItem('shared-appointments', JSON.stringify(defaults));
    console.log("Saved defaults to localStorage");
  } catch (error) {
    console.error("Failed to save defaults:", error);
  }
  
  return defaults;
};

// Global appointments storage with localStorage persistence
let sharedAppointments: SharedAppointment[] = initializeAppointments();

export const SharedAppointmentService = {
  // Get all appointments
  getAllAppointments(): SharedAppointment[] {
    // Always refresh from localStorage
    try {
      const stored = localStorage.getItem('shared-appointments');
      if (stored) {
        sharedAppointments = JSON.parse(stored);
      }
    } catch (error) {
      console.log("Error loading from localStorage:", error);
    }
    return [...sharedAppointments];
  },

  // Get appointments for a specific doctor
  getAppointmentsForDoctor(doctorId: string): SharedAppointment[] {
    // Always refresh from localStorage first
    this.getAllAppointments();
    const filtered = sharedAppointments.filter(appt => appt.providerId === doctorId);
    console.log(`=== DOCTOR APPOINTMENTS FOR ${doctorId} ===`);
    console.log("All appointments:", sharedAppointments);
    console.log("Filtered appointments:", filtered);
    return filtered;
  },

  // Get appointments for a specific patient
  getAppointmentsForPatient(patientId: string): SharedAppointment[] {
    // Always refresh from localStorage first
    this.getAllAppointments();
    return sharedAppointments.filter(appt => appt.patientId === patientId);
  },

  // Add new appointment
  addAppointment(appointment: Omit<SharedAppointment, 'id' | 'bookedAt'>): string {
    console.log("=== ADDING NEW APPOINTMENT ===");
    console.log("Input appointment data:", appointment);
    
    const newAppointment: SharedAppointment = {
      ...appointment,
      id: `appt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      bookedAt: new Date().toISOString()
    };
    
    console.log("Created appointment object:", newAppointment);
    
    sharedAppointments.push(newAppointment);
    console.log("All appointments after push:", sharedAppointments);
    
    // Store in localStorage for persistence
    try {
      const serialized = JSON.stringify(sharedAppointments);
      localStorage.setItem('shared-appointments', serialized);
      console.log("Appointment saved to localStorage");
      console.log("localStorage now contains:", localStorage.getItem('shared-appointments'));
      
      // Verify the save worked
      const verification = localStorage.getItem('shared-appointments');
      if (verification) {
        const parsed = JSON.parse(verification);
        console.log("Verification - localStorage contains", parsed.length, "appointments");
      }
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
    
    return newAppointment.id;
  },

  // Update appointment status
  updateAppointmentStatus(appointmentId: string, newStatus: string): boolean {
    const appointmentIndex = sharedAppointments.findIndex(appt => appt.id === appointmentId);
    if (appointmentIndex !== -1) {
      sharedAppointments[appointmentIndex].status = newStatus;
      
      // Save to localStorage
      try {
        localStorage.setItem('shared-appointments', JSON.stringify(sharedAppointments));
        console.log("Appointment status updated in localStorage:", appointmentId, newStatus);
      } catch (error) {
        console.error("Failed to save status update to localStorage:", error);
      }
      
      return true;
    }
    return false;
  },

  // Get appointment by ID
  getAppointmentById(appointmentId: string): SharedAppointment | undefined {
    return sharedAppointments.find(appt => appt.id === appointmentId);
  }
};

export type { SharedAppointment };