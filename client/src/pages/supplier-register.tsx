import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Building2, Mail, Phone, Globe, MapPin, FileText, Calendar, Users, DollarSign, Award, Package } from 'lucide-react';
import { insertMedicalSupplierSchema } from '@shared/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const supplierFormSchema = insertMedicalSupplierSchema.extend({
  productCategories: z.array(z.string()).min(1, 'At least one product category is required'),
  certifications: z.array(z.string()).min(1, 'At least one certification is required')
});

type SupplierFormData = z.infer<typeof supplierFormSchema>;

const productCategoryOptions = [
  'Medical Devices',
  'Surgical Instruments',
  'Laboratory Equipment',
  'Diagnostic Tools',
  'Patient Monitoring Systems',
  'Imaging Equipment',
  'Rehabilitation Equipment',
  'Emergency Medical Equipment',
  'Pharmaceutical Supplies',
  'Hospital Furniture',
  'Infection Control Products',
  'Disposable Medical Supplies'
];

const certificationOptions = [
  'ISO 13485',
  'FDA 510(k)',
  'CE Mark',
  'ISO 9001',
  'FDA GMP',
  'MDR Compliance',
  'HIPAA Compliance',
  'Joint Commission',
  'CLIA Certification',
  'OSHA Compliance'
];

export default function SupplierRegister() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      productCategories: [],
      certifications: [],
      termsAccepted: false,
      marketingConsent: false
    }
  });

  const handleCategoryToggle = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(updated);
    setValue('productCategories', updated);
  };

  const handleCertificationToggle = (certification: string) => {
    const updated = selectedCertifications.includes(certification)
      ? selectedCertifications.filter(c => c !== certification)
      : [...selectedCertifications, certification];
    
    setSelectedCertifications(updated);
    setValue('certifications', updated);
  };

  const onSubmit = async (data: SupplierFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/public/suppliers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      setRegistrationComplete(true);
      toast({
        title: 'Registration Submitted Successfully',
        description: 'Your supplier registration has been submitted for review. You will be notified when approved.',
        variant: 'default'
      });

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Registration Submitted</CardTitle>
            <CardDescription className="text-lg">
              Thank you for your interest in joining NaviMED's medical supplier network
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your registration has been submitted and is under review. Our team will evaluate your application and notify you via email once approved.
            </p>
            <p className="text-sm text-gray-500">
              Typically, the review process takes 2-5 business days.
            </p>
            <div className="mt-6">
              <Button onClick={() => window.location.href = '/'} variant="outline">
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Supplier Registration</h1>
          <p className="text-lg text-gray-600">Join NaviMED's network of trusted medical device suppliers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Supplier Registration Form
            </CardTitle>
            <CardDescription>
              Complete this form to apply as a medical device supplier on our platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Company Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      {...register('companyName')}
                      placeholder="Your Company Name"
                      className={errors.companyName ? 'border-red-500' : ''}
                    />
                    {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Input
                      id="businessType"
                      {...register('businessType')}
                      placeholder="e.g. Medical Device Manufacturing"
                      className={errors.businessType ? 'border-red-500' : ''}
                    />
                    {errors.businessType && <p className="text-red-500 text-sm mt-1">{errors.businessType.message}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessDescription">Business Description *</Label>
                  <Textarea
                    id="businessDescription"
                    {...register('businessDescription')}
                    placeholder="Describe your company, products, and services"
                    rows={3}
                    className={errors.businessDescription ? 'border-red-500' : ''}
                  />
                  {errors.businessDescription && <p className="text-red-500 text-sm mt-1">{errors.businessDescription.message}</p>}
                </div>

                <div>
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="websiteUrl"
                      {...register('websiteUrl')}
                      placeholder="https://www.yourcompany.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
                
                <div>
                  <Label htmlFor="contactPersonName">Contact Person Name *</Label>
                  <Input
                    id="contactPersonName"
                    {...register('contactPersonName')}
                    placeholder="Primary contact person"
                    className={errors.contactPersonName ? 'border-red-500' : ''}
                  />
                  {errors.contactPersonName && <p className="text-red-500 text-sm mt-1">{errors.contactPersonName.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="contactEmail"
                        type="email"
                        {...register('contactEmail')}
                        placeholder="contact@company.com"
                        className={`pl-10 ${errors.contactEmail ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="contactPhone">Contact Phone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="contactPhone"
                        {...register('contactPhone')}
                        placeholder="+1-555-123-4567"
                        className={`pl-10 ${errors.contactPhone ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone.message}</p>}
                  </div>
                </div>
              </div>

              {/* Business Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Address</h3>
                
                <div>
                  <Label htmlFor="businessAddress">Street Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="businessAddress"
                      {...register('businessAddress')}
                      placeholder="123 Business Street"
                      className={`pl-10 ${errors.businessAddress ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.businessAddress && <p className="text-red-500 text-sm mt-1">{errors.businessAddress.message}</p>}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...register('city')}
                      placeholder="City"
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      {...register('state')}
                      placeholder="State"
                      className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      {...register('zipCode')}
                      placeholder="12345"
                      className={errors.zipCode ? 'border-red-500' : ''}
                    />
                    {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      {...register('country')}
                      placeholder="USA"
                      className={errors.country ? 'border-red-500' : ''}
                    />
                    {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="yearsInBusiness">Years in Business *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="yearsInBusiness"
                        {...register('yearsInBusiness')}
                        placeholder="15"
                        className={`pl-10 ${errors.yearsInBusiness ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.yearsInBusiness && <p className="text-red-500 text-sm mt-1">{errors.yearsInBusiness.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="numberOfEmployees">Number of Employees *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="numberOfEmployees"
                        {...register('numberOfEmployees')}
                        placeholder="250"
                        className={`pl-10 ${errors.numberOfEmployees ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.numberOfEmployees && <p className="text-red-500 text-sm mt-1">{errors.numberOfEmployees.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="annualRevenue">Annual Revenue *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="annualRevenue"
                        {...register('annualRevenue')}
                        placeholder="$10-50 million"
                        className={`pl-10 ${errors.annualRevenue ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.annualRevenue && <p className="text-red-500 text-sm mt-1">{errors.annualRevenue.message}</p>}
                  </div>
                </div>
              </div>

              {/* Product Categories */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Product Categories *
                </h3>
                <p className="text-sm text-gray-600">Select all categories that apply to your products</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {productCategoryOptions.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
                
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCategories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.productCategories && <p className="text-red-500 text-sm mt-1">{errors.productCategories.message}</p>}
              </div>

              {/* Certifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certifications & Compliance *
                </h3>
                <p className="text-sm text-gray-600">Select all certifications your company holds</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {certificationOptions.map((certification) => (
                    <div key={certification} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cert-${certification}`}
                        checked={selectedCertifications.includes(certification)}
                        onCheckedChange={() => handleCertificationToggle(certification)}
                      />
                      <Label
                        htmlFor={`cert-${certification}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {certification}
                      </Label>
                    </div>
                  ))}
                </div>
                
                {selectedCertifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCertifications.map((certification) => (
                      <Badge key={certification} variant="secondary" className="bg-green-100 text-green-800">
                        {certification}
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.certifications && <p className="text-red-500 text-sm mt-1">{errors.certifications.message}</p>}
              </div>

              {/* Terms and Agreements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Terms & Agreements</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="termsAccepted"
                      {...register('termsAccepted')}
                      className={errors.termsAccepted ? 'border-red-500' : ''}
                    />
                    <Label htmlFor="termsAccepted" className="text-sm leading-relaxed cursor-pointer">
                      I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> *
                    </Label>
                  </div>
                  {errors.termsAccepted && <p className="text-red-500 text-sm ml-6">{errors.termsAccepted.message}</p>}

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="marketingConsent"
                      {...register('marketingConsent')}
                    />
                    <Label htmlFor="marketingConsent" className="text-sm leading-relaxed cursor-pointer">
                      I consent to receive marketing communications about NaviMED services and updates
                    </Label>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting Registration...' : 'Submit Registration'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}