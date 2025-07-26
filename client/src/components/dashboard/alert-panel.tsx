import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Clock, Info, CheckCircle } from "lucide-react";

interface AlertPanelProps {
  pendingLabCount: number;
  loading?: boolean;
}

export const AlertPanel = ({ pendingLabCount, loading = false }: AlertPanelProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* High Priority Alert */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div>
            <p className="font-medium">Critical Values Detected</p>
            <p className="text-sm">Patient vitals require immediate attention</p>
            <p className="text-xs text-red-600 mt-1">2 minutes ago</p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Lab Results Alert */}
      {pendingLabCount > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div>
              <p className="font-medium">Lab Results Pending Review</p>
              <p className="text-sm">{pendingLabCount} results need your attention</p>
              <p className="text-xs text-yellow-600 mt-1">15 minutes ago</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Information Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div>
            <p className="font-medium">Insurance Verification</p>
            <p className="text-sm">3 patients need insurance verification</p>
            <p className="text-xs text-blue-600 mt-1">1 hour ago</p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Success Alert */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div>
            <p className="font-medium">System Backup Complete</p>
            <p className="text-sm">All patient data securely backed up</p>
            <p className="text-xs text-green-600 mt-1">2 hours ago</p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
