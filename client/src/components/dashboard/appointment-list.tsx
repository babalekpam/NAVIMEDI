import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCircle, AlertTriangle } from "lucide-react";
import { Appointment } from "@shared/schema";

interface AppointmentListProps {
  appointments: Appointment[];
  loading?: boolean;
}

const statusColors = {
  scheduled: "bg-gray-100 text-gray-800",
  confirmed: "bg-green-100 text-green-800",
  checked_in: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-red-100 text-red-800",
};

export const AppointmentList = ({ appointments, loading = false }: AppointmentListProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <UserCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-sm">No appointments scheduled for today</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {appointments.map((appointment) => (
        <div 
          key={appointment.id} 
          className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                appointment.status === 'urgent' ? 'bg-yellow-50' : 'bg-blue-50'
              }`}>
                {appointment.status === 'urgent' ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                ) : (
                  <UserCircle className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Patient {appointment.patientId.slice(-4)}
              </p>
              <p className="text-sm text-gray-500">{appointment.type}</p>
              <p className="text-xs text-gray-400">
                {appointment.chiefComplaint || 'General consultation'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {new Date(appointment.appointmentDate).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </p>
            <Badge 
              variant="secondary"
              className={statusColors[appointment.status] || statusColors.scheduled}
            >
              {appointment.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};
