import React, { Suspense } from "react";
import { Routes, Route, Navigate, useLocation, BrowserRouter } from "react-router-dom";
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
import { ProtectedRoute } from "@/components/layout/protected-route";

// Loading component for Suspense fallback
const LoadingPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
    <div className="text-center">
      <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-lg font-medium text-gray-700">Loading...</p>
    </div>
  </div>
);

// Critical pages loaded immediately (public pages users see first)
import LandingPage from "@/pages/landing-fixed";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import RegisterOrganization from "@/pages/register-organization";

// All other pages loaded dynamically with code splitting
const Dashboard = React.lazy(() => import("@/pages/dashboard"));
const Patients = React.lazy(() => import("@/pages/patients"));
const PatientMedicalRecords = React.lazy(() => import("@/pages/patient-medical-records"));
const Appointments = React.lazy(() => import("@/pages/appointments"));
const Prescriptions = React.lazy(() => import("@/pages/prescriptions"));
const LabOrders = React.lazy(() => import("@/pages/lab-orders"));
const Billing = React.lazy(() => import("@/pages/billing"));
const TenantManagement = React.lazy(() => import("@/pages/tenant-management"));
const SuperAdminDashboard = React.lazy(() => import("@/pages/super-admin-dashboard"));
const SuperAdminClientManagement = React.lazy(() => import("@/pages/super-admin-client-management"));
const AuditLogs = React.lazy(() => import("@/pages/audit-logs"));
const UserRoles = React.lazy(() => import("@/pages/user-roles"));
const Reports = React.lazy(() => import("@/pages/reports"));
const MedicalCommunications = React.lazy(() => import("@/pages/medical-communications"));
const LaboratoryRegistration = React.lazy(() => import("@/pages/laboratory-registration"));
const LabSampleManagement = React.lazy(() => import("@/pages/lab-sample-management"));
const LabTestManagement = React.lazy(() => import("@/pages/lab-test-management"));
const LabResultsReporting = React.lazy(() => import("@/pages/lab-results-reporting"));
const LabAnalyticsDashboard = React.lazy(() => import("@/pages/lab-analytics-dashboard"));
const LabInventoryManagement = React.lazy(() => import("@/pages/lab-inventory-management"));
const HealthRecommendations = React.lazy(() => import("@/pages/health-recommendations"));
const PricingPage = React.lazy(() => import("@/pages/pricing"));
const ServicePricingManagement = React.lazy(() => import("@/pages/service-pricing-management"));
const WhiteLabelSettingsPage = React.lazy(() => import("@/pages/white-label-settings"));
const OfflineModePage = React.lazy(() => import("@/pages/offline-mode"));
const TrialStatusPage = React.lazy(() => import("@/pages/trial-status"));
const ProfileSettingsPage = React.lazy(() => import("@/pages/profile-settings"));
const ReceptionistDashboard = React.lazy(() => import("@/pages/receptionist-dashboard"));
const ConsultationHistory = React.lazy(() => import("@/pages/consultation-history"));
const Advertisements = React.lazy(() => import("@/pages/advertisements"));
const MarketplacePage = React.lazy(() => import("@/pages/marketplace"));
const SupplierSignupPage = React.lazy(() => import("@/pages/supplier-signup"));
const CurrencyManagementPage = React.lazy(() => import("@/pages/currency-management").then(m => ({ default: m.CurrencyManagementPage })));
const SupplierPortal = React.lazy(() => import("@/pages/supplier-portal"));
const AdminCounterReset = React.lazy(() => import("@/pages/admin-counter-reset"));
const AdminMedicalCodes = React.lazy(() => import("@/pages/admin-medical-codes"));

