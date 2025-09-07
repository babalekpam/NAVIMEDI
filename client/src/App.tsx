import React, { Suspense, startTransition } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TenantProvider } from "@/contexts/tenant-context";
import { TranslationProvider } from "@/contexts/translation-context";
import { AuthProvider } from "@/contexts/auth-context";
import { useAuth } from "@/contexts/auth-context";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { TabsNavigation } from "@/components/layout/tabs-navigation";
import { ProtectedRoute } from "@/components/layout/protected-route";


// Critical pages loaded immediately (public pages users see first)
import LandingPage from "@/pages/landing-fixed";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import RegisterOrganization from "@/pages/register-organization";

// Loading component
const LoadingPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
    <div className="text-center">
      <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-lg font-medium text-gray-700">Loading...</p>
    </div>
  </div>
);

import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients";
import PatientMedicalRecords from "@/pages/patient-medical-records";
import Appointments from "@/pages/appointments";
import Prescriptions from "@/pages/prescriptions";
import LabOrders from "@/pages/lab-orders";
import Billing from "@/pages/billing";
import TenantManagement from "@/pages/tenant-management";
import SuperAdminDashboard from "@/pages/super-admin-dashboard";
import SuperAdminClientManagement from "@/pages/super-admin-client-management";
import AuditLogs from "@/pages/audit-logs";
import UserRoles from "@/pages/user-roles";
import Reports from "@/pages/reports";
import MedicalCommunications from "@/pages/medical-communications";
const LaboratoryRegistration = React.lazy(() => import("@/pages/laboratory-registration"));
const LabSampleManagement = React.lazy(() => import("@/pages/lab-sample-management"));
const LabTestManagement = React.lazy(() => import("@/pages/lab-test-management"));
const LabResultsReporting = React.lazy(() => import("@/pages/lab-results-reporting"));
const LabAnalyticsDashboard = React.lazy(() => import("@/pages/lab-analytics-dashboard"));
const LabInventoryManagement = React.lazy(() => import("@/pages/lab-inventory-management"));
import HealthRecommendations from "@/pages/health-recommendations";
import PricingPage from "@/pages/pricing";
import ServicePricingManagement from "@/pages/service-pricing-management";
import WhiteLabelSettingsPage from "@/pages/white-label-settings";
import OfflineModePage from "@/pages/offline-mode";
const TrialStatusPage = React.lazy(() => import("@/pages/trial-status"));
const ProfileSettingsPage = React.lazy(() => import("@/pages/profile-settings"));
import ReceptionistDashboard from "@/pages/receptionist-dashboard";
import ConsultationHistory from "@/pages/consultation-history";
import Advertisements from "@/pages/advertisements";
import MarketplacePage from "@/pages/marketplace";
import SupplierSignupPage from "@/pages/supplier-signup";
const CurrencyManagementPage = React.lazy(() => import("@/pages/currency-management").then(m => ({ default: m.CurrencyManagementPage })));
import SupplierPortal from "@/pages/supplier-portal";
import AdminCounterReset from "@/pages/admin-counter-reset";
import AdminMedicalCodesWorking from "@/pages/admin-medical-codes-working";

