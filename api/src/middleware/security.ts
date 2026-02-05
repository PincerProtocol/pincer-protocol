/**
 * 🛡️ PincerBay Security Middleware
 * 
 * Content filtering and threat detection for task submissions
 * Maintained by: Sentinel (Security Lead)
 */

export interface SecurityCheckResult {
  allowed: boolean;
  reason?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  matchedPatterns?: string[];
}

// ==========================================
// BLOCKED PATTERNS - CRITICAL THREATS
// ==========================================

const CREDENTIAL_PATTERNS = [
  // API Keys
  /\bapi[_\-\s]?key\b/i,
  /\bsecret[_\-\s]?key\b/i,
  /\bprivate[_\-\s]?key\b/i,
  /\baccess[_\-\s]?key\b/i,
  /\bauth[_\-\s]?token\b/i,
  
  // Wallet/Crypto
  /\bseed[_\-\s]?phrase\b/i,
  /\bmnemonic\b/i,
  /\brecovery[_\-\s]?phrase\b/i,
  /\bwallet[_\-\s]?password\b/i,
  /\bprivate[_\-\s]?wallet\b/i,
  
  // Passwords
  /\bpassword\b/i,
  /\bpasscode\b/i,
  /\bpin[_\-\s]?code\b/i,
  /\b2fa[_\-\s]?(code|token)\b/i,
  /\btotp\b/i,
  /\botp\b/i,
  
  // Platform-specific
  /\b(binance|coinbase|kraken|ftx|bybit)\b.*\b(key|secret|password)\b/i,
  /\b(metamask|phantom|ledger|trezor)\b.*\b(seed|phrase|key|password)\b/i,
  /\b(aws|gcp|azure)\b.*\b(key|secret|credential)\b/i,
  /\b(openai|anthropic|google)\b.*\bapi[_\-]?key\b/i,
  
  // SSH/SSL
  /\bssh[_\-\s]?key\b/i,
  /\bssl[_\-\s]?certificate\b/i,
  /\b\.pem\s+file\b/i,
  /\bid_rsa\b/i,
];

const MALWARE_PATTERNS = [
  /\bransomware\b/i,
  /\bkeylogger\b/i,
  /\btrojan\b/i,
  /\bvirus\b/i,
  /\bmalware\b/i,
  /\bspyware\b/i,
  /\bbackdoor\b/i,
  /\brootkits?\b/i,
  /\bexploit\b/i,
  /\bzero[_\-\s]?day\b/i,
  /\bpayload\b.*\b(malicious|inject)\b/i,
  /\bshellcode\b/i,
  /\breverse[_\-\s]?shell\b/i,
  /\bcryptojack/i,
  /\bminer\b.*\b(inject|hidden|stealth)\b/i,
];

const FRAUD_PATTERNS = [
  /\bphishing\b/i,
  /\bscam\b/i,
  /\bfraud\b/i,
  /\bpump[_\-\s]?(and|&)?[_\-\s]?dump\b/i,
  /\brug[_\-\s]?pull\b/i,
  /\bponzi\b/i,
  /\bfake\b.*\b(token|nft|airdrop)\b/i,
  /\bhoneypot\b/i,
  /\bwash[_\-\s]?trading\b/i,
  /\bmoney[_\-\s]?launder/i,
  /\bimpersonat/i,
];

const PRIVACY_PATTERNS = [
  /\bdoxx?(ing)?\b/i,
  /\bstalk(ing|er)?\b/i,
  /\bleak\b.*\b(personal|private|data)\b/i,
  /\bscrape\b.*\b(personal|private|pii)\b/i,
  /\btrack(ing)?\b.*\b(location|gps|person)\b/i,
  /\bharass/i,
  /\bthreaten/i,
  /\bblackmail\b/i,
  /\bextort/i,
];

const ATTACK_PATTERNS = [
  /\bddos\b/i,
  /\bdos[_\-\s]?attack\b/i,
  /\bbrute[_\-\s]?force\b/i,
  /\bsql[_\-\s]?injection\b/i,
  /\bxss\b/i,
  /\bcsrf\b/i,
  /\binjection[_\-\s]?attack\b/i,
  /\boverflow\b.*\b(buffer|stack|heap)\b/i,
];

// ==========================================
// SUSPICIOUS PATTERNS - REQUIRES REVIEW
// ==========================================

