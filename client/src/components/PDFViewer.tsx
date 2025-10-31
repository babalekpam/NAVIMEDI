import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ZoomIn, ZoomOut, Download, X } from "lucide-react";

interface Annotation {
  id: string;
  annotationType: string;
  annotationData: any;
  pageNumber?: number;
}

interface PDFViewerProps {
  documentUrl: string;
  documentName: string;
  annotations?: Annotation[];
  onClose?: () => void;
  onDownload?: () => void;
}

export function PDFViewer({
  documentUrl,
  documentName,
  annotations = [],
  onClose,
  onDownload
}: PDFViewerProps) {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold truncate max-w-md" data-testid="text-document-name">
            {documentName}
          </h2>
          
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                data-testid="button-zoom-out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <span className="text-sm px-2 min-w-16 text-center" data-testid="text-zoom-level">
                {zoom}%
              </span>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                data-testid="button-zoom-in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Download Button */}
            {onDownload && (
              <Button
                variant="outline"
                size="icon"
                onClick={onDownload}
                data-testid="button-download-document"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}

            {/* Close Button */}
            {onClose && (
              <Button
                variant="outline"
                size="icon"
                onClick={onClose}
                data-testid="button-close-viewer"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Document Viewer */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg">
            {/* PDF Display using iframe for basic implementation */}
            {documentUrl.endsWith('.pdf') ? (
              <iframe
                src={documentUrl}
                className="w-full h-[70vh] border-0"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                data-testid="pdf-iframe"
                title={documentName}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">
                    Document Preview
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {documentName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                    PDF preview will be available with object storage integration
                  </p>
                </div>
                
                {onDownload && (
                  <Button onClick={onDownload} data-testid="button-download-alternative">
                    <Download className="h-4 w-4 mr-2" />
                    Download Document
                  </Button>
                )}
              </div>
            )}

            {/* Annotation Overlay */}
            {annotations.length > 0 && (
              <div
                className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none"
                data-testid="annotation-overlay"
              >
                {annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className="absolute"
                    style={{
                      left: `${annotation.annotationData?.x || 0}%`,
                      top: `${annotation.annotationData?.y || 0}%`,
                      ...getAnnotationStyle(annotation.annotationType)
                    }}
                    data-testid={`annotation-${annotation.id}`}
                  >
                    {annotation.annotationType === 'note' && (
                      <div className="bg-yellow-200 dark:bg-yellow-700 p-2 rounded shadow-lg max-w-xs pointer-events-auto">
                        <p className="text-xs">{annotation.annotationData?.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer with annotation info */}
        {annotations.length > 0 && (
          <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-annotation-count">
              {annotations.length} annotation{annotations.length !== 1 ? 's' : ''} on this document
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

function getAnnotationStyle(type: string): React.CSSProperties {
  switch (type) {
    case 'highlight':
      return {
        backgroundColor: 'rgba(255, 255, 0, 0.3)',
        padding: '2px 4px',
        borderRadius: '2px'
      };
    case 'note':
      return {};
    case 'draw':
      return {
        border: '2px solid red',
        borderRadius: '4px'
      };
    case 'stamp':
      return {
        backgroundColor: 'rgba(0, 128, 0, 0.2)',
        padding: '4px 8px',
        borderRadius: '4px',
        border: '2px solid green'
      };
    default:
      return {};
  }
}
