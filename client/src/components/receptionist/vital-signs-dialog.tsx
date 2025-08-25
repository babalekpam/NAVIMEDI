import React from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Heart, Thermometer, Activity, Weight, Ruler } from 'lucide-react';
import { useTranslation } from '@/contexts/translation-context';

interface VitalSignsDialogProps {
  form: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  patient?: any;
}

export default function VitalSignsDialog({ form, onSubmit, isLoading, patient }: VitalSignsDialogProps) {
  const { t } = useTranslation();

  return (
    <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
      <DialogHeader className="flex-shrink-0">
        <DialogTitle>{t('record-vital-signs')}</DialogTitle>
        <DialogDescription>
          {patient && `${t('patient')}: ${patient.firstName} ${patient.lastName}`}
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Blood Pressure */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-red-500" />
                  {t('blood-pressure')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField
                  control={form.control}
                  name="systolicBp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('systolic')} * (mmHg)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="120"
                          onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="diastolicBp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('diastolic')} * (mmHg)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="80"
                          onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Heart Rate & Oxygen */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-blue-500" />
                  {t('heart-oxygen')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField
                  control={form.control}
                  name="heartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('heart-rate')} * (bpm)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="72"
                          onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="oxygenSaturation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('oxygen-saturation')} * (%)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="98"
                          onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Temperature & Breathing */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Thermometer className="h-4 w-4 mr-2 text-orange-500" />
                  {t('temperature-breathing')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex space-x-2">
                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>{t('temperature')}</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.1"
                            placeholder="98.6"
                            onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="temperatureUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('unit')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-16">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="F">°F</SelectItem>
                            <SelectItem value="C">°C</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="respiratoryRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('respiratory-rate')} * (per min)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="16"
                          onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Weight */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Weight className="h-4 w-4 mr-2 text-green-500" />
                  {t('weight')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex space-x-2">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>{t('weight')} *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.1"
                            placeholder="150"
                            onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weightUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('unit')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lbs">lbs</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Height */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Ruler className="h-4 w-4 mr-2 text-purple-500" />
                  {t('height')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex space-x-2">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>{t('height')} *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.1"
                            placeholder="68"
                            onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="heightUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('unit')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="inches">in</SelectItem>
                            <SelectItem value="cm">cm</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Blood Type & Pain Assessment */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-red-600" />
                  Blood Type & Pain Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField
                  control={form.control}
                  name="bloodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Type/Group *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="A+">A+ (A Positive)</SelectItem>
                          <SelectItem value="A-">A- (A Negative)</SelectItem>
                          <SelectItem value="B+">B+ (B Positive)</SelectItem>
                          <SelectItem value="B-">B- (B Negative)</SelectItem>
                          <SelectItem value="AB+">AB+ (AB Positive)</SelectItem>
                          <SelectItem value="AB-">AB- (AB Negative)</SelectItem>
                          <SelectItem value="O+">O+ (O Positive)</SelectItem>
                          <SelectItem value="O-">O- (O Negative)</SelectItem>
                          <SelectItem value="Unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="painLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pain Level * (0-10 Scale)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pain level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">0 - No Pain</SelectItem>
                          <SelectItem value="1">1 - Minimal</SelectItem>
                          <SelectItem value="2">2 - Mild</SelectItem>
                          <SelectItem value="3">3 - Mild</SelectItem>
                          <SelectItem value="4">4 - Moderate</SelectItem>
                          <SelectItem value="5">5 - Moderate</SelectItem>
                          <SelectItem value="6">6 - Moderate</SelectItem>
                          <SelectItem value="7">7 - Severe</SelectItem>
                          <SelectItem value="8">8 - Severe</SelectItem>
                          <SelectItem value="9">9 - Very Severe</SelectItem>
                          <SelectItem value="10">10 - Worst Possible</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Additional Clinical Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-yellow-500" />
                  Additional Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField
                  control={form.control}
                  name="glucoseLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Glucose Level (mg/dL)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="100"
                          onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Known Allergies</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="List any known allergies (medications, food, environmental)"
                          className="min-h-[60px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentMedications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Medications</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="List all current medications and dosages"
                          className="min-h-[60px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('notes')} ({t('optional')})</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder={t('enter-any-additional-notes')}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2 flex-shrink-0 pt-4 border-t">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('save-vital-signs')}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}