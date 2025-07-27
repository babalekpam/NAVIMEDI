import React from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/contexts/translation-context';

interface PatientRegistrationDialogProps {
  form: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export default function PatientRegistrationDialog({ form, onSubmit, isLoading }: PatientRegistrationDialogProps) {
  const { t } = useTranslation();

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle>{t('register-new-patient')}</DialogTitle>
        <DialogDescription>
          {t('enter-patient-information-below')}
        </DialogDescription>
      </DialogHeader>
      
      <ScrollArea className="max-h-[70vh] pr-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('personal-information')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('first-name')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('enter-first-name')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('last-name')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('enter-last-name')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('date-of-birth')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('gender')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('select-gender')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">{t('male')}</SelectItem>
                          <SelectItem value="female">{t('female')}</SelectItem>
                          <SelectItem value="other">{t('other')}</SelectItem>
                          <SelectItem value="prefer-not-to-say">{t('prefer-not-to-say')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phone-number')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('enter-phone-number')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('email')} ({t('optional')})</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder={t('enter-email')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('address-information')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('street-address')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t('enter-street-address')} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('city')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('enter-city')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('state')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('enter-state')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('zip-code')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('enter-zip-code')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('emergency-contact')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="emergencyContact.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contact-name')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('enter-contact-name')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyContact.relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('relationship')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('spouse-parent-child')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyContact.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contact-phone')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('enter-contact-phone')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Insurance Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('insurance-information')} ({t('optional')})</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="insuranceInfo.provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('insurance-provider')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('enter-insurance-provider')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="insuranceInfo.policyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('policy-number')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('enter-policy-number')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="insuranceInfo.groupNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('group-number')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('enter-group-number')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('register-patient')}
              </Button>
            </div>
          </form>
        </Form>
      </ScrollArea>
    </DialogContent>
  );
}