const FeaturesPage = React.lazy(() => import("@/pages/features"));
const SolutionsPage = React.lazy(() => import("@/pages/solutions"));
const SecurityPage = React.lazy(() => import("@/pages/security"));
const ContactPage = React.lazy(() => import("@/pages/contact"));
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
const PostLabResults = React.lazy(() => import("@/pages/post-lab-results"));
const LabResults = React.lazy(() => import("@/pages/lab-results"));
const LaboratoryBilling = React.lazy(() => import("@/pages/laboratory-billing"));
const HospitalBilling = React.lazy(() => import("@/pages/hospital-billing"));
const MedicationInsuranceClaims = React.lazy(() => import("@/pages/medication-insurance-claims"));
const PatientPortal = React.lazy(() => import("@/pages/patient-portal"));
const PatientPortalStaff = React.lazy(() => import("@/pages/patient-portal-staff"));
const ChangePasswordPage = React.lazy(() => import("@/pages/change-password"));
const AdminDashboard = React.lazy(() => import("@/pages/admin-dashboard"));
const PatientPortalPublic = React.lazy(() => import("@/pages/patient-portal-public"));
const PatientLogin = React.lazy(() => import("@/pages/patient-login"));
const DoctorCalendar = React.lazy(() => import("@/pages/doctor-calendar"));
const Achievements = React.lazy(() => import("@/pages/achievements"));
const PatientAccessManagement = React.lazy(() => import("@/pages/patient-access-management"));
const PrescriptionArchives = React.lazy(() => import("@/pages/prescription-archives"));
const LaboratoryDashboard = React.lazy(() => import("@/pages/laboratory-dashboard"));
const PharmacyDashboard = React.lazy(() => import("@/pages/pharmacy-dashboard"));
const PharmacyDashboardEnhanced = React.lazy(() => import("@/pages/pharmacy-dashboard-enhanced"));
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
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterOrganization />} />
        <Route path="/change-password" element={
          <Suspense fallback={<LoadingPage />}>
            <ChangePasswordPage />
          </Suspense>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <Dashboard />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/patients" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <Patients />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/patient-management" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <Patients />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/patient-medical-records" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <PatientMedicalRecords />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/appointments" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <Appointments />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/prescriptions" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <Prescriptions />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/prescription-archives" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <PrescriptionArchives />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/lab-orders" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <LabOrders />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/post-lab-results" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <PostLabResults />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/laboratory-billing" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <LaboratoryBilling />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/achievements" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Achievements />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/patient-access-management" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <PatientAccessManagement />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/patient-portal" element={
          <ProtectedRoute>
            <PatientPortal />
          </ProtectedRoute>
        } />
        <Route path="/patient-portal-staff" element={
          <ProtectedRoute>
            <PatientPortalStaff />
          </ProtectedRoute>
        } />
        <Route path="/patient-portal-public" element={<PatientPortalPublic />} />
        <Route path="/doctor-calendar" element={
          <ProtectedRoute>
            <DoctorCalendar />
          </ProtectedRoute>
        } />
        <Route path="/patient-login" element={<PatientLogin />} />
        <Route path="/billing" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <Billing />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/hospital-billing" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <HospitalBilling />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/tenant-management" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <TenantManagement />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/super-admin-dashboard" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <SuperAdminDashboard />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/admin/clients" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <SuperAdminClientManagement />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/user-roles" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <UserRoles />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/audit-logs" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <AuditLogs />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <Reports />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/health-recommendations" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <HealthRecommendations />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/medical-communications" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <MedicalCommunications />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/service-pricing-management" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <ServicePricingManagement />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/white-label-settings" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <WhiteLabelSettingsPage />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/offline-mode" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <OfflineModePage />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/laboratory-registration" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <LaboratoryRegistration />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/lab/sample-management" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <LabSampleManagement />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/lab/test-management" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <LabTestManagement />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/lab/results-reporting" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <LabResultsReporting />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/lab/analytics" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <LabAnalyticsDashboard />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/lab/inventory" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <LabInventoryManagement />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/laboratory-dashboard" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <LaboratoryDashboard />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/pharmacy-dashboard" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <PharmacyDashboard />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/pharmacy-dashboard-enhanced" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <PharmacyDashboardEnhanced />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/pharmacy-inventory" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <PharmacyInventory />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/pharmacy-customers" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <PharmacyCustomers />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/pharmacy-billing" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <PharmacyBilling />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/lab-results" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <LabResults />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/consultation-history" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <ConsultationHistory />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/trial-status" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <TrialStatusPage />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/profile-settings" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <ProfileSettingsPage />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/receptionist-dashboard" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <ReceptionistDashboard />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/advertisements" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <Advertisements />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/marketplace" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <MarketplacePage />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/supplier-signup" element={
          <Suspense fallback={<LoadingPage />}>
            <SupplierSignupPage />
          </Suspense>
        } />
        <Route path="/supplier-portal" element={
          <Suspense fallback={<LoadingPage />}>
            <SupplierPortal />
          </Suspense>
        } />
        <Route path="/currency-management" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <CurrencyManagementPage />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/admin/counter-reset" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <AdminCounterReset />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/admin-medical-codes" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <AdminMedicalCodes />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Suspense fallback={<LoadingPage />}>
                    <AdminDashboard />
                  </Suspense>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />

        {/* Public Marketing Pages */}
        <Route path="/pricing" element={
          <Suspense fallback={<LoadingPage />}>
            <PricingPage />
          </Suspense>
        } />
        <Route path="/features" element={
          <Suspense fallback={<LoadingPage />}>
            <FeaturesPage />
          </Suspense>
        } />
        <Route path="/solutions" element={
          <Suspense fallback={<LoadingPage />}>
            <SolutionsPage />
          </Suspense>
        } />
        <Route path="/security" element={
          <Suspense fallback={<LoadingPage />}>
            <SecurityPage />
          </Suspense>
        } />
        <Route path="/contact" element={
          <Suspense fallback={<LoadingPage />}>
            <ContactPage />
          </Suspense>
        } />
        <Route path="/integrations" element={
          <Suspense fallback={<LoadingPage />}>
            <Integrations />
          </Suspense>
        } />
        <Route path="/api-docs" element={
          <Suspense fallback={<LoadingPage />}>
            <ApiDocs />
          </Suspense>
        } />
        <Route path="/solutions/hospitals" element={
          <Suspense fallback={<LoadingPage />}>
            <HospitalSolutions />
          </Suspense>
        } />
        <Route path="/solutions/clinics" element={
          <Suspense fallback={<LoadingPage />}>
            <ClinicSolutions />
          </Suspense>
        } />
        <Route path="/solutions/laboratories" element={
          <Suspense fallback={<LoadingPage />}>
            <LaboratorySolutions />
          </Suspense>
        } />
        <Route path="/support/documentation" element={
          <Suspense fallback={<LoadingPage />}>
            <Documentation />
          </Suspense>
        } />
        <Route path="/support/help-center" element={
          <Suspense fallback={<LoadingPage />}>
            <HelpCenter />
          </Suspense>
        } />
        <Route path="/support/contact" element={
          <Suspense fallback={<LoadingPage />}>
            <Contact />
          </Suspense>
        } />
        <Route path="/support/status" element={
          <Suspense fallback={<LoadingPage />}>
            <Status />
          </Suspense>
        } />
        <Route path="/docs/getting-started" element={
          <Suspense fallback={<LoadingPage />}>
            <GettingStarted />
          </Suspense>
        } />
        <Route path="/docs/patient-management" element={
          <Suspense fallback={<LoadingPage />}>
            <PatientManagement />
          </Suspense>
        } />
        <Route path="/docs/api-docs" element={
          <Suspense fallback={<LoadingPage />}>
            <ApiDocsPage />
          </Suspense>
        } />
        <Route path="/docs/appointment-scheduling" element={
          <Suspense fallback={<LoadingPage />}>
            <AppointmentScheduling />
          </Suspense>
        } />
        <Route path="/docs/billing-insurance" element={
          <Suspense fallback={<LoadingPage />}>
            <BillingInsurance />
          </Suspense>
        } />
        <Route path="/docs/security-compliance" element={
          <Suspense fallback={<LoadingPage />}>
            <SecurityCompliance />
          </Suspense>
        } />
        <Route path="/docs/platform-overview" element={
          <Suspense fallback={<LoadingPage />}>
            <PlatformOverview />
          </Suspense>
        } />
        <Route path="/docs/organization-setup" element={
          <Suspense fallback={<LoadingPage />}>
            <OrganizationSetup />
          </Suspense>
        } />
        <Route path="/docs/electronic-health-records" element={
          <Suspense fallback={<LoadingPage />}>
            <ElectronicHealthRecords />
          </Suspense>
        } />
        <Route path="/docs/prescription-management" element={
          <Suspense fallback={<LoadingPage />}>
            <PrescriptionManagement />
          </Suspense>
        } />
        <Route path="/docs/laboratory-order-processing" element={
          <Suspense fallback={<LoadingPage />}>
            <LaboratoryOrderProcessing />
          </Suspense>
        } />
        <Route path="/docs/clinical-documentation" element={
          <Suspense fallback={<LoadingPage />}>
            <ClinicalDocumentation />
          </Suspense>
        } />
        <Route path="/videos/video-player" element={
          <Suspense fallback={<LoadingPage />}>
            <VideoPlayer />
          </Suspense>
        } />
        <Route path="/videos/video-integration-options" element={
          <Suspense fallback={<LoadingPage />}>
            <VideoIntegrationOptions />
          </Suspense>
        } />
        <Route path="/videos/youtube-integration" element={
          <Suspense fallback={<LoadingPage />}>
            <YoutubeIntegration />
          </Suspense>
        } />
        <Route path="/videos/vimeo-integration" element={
          <Suspense fallback={<LoadingPage />}>
            <VimeoIntegration />
          </Suspense>
        } />
        <Route path="/videos/aws-integration" element={
          <Suspense fallback={<LoadingPage />}>
            <AWSIntegration />
          </Suspense>
        } />

        {/* Payment Routes */}
        <Route path="/checkout" element={
          <Suspense fallback={<LoadingPage />}>
            <Checkout />
          </Suspense>
        } />
        <Route path="/subscribe" element={
          <Suspense fallback={<LoadingPage />}>
            <Subscribe />
          </Suspense>
        } />
        <Route path="/payment-success" element={
          <Suspense fallback={<LoadingPage />}>
            <PaymentSuccess />
          </Suspense>
        } />
        <Route path="/subscription-success" element={
          <Suspense fallback={<LoadingPage />}>
            <SubscriptionSuccess />
          </Suspense>
        } />
        <Route path="/payment-demo" element={
          <Suspense fallback={<LoadingPage />}>
            <PaymentDemo />
          </Suspense>
        } />
          
          {/* Medication Insurance Claims - Public Access for Testing */}
          <Route path="/medication-insurance-claims" element={
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <MedicationInsuranceClaims />
                </main>
              </div>
            </div>
          } />
          
          {/* 404 Not Found - should only show for truly unmatched routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    );
  }

function Router() {
  const { user, isLoading, token } = useAuth();
  const location = useLocation();

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

  // Public routes when not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterOrganization />} />
          <Route path="/pricing" element={<Suspense fallback={<LoadingPage />}><PricingPage /></Suspense>} />
          <Route path="/features" element={<Suspense fallback={<LoadingPage />}><FeaturesPage /></Suspense>} />
          <Route path="/solutions" element={<Suspense fallback={<LoadingPage />}><SolutionsPage /></Suspense>} />
          <Route path="/security" element={<Suspense fallback={<LoadingPage />}><SecurityPage /></Suspense>} />
          <Route path="/contact" element={<Suspense fallback={<LoadingPage />}><ContactPage /></Suspense>} />
          <Route path="/integrations" element={<Suspense fallback={<LoadingPage />}><Integrations /></Suspense>} />
          <Route path="/api-docs" element={<Suspense fallback={<LoadingPage />}><ApiDocs /></Suspense>} />
          <Route path="/solutions/hospitals" element={<Suspense fallback={<LoadingPage />}><HospitalSolutions /></Suspense>} />
          <Route path="/solutions/clinics" element={<Suspense fallback={<LoadingPage />}><ClinicSolutions /></Suspense>} />
          <Route path="/solutions/laboratories" element={<Suspense fallback={<LoadingPage />}><LaboratorySolutions /></Suspense>} />
          <Route path="/support/documentation" element={<Suspense fallback={<LoadingPage />}><Documentation /></Suspense>} />
          <Route path="/support/help-center" element={<Suspense fallback={<LoadingPage />}><HelpCenter /></Suspense>} />
          <Route path="/support/contact" element={<Suspense fallback={<LoadingPage />}><Contact /></Suspense>} />
          <Route path="/support/status" element={<Suspense fallback={<LoadingPage />}><Status /></Suspense>} />
          <Route path="/docs/getting-started" element={<Suspense fallback={<LoadingPage />}><GettingStarted /></Suspense>} />
          <Route path="/docs/patient-management" element={<Suspense fallback={<LoadingPage />}><PatientManagement /></Suspense>} />
          <Route path="/docs/api-docs" element={<Suspense fallback={<LoadingPage />}><ApiDocsPage /></Suspense>} />
          <Route path="/docs/appointment-scheduling" element={<Suspense fallback={<LoadingPage />}><AppointmentScheduling /></Suspense>} />
          <Route path="/docs/billing-insurance" element={<Suspense fallback={<LoadingPage />}><BillingInsurance /></Suspense>} />
          <Route path="/docs/security-compliance" element={<Suspense fallback={<LoadingPage />}><SecurityCompliance /></Suspense>} />
          <Route path="/docs/platform-overview" element={<Suspense fallback={<LoadingPage />}><PlatformOverview /></Suspense>} />
          <Route path="/docs/organization-setup" element={<Suspense fallback={<LoadingPage />}><OrganizationSetup /></Suspense>} />
          <Route path="/docs/electronic-health-records" element={<Suspense fallback={<LoadingPage />}><ElectronicHealthRecords /></Suspense>} />
          <Route path="/docs/prescription-management" element={<Suspense fallback={<LoadingPage />}><PrescriptionManagement /></Suspense>} />
          <Route path="/docs/laboratory-order-processing" element={<Suspense fallback={<LoadingPage />}><LaboratoryOrderProcessing /></Suspense>} />
          <Route path="/docs/clinical-documentation" element={<Suspense fallback={<LoadingPage />}><ClinicalDocumentation /></Suspense>} />
          <Route path="/videos/video-player" element={<Suspense fallback={<LoadingPage />}><VideoPlayer /></Suspense>} />
          <Route path="/videos/video-integration-options" element={<Suspense fallback={<LoadingPage />}><VideoIntegrationOptions /></Suspense>} />
          <Route path="/videos/youtube-integration" element={<Suspense fallback={<LoadingPage />}><YoutubeIntegration /></Suspense>} />
          <Route path="/videos/vimeo-integration" element={<Suspense fallback={<LoadingPage />}><VimeoIntegration /></Suspense>} />
          <Route path="/videos/aws-integration" element={<Suspense fallback={<LoadingPage />}><AWSIntegration /></Suspense>} />
          <Route path="/supplier-signup" element={<Suspense fallback={<LoadingPage />}><SupplierSignupPage /></Suspense>} />
          <Route path="/supplier-portal" element={<Suspense fallback={<LoadingPage />}><SupplierPortal /></Suspense>} />
          <Route path="/patient-portal-public" element={<PatientPortalPublic />} />
          <Route path="/patient-login" element={<PatientLogin />} />
          <Route path="/checkout" element={<Suspense fallback={<LoadingPage />}><Checkout /></Suspense>} />
          <Route path="/subscribe" element={<Suspense fallback={<LoadingPage />}><Subscribe /></Suspense>} />
          <Route path="/payment-success" element={<Suspense fallback={<LoadingPage />}><PaymentSuccess /></Suspense>} />
          <Route path="/subscription-success" element={<Suspense fallback={<LoadingPage />}><SubscriptionSuccess /></Suspense>} />
          <Route path="/payment-demo" element={<Suspense fallback={<LoadingPage />}><PaymentDemo /></Suspense>} />
          
          {/* Medication Insurance Claims - Public Access for Testing */}
          <Route path="/medication-insurance-claims" element={
            <div className="flex flex-col h-screen bg-gray-50">
              <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6">
                  <MedicationInsuranceClaims />
                </main>
              </div>
            </div>
          } />
          
          {/* 404 Not Found - should only show for truly unmatched routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    );
  }

  // Check for post-login redirect
  const redirectPath = localStorage.getItem('post_login_redirect');
  if (redirectPath && redirectPath !== location.pathname) {
    localStorage.removeItem('post_login_redirect');
    console.log('Handling post-login redirect to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated, show the protected app content
  console.log('User authenticated, showing app content for:', user.username);
  return <AppContent />;
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
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;