import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMedicalCommunicationSchema, Patient, SupportedLanguage } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Languages, MessageSquare, Send, AlertCircle } from "lucide-react";
import { z } from "zod";

// Schema for communication form
const communicationFormSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  type: z.enum(["medical_instruction", "prescription_note", "discharge_summary", "appointment_reminder", "lab_result", "general_message", "emergency_alert"]),
  priority: z.enum(["low", "normal", "high", "urgent", "emergency"]).default("normal"),
  originalLanguage: z.string().min(1, "Please select original language"),
  targetLanguages: z.array(z.string()).min(1, "Please select at least one target language"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  metadata: z.object({
    subject: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
});

interface CommunicationFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  patients: Patient[];
  supportedLanguages: SupportedLanguage[];
}

const communicationTypes = [
  { value: "medical_instruction", label: "Medical Instructions", icon: "📋" },
  { value: "prescription_note", label: "Prescription Note", icon: "💊" },
  { value: "discharge_summary", label: "Discharge Summary", icon: "🏥" },
  { value: "appointment_reminder", label: "Appointment Reminder", icon: "📅" },
  { value: "lab_result", label: "Lab Results", icon: "🧪" },
  { value: "general_message", label: "General Message", icon: "💬" },
  { value: "emergency_alert", label: "Emergency Alert", icon: "🚨" },
];

const priorities = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
  { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-800" },
  { value: "high", label: "High", color: "bg-yellow-100 text-yellow-800" },
  { value: "urgent", label: "Urgent", color: "bg-orange-100 text-orange-800" },
  { value: "emergency", label: "Emergency", color: "bg-red-100 text-red-800" },
];

export const CommunicationForm = ({ onSubmit, isLoading = false, patients, supportedLanguages }: CommunicationFormProps) => {
  const form = useForm({
    resolver: zodResolver(communicationFormSchema),
    defaultValues: {
      patientId: "",
      type: "general_message" as const,
      priority: "normal" as const,
      originalLanguage: "en",
      targetLanguages: ["en"],
      title: "",
      content: "",
      metadata: {
        subject: "",
        category: "",
        tags: [],
      },
    }
  });

  const watchedTargetLanguages = form.watch("targetLanguages");
  const watchedType = form.watch("type");
  const watchedPriority = form.watch("priority");

  const handleSubmit = (data: any) => {
    const communicationData = {
      ...data,
      originalContent: {
        title: data.title,
        content: data.content,
        metadata: data.metadata,
      },
    };
    
    onSubmit(communicationData);
  };

  const toggleTargetLanguage = (languageCode: string) => {
    const currentLanguages = form.getValues("targetLanguages");
    if (currentLanguages.includes(languageCode)) {
      if (currentLanguages.length > 1) {
        form.setValue("targetLanguages", currentLanguages.filter(l => l !== languageCode));
      }
    } else {
      form.setValue("targetLanguages", [...currentLanguages, languageCode]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} (MRN: {patient.mrn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Communication Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {communicationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <Badge className={priority.color}>
                          {priority.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="originalLanguage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Original Language</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {supportedLanguages.map((language) => (
                      <SelectItem key={language.languageCode} value={language.languageCode}>
                        <div className="flex items-center space-x-2">
                          <Languages className="h-4 w-4" />
                          <span>{language.languageName} ({language.nativeName})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title/Subject</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter communication title or subject"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter the communication content..."
                  rows={6}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Target Languages Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Languages className="h-5 w-5 mr-2" />
              Target Languages for Translation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {supportedLanguages.map((language) => (
                <div key={language.languageCode} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${language.languageCode}`}
                    checked={watchedTargetLanguages.includes(language.languageCode)}
                    onCheckedChange={() => toggleTargetLanguage(language.languageCode)}
                  />
                  <label
                    htmlFor={`lang-${language.languageCode}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {language.languageName}
                    <div className="text-xs text-gray-500">{language.nativeName}</div>
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-600">
                Selected: {watchedTargetLanguages.length} language(s)
              </p>
              {watchedTargetLanguages.length > 1 && (
                <p className="text-xs text-blue-600">
                  Automatic translation will be attempted for all selected languages
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Information (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="metadata.subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Category</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Post-operative care, Medication instructions"
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadata.category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="urgent_care">Urgent Care</SelectItem>
                      <SelectItem value="routine_follow_up">Routine Follow-up</SelectItem>
                      <SelectItem value="medication_management">Medication Management</SelectItem>
                      <SelectItem value="diagnostic_results">Diagnostic Results</SelectItem>
                      <SelectItem value="patient_education">Patient Education</SelectItem>
                      <SelectItem value="administrative">Administrative</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Priority Warning */}
        {(watchedPriority === "urgent" || watchedPriority === "emergency") && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">High Priority Communication</p>
                  <p className="text-sm">
                    This {watchedPriority} communication will be marked for immediate attention and may trigger additional notifications.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="h-4 w-4" />
                <span>Create Communication</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};