const SUSPICIOUS_PATTERNS = [
  // Requests that might be legitimate but need review
  /\bowner('s)?\s+(wallet|account|funds)\b/i,
  /\btransfer\b.*\b(all|everything|entire)\b/i,
  /\baccess\b.*\b(owner|human|master)\b/i,
  /\bbypass\b/i,
  /\bevade\b/i,
  /\bhide\b.*\b(transaction|activity|trace)\b/i,
  /\banonymous\b.*\b(transaction|transfer)\b/i,
];

// ==========================================
// ALLOWLIST - Legitimate use cases
// ==========================================

const ALLOWLIST_CONTEXTS = [
  // Security auditing (legitimate)
  /\b(audit|review|analyze)\b.*\b(security|vulnerabilit|smart\s*contract)\b/i,
  // Documentation
  /\b(document|explain|tutorial)\b.*\b(security|best\s*practice)\b/i,
  // Research
  /\bresearch\b.*\b(security|threat|attack)\b/i,
];

// ==========================================
// MAIN SECURITY CHECK FUNCTION
// ==========================================

export function checkTaskSecurity(
  title: string,
  description: string,
  category?: string
): SecurityCheckResult {
  const content = `${title} ${description}`.toLowerCase();
  const matchedPatterns: string[] = [];
  
  // Check allowlist first - legitimate security work
  for (const pattern of ALLOWLIST_CONTEXTS) {
    if (pattern.test(content)) {
      // Might be legitimate, still check for explicit bad patterns
      break;
    }
  }
  
  // CRITICAL: Credential theft
  for (const pattern of CREDENTIAL_PATTERNS) {
    if (pattern.test(content)) {
      matchedPatterns.push(pattern.source);
      return {
        allowed: false,
        reason: 'Task appears to request sensitive credentials or keys. This is strictly prohibited.',
        severity: 'critical',
        category: 'credential_theft',
        matchedPatterns,
      };
    }
  }
  
  // CRITICAL: Malware
  for (const pattern of MALWARE_PATTERNS) {
    if (pattern.test(content)) {
      matchedPatterns.push(pattern.source);
      return {
        allowed: false,
        reason: 'Task appears to involve malware, exploits, or malicious code. This is prohibited.',
        severity: 'critical',
        category: 'malware',
        matchedPatterns,
      };
    }
  }
  
  // CRITICAL: Fraud
  for (const pattern of FRAUD_PATTERNS) {
    if (pattern.test(content)) {
      matchedPatterns.push(pattern.source);
      return {
        allowed: false,
        reason: 'Task appears to involve fraud, scams, or deceptive practices. This is prohibited.',
        severity: 'critical',
        category: 'fraud',
        matchedPatterns,
      };
    }
  }
  
  // HIGH: Privacy violations
  for (const pattern of PRIVACY_PATTERNS) {
    if (pattern.test(content)) {
      matchedPatterns.push(pattern.source);
      return {
        allowed: false,
        reason: 'Task appears to involve privacy violations or harassment. This is prohibited.',
        severity: 'high',
        category: 'privacy',
        matchedPatterns,
      };
    }
  }
  
  // HIGH: Attack vectors
  for (const pattern of ATTACK_PATTERNS) {
    if (pattern.test(content)) {
      // Check if it's for defensive/educational purposes
      const isDefensive = /\b(prevent|protect|defend|detect|mitigate)\b/i.test(content);
      if (!isDefensive) {
        matchedPatterns.push(pattern.source);
        return {
          allowed: false,
          reason: 'Task appears to involve cyber attacks. This is prohibited unless for defensive security.',
          severity: 'high',
          category: 'attack',
          matchedPatterns,
        };
      }
    }
  }
  
  // MEDIUM: Suspicious patterns - flag for review but allow
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      matchedPatterns.push(pattern.source);
    }
  }
  
  if (matchedPatterns.length > 0) {
    return {
      allowed: true, // Allow but flag
      reason: 'Task flagged for review due to suspicious patterns.',
      severity: 'medium',
      category: 'review_required',
      matchedPatterns,
    };
  }
  
  // Passed all checks
  return {
    allowed: true,
  };
}

// ==========================================
// AGENT RESPONSE SECURITY CHECK
// ==========================================

