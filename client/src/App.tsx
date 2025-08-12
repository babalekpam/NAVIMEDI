import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TenantProvider } from "@/contexts/tenant-context-fixed";
import { TranslationProvider } from "@/contexts/translation-context";
import { AuthProvider } from "@/contexts/auth-context";
import { useAuth } from "@/contexts/auth-context";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ProtectedRoute } from "@/components/layout/protected-route";
import LandingPage from "@/pages/landing-fixed";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import RegisterOrganization from "@/pages/register-organization";
import MfaSetup from "@/pages/mfa-setup";
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
import LaboratoryRegistration from "@/pages/laboratory-registration";
import HealthRecommendations from "@/pages/health-recommendations";
// import PharmacyDashboardEnhanced from "@/pages/pharmacy-dashboard-enhanced";
import PharmacyDashboardSimple from "@/pages/pharmacy-dashboard-simple";

import PharmacyDashboardWorking from "@/pages/pharmacy-dashboard-working";
import PharmacyRegistration from "@/pages/pharmacy-registration";
import { PharmacyInventoryManager } from "@/components/pharmacy/PharmacyInventoryManager";
import { PharmacyPrescriptionManager } from "@/components/pharmacy/PharmacyPrescriptionManager";
import { PharmacyPOS } from "@/components/pharmacy/PharmacyPOS";
import PricingPage from "@/pages/pricing";
import ServicePricingManagement from "@/pages/service-pricing-management";
import WhiteLabelSettingsPage from "@/pages/white-label-settings";
import OfflineModePage from "@/pages/offline-mode";
import TrialStatusPage from "@/pages/trial-status";
import ProfileSettingsPage from "@/pages/profile-settings";
import ReceptionistDashboard from "@/pages/receptionist-dashboard";
import ConsultationHistory from "@/pages/consultation-history";
import Advertisements from "@/pages/advertisements";
import MarketplacePage from "@/pages/marketplace";
import SupplierSignupPage from "@/pages/supplier-signup";
import SupplierPortal from "@/pages/supplier-portal";
import AdminCounterReset from "@/pages/admin-counter-reset";
// Supplier system moved to pure HTML to prevent conflicts

import FeaturesPage from "@/pages/features";
import SolutionsPage from "@/pages/solutions";
import SecurityPage from "@/pages/security";
import ContactPage from "@/pages/contact";
import Integrations from "@/pages/integrations";
import ApiDocs from "@/pages/api-docs";
import HospitalSolutions from "@/pages/solutions/hospitals";
import ClinicSolutions from "@/pages/solutions/clinics";
import PharmacySolutions from "@/pages/solutions/pharmacies";
import LaboratorySolutions from "@/pages/solutions/laboratories";
import Documentation from "@/pages/support/documentation";
import HelpCenter from "@/pages/support/help-center";
import Contact from "@/pages/support/contact";
import Status from "@/pages/support/status";
import { GettingStarted } from "@/pages/docs/getting-started";
import { PatientManagement } from "@/pages/docs/patient-management";
import { ApiDocs as ApiDocsPage } from "@/pages/docs/api-docs";
import { AppointmentScheduling } from "@/pages/docs/appointment-scheduling";
import { BillingInsurance } from "@/pages/docs/billing-insurance";
import MultiLevelApprovalsPage from "@/pages/multi-level-approvals";
import { SecurityCompliance } from "@/pages/docs/security-compliance";
import { PlatformOverview } from "@/pages/docs/platform-overview";
import { OrganizationSetup } from "@/pages/docs/organization-setup";
import { ElectronicHealthRecords } from "@/pages/docs/electronic-health-records";
import { PrescriptionManagement } from "@/pages/docs/prescription-management";
import { LaboratoryOrderProcessing } from "@/pages/docs/laboratory-order-processing";
import { ClinicalDocumentation } from "@/pages/docs/clinical-documentation";
import VideoPlayer from "@/pages/videos/video-player";
import VideoIntegrationOptions from "@/pages/videos/video-integration-options";
import YoutubeIntegration from "@/pages/videos/youtube-integration";
import VimeoIntegration from "@/pages/videos/vimeo-integration";
import AWSIntegration from "@/pages/videos/aws-integration";
import PostLabResults from "@/pages/post-lab-results";
import LabResults from "@/pages/lab-results";
import LaboratoryBilling from "@/pages/laboratory-billing";
import HospitalBilling from "@/pages/hospital-billing";
import PharmacyBilling from "@/pages/pharmacy-billing";
import MedicationInsuranceClaims from "@/pages/medication-insurance-claims";
import PatientPortal from "@/pages/patient-portal";
import PatientPortalStaff from "@/pages/patient-portal-staff";
import ChangePasswordPage from "@/pages/change-password";
import AdminDashboard from "@/pages/admin-dashboard";
import PatientPortalPublic from "@/pages/patient-portal-public";
import TelemedicineBooking from "@/pages/telemedicine-booking";
import PatientLogin from "@/pages/patient-login";
import DoctorCalendar from "@/pages/doctor-calendar";
import Achievements from "@/pages/achievements";
import PatientAccessManagement from "@/pages/patient-access-management";

