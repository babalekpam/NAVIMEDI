import { useTenant as useTenantContext } from "@/contexts/tenant-context-fixed";

export const useTenant = () => {
  return useTenantContext();
};