import FeaturesPage from "@/pages/features";
import SolutionsPage from "@/pages/solutions";
import SecurityPage from "@/pages/security";
import ContactPage from "@/pages/contact";
const Integrations = React.lazy(() => import("@/pages/integrations"));
const ApiDocs = React.lazy(() => import("@/pages/api-docs"));
const HospitalSolutions = React.lazy(() => import("@/pages/solutions/hospitals"));
const ClinicSolutions = React.lazy(() => import("@/pages/solutions/clinics"));
const LaboratorySolutions = React.lazy(() => import("@/pages/solutions/laboratories"));
const Documentation = React.lazy(() => import("@/pages/support/documentation"));
const HelpCenter = React.lazy(() => import("@/pages/support/help-center"));
const Contact = React.lazy(() => import("@/pages/support/contact"));
const Status = React.lazy(() => import("@/pages/support/status"));
const GettingStarted = React.lazy(() => import("@/pages/docs/getting-started").then(m => ({ default: m.GettingStarted })));
const PatientManagement = React.lazy(() => import("@/pages/docs/patient-management").then(m => ({ default: m.PatientManagement })));
const ApiDocsPage = React.lazy(() => import("@/pages/docs/api-docs").then(m => ({ default: m.ApiDocs })));
const AppointmentScheduling = React.lazy(() => import("@/pages/docs/appointment-scheduling").then(m => ({ default: m.AppointmentScheduling })));
const BillingInsurance = React.lazy(() => import("@/pages/docs/billing-insurance").then(m => ({ default: m.BillingInsurance })));
const SecurityCompliance = React.lazy(() => import("@/pages/docs/security-compliance").then(m => ({ default: m.SecurityCompliance })));
const PlatformOverview = React.lazy(() => import("@/pages/docs/platform-overview").then(m => ({ default: m.PlatformOverview })));
const OrganizationSetup = React.lazy(() => import("@/pages/docs/organization-setup").then(m => ({ default: m.OrganizationSetup })));
const ElectronicHealthRecords = React.lazy(() => import("@/pages/docs/electronic-health-records").then(m => ({ default: m.ElectronicHealthRecords })));
const PrescriptionManagement = React.lazy(() => import("@/pages/docs/prescription-management").then(m => ({ default: m.PrescriptionManagement })));
const LaboratoryOrderProcessing = React.lazy(() => import("@/pages/docs/laboratory-order-processing").then(m => ({ default: m.LaboratoryOrderProcessing })));
const ClinicalDocumentation = React.lazy(() => import("@/pages/docs/clinical-documentation").then(m => ({ default: m.ClinicalDocumentation })));
const VideoPlayer = React.lazy(() => import("@/pages/videos/video-player"));
const VideoIntegrationOptions = React.lazy(() => import("@/pages/videos/video-integration-options"));
const YoutubeIntegration = React.lazy(() => import("@/pages/videos/youtube-integration"));
const VimeoIntegration = React.lazy(() => import("@/pages/videos/vimeo-integration"));
const AWSIntegration = React.lazy(() => import("@/pages/videos/aws-integration"));
import PostLabResults from "@/pages/post-lab-results";
import LabResults from "@/pages/lab-results";
const LaboratoryBilling = React.lazy(() => import("@/pages/laboratory-billing"));
const HospitalBilling = React.lazy(() => import("@/pages/hospital-billing"));
const MedicationInsuranceClaims = React.lazy(() => import("@/pages/medication-insurance-claims"));
import PatientPortal from "@/pages/patient-portal";
import PatientPortalStaff from "@/pages/patient-portal-staff";
import ChangePasswordPage from "@/pages/change-password";
import AdminDashboard from "@/pages/admin-dashboard";
import PatientPortalPublic from "@/pages/patient-portal-public";
import PatientLogin from "@/pages/patient-login";
import DoctorCalendar from "@/pages/doctor-calendar";
const Achievements = React.lazy(() => import("@/pages/achievements"));
import PatientAccessManagement from "@/pages/patient-access-management";
const PrescriptionArchives = React.lazy(() => import("@/pages/prescription-archives"));
import LaboratoryDashboard from "@/pages/laboratory-dashboard";
import PharmacyDashboard from "@/pages/pharmacy-dashboard";
import PharmacyDashboardEnhanced from "@/pages/pharmacy-dashboard-enhanced";
const PharmacyInventory = React.lazy(() => import("@/pages/pharmacy-inventory"));
const PharmacyCustomers = React.lazy(() => import("@/pages/pharmacy-customers"));
const PharmacyBilling = React.lazy(() => import("@/pages/pharmacy-billing"));
const Checkout = React.lazy(() => import("@/pages/checkout"));
const Subscribe = React.lazy(() => import("@/pages/subscribe"));
const PaymentSuccess = React.lazy(() => import("@/pages/payment-success"));
const SubscriptionSuccess = React.lazy(() => import("@/pages/subscription-success"));
const PaymentDemo = React.lazy(() => import("@/pages/payment-demo"));