import PharmacyPatientManagement from "@/pages/pharmacy-patient-management";
import PharmacyReports from "@/pages/pharmacy-reports";
import PrescriptionArchives from "@/pages/prescription-archives";
import PharmacyEmployeeManagement from "@/pages/pharmacy-employee-management";
import LaboratoryDashboard from "@/pages/laboratory-dashboard";




function AppContent() {
  // Supplier authentication now handled by direct HTML pages

  return (
    <div className="min-h-screen">
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={RegisterOrganization} />
        <Route path="/change-password" component={ChangePasswordPage} />
        <Route path="/mfa-setup">
          <ProtectedRoute>
            <MfaSetup />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
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
              <Header />
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
              <Header />
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
              <Header />
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
              <Header />
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
              <Header />
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
              <Header />
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
              <Header />
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
              <Header />
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
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Achievements />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>

        {/* Public routes accessible even when logged in */}
        <Route path="/marketplace" component={MarketplacePage} />
        <Route path="/supplier-portal" component={SupplierPortal} />
        <Route path="/supplier-signup" component={SupplierSignupPage} />
        <Route path="/patient-access-management">
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
        <Route path="/telemedicine-booking">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <TelemedicineBooking />
                </main>
              </div>
            </div>
          </ProtectedRoute>
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
              <Header />
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
              <Header />
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
              <Header />
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
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <AdminDashboard />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/super-admin-dashboard">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
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
              <Header />
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
              <Header />
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
              <Header />
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
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Reports />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/multi-level-approvals">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <MultiLevelApprovalsPage />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>

        <Route path="/pharmacy-patient-management">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <PharmacyPatientManagement />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/pharmacy-reports">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <PharmacyReports />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/pharmacy-employee-management">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <PharmacyEmployeeManagement />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/medical-communications">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
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
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <HealthRecommendations />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/pharmacy-dashboard">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <PharmacyDashboardWorking />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/laboratory-dashboard">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <LaboratoryDashboard />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        
        <Route path="/pharmacy-inventory">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <PharmacyInventoryManager />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/pharmacy-prescriptions">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <PharmacyPrescriptionManager />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/pharmacy-pos">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                  <PharmacyPOS />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/receptionist-dashboard">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
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
        <Route path="/pharmacy-registration" component={PharmacyRegistration} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/service-pricing-management">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <ServicePricingManagement />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/white-label-settings">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
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
              <Header />
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
              <Header />
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
              <Header />
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
              <Header />
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
              <Header />
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
              <Header />
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
              <Header />
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
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <HospitalBilling />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        <Route path="/pharmacy-billing">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
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
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <MedicationInsuranceClaims />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        
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
        <Route path="/solutions/pharmacies" component={PharmacySolutions} />
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
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Switch>
          {/* Public routes - always accessible */}
          <Route path="/" component={LandingPage} />
          <Route path="/marketplace" component={MarketplacePage} />
          <Route path="/supplier-signup" component={SupplierSignupPage} />
          <Route path="/supplier-portal" component={SupplierPortal} />
          <Route path="/register" component={RegisterOrganization} />
          <Route path="/features" component={FeaturesPage} />
          <Route path="/solutions" component={SolutionsPage} />
          <Route path="/security" component={SecurityPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/pricing" component={PricingPage} />
          <Route path="/laboratory-registration" component={LaboratoryRegistration} />
          <Route path="/pharmacy-registration" component={PharmacyRegistration} />
          {/* Supplier routes handled by direct HTML pages */}
          <Route path="/patient-portal-public" component={PatientPortalPublic} />
          <Route path="/patient-login" component={PatientLogin} />
          <Route path="/login" component={Login} />
          
          {/* 404 Not Found - should only show for truly unmatched routes */}
          <Route component={NotFound} />
        </Switch>
      </div>
    );
  }

  return <AppContent />;
}

function App() {
  // Check for supplier redirect, but only for dashboard/protected routes
  const userType = localStorage.getItem('userType');
  const currentPath = window.location.pathname;
  const authUser = localStorage.getItem('auth_user');
  
  // Clear supplier userType if user is logging in with regular auth system
  if (authUser && userType === 'supplier') {
    try {
      const user = JSON.parse(authUser);
      // If user has a valid auth role that's not supplier-related, clear the userType
      if (user.role && user.role !== 'supplier') {
        localStorage.removeItem('userType');
        console.log('Cleared supplier userType for authenticated user with role:', user.role);
      }
    } catch (e) {
      // If auth_user is corrupted, clear both
      localStorage.removeItem('userType');
      localStorage.removeItem('auth_user');
    }
  }
  
  // Only redirect suppliers if they're trying to access protected routes
  // AND they don't have a valid auth session (meaning they're only supplier users)
  const publicRoutes = [
    '/', '/marketplace', '/supplier-portal', '/supplier-signup', 
    '/register', '/features', '/solutions', '/security', '/contact', 
    '/pricing', '/laboratory-registration', '/pharmacy-registration',
    '/patient-portal-public', '/patient-login', '/login'
  ];
  
  const updatedUserType = localStorage.getItem('userType'); // Get updated value
  if (updatedUserType === 'supplier' && !authUser && !publicRoutes.includes(currentPath) && !currentPath.startsWith('/supplier-')) {
    // Only redirect suppliers trying to access protected routes if they don't have regular auth
    window.location.replace('/supplier-dashboard-direct');
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
