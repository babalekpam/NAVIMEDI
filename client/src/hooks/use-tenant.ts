import { useTenant as useTenantContext } from "@/contexts/tenant-context";

export const useTenant = () => {
  return useTenantContext();
};
