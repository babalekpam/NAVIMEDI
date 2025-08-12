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
  try {
    const stored = localStorage.getItem('shared-appointments');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.log("No stored appointments found, using defaults");
  }
  
  return [
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
      providerId: "2cd7fc68-02a0-4924-b564-0dd1bd7b247b", // Lisa Chen
      appointmentDate: "2024-08-20T14:30:00.000Z",
      type: "follow-up",
      reason: "Family medicine consultation",
      status: "confirmed",
      priority: "high",
      bookedAt: new Date().toISOString(),
      patientName: "Sarah Williams",
      doctorName: "Lisa Chen"
    }
  ];
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
    return sharedAppointments.filter(appt => appt.providerId === doctorId);
  },

  // Get appointments for a specific patient
  getAppointmentsForPatient(patientId: string): SharedAppointment[] {
    return sharedAppointments.filter(appt => appt.patientId === patientId);
  },

  // Add new appointment
  addAppointment(appointment: Omit<SharedAppointment, 'id' | 'bookedAt'>): string {
    const newAppointment: SharedAppointment = {
      ...appointment,
      id: `appt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      bookedAt: new Date().toISOString()
    };
    
    sharedAppointments.push(newAppointment);
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('shared-appointments', JSON.stringify(sharedAppointments));
      console.log("Appointment saved to localStorage:", newAppointment);
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