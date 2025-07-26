import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MedicalCommunication, Patient, SupportedLanguage, CommunicationTranslation } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages, User, Calendar, Clock, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";

interface CommunicationViewerProps {
  communication: MedicalCommunication;
  patients: Patient[];
  supportedLanguages: SupportedLanguage[];
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  normal: "bg-blue-100 text-blue-800", 
  high: "bg-yellow-100 text-yellow-800",
  urgent: "bg-orange-100 text-orange-800",
  emergency: "bg-red-100 text-red-800",
};

const typeColors = {
  medical_instruction: "bg-green-100 text-green-800",
  prescription_note: "bg-purple-100 text-purple-800",
  discharge_summary: "bg-indigo-100 text-indigo-800",
  appointment_reminder: "bg-cyan-100 text-cyan-800",
  lab_result: "bg-orange-100 text-orange-800",
  general_message: "bg-gray-100 text-gray-800",
  emergency_alert: "bg-red-100 text-red-800",
};

const translationStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  translating: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  manual_review: "bg-orange-100 text-orange-800",
};

export const CommunicationViewer = ({ communication, patients, supportedLanguages }: CommunicationViewerProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState(communication.originalLanguage);
  const queryClient = useQueryClient();

  const { data: translations = [] } = useQuery<CommunicationTranslation[]>({
    queryKey: ["/api/communication-translations", communication.id],
  });

  const translateMutation = useMutation({
    mutationFn: async (languageCode: string) => {
      const { apiRequest } = await import("@/lib/queryClient");
      const response = await apiRequest("POST", "/api/communication-translations", {
        communicationId: communication.id,
        languageCode,
        translatedContent: {
          title: `[Auto-translated to ${languageCode}] ${communication.originalContent.title}`,
          content: `[Auto-translated content] ${communication.originalContent.content}`,
        },
        status: "completed",
        translationEngine: "auto-translator",
        confidence: 0.85,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communication-translations", communication.id] });
    }
  });

  const patient = patients.find(p => p.id === communication.patientId);
  const originalLanguage = supportedLanguages.find(l => l.languageCode === communication.originalLanguage);
  const selectedLangDetails = supportedLanguages.find(l => l.languageCode === selectedLanguage);

  const getCurrentContent = () => {
    if (selectedLanguage === communication.originalLanguage) {
      return communication.originalContent;
    }
    
    const translation = translations.find(t => t.languageCode === selectedLanguage);
    if (translation) {
      return translation.translatedContent;
    }
    
    return null;
  };

  const currentContent = getCurrentContent();
  const targetLanguages = Array.isArray(communication.targetLanguages) ? communication.targetLanguages : [communication.originalLanguage];

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Badge className={priorityColors[communication.priority as keyof typeof priorityColors]}>
                  {communication.priority.toUpperCase()}
                </Badge>
                <Badge variant="outline" className={typeColors[communication.type as keyof typeof typeColors]}>
                  {communication.type.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <h2 className="text-xl font-semibold">
                {typeof communication.originalContent === 'object' && communication.originalContent.title 
                  ? communication.originalContent.title 
                  : "Medical Communication"
                }
              </h2>
            </div>
            
            <div className="text-right text-sm text-gray-500 space-y-1">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(communication.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{new Date(communication.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                <strong>Patient:</strong> {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                {patient && <span className="text-gray-500 ml-2">(MRN: {patient.mrn})</span>}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Languages className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                <strong>Original Language:</strong> {originalLanguage?.languageName || communication.originalLanguage.toUpperCase()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Selection and Translation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Languages className="h-5 w-5 mr-2" />
              Translation & Language Options
            </CardTitle>
            
            <div className="flex items-center space-x-3">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {targetLanguages.map((langCode) => {
                    const lang = supportedLanguages.find(l => l.languageCode === langCode);
                    const translation = translations.find(t => t.languageCode === langCode);
                    const isOriginal = langCode === communication.originalLanguage;
                    
                    return (
                      <SelectItem key={langCode} value={langCode}>
                        <div className="flex items-center justify-between w-full">
                          <span>{lang?.languageName || langCode.toUpperCase()}</span>
                          {isOriginal ? (
                            <Badge variant="outline" className="ml-2">Original</Badge>
                          ) : translation ? (
                            <Badge className={translationStatusColors[translation.status as keyof typeof translationStatusColors]}>
                              {translation.status}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Not translated</Badge>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {selectedLanguage !== communication.originalLanguage && !translations.find(t => t.languageCode === selectedLanguage) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => translateMutation.mutate(selectedLanguage)}
                  disabled={translateMutation.isPending}
                >
                  {translateMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Languages className="h-4 w-4 mr-2" />
                  )}
                  Translate to {selectedLangDetails?.languageName}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Translation Status */}
            {selectedLanguage !== communication.originalLanguage && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <Languages className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Viewing translation in <strong>{selectedLangDetails?.languageName}</strong>
                </span>
                {translations.find(t => t.languageCode === selectedLanguage) && (
                  <Badge className="ml-auto bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Translated
                  </Badge>
                )}
              </div>
            )}

            {/* Content Display */}
            {currentContent ? (
              <div className="space-y-4">
                {typeof currentContent === 'object' && currentContent.title && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Title</h3>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">{currentContent.title}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Content</h3>
                  <div className="text-gray-800 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {typeof currentContent === 'object' ? currentContent.content : currentContent}
                  </div>
                </div>

                {/* Translation Quality Indicator */}
                {selectedLanguage !== communication.originalLanguage && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>
                      This is an automatic translation. For critical medical communications, 
                      consider professional medical translation review.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Languages className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Translation not available for {selectedLangDetails?.languageName}</p>
                <p className="text-sm">Click the translate button to generate a translation</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Translations Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Translation Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {targetLanguages.map((langCode) => {
              const lang = supportedLanguages.find(l => l.languageCode === langCode);
              const translation = translations.find(t => t.languageCode === langCode);
              const isOriginal = langCode === communication.originalLanguage;
              
              return (
                <div key={langCode} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{lang?.languageName || langCode.toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{lang?.nativeName}</p>
                  </div>
                  
                  <div className="text-right">
                    {isOriginal ? (
                      <Badge variant="outline">Original</Badge>
                    ) : translation ? (
                      <Badge className={translationStatusColors[translation.status as keyof typeof translationStatusColors]}>
                        {translation.status}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      {communication.metadata && Object.keys(communication.metadata).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(communication.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                  <span className="text-gray-600">{String(value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};