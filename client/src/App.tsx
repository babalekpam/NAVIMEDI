import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { TenantProvider } from "@/contexts/tenant-context";
import { TranslationProvider } from "@/contexts/translation-context";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ProtectedRoute } from "@/components/layout/protected-route";
import LandingPage from "@/pages/landing";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import RegisterOrganization from "@/pages/register-organization";
import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients";
import PatientMedicalRecords from "@/pages/patient-medical-records";
import Appointments from "@/pages/appointments";
import Prescriptions from "@/pages/prescriptions";
import LabOrders from "@/pages/lab-orders";
import Billing from "@/pages/billing";
import TenantManagement from "@/pages/tenant-management";
import AuditLogs from "@/pages/audit-logs";
import UserRoles from "@/pages/user-roles";
import Reports from "@/pages/reports";
import MedicalCommunications from "@/pages/medical-communications";
import LaboratoryRegistration from "@/pages/laboratory-registration";
import HealthRecommendations from "@/pages/health-recommendations";
import PharmacyDashboard from "@/pages/pharmacy-dashboard";
import PharmacyRegistration from "@/pages/pharmacy-registration";
import PricingPage from "@/pages/pricing";
import ServicePricingManagement from "@/pages/service-pricing-management";
import WhiteLabelSettingsPage from "@/pages/white-label-settings";
import OfflineModePage from "@/pages/offline-mode";
import TrialStatusPage from "@/pages/trial-status";
import ProfileSettingsPage from "@/pages/profile-settings";
import ReceptionistDashboard from "@/pages/receptionist-dashboard";
import ConsultationHistory from "@/pages/consultation-history";
import Features from "@/pages/features";
import Security from "@/pages/security";
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
import { SecurityCompliance } from "@/pages/docs/security-compliance";
import { PlatformOverview } from "@/pages/docs/platform-overview";
import { OrganizationSetup } from "@/pages/docs/organization-setup";
import { ElectronicHealthRecords } from "@/pages/docs/electronic-health-records";
import { PrescriptionManagement } from "@/pages/docs/prescription-management";
import { LaboratoryOrderProcessing } from "@/pages/docs/laboratory-order-processing";
import { ClinicalDocumentation } from "@/pages/docs/clinical-documentation";
import VideoPlayer from "@/pages/videos/video-player";
import VideoIntegrationOptions from "@/pages/videos/video-integration-options";




function AppContent() {
  return (
    <div className="min-h-screen">
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={RegisterOrganization} />
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
                  <PharmacyDashboard />
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
        <Route path="/lab-results">
          <ProtectedRoute>
            <div className="flex flex-col h-screen bg-gray-50">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Lab Results</h2>
                    <p className="text-gray-600 mt-2">Lab results management coming soon</p>
                  </div>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </Route>
        
        {/* Platform Footer Pages */}
        <Route path="/features" component={Features} />
        <Route path="/security" component={Security} />
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
        <Route path="/videos/:videoId" component={VideoPlayer} />
        <Route path="/videos/integration" component={VideoIntegrationOptions} />
        
        {/* Catch-all routes for docs */}
        <Route path="/docs/:slug" component={GettingStarted} />
        
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TranslationProvider>
          <AuthProvider>
            <TenantProvider>
              <Toaster />
              <AppContent />
            </TenantProvider>
          </AuthProvider>
        </TranslationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
