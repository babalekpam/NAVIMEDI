import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, XCircle, AlertCircle, Info, ExternalLink } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClinicalAlertData {
  type: 'drug_interaction' | 'allergy' | 'dosage' | 'duplicate_therapy' | 'contraindication';
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  title: string;
  message: string;
  recommendations: string;
  clinicalImpact?: string;
  managementStrategy?: string;
}

interface ClinicalAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: ClinicalAlertData[];
  severity: 'critical' | 'major' | 'moderate' | 'minor' | 'none';
  canProceed: boolean;
  onAcknowledge?: (overrideReason: string) => void;
  onCancel?: () => void;
  patientId?: string;
}

const severityConfig = {
  critical: {
    color: "bg-red-100 text-red-900 border-red-300 dark:bg-red-900 dark:text-red-100",
    badgeVariant: "destructive" as const,
    icon: XCircle,
    iconColor: "text-red-600 dark:text-red-400",
    title: "Critical Alert"
  },
  major: {
    color: "bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-900 dark:text-orange-100",
    badgeVariant: "default" as const,
    icon: AlertTriangle,
    iconColor: "text-orange-600 dark:text-orange-400",
    title: "Major Alert"
  },
  moderate: {
    color: "bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-100",
    badgeVariant: "default" as const,
    icon: AlertCircle,
    iconColor: "text-yellow-600 dark:text-yellow-400",
    title: "Moderate Alert"
  },
  minor: {
    color: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-900 dark:text-blue-100",
    badgeVariant: "secondary" as const,
    icon: Info,
    iconColor: "text-blue-600 dark:text-blue-400",
    title: "Minor Alert"
  },
  none: {
    color: "bg-gray-100 text-gray-900 border-gray-300 dark:bg-gray-900 dark:text-gray-100",
    badgeVariant: "outline" as const,
    icon: Info,
    iconColor: "text-gray-600 dark:text-gray-400",
    title: "No Alerts"
  }
};

const alertTypeLabels = {
  drug_interaction: "Drug Interaction",
  allergy: "Allergy Alert",
  dosage: "Dosage Warning",
  duplicate_therapy: "Duplicate Therapy",
  contraindication: "Contraindication"
};

export default function ClinicalAlertModal({
  isOpen,
  onClose,
  alerts,
  severity,
  canProceed,
  onAcknowledge,
  onCancel,
  patientId
}: ClinicalAlertModalProps) {
  const [overrideReason, setOverrideReason] = useState("");
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const { toast } = useToast();

  const config = severityConfig[severity];
  const SeverityIcon = config.icon;

  const handleAcknowledge = () => {
    if (severity === 'critical' && !overrideReason.trim()) {
      toast({
        title: "Override Reason Required",
        description: "Critical alerts require a documented reason to proceed.",
        variant: "destructive"
      });
      return;
    }

    if (onAcknowledge) {
      onAcknowledge(overrideReason);
    }
    
    setOverrideReason("");
    setIsAcknowledging(false);
    onClose();
  };

  const handleCancel = () => {
    setOverrideReason("");
    setIsAcknowledging(false);
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent 
        className="max-w-3xl max-h-[90vh]" 
        data-testid="modal-clinical-alert"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <SeverityIcon className={`h-6 w-6 ${config.iconColor}`} data-testid="icon-severity" />
            <span data-testid="text-modal-title">{config.title} - {alerts.length} Issue{alerts.length > 1 ? 's' : ''} Found</span>
            <Badge variant={config.badgeVariant} data-testid={`badge-severity-${severity}`}>
              {severity.toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${severityConfig[alert.severity].color}`}
                data-testid={`alert-item-${index}`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <Badge 
                    variant={severityConfig[alert.severity].badgeVariant}
                    data-testid={`badge-alert-type-${index}`}
                  >
                    {alertTypeLabels[alert.type]}
                  </Badge>
                  <Badge 
                    variant="outline"
                    data-testid={`badge-alert-severity-${index}`}
                  >
                    {alert.severity}
                  </Badge>
                </div>

                <h3 
                  className="font-semibold text-lg mb-2"
                  data-testid={`text-alert-title-${index}`}
                >
                  {alert.title}
                </h3>

                <p 
                  className="text-sm mb-3"
                  data-testid={`text-alert-message-${index}`}
                >
                  {alert.message}
                </p>

                {alert.clinicalImpact && (
                  <div className="mb-3">
                    <Label className="text-xs font-semibold">Clinical Impact:</Label>
                    <p 
                      className="text-sm mt-1"
                      data-testid={`text-clinical-impact-${index}`}
                    >
                      {alert.clinicalImpact}
                    </p>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                  <Label className="text-xs font-semibold">Recommendations:</Label>
                  <p 
                    className="text-sm mt-1"
                    data-testid={`text-recommendations-${index}`}
                  >
                    {alert.recommendations}
                  </p>
                </div>

                {alert.managementStrategy && (
                  <div className="mt-3">
                    <Label className="text-xs font-semibold">Management Strategy:</Label>
                    <p 
                      className="text-sm mt-1"
                      data-testid={`text-management-${index}`}
                    >
                      {alert.managementStrategy}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        {!canProceed && (
          <div 
            className="bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-800 rounded-lg p-4"
            data-testid="warning-critical"
          >
            <div className="flex items-center gap-2 text-red-900 dark:text-red-100">
              <XCircle className="h-5 w-5" />
              <p className="font-semibold">Critical Override Required</p>
            </div>
            <p className="text-sm text-red-800 dark:text-red-200 mt-1">
              This prescription has critical safety concerns. You must provide a documented clinical reason to proceed.
            </p>
          </div>
        )}

        {(severity === 'critical' || isAcknowledging) && (
          <div className="space-y-2">
            <Label htmlFor="override-reason" data-testid="label-override-reason">
              Override Reason {severity === 'critical' && <span className="text-red-600">*</span>}
            </Label>
            <Textarea
              id="override-reason"
              placeholder="Document the clinical justification for overriding these alerts..."
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="min-h-[100px]"
              data-testid="input-override-reason"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              This override will be logged in the patient's medical record and audit trail.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            data-testid="button-cancel-prescription"
          >
            Cancel Prescription
          </Button>

          {severity !== 'critical' && !isAcknowledging && (
            <Button
              variant="secondary"
              onClick={() => setIsAcknowledging(true)}
              data-testid="button-add-override"
            >
              Add Override Reason
            </Button>
          )}

          <Button
            onClick={handleAcknowledge}
            disabled={severity === 'critical' && !overrideReason.trim()}
            variant={severity === 'critical' ? 'destructive' : 'default'}
            data-testid="button-proceed-acknowledge"
          >
            {severity === 'critical' ? 'Override & Proceed' : 'Acknowledge & Proceed'}
          </Button>
        </DialogFooter>

        {patientId && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            <a 
              href={`https://www.drugs.com/drug_interactions.html`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline"
              data-testid="link-drug-info"
            >
              <ExternalLink className="h-3 w-3" />
              View detailed drug information
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
