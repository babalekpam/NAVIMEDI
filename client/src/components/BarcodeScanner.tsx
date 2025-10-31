import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scan, CheckCircle, XCircle, Package } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BarcodeScannerProps {
  onItemScanned?: (item: any) => void;
}

export function BarcodeScanner({ onItemScanned }: BarcodeScannerProps) {
  const [barcode, setBarcode] = useState("");
  const [scannedItem, setScannedItem] = useState<any>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const scanMutation = useMutation({
    mutationFn: async (barcodeValue: string) => {
      const response = await apiRequest('/api/inventory/scan-barcode', {
        method: 'POST',
        body: JSON.stringify({ barcode: barcodeValue })
      });
      return response;
    },
    onSuccess: (data) => {
      setScannedItem(data);
      setScanStatus('success');
      toast({
        title: "Item Found",
        description: `Found: ${data.medicationName}`,
      });
      if (onItemScanned) {
        onItemScanned(data);
      }
    },
    onError: (error: any) => {
      setScanStatus('error');
      setScannedItem(null);
      toast({
        title: "Item Not Found",
        description: error.message || "No item found with this barcode",
        variant: "destructive"
      });
    }
  });

  const handleScan = () => {
    if (!barcode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a barcode",
        variant: "destructive"
      });
      return;
    }

    setScanStatus('idle');
    scanMutation.mutate(barcode);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  const clearScan = () => {
    setBarcode("");
    setScannedItem(null);
    setScanStatus('idle');
  };

  return (
    <Card data-testid="barcode-scanner">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Barcode Scanner
        </CardTitle>
        <CardDescription>
          Scan or manually enter barcode to look up inventory items
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Scanner Input */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                data-testid="input-barcode"
                placeholder="Enter barcode or scan with USB scanner"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={scanMutation.isPending}
                className="font-mono"
              />
            </div>
            <Button
              data-testid="button-scan"
              onClick={handleScan}
              disabled={scanMutation.isPending || !barcode.trim()}
            >
              {scanMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Scanning...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Scan className="h-4 w-4" />
                  Scan
                </span>
              )}
            </Button>
            {barcode && (
              <Button
                data-testid="button-clear-scan"
                variant="outline"
                onClick={clearScan}
              >
                Clear
              </Button>
            )}
          </div>

          {/* Scan Status Indicator */}
          {scanStatus !== 'idle' && (
            <div className={`flex items-center gap-2 p-3 rounded-md ${
              scanStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`} data-testid="scan-status">
              {scanStatus === 'success' ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Item found successfully</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Item not found</span>
                </>
              )}
            </div>
          )}

          {/* Scanned Item Details */}
          {scannedItem && (
            <div className="border rounded-md p-4 bg-gray-50" data-testid="scanned-item-details">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-lg" data-testid="text-item-name">
                    {scannedItem.medicationName}
                  </h3>
                </div>
                <Badge variant={scannedItem.currentStock < (scannedItem.minStockLevel || 0) ? "destructive" : "default"}>
                  Stock: {scannedItem.currentStock}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {scannedItem.genericName && (
                  <div data-testid="item-generic">
                    <span className="text-gray-600">Generic Name:</span>
                    <span className="ml-2 font-medium">{scannedItem.genericName}</span>
                  </div>
                )}
                {scannedItem.strength && (
                  <div data-testid="item-strength">
                    <span className="text-gray-600">Strength:</span>
                    <span className="ml-2 font-medium">{scannedItem.strength}</span>
                  </div>
                )}
                {scannedItem.form && (
                  <div data-testid="item-form">
                    <span className="text-gray-600">Form:</span>
                    <span className="ml-2 font-medium">{scannedItem.form}</span>
                  </div>
                )}
                {scannedItem.lotNumber && (
                  <div data-testid="item-lot">
                    <span className="text-gray-600">Lot Number:</span>
                    <span className="ml-2 font-medium">{scannedItem.lotNumber}</span>
                  </div>
                )}
                {scannedItem.expirationDate && (
                  <div data-testid="item-expiration">
                    <span className="text-gray-600">Expiration:</span>
                    <span className="ml-2 font-medium">
                      {new Date(scannedItem.expirationDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {scannedItem.storageLocation && (
                  <div data-testid="item-location">
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2 font-medium">{scannedItem.storageLocation}</span>
                  </div>
                )}
                {scannedItem.temperatureControlled && (
                  <div data-testid="item-temperature" className="col-span-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      🌡️ Temperature Controlled: {scannedItem.temperatureRange || 'See label'}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Stock Status Indicators */}
              <div className="mt-3 pt-3 border-t">
                <div className="flex gap-2">
                  {scannedItem.currentStock < (scannedItem.minStockLevel || 0) && (
                    <Badge variant="destructive" data-testid="badge-low-stock">
                      Low Stock Alert
                    </Badge>
                  )}
                  {scannedItem.expirationDate && new Date(scannedItem.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                    <Badge variant="warning" className="bg-yellow-100 text-yellow-800" data-testid="badge-expiring-soon">
                      Expiring Soon
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Supported Formats Info */}
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            <span className="font-medium">Supported formats:</span> UPC, EAN-13, Code 128
            <br />
            <span className="font-medium">Note:</span> USB barcode scanners work via keyboard emulation (no special setup required)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
