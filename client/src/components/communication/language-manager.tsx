import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SupportedLanguage } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages, Plus, Globe, Star, Settings, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const languageFormSchema = z.object({
  languageCode: z.string().min(2, "Language code must be at least 2 characters"),
  languageName: z.string().min(1, "Language name is required"),
  nativeName: z.string().min(1, "Native name is required"),
  isPrimary: z.boolean().default(false),
});

interface LanguageManagerProps {
  supportedLanguages: SupportedLanguage[];
}

// Common world languages for easy selection
const commonLanguages = [
  { code: "en", name: "English", native: "English" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "fr", name: "French", native: "Français" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "it", name: "Italian", native: "Italiano" },
  { code: "pt", name: "Portuguese", native: "Português" },
  { code: "ru", name: "Russian", native: "Русский" },
  { code: "ja", name: "Japanese", native: "日本語" },
  { code: "ko", name: "Korean", native: "한국어" },
  { code: "zh-cn", name: "Chinese (Simplified)", native: "中文(简体)" },
  { code: "zh-tw", name: "Chinese (Traditional)", native: "中文(繁體)" },
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "ur", name: "Urdu", native: "اردو" },
  { code: "fa", name: "Persian", native: "فارسی" },
  { code: "tr", name: "Turkish", native: "Türkçe" },
  { code: "nl", name: "Dutch", native: "Nederlands" },
  { code: "sv", name: "Swedish", native: "Svenska" },
  { code: "da", name: "Danish", native: "Dansk" },
  { code: "no", name: "Norwegian", native: "Norsk" },
  { code: "fi", name: "Finnish", native: "Suomi" },
  { code: "pl", name: "Polish", native: "Polski" },
  { code: "cs", name: "Czech", native: "Čeština" },
  { code: "hu", name: "Hungarian", native: "Magyar" },
  { code: "ro", name: "Romanian", native: "Română" },
  { code: "bg", name: "Bulgarian", native: "Български" },
  { code: "hr", name: "Croatian", native: "Hrvatski" },
  { code: "sr", name: "Serbian", native: "Српски" },
  { code: "sk", name: "Slovak", native: "Slovenčina" },
  { code: "sl", name: "Slovenian", native: "Slovenščina" },
  { code: "et", name: "Estonian", native: "Eesti" },
  { code: "lv", name: "Latvian", native: "Latviešu" },
  { code: "lt", name: "Lithuanian", native: "Lietuvių" },
  { code: "mt", name: "Maltese", native: "Malti" },
  { code: "ga", name: "Irish", native: "Gaeilge" },
  { code: "cy", name: "Welsh", native: "Cymraeg" },
  { code: "eu", name: "Basque", native: "Euskera" },
  { code: "ca", name: "Catalan", native: "Català" },
  { code: "gl", name: "Galician", native: "Galego" },
];

export const LanguageManager = ({ supportedLanguages }: LanguageManagerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(languageFormSchema),
    defaultValues: {
      languageCode: "",
      languageName: "",
      nativeName: "",
      isPrimary: false,
    }
  });

  const addLanguageMutation = useMutation({
    mutationFn: async (data: any) => {
      const { apiRequest } = await import("@/lib/queryClient");
      const response = await apiRequest("POST", "/api/supported-languages", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supported-languages"] });
      setIsAddDialogOpen(false);
      form.reset();
      setSelectedPreset("");
    }
  });

  const updateLanguageMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { apiRequest } = await import("@/lib/queryClient");
      const response = await apiRequest("PATCH", `/api/supported-languages/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supported-languages"] });
    }
  });

  const handlePresetSelection = (preset: string) => {
    const language = commonLanguages.find(l => l.code === preset);
    if (language) {
      form.setValue("languageCode", language.code);
      form.setValue("languageName", language.name);
      form.setValue("nativeName", language.native);
    }
  };

  const handleSubmit = (data: any) => {
    addLanguageMutation.mutate(data);
  };

  const toggleLanguageStatus = (language: SupportedLanguage) => {
    updateLanguageMutation.mutate({
      id: language.id,
      updates: { isActive: !language.isActive }
    });
  };

  const togglePrimaryStatus = (language: SupportedLanguage) => {
    updateLanguageMutation.mutate({
      id: language.id,
      updates: { isPrimary: !language.isPrimary }
    });
  };

  const availablePresets = commonLanguages.filter(preset => 
    !supportedLanguages?.some(lang => lang.languageCode === preset.code)
  );

  const activeLanguages = supportedLanguages?.filter(l => l.isActive) || [];
  const inactiveLanguages = supportedLanguages?.filter(l => !l.isActive) || [];
  const primaryLanguage = supportedLanguages?.find(l => l.isPrimary);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Language Management</h2>
          <p className="text-gray-600">Configure supported languages for multilingual communications</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Language
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Supported Language</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {/* Language Preset Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Select (Optional)</label>
                  <Select 
                    value={selectedPreset} 
                    onValueChange={(value) => {
                      setSelectedPreset(value);
                      handlePresetSelection(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose from common languages" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {availablePresets.map((language) => (
                        <SelectItem key={language.code} value={language.code}>
                          {language.name} - {language.native}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <FormField
                  control={form.control}
                  name="languageCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., en, es, fr, zh-cn"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="languageName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language Name (English)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., English, Spanish, French"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nativeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Native Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., English, Español, Français"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPrimary"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Primary Language</FormLabel>
                        <div className="text-sm text-gray-500">
                          Set as the primary language for this organization
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addLanguageMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {addLanguageMutation.isPending ? "Adding..." : "Add Language"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Globe className="h-5 w-5 mr-2 text-blue-600" />
              Active Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{activeLanguages.length}</div>
            <p className="text-sm text-gray-600">Available for translation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-600" />
              Primary Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-yellow-600">
              {primaryLanguage ? primaryLanguage.languageName : "None set"}
            </div>
            <p className="text-sm text-gray-600">Default organization language</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Settings className="h-5 w-5 mr-2 text-gray-600" />
              Total Configured
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{supportedLanguages.length}</div>
            <p className="text-sm text-gray-600">Including inactive languages</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Languages className="h-5 w-5 mr-2" />
            Active Languages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeLanguages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No active languages configured</p>
              <p className="text-sm">Add your first language to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeLanguages.map((language) => (
                <div 
                  key={language.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Languages className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{language.languageName}</h3>
                        <Badge variant="outline">{language.languageCode.toUpperCase()}</Badge>
                        {language.isPrimary && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Primary
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{language.nativeName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Primary</span>
                      <Switch
                        checked={language.isPrimary}
                        onCheckedChange={() => togglePrimaryStatus(language)}
                        disabled={updateLanguageMutation.isPending}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Active</span>
                      <Switch
                        checked={language.isActive}
                        onCheckedChange={() => toggleLanguageStatus(language)}
                        disabled={updateLanguageMutation.isPending}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Languages */}
      {inactiveLanguages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Inactive Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveLanguages.map((language) => (
                <div 
                  key={language.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Languages className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-600">{language.languageName}</h3>
                        <Badge variant="secondary">{language.languageCode.toUpperCase()}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">{language.nativeName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleLanguageStatus(language)}
                      disabled={updateLanguageMutation.isPending}
                    >
                      Activate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Globe className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Language Configuration Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Set one language as primary for your organization's default communications</li>
                <li>• Use standard language codes (ISO 639-1 or ISO 639-2) for compatibility</li>
                <li>• Include regional variants when needed (e.g., zh-cn for Simplified Chinese)</li>
                <li>• Inactive languages are preserved but not available for new translations</li>
                <li>• Automatic translation quality may vary between language pairs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};