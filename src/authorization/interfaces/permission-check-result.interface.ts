export interface PermissionCheckResult {
  granted: boolean;
  scope?: string;
  filter?: string;
  message?: string;
}