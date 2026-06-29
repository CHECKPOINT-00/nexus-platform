/**
 * Structured audit logging for backend demo-critical operations.
 * All logs follow a consistent JSON format for observability.
 */

export interface AuditLogEntry {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  operation: string;
  actor_id: string;
  actor_role?: string;
  case_id?: string;
  resource_type?: string;
  resource_id?: string;
  action: string;
  old_state?: Record<string, any>;
  new_state?: Record<string, any>;
  metadata?: Record<string, any>;
  error_code?: string;
  error_message?: string;
  duration_ms?: number;
}

class AuditLogger {
  private shouldLog(): boolean {
    return process.env.NODE_ENV !== "test";
  }

  private format(entry: AuditLogEntry): string {
    return JSON.stringify(entry);
  }

  log(entry: Omit<AuditLogEntry, "timestamp" | "level">): void {
    if (!this.shouldLog()) return;
    console.log(
      this.format({
        timestamp: new Date().toISOString(),
        level: "INFO",
        ...entry,
      }),
    );
  }

  warn(entry: Omit<AuditLogEntry, "timestamp" | "level">): void {
    if (!this.shouldLog()) return;
    console.warn(
      this.format({
        timestamp: new Date().toISOString(),
        level: "WARN",
        ...entry,
      }),
    );
  }

  error(entry: Omit<AuditLogEntry, "timestamp" | "level">): void {
    if (!this.shouldLog()) return;
    console.error(
      this.format({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        ...entry,
      }),
    );
  }

  startTimer(): () => number {
    const start = Date.now();
    return () => Date.now() - start;
  }
}

export const auditLogger = new AuditLogger();
