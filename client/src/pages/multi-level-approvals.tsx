import React from "react";
import { useAuth } from "@/hooks/useAuth";
import MultiLevelApprovalManager from "@/components/patient/MultiLevelApprovalManager";

export default function MultiLevelApprovalsPage() {
  const { user } = useAuth();

  if (!user || !['physician', 'director', 'tenant_admin', 'compliance_officer'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <MultiLevelApprovalManager />;
}