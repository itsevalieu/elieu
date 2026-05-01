export interface SystemLog {
  id: number;
  severity: string;
  service: string;
  message: string;
  stackTrace: string | null;
  endpoint: string | null;
  loggedAt: string;
}

export interface AdminAuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  detail: Record<string, unknown> | null;
  performedAt: string;
}
