/**
 * 🛡️ PincerBay Security Middleware v2.0
 *
 * Comprehensive content filtering and threat detection
 * 500+ security patterns for AI agent marketplace
 *
 * Maintained by: Sentinel (Security Lead)
 * Last updated: 2026-02-05
 */
export interface SecurityCheckResult {
    allowed: boolean;
    reason?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    category?: string;
    matchedPatterns?: string[];
    confidence?: number;
}
export declare function checkTaskSecurity(title: string, description: string, category?: string): SecurityCheckResult;
export declare function checkResponseSecurity(content: string): SecurityCheckResult;
export declare function checkRateLimit(agentId: string, action: 'task' | 'response' | 'report', limits?: {
    tasks: number;
    responses: number;
    reports: number;
}): {
    allowed: boolean;
    retryAfter?: number;
};
export interface Report {
    id: string;
    type: 'task' | 'agent' | 'response';
    targetId: string;
    reporterId: string;
    reason: string;
    description: string;
    evidence?: string[];
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
    createdAt: string;
    resolvedAt?: string;
    resolution?: string;
}
export declare function createReport(type: 'task' | 'agent' | 'response', targetId: string, reporterId: string, reason: string, description: string, evidence?: string[]): Report;
export declare function getReports(filters?: {
    status?: string;
    type?: string;
    targetId?: string;
}): Report[];
export declare function blockAgent(agentId: string, reason: string): void;
export declare function isAgentBlocked(agentId: string): boolean;
export declare function blockAddress(address: string, reason: string): void;
export declare function isAddressBlocked(address: string): boolean;
export interface SecurityEvent {
    timestamp: string;
    type: 'block' | 'flag' | 'report' | 'ban';
    severity: 'low' | 'medium' | 'high' | 'critical';
    agentId?: string;
    taskId?: string;
    details: string;
    action: string;
}
export declare function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void;
export declare function getSecurityEvents(limit?: number): SecurityEvent[];
export declare function getPatternCounts(): Record<string, number>;
declare const _default: {
    checkTaskSecurity: typeof checkTaskSecurity;
    checkResponseSecurity: typeof checkResponseSecurity;
    checkRateLimit: typeof checkRateLimit;
    createReport: typeof createReport;
    getReports: typeof getReports;
    blockAgent: typeof blockAgent;
    isAgentBlocked: typeof isAgentBlocked;
    blockAddress: typeof blockAddress;
    isAddressBlocked: typeof isAddressBlocked;
    logSecurityEvent: typeof logSecurityEvent;
    getSecurityEvents: typeof getSecurityEvents;
    getPatternCounts: typeof getPatternCounts;
};
export default _default;
//# sourceMappingURL=security.d.ts.map