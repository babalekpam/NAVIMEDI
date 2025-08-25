import React from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/contexts/translation-context';
import { PatientForm } from '@/components/forms/patient-form-simple';
import { useTenant } from '@/hooks/use-tenant';

interface PatientRegistrationDialogProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
  department?: string;
}

export default function PatientRegistrationDialog({ onSubmit, isLoading, department = 'General' }: PatientRegistrationDialogProps) {
  const { t } = useTranslation();
  const { tenant } = useTenant();

  // Determine if this is a hospital/clinic that should include vital signs
  const includeVitalSigns = tenant?.type === 'hospital' || tenant?.type === 'clinic';

  return (
    <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle>{t('register-new-patient')}</DialogTitle>
        <DialogDescription>
          {includeVitalSigns 
            ? `${t('enter-patient-information-below')} - ${department} Department`
            : t('enter-patient-information-below')
          }
        </DialogDescription>
      </DialogHeader>
      
      <ScrollArea className="max-h-[70vh] pr-4">
        <PatientForm 
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </ScrollArea>
    </DialogContent>
  );
};