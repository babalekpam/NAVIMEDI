import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Phone, Mail, MapPin, AlertTriangle, MoreHorizontal } from "lucide-react";
import { Patient } from "@shared/schema";

interface PatientCardProps {
  patient: Patient;
  onViewDetails?: () => void;
  onScheduleAppointment?: () => void;
  onEditPatient?: () => void;
}

export const PatientCard = ({ 
  patient, 
  onViewDetails, 
  onScheduleAppointment, 
  onEditPatient 
}: PatientCardProps) => {
  const getPatientInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const hasAllergies = patient.allergies && Array.isArray(patient.allergies) && patient.allergies.length > 0;
  const hasConditions = patient.medicalHistory && Array.isArray(patient.medicalHistory) && patient.medicalHistory.length > 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-medium">
                {getPatientInitials(patient.firstName, patient.lastName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {patient.firstName} {patient.lastName}
                </h3>
                {hasAllergies && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Allergies
                  </Badge>
                )}
                {!patient.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">MRN:</span>
                  <span>{patient.mrn}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Age:</span>
                  <span>{calculateAge(patient.dateOfBirth)} years</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">DOB:</span>
                  <span>{new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                </div>
                {patient.gender && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Gender:</span>
                    <span className="capitalize">{patient.gender}</span>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="mt-3 space-y-1">
                {patient.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{patient.phone}</span>
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{patient.email}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">
                      {typeof patient.address === 'object' && patient.address 
                        ? `${(patient.address as any).street || ''} ${(patient.address as any).city || ''}`.trim()
                        : 'Address on file'
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* Medical Alerts */}
              {(hasAllergies || hasConditions) && (
                <div className="mt-3 space-y-2">
                  {hasAllergies && (
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-red-700">Allergies:</span>
                        <p className="text-sm text-red-600">
                          {(patient.allergies as string[]).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {hasConditions && (
                    <div className="flex items-start space-x-2">
                      <Calendar className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-blue-700">Conditions:</span>
                        <p className="text-sm text-blue-600 truncate">
                          {(patient.medicalHistory as string[]).slice(0, 2).join(', ')}
                          {(patient.medicalHistory as string[]).length > 2 && '...'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Insurance Information */}
              {patient.insuranceInfo && (
                <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Insurance:</span>
                  <p className="text-sm text-gray-600">
                    {typeof patient.insuranceInfo === 'object' && patient.insuranceInfo
                      ? (patient.insuranceInfo as any).provider || 'Insurance on file'
                      : 'Insurance on file'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewDetails}
              className="text-blue-600 hover:text-blue-700"
            >
              View EHR
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onScheduleAppointment}
              className="text-green-600 hover:text-green-700"
            >
              Schedule
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditPatient}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
