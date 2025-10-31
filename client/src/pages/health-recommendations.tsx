import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Target, Heart, Activity } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTenant } from "@/hooks/use-tenant";
import { apiRequest } from "@/lib/queryClient";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  mrn: string;
  dateOfBirth: string;
}

interface HealthRecommendation {
  id: string;
  patientId: string;
  type: "lifestyle" | "medical" | "preventive" | "risk_alert";
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  description: string;
  recommendations: string[];
  reasoning: string;
  followUpRequired: boolean;
  status: "active" | "dismissed" | "completed";
  acknowledgedAt?: string;
  createdAt: string;
}

interface HealthAnalysis {
  id: string;
  patientId: string;
  overallHealthScore: number;
  riskFactors: string[];
  trends: {
    improving: string[];
    concerning: string[];
    stable: string[];
  };
  nextAppointmentSuggestion?: string;
  createdAt: string;
}

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

const typeIcons = {
  lifestyle: Heart,
  medical: Activity,
  preventive: Target,
  risk_alert: AlertTriangle
};

export default function HealthRecommendations() {
  const { user } = useAuth();
  const { tenant: currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedRecommendation, setSelectedRecommendation] = useState<HealthRecommendation | null>(null);

  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ["/api/patients"],
    enabled: !!user && !!currentTenant
  });



  const { data: recommendations = [], isLoading: recommendationsLoading, refetch: refetchRecommendations } = useQuery({
    queryKey: ["/api/health-recommendations/patient", selectedPatient],
    enabled: !!selectedPatient
  });

  const { data: latestAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["/api/health-analyses/patient", selectedPatient, "latest"],
    enabled: !!selectedPatient
  });

  const generateAnalysisMutation = useMutation({
    mutationFn: (patientId: string) => 
      apiRequest(`/api/health-analyses/generate/${patientId}`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-recommendations/patient", selectedPatient] });
      queryClient.invalidateQueries({ queryKey: ["/api/health-analyses/patient", selectedPatient, "latest"] });
      refetchRecommendations();
    }
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (recommendationId: string) =>
      apiRequest(`/api/health-recommendations/${recommendationId}/acknowledge`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-recommendations/patient", selectedPatient] });
      refetchRecommendations();
    }
  });

  const handleGenerateAnalysis = () => {
    if (selectedPatient) {
      generateAnalysisMutation.mutate(selectedPatient);
    }
  };

  const handleAcknowledgeRecommendation = (recommendationId: string) => {
    acknowledgeMutation.mutate(recommendationId);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  if (patientsLoading) {
    return <div className="flex items-center justify-center h-64">Loading patients...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">AI Health Recommendations</h1>
            <p className="text-muted-foreground">
              Personalized AI-powered health insights using vital signs, appointments, and lab results
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Patient</CardTitle>
          <CardDescription>
            Choose a patient to view their health recommendations and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {(patients as Patient[]).map((patient: Patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName} (MRN: {patient.mrn})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedPatient && (
              <Button 
                onClick={handleGenerateAnalysis}
                disabled={generateAnalysisMutation.isPending}
                className="flex items-center space-x-2"
                data-testid="button-generate-analysis"
              >
                <Brain className="h-4 w-4" />
                <span>
                  {generateAnalysisMutation.isPending ? "Generating..." : "Generate AI Analysis"}
                </span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedPatient && (
        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommendations">Health Recommendations</TabsTrigger>
            <TabsTrigger value="analysis">Health Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            {generateAnalysisMutation.isPending && (
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  Analyzing patient data including vital signs, appointments, and lab results to generate personalized health recommendations...
                </AlertDescription>
              </Alert>
            )}

            {recommendationsLoading ? (
              <div className="flex items-center justify-center h-32">
                Loading recommendations...
              </div>
            ) : (recommendations as HealthRecommendation[]).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-32 text-center">
                  <Brain className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No health recommendations yet. Generate a health analysis to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {(recommendations as HealthRecommendation[]).map((rec: HealthRecommendation) => {
                  const TypeIcon = typeIcons[rec.type];
                  return (
                    <Card key={rec.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <TypeIcon className="h-5 w-5 mt-0.5 text-blue-600" />
                            <div>
                              <CardTitle className="text-lg">{rec.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {rec.description}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={priorityColors[rec.priority]}>
                              {rec.priority}
                            </Badge>
                            {rec.acknowledgedAt && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Acknowledged
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">
                              Recommended Actions:
                            </h4>
                            <ul className="space-y-1">
                              {rec.recommendations.map((recommendation, index) => (
                                <li key={index} className="flex items-start space-x-2 text-sm">
                                  <span className="text-blue-600 mt-1">•</span>
                                  <span>{recommendation}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                              </span>
                              {rec.followUpRequired && (
                                <Badge variant="outline" className="text-orange-600 border-orange-600">
                                  Follow-up Required
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedRecommendation(rec)}>
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center space-x-2">
                                      <TypeIcon className="h-5 w-5 text-blue-600" />
                                      <span>{rec.title}</span>
                                    </DialogTitle>
                                    <DialogDescription>
                                      Detailed health recommendation and reasoning
                                    </DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="max-h-96">
                                    <div className="space-y-4 pr-6">
                                      <div>
                                        <h4 className="font-medium mb-2">Description</h4>
                                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                                      </div>
                                      
                                      <Separator />
                                      
                                      <div>
                                        <h4 className="font-medium mb-2">Medical Reasoning</h4>
                                        <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                                      </div>
                                      
                                      <Separator />
                                      
                                      <div>
                                        <h4 className="font-medium mb-2">Recommended Actions</h4>
                                        <ul className="space-y-2">
                                          {rec.recommendations.map((recommendation, index) => (
                                            <li key={index} className="flex items-start space-x-2 text-sm">
                                              <span className="text-blue-600 mt-1">•</span>
                                              <span>{recommendation}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                              
                              {!rec.acknowledgedAt && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleAcknowledgeRecommendation(rec.id)}
                                  disabled={acknowledgeMutation.isPending}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Acknowledge
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {analysisLoading ? (
              <div className="flex items-center justify-center h-32">
                Loading health analysis...
              </div>
            ) : !latestAnalysis || Object.keys(latestAnalysis).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-32 text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No health analysis available. Generate an AI analysis to get comprehensive health insights based on vital signs, appointments, and lab results.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {/* Overall Health Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Overall Health Score</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getHealthScoreColor((latestAnalysis as HealthAnalysis)?.overallHealthScore || 0)}`}>
                          {(latestAnalysis as HealthAnalysis)?.overallHealthScore || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">out of 100</div>
                      </div>
                      <div className="flex-1">
                        <Progress 
                          value={(latestAnalysis as HealthAnalysis)?.overallHealthScore || 0} 
                          className="w-full h-3"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Poor</span>
                          <span>Fair</span>
                          <span>Good</span>
                          <span>Excellent</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Health Trends */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">Improving</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {((latestAnalysis as HealthAnalysis)?.trends?.improving || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No improvements detected</p>
                      ) : (
                        <ul className="space-y-1">
                          {((latestAnalysis as HealthAnalysis)?.trends?.improving || []).map((trend: string, index: number) => (
                            <li key={index} className="text-sm flex items-center space-x-2">
                              <span className="text-green-600">•</span>
                              <span>{trend}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-blue-600">
                        <Activity className="h-4 w-4" />
                        <span className="text-sm">Stable</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {((latestAnalysis as HealthAnalysis)?.trends?.stable || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No stable indicators</p>
                      ) : (
                        <ul className="space-y-1">
                          {((latestAnalysis as HealthAnalysis)?.trends?.stable || []).map((trend: string, index: number) => (
                            <li key={index} className="text-sm flex items-center space-x-2">
                              <span className="text-blue-600">•</span>
                              <span>{trend}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-orange-600">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-sm">Concerning</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {((latestAnalysis as HealthAnalysis)?.trends?.concerning || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No concerning trends</p>
                      ) : (
                        <ul className="space-y-1">
                          {((latestAnalysis as HealthAnalysis)?.trends?.concerning || []).map((trend: string, index: number) => (
                            <li key={index} className="text-sm flex items-center space-x-2">
                              <span className="text-orange-600">•</span>
                              <span>{trend}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Risk Factors */}
                {((latestAnalysis as HealthAnalysis)?.riskFactors || []).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Identified Risk Factors</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-3">
                        {((latestAnalysis as HealthAnalysis)?.riskFactors || []).map((risk: string, index: number) => (
                          <Alert key={index} className="border-red-200">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{risk}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Next Appointment Suggestion */}
                {(latestAnalysis as HealthAnalysis)?.nextAppointmentSuggestion && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>Next Appointment Recommendation</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{(latestAnalysis as HealthAnalysis)?.nextAppointmentSuggestion}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}