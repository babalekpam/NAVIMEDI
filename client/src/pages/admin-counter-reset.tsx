import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, RotateCcw, CheckCircle, RefreshCw } from "lucide-react";

export default function AdminCounterReset() {
  const { toast } = useToast();
  const [resetResult, setResetResult] = useState<any>(null);

  const resetCountersMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/admin/reset-counters", {
        method: "POST"
      });
    },
    onSuccess: (data) => {
      setResetResult(data);
      toast({
        title: "Counters Reset Successfully",
        description: "All platform counters have been reset to zero",
        variant: "default"
      });
    },
    onError: (error: any) => {
      console.error("Counter reset error:", error);
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset counters",
        variant: "destructive"
      });
    }
  });

  const handleResetCounters = () => {
    if (window.confirm("Are you sure you want to reset ALL counters across ALL accounts to zero? This action cannot be undone.")) {
      resetCountersMutation.mutate();
    }
  };

  const counterTypes = [
    "Work shift prescriptions, revenue, and insurance claims",
    "User levels, points, tests completed, and streaks", 
    "Advertisement impressions, clicks, and conversions",
    "Product view counts, order counts, ratings, and reviews",
    "Activity log points",
    "Stock quantities reset to zero"
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Counter Reset Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Reset all platform counters to zero for accuracy when new users sign up
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Counter Reset Tool
          </CardTitle>
          <CardDescription>
            This tool will reset all numeric counters across all accounts to zero. 
            Use this to ensure clean starting values for new user registrations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action will reset counters for ALL accounts and cannot be undone. 
              Only use this when necessary for platform maintenance.
            </AlertDescription>
          </Alert>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Counters that will be reset:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {counterTypes.map((counter, index) => (
                <Badge key={index} variant="outline" className="p-2 text-sm">
                  {counter}
                </Badge>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleResetCounters}
            disabled={resetCountersMutation.isPending}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            size="lg"
          >
            {resetCountersMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Resetting Counters...
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset All Counters to Zero
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {resetResult && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              Reset Completed Successfully
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 dark:text-green-400 mb-4">
              {resetResult.message}
            </p>
            
            <div className="space-y-2 text-sm">
              <p><strong>Reset by:</strong> {resetResult.details?.resetBy}</p>
              <p><strong>Timestamp:</strong> {new Date(resetResult.details?.timestamp).toLocaleString()}</p>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Reset Categories:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-700 dark:text-green-400">
                {resetResult.details?.resetCounters?.map((counter: string, index: number) => (
                  <li key={index}>{counter}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}