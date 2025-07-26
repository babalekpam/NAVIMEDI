import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { TenantProvider } from "@/contexts/tenant-context";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ProtectedRoute } from "@/components/layout/protected-route";
import LandingPage from "@/pages/landing";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients";
import Appointments from "@/pages/appointments";
import Prescriptions from "@/pages/prescriptions";
import LabOrders from "@/pages/lab-orders";
import Billing from "@/pages/billing";
import TenantManagement from "@/pages/tenant-management";
import AuditLogs from "@/pages/audit-logs";



function AppContent() {
  return (
    <div className="min-h-screen">
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={Login} />
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
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <TenantProvider>
            <Toaster />
            <AppContent />
          </TenantProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
