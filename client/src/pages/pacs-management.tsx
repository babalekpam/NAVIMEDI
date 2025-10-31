import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Edit, Trash2, Activity, Server, Search, Download, CheckCircle, XCircle
} from "lucide-react";
import { format } from "date-fns";

// Mock PACS Connections Data
const initialPacsConnections = [
  {
    id: "pacs-1",
    pacsName: "Hospital Main PACS",
    aeTitle: "HOSPACS",
    host: "pacs.hospital.local",
    port: 11112,
    protocol: "DICOM",
    isActive: true,
    lastSync: "2025-01-20T10:00:00"
  },
  {
    id: "pacs-2",
    pacsName: "Radiology Department PACS",
    aeTitle: "RADPACS",
    host: "rad-pacs.hospital.local",
    port: 11113,
    protocol: "DICOMWEB",
    isActive: true,
    lastSync: "2025-01-20T09:45:00"
  },
  {
    id: "pacs-3",
    pacsName: "External Imaging Center",
    aeTitle: "EXTPACS",
    host: "external.imaging.com",
    port: 11114,
    protocol: "DICOM",
    isActive: false,
    lastSync: "2025-01-19T18:30:00"
  }
];

// Mock PACS Query Results
const mockQueryResults = [
  {
    id: "result-1",
    patientName: "Alice Johnson",
    patientId: "PT009",
    studyDate: "2025-01-18",
    modality: "CT",
    studyDescription: "CT Chest without Contrast",
    accessionNumber: "ACC001"
  },
  {
    id: "result-2",
    patientName: "Bob Williams",
    patientId: "PT010",
    studyDate: "2025-01-17",
    modality: "MRI",
    studyDescription: "MRI Brain with Contrast",
    accessionNumber: "ACC002"
  },
  {
    id: "result-3",
    patientName: "Carol Davis",
    patientId: "PT011",
    studyDate: "2025-01-16",
    modality: "X-Ray",
    studyDescription: "X-Ray Chest PA",
    accessionNumber: "ACC003"
  }
];

