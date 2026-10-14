import { describe, it, expect } from 'vitest';
import { generateHash, createAuditLog, ROLE_PERMISSIONS } from '../security';

describe('Security & RBAC Enforcement Suite', () => {
  it('generates reproducible hashes with sha256 prefix', () => {
    const hash = generateHash('Ambattur-Stock-Audit-Record');
    expect(hash).toContain('sha256_');
    expect(hash.length).toBeGreaterThan(10);
  });

  it('creates complete audit log entries with timestamp and role', () => {
    const log = createAuditLog('Admin', 'Owner', 'CALCULATION_CYCLE', 'Updated thresholds');
    expect(log.user).toBe('Admin');
    expect(log.role).toBe('Owner');
    expect(log.action).toBe('CALCULATION_CYCLE');
    expect(log.details).toBe('Updated thresholds');
    expect(log.hash).toContain('sha256_');
  });

  it('enforces strict role-based access control (RBAC)', () => {
    // Owner has full rights
    expect(ROLE_PERMISSIONS.Owner.canEditRules).toBe(true);
    expect(ROLE_PERMISSIONS.Owner.canConfigureSecurity).toBe(true);

    // Auditor has read & export rights but NO modification rights
    expect(ROLE_PERMISSIONS.Auditor.canEditStock).toBe(false);
    expect(ROLE_PERMISSIONS.Auditor.canEditRules).toBe(false);
    expect(ROLE_PERMISSIONS.Auditor.canExportReports).toBe(true);

    // Read Only cannot export or edit
    expect(ROLE_PERMISSIONS['Read Only'].canEditStock).toBe(false);
    expect(ROLE_PERMISSIONS['Read Only'].canExportReports).toBe(false);
  });
});
