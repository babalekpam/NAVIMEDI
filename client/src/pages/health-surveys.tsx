import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, CheckCircle2, BarChart3, FileText } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

interface HealthSurvey {
  id: string;
  surveyName: string;
  description: string | null;
  questions: Array<{
    id: string;
    question: string;
    type: 'multiple_choice' | 'text' | 'scale';
    options?: string[];
    required: boolean;
  }>;
  targetAudience: string | null;
  isActive: boolean;
  createdAt: string;
}

interface SurveyResponse {
  id: string;
  surveyId: string;
  patientId: string;
  responses: Record<string, any>;
  score: number | null;
  submittedAt: string;
}

export default function HealthSurveys() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedSurvey, setSelectedSurvey] = useState<HealthSurvey | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const { data: surveys = [], isLoading } = useQuery<HealthSurvey[]>({
    queryKey: ['/api/surveys'],
    enabled: true
  });

  const { data: myResponses = [] } = useQuery<SurveyResponse[]>({
    queryKey: ['/api/surveys', 'my-responses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const allResponses: SurveyResponse[] = [];
      for (const survey of surveys) {
        const responses = await fetch(`/api/surveys/${survey.id}/results`).then(r => r.json());
        if (responses.responses) {
          allResponses.push(...responses.responses.filter((r: SurveyResponse) => r.patientId === user.id));
        }
      }
      return allResponses;
    },
    enabled: !!user?.id && surveys.length > 0
  });

  const submitResponseMutation = useMutation({
    mutationFn: (data: { surveyId: string; patientId: string; responses: Record<string, any>; score?: number }) => 
      apiRequest(`/api/surveys/${data.surveyId}/respond`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/surveys'] });
      setSelectedSurvey(null);
      setCurrentQuestion(0);
      setAnswers({});
      toast({
        title: "Survey Submitted",
        description: "Thank you for completing the survey!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit survey. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleStartSurvey = (survey: HealthSurvey) => {
    setSelectedSurvey(survey);
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (selectedSurvey && currentQuestion < selectedSurvey.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!selectedSurvey || !user?.id) return;

    // Calculate score if applicable
    let score = 0;
    selectedSurvey.questions.forEach(q => {
      if (q.type === 'scale' && answers[q.id]) {
        score += parseInt(answers[q.id]);
      }
    });

    submitResponseMutation.mutate({
      surveyId: selectedSurvey.id,
      patientId: user.id,
      responses: answers,
      score: score > 0 ? score : undefined
    });
  };

  const isQuestionAnswered = (questionId: string) => {
    return answers[questionId] !== undefined && answers[questionId] !== '';
  };

  const canProceed = selectedSurvey && selectedSurvey.questions[currentQuestion] 
    ? isQuestionAnswered(selectedSurvey.questions[currentQuestion].id) || !selectedSurvey.questions[currentQuestion].required
    : false;

  const hasCompletedSurvey = (surveyId: string) => {
    return myResponses.some(r => r.surveyId === surveyId);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2" data-testid="heading-surveys">
          <ClipboardList className="h-8 w-8 text-blue-600" />
          Health Surveys
        </h1>
        <p className="text-gray-600">
          Help us understand your health better by completing these surveys
        </p>
      </div>

      {/* Available Surveys */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading surveys...</p>
        </div>
      ) : surveys.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Surveys Available</h3>
            <p className="text-gray-600">
              There are no active surveys at the moment. Please check back later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.filter(s => s.isActive).map((survey) => (
            <Card 
              key={survey.id} 
              className="hover:shadow-lg transition-shadow"
              data-testid={`card-survey-${survey.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg" data-testid={`text-survey-name-${survey.id}`}>
                    {survey.surveyName}
                  </CardTitle>
                  {hasCompletedSurvey(survey.id) && (
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  {survey.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span data-testid={`text-questions-count-${survey.id}`}>
                    {survey.questions.length} questions
                  </span>
                  {survey.targetAudience && (
                    <Badge variant="outline">{survey.targetAudience}</Badge>
                  )}
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleStartSurvey(survey)}
                  disabled={hasCompletedSurvey(survey.id)}
                  data-testid={`button-start-survey-${survey.id}`}
                >
                  {hasCompletedSurvey(survey.id) ? 'Already Completed' : 'Start Survey'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Survey Taking Dialog */}
      <Dialog open={!!selectedSurvey} onOpenChange={() => setSelectedSurvey(null)}>
        <DialogContent className="max-w-2xl" data-testid="dialog-survey-taking">
          {selectedSurvey && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl" data-testid="text-survey-title">
                  {selectedSurvey.surveyName}
                </DialogTitle>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Question {currentQuestion + 1} of {selectedSurvey.questions.length}</span>
                    <span>{Math.round(((currentQuestion + 1) / selectedSurvey.questions.length) * 100)}% Complete</span>
                  </div>
                  <Progress 
                    value={((currentQuestion + 1) / selectedSurvey.questions.length) * 100} 
                    data-testid="progress-survey"
                  />
                </div>
              </DialogHeader>

              <div className="py-6">
                {selectedSurvey.questions[currentQuestion] && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                        {currentQuestion + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-4" data-testid="text-question">
                          {selectedSurvey.questions[currentQuestion].question}
                          {selectedSurvey.questions[currentQuestion].required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </h3>

                        {selectedSurvey.questions[currentQuestion].type === 'multiple_choice' && (
                          <RadioGroup
                            value={answers[selectedSurvey.questions[currentQuestion].id] || ''}
                            onValueChange={(value) => handleAnswer(selectedSurvey.questions[currentQuestion].id, value)}
                          >
                            {selectedSurvey.questions[currentQuestion].options?.map((option, idx) => (
                              <div key={idx} className="flex items-center space-x-2 mb-2">
                                <RadioGroupItem 
                                  value={option} 
                                  id={`option-${idx}`}
                                  data-testid={`radio-option-${idx}`}
                                />
                                <Label htmlFor={`option-${idx}`} className="cursor-pointer">
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}

                        {selectedSurvey.questions[currentQuestion].type === 'scale' && (
                          <RadioGroup
                            value={answers[selectedSurvey.questions[currentQuestion].id] || ''}
                            onValueChange={(value) => handleAnswer(selectedSurvey.questions[currentQuestion].id, value)}
                          >
                            <div className="flex justify-between">
                              {[1, 2, 3, 4, 5].map((num) => (
                                <div key={num} className="flex flex-col items-center">
                                  <RadioGroupItem 
                                    value={num.toString()} 
                                    id={`scale-${num}`}
                                    data-testid={`radio-scale-${num}`}
                                    className="mb-2"
                                  />
                                  <Label htmlFor={`scale-${num}`} className="text-sm cursor-pointer">
                                    {num}
                                  </Label>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                              <span>Not at all</span>
                              <span>Extremely</span>
                            </div>
                          </RadioGroup>
                        )}

                        {selectedSurvey.questions[currentQuestion].type === 'text' && (
                          <Textarea
                            value={answers[selectedSurvey.questions[currentQuestion].id] || ''}
                            onChange={(e) => handleAnswer(selectedSurvey.questions[currentQuestion].id, e.target.value)}
                            placeholder="Type your answer here..."
                            rows={4}
                            data-testid="textarea-answer"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  data-testid="button-previous"
                >
                  Previous
                </Button>
                {currentQuestion < selectedSurvey.questions.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed}
                    data-testid="button-next"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceed || submitResponseMutation.isPending}
                    data-testid="button-submit-survey"
                  >
                    {submitResponseMutation.isPending ? 'Submitting...' : 'Submit Survey'}
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