export default function PacsManagement() {
  const { toast } = useToast();
  const [pacsConnections, setPacsConnections] = useState(initialPacsConnections);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPacs, setEditingPacs] = useState<any>(null);
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  
  // Form states
  const [formData, setFormData] = useState({
    pacsName: "",
    aeTitle: "",
    host: "",
    port: "",
    protocol: "DICOM"
  });

  // Query form states
  const [queryForm, setQueryForm] = useState({
    patientName: "",
    modality: "all",
    dateFrom: "",
    dateTo: ""
  });

  const handleAddPacs = () => {
    setEditingPacs(null);
    setFormData({
      pacsName: "",
      aeTitle: "",
      host: "",
      port: "",
      protocol: "DICOM"
    });
    setIsAddDialogOpen(true);
  };

  const handleEditPacs = (pacs: any) => {
    setEditingPacs(pacs);
    setFormData({
      pacsName: pacs.pacsName,
      aeTitle: pacs.aeTitle,
      host: pacs.host,
      port: pacs.port.toString(),
      protocol: pacs.protocol
    });
    setIsAddDialogOpen(true);
  };

  const handleDeletePacs = (id: string) => {
    setPacsConnections(pacsConnections.filter(p => p.id !== id));
    toast({
      title: "PACS Connection Deleted",
      description: "The PACS connection has been removed.",
    });
  };

  const handleSavePacs = () => {
    if (editingPacs) {
      // Update existing
      setPacsConnections(pacsConnections.map(p => 
        p.id === editingPacs.id 
          ? { ...p, ...formData, port: parseInt(formData.port) }
          : p
      ));
      toast({
        title: "PACS Connection Updated",
        description: "The PACS connection has been updated successfully.",
      });
    } else {
      // Add new
      const newPacs = {
        id: `pacs-${Date.now()}`,
        ...formData,
        port: parseInt(formData.port),
        isActive: true,
        lastSync: new Date().toISOString()
      };
      setPacsConnections([...pacsConnections, newPacs]);
      toast({
        title: "PACS Connection Added",
        description: "New PACS connection has been added successfully.",
      });
    }
    setIsAddDialogOpen(false);
  };

  const handleTestConnection = (pacsId: string) => {
    // Mock test connection
    toast({
      title: "Connection Test",
      description: "Testing connection to PACS server...",
    });
    
    setTimeout(() => {
      toast({
        title: "Connection Successful",
        description: "PACS server is reachable and responding.",
      });
    }, 1000);
  };

  const handleQueryPacs = () => {
    // Mock PACS query
    toast({
      title: "Querying PACS",
      description: "Searching for studies...",
    });
    
    setTimeout(() => {
      setQueryResults(mockQueryResults);
      toast({
        title: "Query Complete",
        description: `Found ${mockQueryResults.length} studies.`,
      });
    }, 1000);
  };

  const handleRetrieveSelected = () => {
    if (selectedResults.length === 0) {
      toast({
        title: "No Studies Selected",
        description: "Please select studies to retrieve.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Retrieving Studies",
      description: `Retrieving ${selectedResults.length} studies from PACS...`,
    });

    setTimeout(() => {
      toast({
        title: "Retrieval Complete",
        description: `Successfully retrieved ${selectedResults.length} studies.`,
      });
      setSelectedResults([]);
    }, 2000);
  };

  const toggleResultSelection = (id: string) => {
    setSelectedResults(prev => 
      prev.includes(id) 
        ? prev.filter(r => r !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">PACS Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage PACS connections and query remote studies</p>
          </div>
          <Button data-testid="button-add-pacs" onClick={handleAddPacs}>
            <Plus className="mr-2 h-4 w-4" />
            Add PACS Connection
          </Button>
        </div>

        {/* PACS Connections Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              PACS Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table data-testid="table-pacs-connections">
                <TableHeader>
                  <TableRow>
                    <TableHead>PACS Name</TableHead>
                    <TableHead>AE Title</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>Protocol</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pacsConnections.map((pacs) => (
                    <TableRow key={pacs.id} data-testid={`row-pacs-${pacs.id}`}>
                      <TableCell className="font-medium">{pacs.pacsName}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {pacs.aeTitle}
                        </code>
                      </TableCell>
                      <TableCell>{pacs.host}</TableCell>
                      <TableCell>{pacs.port}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{pacs.protocol}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={pacs.isActive ? "default" : "secondary"}
                          className={pacs.isActive ? "bg-green-600" : "bg-gray-500"}
                        >
                          {pacs.isActive ? (
                            <><CheckCircle className="mr-1 h-3 w-3" />Online</>
                          ) : (
                            <><XCircle className="mr-1 h-3 w-3" />Offline</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(pacs.lastSync), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            data-testid={`button-test-${pacs.id}`}
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestConnection(pacs.id)}
                          >
                            <Activity className="h-4 w-4" />
                          </Button>
                          <Button
                            data-testid={`button-edit-${pacs.id}`}
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPacs(pacs)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            data-testid={`button-delete-${pacs.id}`}
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePacs(pacs.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Query PACS Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Query PACS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Query Form */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="query-patient-name">Patient Name</Label>
                <Input
                  id="query-patient-name"
                  data-testid="input-query-patient-name"
                  placeholder="Enter patient name..."
                  value={queryForm.patientName}
                  onChange={(e) => setQueryForm({ ...queryForm, patientName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="query-modality">Modality</Label>
                <Select 
                  value={queryForm.modality} 
                  onValueChange={(value) => setQueryForm({ ...queryForm, modality: value })}
                >
                  <SelectTrigger id="query-modality" data-testid="select-query-modality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modalities</SelectItem>
                    <SelectItem value="CT">CT</SelectItem>
                    <SelectItem value="MRI">MRI</SelectItem>
                    <SelectItem value="X-Ray">X-Ray</SelectItem>
                    <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="query-date-from">Date From</Label>
                <Input
                  id="query-date-from"
                  data-testid="input-query-date-from"
                  type="date"
                  value={queryForm.dateFrom}
                  onChange={(e) => setQueryForm({ ...queryForm, dateFrom: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="query-date-to">Date To</Label>
                <Input
                  id="query-date-to"
                  data-testid="input-query-date-to"
                  type="date"
                  value={queryForm.dateTo}
                  onChange={(e) => setQueryForm({ ...queryForm, dateTo: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button data-testid="button-query-pacs" onClick={handleQueryPacs}>
                <Search className="mr-2 h-4 w-4" />
                Search PACS
              </Button>
              <Button 
                data-testid="button-clear-query" 
                variant="outline"
                onClick={() => {
                  setQueryForm({ patientName: "", modality: "all", dateFrom: "", dateTo: "" });
                  setQueryResults([]);
                  setSelectedResults([]);
                }}
              >
                Clear
              </Button>
            </div>

            {/* Query Results */}
            {queryResults.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Query Results ({queryResults.length})
                  </h3>
                  <Button 
                    data-testid="button-retrieve-selected"
                    disabled={selectedResults.length === 0}
                    onClick={handleRetrieveSelected}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Retrieve Selected ({selectedResults.length})
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <Table data-testid="table-query-results">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            data-testid="checkbox-select-all"
                            checked={selectedResults.length === queryResults.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedResults(queryResults.map(r => r.id));
                              } else {
                                setSelectedResults([]);
                              }
                            }}
                            className="rounded"
                          />
                        </TableHead>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Patient ID</TableHead>
                        <TableHead>Study Date</TableHead>
                        <TableHead>Modality</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Accession #</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queryResults.map((result) => (
                        <TableRow key={result.id} data-testid={`row-result-${result.id}`}>
                          <TableCell>
                            <input
                              type="checkbox"
                              data-testid={`checkbox-result-${result.id}`}
                              checked={selectedResults.includes(result.id)}
                              onChange={() => toggleResultSelection(result.id)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{result.patientName}</TableCell>
                          <TableCell>{result.patientId}</TableCell>
                          <TableCell>{format(new Date(result.studyDate), "MMM dd, yyyy")}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{result.modality}</Badge>
                          </TableCell>
                          <TableCell>{result.studyDescription}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {result.accessionNumber}
                            </code>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit PACS Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent data-testid="dialog-pacs-form">
            <DialogHeader>
              <DialogTitle>
                {editingPacs ? "Edit PACS Connection" : "Add PACS Connection"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="pacs-name">PACS Name *</Label>
                <Input
                  id="pacs-name"
                  data-testid="input-pacs-name"
                  placeholder="Hospital Main PACS"
                  value={formData.pacsName}
                  onChange={(e) => setFormData({ ...formData, pacsName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="ae-title">AE Title *</Label>
                <Input
                  id="ae-title"
                  data-testid="input-ae-title"
                  placeholder="HOSPACS"
                  value={formData.aeTitle}
                  onChange={(e) => setFormData({ ...formData, aeTitle: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="host">Host/IP *</Label>
                  <Input
                    id="host"
                    data-testid="input-host"
                    placeholder="pacs.hospital.local"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="port">Port *</Label>
                  <Input
                    id="port"
                    data-testid="input-port"
                    type="number"
                    placeholder="11112"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="protocol">Protocol *</Label>
                <Select 
                  value={formData.protocol} 
                  onValueChange={(value) => setFormData({ ...formData, protocol: value })}
                >
                  <SelectTrigger id="protocol" data-testid="select-protocol">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DICOM">DICOM</SelectItem>
                    <SelectItem value="DICOMWEB">DICOMWEB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button 
                data-testid="button-test-connection-dialog" 
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Testing Connection",
                    description: "Verifying PACS connectivity...",
                  });
                  setTimeout(() => {
                    toast({
                      title: "Connection Successful",
                      description: "PACS server is reachable.",
                    });
                  }, 1000);
                }}
              >
                Test Connection
              </Button>
              <Button 
                data-testid="button-cancel-pacs" 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                data-testid="button-save-pacs" 
                onClick={handleSavePacs}
                disabled={!formData.pacsName || !formData.aeTitle || !formData.host || !formData.port}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
