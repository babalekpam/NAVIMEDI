import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Upload, Search, Filter, Download, ZoomIn, ZoomOut, Move, 
  ChevronLeft, ChevronRight, Ruler, ArrowUpRight, Circle, Type
} from "lucide-react";
import { format } from "date-fns";

// Mock DICOM Studies Data
const mockStudies = [
  {
    id: "study-1",
    studyInstanceUID: "1.2.840.113619.2.55.3.12345",
    patientId: "PT001",
    patientName: "John Doe",
    studyDate: "2025-01-15",
    studyDescription: "CT Chest with Contrast",
    modality: "CT",
    bodyPart: "Chest",
    numberOfSeries: 3,
    numberOfImages: 125,
    status: "available",
    series: [
      { id: "series-1", description: "Axial", imageCount: 50 },
      { id: "series-2", description: "Coronal", imageCount: 45 },
      { id: "series-3", description: "Sagittal", imageCount: 30 }
    ]
  },
  {
    id: "study-2",
    studyInstanceUID: "1.2.840.113619.2.55.3.12346",
    patientId: "PT002",
    patientName: "Jane Smith",
    studyDate: "2025-01-14",
    studyDescription: "MRI Brain without Contrast",
    modality: "MRI",
    bodyPart: "Brain",
    numberOfSeries: 4,
    numberOfImages: 180,
    status: "available",
    series: [
      { id: "series-4", description: "T1 Axial", imageCount: 45 },
      { id: "series-5", description: "T2 Axial", imageCount: 45 },
      { id: "series-6", description: "FLAIR", imageCount: 45 },
      { id: "series-7", description: "DWI", imageCount: 45 }
    ]
  },
  {
    id: "study-3",
    studyInstanceUID: "1.2.840.113619.2.55.3.12347",
    patientId: "PT003",
    patientName: "Robert Johnson",
    studyDate: "2025-01-13",
    studyDescription: "X-Ray Chest PA and Lateral",
    modality: "X-Ray",
    bodyPart: "Chest",
    numberOfSeries: 2,
    numberOfImages: 2,
    status: "available",
    series: [
      { id: "series-8", description: "PA View", imageCount: 1 },
      { id: "series-9", description: "Lateral View", imageCount: 1 }
    ]
  },
  {
    id: "study-4",
    studyInstanceUID: "1.2.840.113619.2.55.3.12348",
    patientId: "PT004",
    patientName: "Emily Davis",
    studyDate: "2025-01-12",
    studyDescription: "Ultrasound Abdomen Complete",
    modality: "Ultrasound",
    bodyPart: "Abdomen",
    numberOfSeries: 1,
    numberOfImages: 35,
    status: "available",
    series: [
      { id: "series-10", description: "Abdomen Complete", imageCount: 35 }
    ]
  },
  {
    id: "study-5",
    studyInstanceUID: "1.2.840.113619.2.55.3.12349",
    patientId: "PT005",
    patientName: "Michael Brown",
    studyDate: "2025-01-11",
    studyDescription: "CT Abdomen and Pelvis with Contrast",
    modality: "CT",
    bodyPart: "Abdomen/Pelvis",
    numberOfSeries: 5,
    numberOfImages: 220,
    status: "available",
    series: [
      { id: "series-11", description: "Arterial Phase", imageCount: 70 },
      { id: "series-12", description: "Portal Venous", imageCount: 70 },
      { id: "series-13", description: "Delayed", imageCount: 40 },
      { id: "series-14", description: "Coronal Recon", imageCount: 20 },
      { id: "series-15", description: "Sagittal Recon", imageCount: 20 }
    ]
  },
  {
    id: "study-6",
    studyInstanceUID: "1.2.840.113619.2.55.3.12350",
    patientId: "PT006",
    patientName: "Sarah Wilson",
    studyDate: "2025-01-10",
    studyDescription: "MRI Lumbar Spine",
    modality: "MRI",
    bodyPart: "Lumbar Spine",
    numberOfSeries: 3,
    numberOfImages: 90,
    status: "available",
    series: [
      { id: "series-16", description: "T1 Sagittal", imageCount: 30 },
      { id: "series-17", description: "T2 Sagittal", imageCount: 30 },
      { id: "series-18", description: "T2 Axial", imageCount: 30 }
    ]
  },
  {
    id: "study-7",
    studyInstanceUID: "1.2.840.113619.2.55.3.12351",
    patientId: "PT007",
    patientName: "David Martinez",
    studyDate: "2025-01-09",
    studyDescription: "X-Ray Knee AP and Lateral",
    modality: "X-Ray",
    bodyPart: "Knee",
    numberOfSeries: 2,
    numberOfImages: 2,
    status: "processing",
    series: [
      { id: "series-19", description: "AP View", imageCount: 1 },
      { id: "series-20", description: "Lateral View", imageCount: 1 }
    ]
  },
  {
    id: "study-8",
    studyInstanceUID: "1.2.840.113619.2.55.3.12352",
    patientId: "PT008",
    patientName: "Lisa Anderson",
    studyDate: "2025-01-08",
    studyDescription: "CT Head without Contrast",
    modality: "CT",
    bodyPart: "Head",
    numberOfSeries: 2,
    numberOfImages: 85,
    status: "available",
    series: [
      { id: "series-21", description: "Axial 5mm", imageCount: 25 },
      { id: "series-22", description: "Axial 1mm", imageCount: 60 }
    ]
  }
];

