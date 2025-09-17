/**
 * ENHANCED MUTATIONS WITH AUTOMATIC CACHE INVALIDATION
 * 
 * This module provides React Query mutation hooks that automatically
 * invalidate the appropriate dashboard caches when operations complete,
 * ensuring real-time updates across all relevant dashboards.
 */

import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import { dashboardInvalidation, invalidateForOperation, invalidateDashboard } from "./dashboard-invalidation";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/hooks/use-toast";

// ================================
// APPOINTMENT MUTATIONS
// ================================

/**
 * Enhanced appointment creation mutation with real-time dashboard updates
 */
export function useCreateAppointmentMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (appointmentData: any) => apiRequest('/api/appointments', {
      method: 'POST',
      body: appointmentData
    }),
    onSuccess: async (data, variables) => {
      console.log('🔄 Appointment created - triggering dashboard updates...');
      
      // Invalidate appointment-related dashboards immediately
      await invalidateForOperation.appointmentCreated(tenant?.id || '');
      
      // Also invalidate tenant-wide analytics
      if (tenant?.id) {
        await queryClient.invalidateQueries({ 
          queryKey: ['/api/analytics/tenant', tenant.id] 
        });
      }
      
      // Show success notification
      toast({
        title: "Appointment Created",
        description: "The appointment has been scheduled successfully. Dashboard data is updating...",
      });
      
      console.log('✅ Dashboard cache invalidation completed for appointment creation');
    },
    onError: (error) => {
      console.error('❌ Failed to create appointment:', error);
      toast({
        title: "Appointment Creation Failed",
        description: "Failed to create the appointment. Please try again.",
        variant: "destructive"
      });
    }
  });
}

/**
 * Enhanced appointment status update mutation with real-time updates
 */
export function useUpdateAppointmentMutation() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) => 
      apiRequest(`/api/appointments/${id}`, {
        method: 'PATCH',
        body: { status, notes }
      }),
    onSuccess: async (data, variables) => {
      console.log(`🔄 Appointment ${variables.id} updated to ${variables.status} - triggering updates...`);
      
      // Invalidate appointment-related dashboards
      await invalidateForOperation.appointmentStatusChanged(tenant?.id || '');
      
      toast({
        title: "Appointment Updated",
        description: `Appointment status changed to ${variables.status}. Dashboards are updating...`,
      });
      
      console.log('✅ Dashboard updates completed for appointment status change');
    },
    onError: (error) => {
      console.error('❌ Failed to update appointment:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update appointment status. Please try again.",
        variant: "destructive"
      });
    }
  });
}

// ================================
// PRESCRIPTION MUTATIONS
// ================================

/**
 * Enhanced prescription creation mutation with pharmacy/admin dashboard updates
 */
export function useCreatePrescriptionMutation() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (prescriptionData: any) => apiRequest('/api/prescriptions', {
      method: 'POST',
      body: prescriptionData
    }),
    onSuccess: async (data, variables) => {
      console.log('🔄 Prescription created - triggering pharmacy and admin dashboard updates...');
      
      // Invalidate prescription-related dashboards  
      await invalidateForOperation.prescriptionCreated(tenant?.id || '');
      
      // If routed to a specific pharmacy, also invalidate that pharmacy's cache
      if (variables.pharmacyTenantId) {
        await invalidateDashboard.pharmacy(variables.pharmacyTenantId);
      }
      
      toast({
        title: "Prescription Created",
        description: "The prescription has been created successfully. Dashboards are updating...",
      });
      
      console.log('✅ Prescription creation dashboard updates completed');
    },
    onError: (error) => {
      console.error('❌ Failed to create prescription:', error);
      toast({
        title: "Prescription Creation Failed",
        description: "Failed to create the prescription. Please try again.",
        variant: "destructive"
      });
    }
  });
}

/**
 * Enhanced prescription status update mutation for pharmacy operations
 */
export function useUpdatePrescriptionStatusMutation() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiRequest(`/api/prescriptions/${id}/status`, {
        method: 'PATCH',
        body: { status }
      }),
    onSuccess: async (data, variables) => {
      console.log(`🔄 Prescription ${variables.id} status updated to ${variables.status}...`);
      
      // Invalidate pharmacy and admin dashboards
      await invalidateForOperation.prescriptionStatusChanged(tenant?.id || '');
      
      // Get prescription details to invalidate originating hospital dashboard too
      const prescription = data;
      if (prescription?.tenantId && prescription.tenantId !== tenant?.id) {
        await invalidateDashboard.admin(prescription.tenantId);
      }
      
      toast({
        title: "Prescription Status Updated", 
        description: `Prescription marked as ${variables.status}. Dashboards are updating...`,
      });
      
      console.log('✅ Prescription status update dashboard refreshes completed');
    },
    onError: (error) => {
      console.error('❌ Failed to update prescription status:', error);
      toast({
        title: "Status Update Failed",
        description: "Failed to update prescription status. Please try again.",
        variant: "destructive"
      });
    }
  });
}

