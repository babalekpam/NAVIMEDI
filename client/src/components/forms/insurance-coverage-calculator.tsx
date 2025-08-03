import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  };
}

export function InsuranceCoverageCalculator({ onCoverageChange, initialValues }: InsuranceCoverageCalculatorProps) {
  const [totalCost, setTotalCost] = useState(initialValues?.totalCost || 0);
  const [coveragePercentage, setCoveragePercentage] = useState(initialValues?.coveragePercentage || 80);

  const insuranceAmount = (totalCost * coveragePercentage) / 100;
  const patientCopay = totalCost - insuranceAmount;

  useEffect(() => {
    if (onCoverageChange) {
      onCoverageChange({
        totalCost,
        coveragePercentage,
        insuranceAmount,
        patientCopay,
      });
    }
  }, [totalCost, coveragePercentage, insuranceAmount, patientCopay, onCoverageChange]);

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

        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Insurance Coverage Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <Input
                  value={insuranceAmount.toFixed(2)}
                  disabled
                  className="pl-8 bg-green-50 text-green-700 font-medium"
                />
              </div>
            </div>
            <div>
              <Label>Patient Copay</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <Input
                  value={patientCopay.toFixed(2)}
                  disabled
                  className="pl-8 bg-blue-50 text-blue-700 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
          <p className="font-medium mb-1">Calculation Breakdown:</p>
          <p>• Insurance covers {coveragePercentage}% of ${totalCost.toFixed(2)} = ${insuranceAmount.toFixed(2)}</p>
          <p>• Patient pays remaining ${patientCopay.toFixed(2)} ({(100 - coveragePercentage).toFixed(1)}%)</p>
        </div>
      </CardContent>
    </Card>
  );
}