function AppContent() {
  // Supplier authentication now handled by direct HTML pages

  return (
    <div className="min-h-screen">
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={RegisterOrganization} />
        <Route path="/change-password" component={ChangePasswordPage} />
        <Route path="/dashboard">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Dashboard />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/patients">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Patients />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        
        <Route path="/patient-management">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Patients />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/patient-medical-records">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <PatientMedicalRecords />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/appointments">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Appointments />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/prescriptions">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Prescriptions />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/prescription-archives">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <PrescriptionArchives />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>

        <Route path="/lab-orders">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <LabOrders />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/post-lab-results">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <PostLabResults />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/laboratory-billing">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <LaboratoryBilling />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/achievements">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Achievements />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/patient-access-management">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <PatientAccessManagement />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/patient-portal">
          <ProtectedRoute>
            <PatientPortal />
          </ProtectedRoute>
        </Route>
        <Route path="/patient-portal-staff">
          <ProtectedRoute>
            <PatientPortalStaff />
          </ProtectedRoute>
        </Route>
        <Route path="/patient-portal-public">
          <PatientPortalPublic />
        </Route>
        <Route path="/doctor-calendar">
          <ProtectedRoute>
            <DoctorCalendar />
          </ProtectedRoute>
        </Route>
        <Route path="/patient-login">
          <PatientLogin />
        </Route>
        <Route path="/billing">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Billing />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/tenant-management">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <TenantManagement />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/audit-logs">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <AuditLogs />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/admin-dashboard">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <AdminDashboard />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/admin-medical-codes">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <AdminMedicalCodesWorking />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/super-admin-dashboard">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <SuperAdminDashboard />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        {/* Supplier routes now handled by direct HTML pages */}
        
        <Route path="/admin/clients">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                  <SuperAdminClientManagement />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/admin/counter-reset">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <AdminCounterReset />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/user-roles">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <UserRoles />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/reports">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Reports />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>

        <Route path="/medical-communications">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <MedicalCommunications />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/health-recommendations">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <HealthRecommendations />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/laboratory-dashboard">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <LaboratoryDashboard />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        
        <Route path="/pharmacy-dashboard">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <PharmacyDashboard />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        
        <Route path="/pharmacy-dashboard-enhanced">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <PharmacyDashboardEnhanced />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        
        <Route path="/pharmacy-inventory">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <PharmacyInventory />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        
        <Route path="/pharmacy-customers">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <PharmacyCustomers />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        
        <Route path="/pharmacy-billing">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <PharmacyBilling />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        
        <Route path="/medication-insurance-claims">
          <div className="flex flex-col h-screen bg-gray-50">
            <Header />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-6">
                <MedicationInsuranceClaims />
              </main>
            </div>
          </div>
        </Route>
        
        <Route path="/receptionist-dashboard">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <ReceptionistDashboard />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>

        <Route path="/laboratory-registration" component={LaboratoryRegistration} />
        
        {/* LABSAFE Laboratory Features */}
        <Route path="/lab/sample-management">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                  <LabSampleManagement />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        
        <Route path="/lab/test-management">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                  <LabTestManagement />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        
        <Route path="/lab/results-reporting">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                  <LabResultsReporting />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        
        <Route path="/lab/analytics">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                  <LabAnalyticsDashboard />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        
        <Route path="/lab/inventory">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                  <LabInventoryManagement />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        

        <Route path="/pricing" component={PricingPage} />
        <Route path="/service-pricing-management">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <ServicePricingManagement />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/currency-management">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <CurrencyManagementPage />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/white-label-settings">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <WhiteLabelSettingsPage />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/offline-mode">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <OfflineModePage />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/trial-status">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <TrialStatusPage />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/profile-settings">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <ProfileSettingsPage />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/consultation-history">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <ConsultationHistory />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/advertisements">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Advertisements />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>

        <Route path="/lab-results">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <LabResults />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/laboratory-billing">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <LaboratoryBilling />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/hospital-billing">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <HospitalBilling />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        
        {/* Payment System Routes */}
        <Route path="/payment-demo" component={PaymentDemo} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/checkout-simple" component={React.lazy(() => import("@/pages/checkout-simple"))} />
        <Route path="/subscribe" component={Subscribe} />
        <Route path="/payment-success" component={PaymentSuccess} />
        <Route path="/subscription-success" component={SubscriptionSuccess} />
        
        {/* Platform Footer Pages */}
        <Route path="/features" component={FeaturesPage} />
        <Route path="/solutions" component={SolutionsPage} />
        <Route path="/security" component={SecurityPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/integrations" component={Integrations} />
        <Route path="/api-docs" component={ApiDocsPage} />
        
        {/* Solutions Pages */}
        <Route path="/solutions/hospitals" component={HospitalSolutions} />
        <Route path="/solutions/clinics" component={ClinicSolutions} />
        <Route path="/solutions/laboratories" component={LaboratorySolutions} />
        
        {/* Support Pages */}
        <Route path="/support/documentation" component={Documentation} />
        <Route path="/support/help-center" component={HelpCenter} />
        <Route path="/support/contact" component={Contact} />
        <Route path="/support/status" component={Status} />
        
        {/* Documentation Pages */}
        <Route path="/docs/getting-started" component={GettingStarted} />
        <Route path="/docs/platform-overview" component={PlatformOverview} />
        <Route path="/docs/organization-setup" component={OrganizationSetup} />
        <Route path="/docs/patient-management" component={PatientManagement} />
        <Route path="/docs/appointment-scheduling" component={AppointmentScheduling} />
        <Route path="/docs/electronic-health-records" component={ElectronicHealthRecords} />
        <Route path="/docs/prescription-management" component={PrescriptionManagement} />
        <Route path="/docs/laboratory-order-processing" component={LaboratoryOrderProcessing} />
        <Route path="/docs/clinical-documentation" component={ClinicalDocumentation} />
        <Route path="/docs/billing-insurance" component={BillingInsurance} />
        <Route path="/docs/security-compliance" component={SecurityCompliance} />
        <Route path="/docs/api-docs" component={ApiDocsPage} />
        
        {/* Video Tutorial Routes */}
        <Route path="/videos/integration" component={VideoIntegrationOptions} />
        <Route path="/videos/integration/youtube" component={YoutubeIntegration} />
        <Route path="/videos/integration/vimeo" component={VimeoIntegration} />
        <Route path="/videos/integration/aws" component={AWSIntegration} />
        <Route path="/videos/:videoId" component={VideoPlayer} />
        
        {/* Catch-all routes for docs */}
        <Route path="/docs/:slug" component={GettingStarted} />
        
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function Router() {
  const { user, isLoading, token } = useAuth();
  const [location] = useLocation();

  // Better loading state with platform branding
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <h3 className="mt-4 text-lg font-semibold text-gray-700">NaviMED Healthcare Platform</h3>
          <p className="mt-2 text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Log authentication state for debugging
  if (!user && !token) {
    console.log('No authentication found, displaying public routes');
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Switch>
          {/* Public routes - always accessible */}
          <Route path="/" component={LandingPage} />
          <Route path="/login" component={Login} />
          <Route path="/marketplace" component={MarketplacePage} />
          <Route path="/supplier-signup" component={SupplierSignupPage} />
          <Route path="/supplier-portal" component={SupplierPortal} />
          <Route path="/register" component={RegisterOrganization} />
          <Route path="/organizations/register" component={RegisterOrganization} />
          
          {/* Payment routes - require authentication */}
          <Route path="/checkout">
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          </Route>
          <Route path="/subscribe">
            <ProtectedRoute>
              <Subscribe />
            </ProtectedRoute>
          </Route>
          <Route path="/payment-success">
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          </Route>
          <Route path="/subscription-success">
            <ProtectedRoute>
              <SubscriptionSuccess />
            </ProtectedRoute>
          </Route>
          <Route path="/payment-demo">
            <ProtectedRoute>
              <PaymentDemo />
            </ProtectedRoute>
          </Route>
          <Route path="/features" component={FeaturesPage} />
          <Route path="/solutions" component={SolutionsPage} />
          <Route path="/security" component={SecurityPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/pricing" component={PricingPage} />
          <Route path="/laboratory-registration" component={LaboratoryRegistration} />
  
          {/* Support and documentation pages */}
          <Route path="/support/documentation" component={Documentation} />
          <Route path="/support/help-center" component={HelpCenter} />
          <Route path="/support/contact" component={Contact} />
          <Route path="/support/status" component={Status} />
          <Route path="/integrations" component={Integrations} />
          <Route path="/api-docs" component={ApiDocsPage} />
          {/* Supplier routes handled by direct HTML pages */}
          <Route path="/patient-portal-public" component={PatientPortalPublic} />
          <Route path="/patient-login" component={PatientLogin} />
          
          
          {/* Medication Insurance Claims - Public Access for Testing */}
          <Route path="/medication-insurance-claims">
            <div className="flex flex-col h-screen bg-gray-50">
              <TabsNavigation />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <MedicationInsuranceClaims />
                </main>
              </div>
            </div>
          </Route>
          
          {/* 404 Not Found - should only show for truly unmatched routes */}
          <Route component={NotFound} />
        </Switch>
      </div>
    );
  }

  // Check for post-login redirect
  const redirectPath = localStorage.getItem('post_login_redirect');
  if (redirectPath && redirectPath !== location) {
    localStorage.removeItem('post_login_redirect');
    console.log('Handling post-login redirect to:', redirectPath);
    // Use startTransition for redirect to prevent suspension
    startTransition(() => {
      // Use a timeout to ensure the redirect happens in the next tick
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 0);
    });
    return <LoadingPage />;
  }

  // User is authenticated, show the protected app content
  console.log('User authenticated, showing app content for:', user.username);
  return (
    <Suspense fallback={<LoadingPage />}>
      <AppContent />
    </Suspense>
  );
}

function App() {
  // IMMEDIATE: Block suppliers before any React rendering
  const userType = localStorage.getItem('userType');
  if (userType === 'supplier') {
    // Force redirect immediately
    window.location.replace('/supplier-dashboard-direct');
    // Return empty div to prevent React from rendering anything
    return <div style={{display: 'none'}}>Redirecting supplier...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <TranslationProvider>
            <TenantProvider>
              <Toaster />
              <Router />
            </TenantProvider>
          </TranslationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
