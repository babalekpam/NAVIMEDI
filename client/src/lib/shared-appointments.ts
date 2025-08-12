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

// Global appointments storage (simulating a shared database)
let sharedAppointments: SharedAppointment[] = [
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

export const SharedAppointmentService = {
  // Get all appointments
  getAllAppointments(): SharedAppointment[] {
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
    return newAppointment.id;
  },

  // Update appointment status
  updateAppointmentStatus(appointmentId: string, newStatus: string): boolean {
    const appointmentIndex = sharedAppointments.findIndex(appt => appt.id === appointmentId);
    if (appointmentIndex !== -1) {
      sharedAppointments[appointmentIndex].status = newStatus;
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