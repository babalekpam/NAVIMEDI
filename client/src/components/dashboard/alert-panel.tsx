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
      {/* Only show lab results alert if there are pending results */}
      {pendingLabCount > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div>
              <p className="font-medium">Lab Results Pending Review</p>
              <p className="text-sm">{pendingLabCount} results need your attention</p>
              <p className="text-xs text-yellow-600 mt-1">Needs review</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Show message when no alerts */}
      {pendingLabCount === 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div>
              <p className="font-medium">All Clear</p>
              <p className="text-sm">No urgent notifications at this time</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
