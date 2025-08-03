import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface InsuranceCoverageCalculatorProps {
  onCoverageChange?: (coverage: {
    totalCost: number;
    coveragePercentage: number;
    insuranceAmount: number;
    patientCopay: number;
  }) => void;
  initialValues?: {
    totalCost?: number;
    coveragePercentage?: number;
    insuranceAmount?: number;
    patientCopay?: number;
  };
}

export function InsuranceCoverageCalculator({ onCoverageChange, initialValues }: InsuranceCoverageCalculatorProps) {
  const [totalCost, setTotalCost] = useState(initialValues?.totalCost || 0);
  const [coveragePercentage, setCoveragePercentage] = useState(initialValues?.coveragePercentage || 80);
  const [manualInsuranceAmount, setManualInsuranceAmount] = useState(initialValues?.insuranceAmount || 0);
  const [manualPatientCopay, setManualPatientCopay] = useState(initialValues?.patientCopay || 0);
  const [useManualAmounts, setUseManualAmounts] = useState(false);

  // Calculate amounts based on percentage
  const calculatedInsuranceAmount = (totalCost * coveragePercentage) / 100;
  const calculatedPatientCopay = totalCost - calculatedInsuranceAmount;

  // Use manual or calculated amounts
  const insuranceAmount = useManualAmounts ? manualInsuranceAmount : calculatedInsuranceAmount;
  const patientCopay = useManualAmounts ? manualPatientCopay : calculatedPatientCopay;

  useEffect(() => {
    if (onCoverageChange) {
      onCoverageChange({
        totalCost,
        coveragePercentage,
        insuranceAmount,
        patientCopay,
      });
    }
  }, [totalCost, coveragePercentage, insuranceAmount, patientCopay, manualInsuranceAmount, manualPatientCopay, useManualAmounts, onCoverageChange]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Insurance Coverage Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="total-cost">Total Medication Cost</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <Input
                id="total-cost"
                type="number"
                step="0.01"
                min="0"
                value={totalCost || ''}
                onChange={(e) => setTotalCost(parseFloat(e.target.value) || 0)}
                className="pl-8"
                placeholder="85.00"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="coverage-percentage">Insurance Coverage %</Label>
            <div className="relative">
              <Input
                id="coverage-percentage"
                type="number"
                min="0"
                max="100"
                value={coveragePercentage || ''}
                onChange={(e) => setCoveragePercentage(parseFloat(e.target.value) || 0)}
                className="pr-8"
                placeholder="80"
              />
              <span className="absolute right-3 top-2.5 text-gray-500">%</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="manual-amounts"
              checked={useManualAmounts}
              onCheckedChange={setUseManualAmounts}
            />
            <Label htmlFor="manual-amounts" className="text-sm">
              {useManualAmounts ? "Manual Entry Mode" : "Auto-Calculate from Percentage"}
            </Label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Insurance Coverage Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={useManualAmounts ? manualInsuranceAmount || '' : insuranceAmount.toFixed(2)}
                  onChange={(e) => setManualInsuranceAmount(parseFloat(e.target.value) || 0)}
                  disabled={!useManualAmounts}
                  className={`pl-8 ${useManualAmounts ? 'bg-white' : 'bg-green-50 text-green-700 font-medium'}`}
                  placeholder="68.00"
                />
              </div>
            </div>
            <div>
              <Label>Patient Copay</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={useManualAmounts ? manualPatientCopay || '' : patientCopay.toFixed(2)}
                  onChange={(e) => setManualPatientCopay(parseFloat(e.target.value) || 0)}
                  disabled={!useManualAmounts}
                  className={`pl-8 ${useManualAmounts ? 'bg-white' : 'bg-blue-50 text-blue-700 font-medium'}`}
                  placeholder="17.00"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
          <p className="font-medium mb-1">
            {useManualAmounts ? "Manual Entry Mode:" : "Calculation Breakdown:"}
          </p>
          {useManualAmounts ? (
            <div>
              <p>• Insurance amount: ${insuranceAmount.toFixed(2)} (manually entered)</p>
              <p>• Patient copay: ${patientCopay.toFixed(2)} (manually entered)</p>
              <p>• Total: ${(insuranceAmount + patientCopay).toFixed(2)}</p>
            </div>
          ) : (
            <div>
              <p>• Insurance covers {coveragePercentage}% of ${totalCost.toFixed(2)} = ${insuranceAmount.toFixed(2)}</p>
              <p>• Patient pays remaining ${patientCopay.toFixed(2)} ({(100 - coveragePercentage).toFixed(1)}%)</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}