import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertTrainingEnrollmentSchema, type InsertTrainingEnrollment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BookOpen, GraduationCap, Loader2 } from "lucide-react";
import { z } from "zod";

interface TrainingEnrollmentFormProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function TrainingEnrollmentForm({ trigger, onSuccess }: TrainingEnrollmentFormProps) {
  const [open, setOpen] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Define form schema with enhanced validation
  const formSchema = insertTrainingEnrollmentSchema.extend({
    email: z.string().email("Please enter a valid email address"),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    phone: z.string().optional(),
    organization: z.string().optional(),
    jobRole: z.string().optional(),
  });

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      organization: "",
      jobRole: "",
      trainingLevel: "foundation",
      status: "enrolled",
    },
  });

  // Fetch CSRF token when dialog opens
  useEffect(() => {
    if (open && !csrfToken) {
      fetch('/api/csrf-token')
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch CSRF token: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('🔐 CSRF token fetched:', data.csrfToken ? 'Yes' : 'No');
          setCsrfToken(data.csrfToken);
        })
        .catch(err => {
          console.error('❌ Failed to fetch CSRF token:', err);
          toast({
            title: "Security Setup Failed",
            description: "Please close and reopen this form to try again.",
            variant: "destructive",
          });
        });
    }
  }, [open, csrfToken, toast]);

  // Mutation for enrolling in training
  const enrollMutation = useMutation({
    mutationFn: async (data: InsertTrainingEnrollment) => {
      if (!csrfToken) {
        throw new Error("CSRF token not available. Please try again.");
      }
      
      return apiRequest("/api/training/enroll", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });
    },
    onSuccess: (data) => {
      console.log("✅ Training enrollment successful:", data);
      
      // Show success toast
      toast({
        title: "Enrollment Successful! 🎓",
        description: "You have been successfully enrolled in the training program. We'll contact you soon with program details.",
        duration: 5000,
      });

      // Reset form and close dialog
      form.reset();
      setOpen(false);

      // Invalidate enrollments cache
      queryClient.invalidateQueries({ queryKey: ["/api/training/enrollments"] });

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: async (error: any) => {
      console.error("❌ Training enrollment failed:", error);
      
      // Check if it's a CSRF error (403)
      if (error.status === 403 || error.message?.includes('CSRF')) {
        console.log('🔄 CSRF error detected, refetching token and retrying...');
        
        try {
          // Refetch CSRF token
          const res = await fetch('/api/csrf-token');
          if (!res.ok) {
            throw new Error('Failed to refetch CSRF token');
          }
          const data = await res.json();
          setCsrfToken(data.csrfToken);
          
          toast({
            title: "Security Token Refreshed",
            description: "Please submit the form again.",
          });
        } catch (refetchError) {
          console.error('❌ Failed to refetch CSRF token:', refetchError);
          toast({
            title: "Security Error",
            description: "Please close and reopen this form to try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Enrollment Failed",
          description: error.message || "Failed to enroll in training program. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("📚 Submitting training enrollment:", data);
    enrollMutation.mutate(data as InsertTrainingEnrollment);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    console.log("🔍 Form submit attempted");
    console.log("🔍 Form errors:", form.formState.errors);
    console.log("🔍 Form values:", form.getValues());
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg" className="gap-2" data-testid="button-enroll-training">
            <GraduationCap className="w-5 h-5" />
            Enroll in Training Program
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="w-6 h-6 text-primary" />
            Training Program Enrollment
          </DialogTitle>
          <DialogDescription>
            Join our comprehensive training program to master the NaviMED healthcare platform.
            Fill out the form below to get started.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your full name" 
                      {...field} 
                      data-testid="input-full-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="your.email@example.com" 
                      {...field} 
                      data-testid="input-email"
                    />
                  </FormControl>
                  <FormDescription>
                    We'll send program details to this email
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel"
                      placeholder="+1 (555) 123-4567" 
                      {...field} 
                      data-testid="input-phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Organization */}
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization / Healthcare Facility</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your organization name" 
                      {...field} 
                      data-testid="input-organization"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job Role */}
            <FormField
              control={form.control}
              name="jobRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Role / Position</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Physician, Nurse, Administrator" 
                      {...field} 
                      data-testid="input-job-role"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Training Level */}
            <FormField
              control={form.control}
              name="trainingLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Training Level <span className="text-red-500">*</span></FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    data-testid="select-training-level"
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-training-level-trigger">
                        <SelectValue placeholder="Select training level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="foundation" data-testid="option-foundation">
                        Foundation Level (4-6 hours) - Essential skills for all staff
                      </SelectItem>
                      <SelectItem value="intermediate" data-testid="option-intermediate">
                        Intermediate Level (6-8 hours) - Advanced daily operations
                      </SelectItem>
                      <SelectItem value="advanced" data-testid="option-advanced">
                        Advanced Level (8-10 hours) - Specialized workflows
                      </SelectItem>
                      <SelectItem value="all_levels" data-testid="option-all-levels">
                        All Levels (20-40 hours) - Complete comprehensive program
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the training level that matches your experience and needs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={enrollMutation.isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={enrollMutation.isPending || !csrfToken}
                className="gap-2"
                data-testid="button-submit-enrollment"
              >
                {enrollMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4" />
                    Enroll Now
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
