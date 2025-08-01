import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Clock, 
  Play, 
  Square, 
  Search, 
  Archive, 
  Calendar,
  FileText,
  Users,
  Timer
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface WorkShift {
  id: string;
  tenantId: string;
  userId: string;
  shiftType: string;
  startTime: string;
  endTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ArchivedRecord {
  id: string;
  tenantId: string;
  workShiftId: string;
  patientId?: string;
  recordType: string;
  recordId: string;
  originalData: any;
  searchableContent?: string;
  archivedBy: string;
  archivedAt: string;
  lastAccessedBy?: string;
  lastAccessedAt?: string;
  accessCount: number;
  retentionPeriod: number;
  createdAt: string;
}

export default function ShiftManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShiftType, setSelectedShiftType] = useState("");
  const [shiftNotes, setShiftNotes] = useState("");
  const [showArchiveSearch, setShowArchiveSearch] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for current work shift
  const { data: currentShift, isLoading: currentShiftLoading } = useQuery({
    queryKey: ["/api/work-shifts/current"],
  });

  // Query for all active shifts
  const { data: activeShifts = [], isLoading: shiftsLoading } = useQuery({
    queryKey: ["/api/work-shifts"],
  });

  // Query for archived records search
  const { data: archivedRecords = [], isLoading: archiveLoading } = useQuery({
    queryKey: ["/api/archived-records/search", searchQuery],
    enabled: searchQuery.length > 2,
  });

  // Mutation to start a new shift
  const startShiftMutation = useMutation({
    mutationFn: (data: { shiftType: string; notes?: string }) =>
      apiRequest("/api/work-shifts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-shifts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/work-shifts/current"] });
      toast({ title: "Shift started successfully" });
      setSelectedShiftType("");
      setShiftNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to start shift",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to end a shift
  const endShiftMutation = useMutation({
    mutationFn: (shiftId: string) =>
      apiRequest(`/api/work-shifts/${shiftId}/end`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-shifts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/work-shifts/current"] });
      toast({ 
        title: "Shift ended successfully",
        description: "Records have been automatically archived"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to end shift",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartShift = () => {
    if (!selectedShiftType) {
      toast({
        title: "Shift type required",
        description: "Please select a shift type before starting",
        variant: "destructive",
      });
      return;
    }

    startShiftMutation.mutate({
      shiftType: selectedShiftType,
      notes: shiftNotes || undefined,
    });
  };

  const handleEndShift = () => {
    if (!currentShift) return;
    endShiftMutation.mutate(currentShift.id);
  };

  const getShiftDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatRecordData = (record: ArchivedRecord) => {
    try {
      const data = typeof record.originalData === 'string' 
        ? JSON.parse(record.originalData) 
        : record.originalData;
      
      // Extract key information based on record type
      switch (record.recordType) {
        case 'prescription':
          return `Medication: ${data.medicationName || 'N/A'}`;
        case 'patient':
          return `Patient: ${data.firstName} ${data.lastName}`;
        case 'appointment':
          return `Appointment: ${data.appointmentType || 'N/A'}`;
        default:
          return `${record.recordType}: ${data.id || 'N/A'}`;
      }
    } catch (error) {
      return `${record.recordType}: Data unavailable`;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Shift Management</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowArchiveSearch(!showArchiveSearch)}
          >
            <Archive className="h-4 w-4 mr-2" />
            Search Archives
          </Button>
        </div>
      </div>

      {/* Current Shift Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Current Shift Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentShiftLoading ? (
            <div>Loading current shift...</div>
          ) : currentShift ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{currentShift.shiftType}</Badge>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Started: {format(new Date(currentShift.startTime), "PPp")}
                  </p>
                  <p className="text-sm text-gray-600">
                    Duration: {getShiftDuration(currentShift.startTime)}
                  </p>
                  {currentShift.notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      Notes: {currentShift.notes}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={handleEndShift}
                  disabled={endShiftMutation.isPending}
                  variant="destructive"
                >
                  <Square className="h-4 w-4 mr-2" />
                  End Shift
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">No active shift</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Shift Type</label>
                  <Select value={selectedShiftType} onValueChange={setSelectedShiftType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning Shift</SelectItem>
                      <SelectItem value="afternoon">Afternoon Shift</SelectItem>
                      <SelectItem value="evening">Evening Shift</SelectItem>
                      <SelectItem value="night">Night Shift</SelectItem>
                      <SelectItem value="weekend">Weekend Shift</SelectItem>
                      <SelectItem value="holiday">Holiday Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Notes (Optional)</label>
                  <Textarea
                    value={shiftNotes}
                    onChange={(e) => setShiftNotes(e.target.value)}
                    placeholder="Any notes for this shift..."
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleStartShift}
                  disabled={startShiftMutation.isPending}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Shift
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Archive Search */}
      {showArchiveSearch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Archived Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search archived records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {searchQuery.length > 2 && (
                <div>
                  {archiveLoading ? (
                    <div>Searching archives...</div>
                  ) : archivedRecords.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Record Type</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>Archived Date</TableHead>
                          <TableHead>Access Count</TableHead>
                          <TableHead>Last Accessed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {archivedRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <Badge variant="outline">
                                {record.recordType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatRecordData(record)}
                            </TableCell>
                            <TableCell>
                              {format(new Date(record.archivedAt), "PPp")}
                            </TableCell>
                            <TableCell>{record.accessCount}</TableCell>
                            <TableCell>
                              {record.lastAccessedAt 
                                ? format(new Date(record.lastAccessedAt), "PPp")
                                : "Never"
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-600 text-center py-4">
                      No archived records found for "{searchQuery}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Shifts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Shifts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shiftsLoading ? (
            <div>Loading shifts...</div>
          ) : activeShifts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shift Type</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeShifts.map((shift: WorkShift) => (
                  <TableRow key={shift.id}>
                    <TableCell>
                      <Badge variant="secondary">
                        {shift.shiftType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(shift.startTime), "PPp")}
                    </TableCell>
                    <TableCell>
                      {shift.endTime 
                        ? format(new Date(shift.endTime), "PPp")
                        : "Active"
                      }
                    </TableCell>
                    <TableCell>
                      {getShiftDuration(shift.startTime, shift.endTime)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={shift.endTime ? "outline" : "default"}>
                        {shift.endTime ? "Completed" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {shift.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-600 text-center py-4">
              No shifts found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}