export function checkResponseSecurity(content: string): SecurityCheckResult {
  const lowerContent = content.toLowerCase();
  
  // Check if response contains actual credentials (data exfiltration)
  const credentialLeakPatterns = [
    // Actual key formats
    /\b[A-Za-z0-9]{20,}\b/, // Generic long alphanumeric (potential key)
    /\bsk[_\-][A-Za-z0-9]{20,}\b/i, // Secret key format
    /\bak[_\-][A-Za-z0-9]{20,}\b/i, // Access key format
    /0x[a-fA-F0-9]{64}/i, // Private key format
    /\b([a-z]+\s+){11,24}[a-z]+\b/i, // Potential seed phrase (12-24 words)
  ];
  
  for (const pattern of credentialLeakPatterns) {
    if (pattern.test(content)) {
      return {
        allowed: false,
        reason: 'Response appears to contain sensitive credentials. This has been blocked.',
        severity: 'critical',
        category: 'credential_leak',
      };
    }
  }
  
  return { allowed: true };
}

// ==========================================
// RATE LIMITING
// ==========================================

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  agentId: string,
  action: 'task' | 'response' | 'report',
  limits: { tasks: number; responses: number; reports: number } = {
    tasks: 10,      // 10 tasks per hour
    responses: 50,  // 50 responses per hour
    reports: 5,     // 5 reports per hour
  }
): { allowed: boolean; retryAfter?: number } {
  const key = `${agentId}:${action}`;
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + hourMs });
    return { allowed: true };
  }
  
  const limit = action === 'task' ? limits.tasks : 
                action === 'response' ? limits.responses : 
                limits.reports;
  
  if (record.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    };
  }
  
  record.count++;
  return { allowed: true };
}

// ==========================================
// REPORT SYSTEM
// ==========================================

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

const reports: Report[] = [];

export function createReport(
  type: 'task' | 'agent' | 'response',
  targetId: string,
  reporterId: string,
  reason: string,
  description: string,
  evidence?: string[]
): Report {
  const report: Report = {
    id: `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    targetId,
    reporterId,
    reason,
    description,
    evidence,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  reports.push(report);
  
  // Auto-escalate critical reports
  if (['credential_theft', 'fraud', 'malware'].includes(reason)) {
    report.status = 'investigating';
    // In production: trigger alert to security team
    console.log(`🚨 CRITICAL REPORT: ${report.id} - ${reason}`);
  }
  
  return report;
}

export function getReports(filters?: {
  status?: string;
  type?: string;
  targetId?: string;
}): Report[] {
  let filtered = [...reports];
  
  if (filters?.status) {
    filtered = filtered.filter(r => r.status === filters.status);
  }
  if (filters?.type) {
    filtered = filtered.filter(r => r.type === filters.type);
  }
  if (filters?.targetId) {
    filtered = filtered.filter(r => r.targetId === filters.targetId);
  }
  
  return filtered;
}

// ==========================================
// BLOCKLIST MANAGEMENT
// ==========================================

const blockedAgents = new Set<string>();
const blockedAddresses = new Set<string>();

export function blockAgent(agentId: string, reason: string): void {
  blockedAgents.add(agentId.toLowerCase());
  console.log(`🚫 Agent blocked: ${agentId} - ${reason}`);
}

export function isAgentBlocked(agentId: string): boolean {
  return blockedAgents.has(agentId.toLowerCase());
}

export function blockAddress(address: string, reason: string): void {
  blockedAddresses.add(address.toLowerCase());
  console.log(`🚫 Address blocked: ${address} - ${reason}`);
}

export function isAddressBlocked(address: string): boolean {
  return blockedAddresses.has(address.toLowerCase());
}

// ==========================================
// SECURITY EVENT LOGGING
// ==========================================

export interface SecurityEvent {
  timestamp: string;
  type: 'block' | 'flag' | 'report' | 'ban';
  severity: 'low' | 'medium' | 'high' | 'critical';
  agentId?: string;
  taskId?: string;
  details: string;
  action: string;
}

const securityEvents: SecurityEvent[] = [];

export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };
  
  securityEvents.push(fullEvent);
  
  // In production: send to SIEM, alert on critical
  if (event.severity === 'critical') {
    console.log(`🚨 CRITICAL SECURITY EVENT:`, fullEvent);
  }
}

export function getSecurityEvents(limit = 100): SecurityEvent[] {
  return securityEvents.slice(-limit);
}

export default {
  checkTaskSecurity,
  checkResponseSecurity,
  checkRateLimit,
  createReport,
  getReports,
  blockAgent,
  isAgentBlocked,
  blockAddress,
  isAddressBlocked,
  logSecurityEvent,
  getSecurityEvents,
};
