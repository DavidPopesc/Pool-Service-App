import { Role } from "@prisma/client";

export function canManageCustomers(role: Role) {
  return role === "OWNER";
}

export function canManagePools(role: Role) {
  return role === "OWNER";
}

export function canManageJobs(role: Role) {
  return role === "OWNER" || role === "OPERATIONS_MANAGER";
}

export function canViewOps(role: Role) {
  return role === "OWNER" || role === "OPERATIONS_MANAGER";
}

export function canManageTeam(role: Role) {
  return role === "OWNER";
}

export function canSendCustomerUpdates(role: Role) {
  return role === "OWNER" || role === "OPERATIONS_MANAGER";
}
