import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, MoreHorizontal, UserCircle } from "lucide-react";
import { Patient } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { PatientForm } from "@/components/forms/patient-form";

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useAuth();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

  const { data: patients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: !!user && !!tenant,
  });

  const createPatientMutation = useMutation({
    mutationFn: async (patientData: any) => {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(patientData)
      });
      if (!response.ok) throw new Error("Failed to create patient");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setIsFormOpen(false);
    }
  });

  if (!user || !tenant) {
    return <div>Loading...</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPatientInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Records</h1>
          <p className="text-gray-600 mt-1">Manage patient information and medical records</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <PatientForm
              onSubmit={(data) => createPatientMutation.mutate(data)}
              isLoading={createPatientMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
              <Input
                placeholder="Search patients by name or MRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Patient Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4 py-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                    </div>
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12">
              <UserCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? "No patients match your search criteria" 
                  : "Get started by adding your first patient"
                }
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>
          ) : (
            <div className="space-y-0">
              {patients.map((patient) => (
                <div 
                  key={patient.id}
                  className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                        {getPatientInitials(patient.firstName, patient.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </p>
                        {patient.gender && (
                          <Badge variant="outline" className="text-xs">
                            {patient.gender}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        DOB: {formatDate(patient.dateOfBirth)}
                      </p>
                      <p className="text-xs text-gray-400">
                        MRN: {patient.mrn}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Last Visit</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(patient.updatedAt)}
                      </p>
                    </div>
                    
                    <Badge 
                      variant={patient.isActive ? "default" : "secondary"}
                      className={patient.isActive ? "bg-green-100 text-green-800" : ""}
                    >
                      {patient.isActive ? "Active" : "Inactive"}
                    </Badge>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        View EHR
                      </Button>
                      <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700">
                        Schedule
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