export default function DicomViewer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudy, setSelectedStudy] = useState<any>(null);
  const [selectedSeries, setSelectedSeries] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [windowLevel, setWindowLevel] = useState([50]);
  const [windowWidth, setWindowWidth] = useState([350]);
  const [zoom, setZoom] = useState(100);
  const [isPanEnabled, setIsPanEnabled] = useState(false);

  const filteredStudies = mockStudies.filter(study => {
    const matchesSearch = study.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModality = modalityFilter === "all" || study.modality === modalityFilter;
    const matchesStatus = statusFilter === "all" || study.status === statusFilter;
    return matchesSearch && matchesModality && matchesStatus;
  });

  const handleStudyClick = (study: any) => {
    setSelectedStudy(study);
    setSelectedSeries(null);
    setCurrentImageIndex(0);
  };

  const handleSeriesClick = (series: any) => {
    setSelectedSeries(series);
    setCurrentImageIndex(0);
  };

  const handlePreviousImage = () => {
    if (selectedSeries && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (selectedSeries && currentImageIndex < selectedSeries.imageCount - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DICOM Viewer</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Medical Imaging Studies</p>
          </div>
          <Button data-testid="button-upload-dicom">
            <Upload className="mr-2 h-4 w-4" />
            Upload DICOM Files
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                  Search Patient
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    data-testid="input-search-patient"
                    placeholder="Name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                  Modality
                </label>
                <Select value={modalityFilter} onValueChange={setModalityFilter}>
                  <SelectTrigger data-testid="select-modality">
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
                <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  data-testid="button-clear-filters" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchTerm("");
                    setModalityFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Studies Table */}
        <Card>
          <CardHeader>
            <CardTitle>Studies ({filteredStudies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table data-testid="table-studies">
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Study Date</TableHead>
                    <TableHead>Modality</TableHead>
                    <TableHead>Body Part</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Images</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudies.map((study) => (
                    <TableRow
                      key={study.id}
                      data-testid={`row-study-${study.id}`}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleStudyClick(study)}
                    >
                      <TableCell className="font-medium">{study.patientName}</TableCell>
                      <TableCell>{format(new Date(study.studyDate), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{study.modality}</Badge>
                      </TableCell>
                      <TableCell>{study.bodyPart}</TableCell>
                      <TableCell>{study.studyDescription}</TableCell>
                      <TableCell className="text-center">{study.numberOfImages}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={study.status === "available" ? "default" : "secondary"}
                          className={study.status === "available" ? "bg-green-600" : ""}
                        >
                          {study.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Study Detail Modal */}
        <Dialog open={!!selectedStudy} onOpenChange={(open) => !open && setSelectedStudy(null)}>
          <DialogContent 
            data-testid="dialog-study-detail" 
            className="max-w-6xl max-h-[90vh] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle>Study Details</DialogTitle>
            </DialogHeader>
            
            {selectedStudy && (
              <div className="space-y-6">
                {/* Study Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Patient Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedStudy.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Patient ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedStudy.patientId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Study Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {format(new Date(selectedStudy.studyDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Modality</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedStudy.modality}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Body Part</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedStudy.bodyPart}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Images</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedStudy.numberOfImages}</p>
                  </div>
                </div>

                {/* Series Grid */}
                {!selectedSeries ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Series ({selectedStudy.series.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedStudy.series.map((series: any) => (
                        <Card
                          key={series.id}
                          data-testid={`card-series-${series.id}`}
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => handleSeriesClick(series)}
                        >
                          <CardContent className="p-4">
                            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                              <div className="text-gray-400 dark:text-gray-500 text-center">
                                <div className="text-4xl mb-2">🖼️</div>
                                <div className="text-sm">Thumbnail</div>
                              </div>
                            </div>
                            <p className="font-medium text-sm text-gray-900 dark:text-white">{series.description}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {series.imageCount} images
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <Button data-testid="button-download-study" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download Study
                      </Button>
                      <Button data-testid="button-close-study" onClick={() => setSelectedStudy(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Image Viewer */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Button
                        data-testid="button-back-to-series"
                        variant="outline"
                        onClick={() => setSelectedSeries(null)}
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Series
                      </Button>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedSeries.description}
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Image {currentImageIndex + 1} of {selectedSeries.imageCount}
                      </div>
                    </div>

                    {/* Image Display */}
                    <div className="bg-black rounded-lg p-4 flex items-center justify-center" style={{ height: "500px" }}>
                      <div className="text-white text-center">
                        <div className="text-6xl mb-4">🏥</div>
                        <p className="text-lg mb-2">Medical Image Placeholder</p>
                        <p className="text-sm text-gray-400">
                          Real DICOM rendering requires dcmjs/Cornerstone.js
                        </p>
                        <p className="text-xs text-gray-500 mt-4">
                          Zoom: {zoom}% | Window: {windowWidth[0]} | Level: {windowLevel[0]}
                        </p>
                      </div>
                    </div>

                    {/* Image Controls */}
                    <div className="space-y-4">
                      {/* Navigation */}
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          data-testid="button-previous-image"
                          disabled={currentImageIndex === 0}
                          onClick={handlePreviousImage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {currentImageIndex + 1} / {selectedSeries.imageCount}
                        </span>
                        <Button
                          data-testid="button-next-image"
                          disabled={currentImageIndex === selectedSeries.imageCount - 1}
                          onClick={handleNextImage}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Window/Level Adjustment */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                            Window Level: {windowLevel[0]}
                          </label>
                          <Slider
                            data-testid="slider-window-level"
                            value={windowLevel}
                            onValueChange={setWindowLevel}
                            min={0}
                            max={100}
                            step={1}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                            Window Width: {windowWidth[0]}
                          </label>
                          <Slider
                            data-testid="slider-window-width"
                            value={windowWidth}
                            onValueChange={setWindowWidth}
                            min={1}
                            max={500}
                            step={1}
                          />
                        </div>
                      </div>

                      {/* Tool Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          data-testid="button-zoom-in"
                          variant="outline"
                          size="sm"
                          onClick={() => setZoom(Math.min(zoom + 10, 200))}
                        >
                          <ZoomIn className="mr-2 h-4 w-4" />
                          Zoom In
                        </Button>
                        <Button
                          data-testid="button-zoom-out"
                          variant="outline"
                          size="sm"
                          onClick={() => setZoom(Math.max(zoom - 10, 50))}
                        >
                          <ZoomOut className="mr-2 h-4 w-4" />
                          Zoom Out
                        </Button>
                        <Button
                          data-testid="button-pan-toggle"
                          variant={isPanEnabled ? "default" : "outline"}
                          size="sm"
                          onClick={() => setIsPanEnabled(!isPanEnabled)}
                        >
                          <Move className="mr-2 h-4 w-4" />
                          Pan {isPanEnabled ? "(On)" : "(Off)"}
                        </Button>
                        <Button
                          data-testid="button-measurement-ruler"
                          variant="outline"
                          size="sm"
                          title="Measurement tool (placeholder)"
                        >
                          <Ruler className="mr-2 h-4 w-4" />
                          Ruler
                        </Button>
                        <Button
                          data-testid="button-annotation-arrow"
                          variant="outline"
                          size="sm"
                          title="Arrow annotation (placeholder)"
                        >
                          <ArrowUpRight className="mr-2 h-4 w-4" />
                          Arrow
                        </Button>
                        <Button
                          data-testid="button-annotation-circle"
                          variant="outline"
                          size="sm"
                          title="Circle annotation (placeholder)"
                        >
                          <Circle className="mr-2 h-4 w-4" />
                          Circle
                        </Button>
                        <Button
                          data-testid="button-annotation-text"
                          variant="outline"
                          size="sm"
                          title="Text annotation (placeholder)"
                        >
                          <Type className="mr-2 h-4 w-4" />
                          Text
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