/**
 * Enhanced prescription routing mutation for hospital-to-pharmacy workflow
 */
export function useRoutePrescriptionMutation() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ prescriptionId, pharmacyTenantId, routingNotes }: {
      prescriptionId: string;
      pharmacyTenantId: string; 
      routingNotes?: string;
    }) => apiRequest(`/api/prescriptions/${prescriptionId}/send-to-pharmacy`, {
      method: 'POST',
      body: { pharmacyTenantId, routingNotes }
    }),
    onSuccess: async (data, variables) => {
      console.log(`🔄 Prescription ${variables.prescriptionId} routed to pharmacy ${variables.pharmacyTenantId}...`);
      
      // Invalidate hospital admin dashboard (sending side)
      await invalidateDashboard.admin(tenant?.id || '');
      
      // Invalidate pharmacy dashboard (receiving side) 
      await invalidateDashboard.pharmacy(variables.pharmacyTenantId);
      
      // Invalidate prescription-related analytics
      await invalidateForOperation.prescriptionRouted(tenant?.id || '');
      
      toast({
        title: "Prescription Routed",
        description: "Prescription successfully sent to pharmacy. Dashboards are updating...",
      });
      
      console.log('✅ Prescription routing dashboard updates completed');
    },
    onError: (error) => {
      console.error('❌ Failed to route prescription:', error);
      toast({
        title: "Routing Failed",
        description: "Failed to send prescription to pharmacy. Please try again.",
        variant: "destructive"
      });
    }
  });
}

// ================================
// LAB ORDER MUTATIONS
// ================================

/**
 * Enhanced lab order creation mutation with laboratory dashboard updates
 */
export function useCreateLabOrderMutation() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (labOrderData: any) => apiRequest('/api/lab-orders', {
      method: 'POST',
      body: labOrderData
    }),
    onSuccess: async (data, variables) => {
      console.log('🔄 Lab order created - triggering laboratory dashboard updates...');
      
      // Invalidate lab-related dashboards
      await invalidateForOperation.labOrderCreated(tenant?.id || '');
      
      // If order is for external lab, invalidate that lab's dashboard too
      if (variables.laboratoryTenantId && variables.laboratoryTenantId !== tenant?.id) {
        await invalidateDashboard.laboratory(variables.laboratoryTenantId);
      }
      
      toast({
        title: "Lab Order Created", 
        description: "The lab order has been placed successfully. Dashboards are updating...",
      });
      
      console.log('✅ Lab order creation dashboard updates completed');
    },
    onError: (error) => {
      console.error('❌ Failed to create lab order:', error);
      toast({
        title: "Lab Order Failed",
        description: "Failed to create the lab order. Please try again.",
        variant: "destructive"
      });
    }
  });
}

/**
 * Enhanced lab result posting mutation with immediate dashboard updates
 */
export function usePostLabResultMutation() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (labResultData: any) => apiRequest('/api/lab-results', {
      method: 'POST',
      body: labResultData
    }),
    onSuccess: async (data, variables) => {
      console.log('🔄 Lab result posted - triggering dashboard updates...');
      
      // Invalidate laboratory dashboard
      await invalidateForOperation.labResultPosted(tenant?.id || '');
      
      // If result is for patient from another hospital, invalidate that hospital's dashboard
      const labOrder = variables.labOrder;
      if (labOrder?.tenantId && labOrder.tenantId !== tenant?.id) {
        await invalidateDashboard.admin(labOrder.tenantId);
      }
      
      toast({
        title: "Lab Result Posted",
        description: "The lab result has been posted successfully. Dashboards are updating...",
      });
      
      console.log('✅ Lab result posting dashboard updates completed');
    },
    onError: (error) => {
      console.error('❌ Failed to post lab result:', error);
      toast({
        title: "Result Posting Failed", 
        description: "Failed to post the lab result. Please try again.",
        variant: "destructive"
      });
    }
  });
}

// ================================
// PATIENT MUTATIONS
// ================================

/**
 * Enhanced patient registration mutation with receptionist/admin dashboard updates
 */
export function useCreatePatientMutation() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (patientData: any) => apiRequest('/api/patients', {
      method: 'POST',
      body: patientData
    }),
    onSuccess: async (data, variables) => {
      console.log('🔄 Patient registered - triggering dashboard updates...');
      
      // Invalidate patient-related dashboards
      await invalidateForOperation.patientCreated(tenant?.id || '');
      
      toast({
        title: "Patient Registered",
        description: "The patient has been registered successfully. Dashboards are updating...",
      });
      
      console.log('✅ Patient registration dashboard updates completed');
    },
    onError: (error) => {
      console.error('❌ Failed to register patient:', error);
      toast({
        title: "Patient Registration Failed",
        description: "Failed to register the patient. Please try again.",
        variant: "destructive"
      });
    }
  });
}

/**
 * Enhanced patient update mutation with dashboard synchronization
 */
