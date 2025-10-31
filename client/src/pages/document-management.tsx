import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Edit,
  FileSignature,
  Plus
} from "lucide-react";
import { PDFViewer } from "@/components/PDFViewer";
import { SignatureCanvas } from "@/components/SignatureCanvas";

const DOCUMENT_TYPES = [
  { value: "all", label: "All Types" },
  { value: "medical_record", label: "Medical Record" },
  { value: "consent_form", label: "Consent Form" },
  { value: "prescription", label: "Prescription" },
  { value: "lab_report", label: "Lab Report" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" }
];

const DOCUMENT_STATUS = [
  { value: "all", label: "All Status" },
  { value: "draft", label: "Draft" },
  { value: "final", label: "Final" },
  { value: "archived", label: "Archived" }
];

interface Document {
  id: string;
  fileName: string;
  documentType: string;
  status: string;
  fileSize: number;
  uploadedAt: string;
  storageUrl: string;
  metadata?: any;
}

export default function DocumentManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureRequestDoc, setSignatureRequestDoc] = useState<Document | null>(null);

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocType, setUploadDocType] = useState("medical_record");
  const [uploadStatus, setUploadStatus] = useState("draft");
  const [dragActive, setDragActive] = useState(false);

  // Fetch documents
  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/documents', typeFilter, statusFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/documents?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    }
  });

  // Fetch signature requests
  const { data: signatureRequests = [] } = useQuery({
    queryKey: ['/api/signature-requests'],
    queryFn: async () => {
      const response = await fetch('/api/signature-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) return [];
      return response.json();
    }
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      // For now, create document metadata without actual file upload
      return apiRequest('/api/documents/upload', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document uploaded successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setShowUploadDialog(false);
      setUploadFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
    }
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/documents/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive"
      });
    }
  });

  // Request signature mutation
  const requestSignatureMutation = useMutation({
    mutationFn: async ({ documentId, signerEmail }: { documentId: string; signerEmail: string }) => {
      return apiRequest(`/api/documents/${documentId}/request-signature`, {
        method: 'POST',
        body: JSON.stringify({ signerEmail })
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Signature request sent successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/signature-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to request signature",
        variant: "destructive"
      });
    }
  });

  // Sign document mutation
  const signDocumentMutation = useMutation({
    mutationFn: async ({ requestId, signatureData }: { requestId: string; signatureData: string }) => {
      return apiRequest(`/api/documents/${requestId}/sign`, {
        method: 'PATCH',
        body: JSON.stringify({ signatureData })
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document signed successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/signature-requests'] });
      setShowSignatureDialog(false);
      setSignatureRequestDoc(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sign document",
        variant: "destructive"
      });
    }
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!uploadFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    uploadMutation.mutate({
      fileName: uploadFile.name,
      fileSize: uploadFile.size,
      mimeType: uploadFile.type,
      documentType: uploadDocType,
      status: uploadStatus,
      metadata: {
        originalFileName: uploadFile.name,
        uploadedBy: user?.username || user?.email
      }
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Document Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage healthcare documents, annotations, and e-signatures
          </p>
        </div>
        
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-document">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload a new healthcare document to the system
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Drag and drop area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
                data-testid="dropzone-upload"
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {uploadFile ? uploadFile.name : 'Drag and drop or click to select file'}
                </p>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  data-testid="input-file-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Document Type</label>
                <Select value={uploadDocType} onValueChange={setUploadDocType}>
                  <SelectTrigger data-testid="select-document-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.slice(1).map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={uploadStatus} onValueChange={setUploadStatus}>
                  <SelectTrigger data-testid="select-document-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_STATUS.slice(1).map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadDialog(false)}
                  data-testid="button-cancel-upload"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!uploadFile || uploadMutation.isPending}
                  data-testid="button-confirm-upload"
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList>
          <TabsTrigger value="documents" data-testid="tab-documents">
            Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="signatures" data-testid="tab-signatures">
            Pending Signatures ({signatureRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-documents"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Document Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger data-testid="select-filter-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger data-testid="select-filter-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_STATUS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document List */}
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-documents">
              <p className="text-gray-600 dark:text-gray-400">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400" data-testid="text-no-documents">
                  No documents found. Upload your first document to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc: Document) => (
                <Card key={doc.id} data-testid={`card-document-${doc.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate" data-testid={`text-document-name-${doc.id}`}>
                          {doc.fileName}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {formatDate(doc.uploadedAt)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" data-testid={`badge-type-${doc.id}`}>
                          {doc.documentType.replace('_', ' ')}
                        </Badge>
                        <Badge
                          variant={doc.status === 'final' ? 'default' : 'secondary'}
                          data-testid={`badge-status-${doc.id}`}
                        >
                          {doc.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatFileSize(doc.fileSize)}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedDocument(doc)}
                          data-testid={`button-view-${doc.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSignatureRequestDoc(doc);
                            const email = prompt('Enter signer email:');
                            if (email) {
                              requestSignatureMutation.mutate({ documentId: doc.id, signerEmail: email });
                            }
                          }}
                          data-testid={`button-request-signature-${doc.id}`}
                        >
                          <FileSignature className="h-4 w-4 mr-1" />
                          Sign
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(doc.id)}
                          data-testid={`button-delete-${doc.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="signatures" className="space-y-4">
          {signatureRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileSignature className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400" data-testid="text-no-signature-requests">
                  No pending signature requests
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {signatureRequests.map((request: any) => (
                <Card key={request.id} data-testid={`card-signature-request-${request.id}`}>
                  <CardHeader>
                    <CardTitle>Signature Request</CardTitle>
                    <CardDescription>
                      Requested on {formatDate(request.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">
                          Document ID: {request.documentId}
                        </p>
                        <Badge variant="outline">{request.status}</Badge>
                      </div>
                      
                      {request.status === 'pending' && (
                        <Button
                          onClick={() => {
                            setSignatureRequestDoc(request);
                            setShowSignatureDialog(true);
                          }}
                          data-testid={`button-sign-request-${request.id}`}
                        >
                          Sign Document
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* PDF Viewer Modal */}
      {selectedDocument && (
        <PDFViewer
          documentUrl={selectedDocument.storageUrl}
          documentName={selectedDocument.fileName}
          annotations={[]}
          onClose={() => setSelectedDocument(null)}
          onDownload={() => {
            toast({
              title: "Info",
              description: "Object storage integration pending"
            });
          }}
        />
      )}

      {/* Signature Dialog */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Sign Document</DialogTitle>
            <DialogDescription>
              Draw your signature below to sign this document
            </DialogDescription>
          </DialogHeader>
          
          <SignatureCanvas
            onSave={(signatureData) => {
              if (signatureRequestDoc) {
                signDocumentMutation.mutate({
                  requestId: signatureRequestDoc.id,
                  signatureData
                });
              }
            }}
            onCancel={() => {
              setShowSignatureDialog(false);
              setSignatureRequestDoc(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