export function useUpdatePatientMutation() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, ...patientData }: { id: string; [key: string]: any }) => 
      apiRequest(`/api/patients/${id}`, {
        method: 'PATCH',
        body: patientData
      }),
    onSuccess: async (data, variables) => {
      console.log(`🔄 Patient ${variables.id} updated - triggering dashboard updates...`);
      
      // Invalidate patient-related dashboards
      await invalidateForOperation.patientUpdated(tenant?.id || '');
      
      toast({
        title: "Patient Updated",
        description: "The patient information has been updated. Dashboards are refreshing...",
      });
      
      console.log('✅ Patient update dashboard synchronization completed');
    },
    onError: (error) => {
      console.error('❌ Failed to update patient:', error);
      toast({
        title: "Patient Update Failed",
        description: "Failed to update patient information. Please try again.",
        variant: "destructive"
      });
    }
  });
}

// ================================
// BILLING MUTATIONS
// ================================

/**
 * Enhanced billing creation mutation with financial dashboard updates
 */
export function useCreateBillingMutation() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (billingData: any) => apiRequest('/api/laboratory/billing', {
      method: 'POST',
      body: billingData
    }),
    onSuccess: async (data, variables) => {
      console.log('🔄 Bill created - triggering financial dashboard updates...');
      
      // Invalidate billing-related dashboards
      await invalidateForOperation.billingCreated(tenant?.id || '');
      
      toast({
        title: "Bill Created",
        description: "The bill has been generated successfully. Dashboards are updating...",
      });
      
      console.log('✅ Billing creation dashboard updates completed');
    },
    onError: (error) => {
      console.error('❌ Failed to create bill:', error);
      toast({
        title: "Billing Creation Failed",
        description: "Failed to create the bill. Please try again.",
        variant: "destructive"
      });
    }
  });
}

/**
 * Enhanced billing update mutation with admin dashboard synchronization
 */
export function useUpdateBillingMutation() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ billId, ...updateData }: { billId: string; [key: string]: any }) => 
      apiRequest(`/api/laboratory/billing/${billId}`, {
        method: 'PATCH',
        body: updateData
      }),
    onSuccess: async (data, variables) => {
      console.log(`🔄 Bill ${variables.billId} updated - triggering dashboard updates...`);
      
      // Invalidate billing-related dashboards
      await invalidateForOperation.billingUpdated(tenant?.id || '');
      
      toast({
        title: "Bill Updated",
        description: "The bill has been updated successfully. Dashboards are refreshing...",
      });
      
      console.log('✅ Billing update dashboard synchronization completed');
    },
    onError: (error) => {
      console.error('❌ Failed to update bill:', error);
      toast({
        title: "Billing Update Failed",
        description: "Failed to update the bill. Please try again.",
        variant: "destructive"
      });
    }
  });
}

// ================================
// GENERIC ENHANCED MUTATION HOOK
// ================================

/**
 * Generic enhanced mutation factory for custom operations
 */
export function createEnhancedMutation<TData = unknown, TError = Error, TVariables = void>(
  mutationConfig: {
    mutationFn: (variables: TVariables) => Promise<TData>;
    invalidationPattern: {
      operationType: 'appointment' | 'prescription' | 'labOrder' | 'patient' | 'billing';
      action: 'create' | 'update' | 'delete' | 'statusChange';
      getTenantId?: (variables: TVariables) => string;
      additionalInvalidations?: (data: TData, variables: TVariables) => Promise<void>;
    };
    successMessage?: string;
    errorMessage?: string;
  }
): UseMutationResult<TData, TError, TVariables> {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: mutationConfig.mutationFn,
    onSuccess: async (data: TData, variables: TVariables) => {
      const tenantId = mutationConfig.invalidationPattern.getTenantId?.(variables) || tenant?.id || '';
      
      console.log(`🔄 ${mutationConfig.invalidationPattern.operationType} ${mutationConfig.invalidationPattern.action} - triggering updates...`);
      
      // Perform main cache invalidation based on pattern
      await dashboardInvalidation.invalidateOperation(
        mutationConfig.invalidationPattern.operationType,
        mutationConfig.invalidationPattern.action,
        tenantId
      );
      
      // Perform any additional invalidations
      if (mutationConfig.invalidationPattern.additionalInvalidations) {
        await mutationConfig.invalidationPattern.additionalInvalidations(data, variables);
      }
      
      // Show success notification
      if (mutationConfig.successMessage) {
        toast({
          title: "Operation Successful",
          description: `${mutationConfig.successMessage} Dashboards are updating...`,
        });
      }
      
      console.log('✅ Dashboard invalidation completed for custom mutation');
    },
    onError: (error: TError) => {
      console.error(`❌ ${mutationConfig.invalidationPattern.operationType} ${mutationConfig.invalidationPattern.action} failed:`, error);
      
      if (mutationConfig.errorMessage) {
        toast({
          title: "Operation Failed",
          description: mutationConfig.errorMessage,
          variant: "destructive"
        });
      }
    }
  });
}