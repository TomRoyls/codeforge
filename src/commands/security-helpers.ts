// ─── Interfaces ──────────────────────────────────────────

export type Severity = 'critical' | 'high' | 'medium' | 'low'

export type Category = 'secrets' | 'injection' | 'crypto' | 'xss' | 'auth' | 'config' | 'dos'

export interface SecurityFinding {
  rule: string
  title: string
  severity: Severity
  category: Category
  file: string
  line: number
  column: number
  match: string
  context: string
  remediation: string
}

export interface SecurityStats {
  total: number
  critical: number
  high: number
  medium: number
  low: number
  byCategory: Record<string, number>
  byFile: Record<string, number>
}

export interface SecurityResult {
  findings: SecurityFinding[]
  stats: SecurityStats
  files: string[]
}

export interface SecurityRule {
  id: string
  title: string
  severity: Severity
  category: Category
  pattern: RegExp
  remediation: string
}

export interface ScanOptions {
  severity?: Severity
  ignorePatterns?: string[]
}

// ─── Security Rules ─────────────────────────────────────

/**
 * Returns all security scanning rules with their regex patterns and metadata.
 *
 * @example
 * const rules = getSecurityRules()
 * console.log(rules.length) // 15
 */
export function getSecurityRules(): SecurityRule[] {
  return [
    {
      category: 'secrets',
      id: 'SEC001',
      pattern: /api[_-]?key\s*[:=]\s*['"][^'"]{20,}['"]/i,
      remediation: 'Use environment variables or a secrets manager instead of hardcoding API keys.',
      severity: 'critical',
      title: 'Hardcoded API Key',
    },
    {
      category: 'secrets',
      id: 'SEC002',
      pattern: /(password|secret|token|credential)\s*[:=]\s*['"][^'"]{8,}['"]/i,
      remediation: 'Store credentials in environment variables or a secrets manager.',
      severity: 'critical',
      title: 'Hardcoded Secret/Password',
    },
    {
      category: 'injection',
      id: 'SEC003',
      pattern: /\beval\s*\(/,
      remediation: 'Avoid eval(). Use safer alternatives like JSON.parse() for data or Function constructor only when necessary.',
      severity: 'high',
      title: 'eval() usage',
    },
    {
      category: 'injection',
      id: 'SEC004',
      pattern:
        /query\s*\(|execute\s*\(|sql\s*[+`].*\$\{|SELECT.*\+\s*['"`]|\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE)/i,
      remediation: 'Use parameterized queries or an ORM to prevent SQL injection.',
      severity: 'high',
      title: 'SQL string interpolation',
    },
    {
      category: 'xss',
      id: 'SEC005',
      pattern: /\.innerHTML\s*=/,
      remediation: 'Use textContent or a sanitization library to prevent XSS.',
      severity: 'high',
      title: 'innerHTML assignment',
    },
    {
      category: 'xss',
      id: 'SEC006',
      pattern: /document\.write\s*\(/,
      remediation: 'Use DOM manipulation methods like textContent or createElement instead.',
      severity: 'medium',
      title: 'document.write',
    },
    {
      category: 'config',
      id: 'SEC007',
      pattern: /http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0)[^\s'"]+/,
      remediation: 'Use HTTPS instead of HTTP for production connections.',
      severity: 'medium',
      title: 'Insecure HTTP URL',
    },
    {
      category: 'crypto',
      id: 'SEC008',
      pattern: /Math\.random\(\)/,
      remediation: 'Use crypto.randomBytes() or window.crypto.getRandomValues() for cryptographic purposes.',
      severity: 'medium',
      title: 'Math.random() for crypto',
    },
    {
      category: 'config',
      id: 'SEC009',
      pattern: /\/\/\s*(TODO|FIXME).*security/i,
      remediation: 'Resolve the security-related TODO/FIXME item.',
      severity: 'low',
      title: 'TODO security comment',
    },
    {
      category: 'secrets',
      id: 'SEC010',
      pattern: /console\.log\s*\(.*(?:password|token|secret|key|credential)/i,
      remediation: 'Remove sensitive data from console.log statements.',
      severity: 'medium',
      title: 'Console.log with sensitive data',
    },
    {
      category: 'injection',
      id: 'SEC011',
      pattern: /__proto__|prototype\[.*\]\s*=/,
      remediation: 'Avoid modifying __proto__ or prototype to prevent prototype pollution.',
      severity: 'high',
      title: 'Prototype pollution',
    },
    {
      category: 'injection',
      id: 'SEC012',
      pattern: /(?:const|let|var)\s+\w+\s*=\s*JSON\.parse\s*\(/,
      remediation: 'Validate and sanitize input before parsing JSON.',
      severity: 'low',
      title: 'Unsafe JSON.parse',
    },
    {
      category: 'secrets',
      id: 'SEC013',
      pattern: /process\.env\.\w+.*(?:send|transmit|post|fetch|axios)/i,
      remediation: 'Do not send environment variables directly over the network.',
      severity: 'high',
      title: 'Process env exposure',
    },
    {
      category: 'config',
      id: 'SEC014',
      pattern: /(rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0)/,
      remediation: 'Do not disable TLS certificate verification in production.',
      severity: 'critical',
      title: 'Disabled TLS verification',
    },
    {
      category: 'config',
      id: 'SEC015',
      pattern: /connect\s*\(\s*['"]\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
      remediation: 'Use hostnames instead of hardcoded IP addresses for connections.',
      severity: 'low',
      title: 'Hardcoded IP in connection',
    },
  ]
}

// ─── Context extraction ─────────────────────────────────

/**
 * Extract surrounding code context for a finding.
 *
 * @example
 * const ctx = extractContext(lines, 5, 2)
 */
export function extractContext(lines: string[], lineIndex: number, contextRadius: number = 2): string {
  const start = Math.max(0, lineIndex - contextRadius)
  const end = Math.min(lines.length - 1, lineIndex + contextRadius)
  const contextLines: string[] = []
  for (let i = start; i <= end; i++) {
    const line = lines[i]
    if (line !== undefined) contextLines.push(line)
  }
  return contextLines.join('\n')
}

// ─── File scanning ──────────────────────────────────────

/**
 * Scan a single file's content against all security rules.
 *
 * @example
 * const findings = scanFile(content, 'app.ts', rules)
 */
export function scanFile(content: string, filePath: string, rules: SecurityRule[]): SecurityFinding[] {
  const findings: SecurityFinding[] = []
  const lines = content.split('\n')

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]
    if (!line) continue

    for (const rule of rules) {
      const match = rule.pattern.exec(line)
      if (match) {
        const column = match.index + 1
        findings.push({
          category: rule.category,
          column,
          context: extractContext(lines, lineIndex),
          file: filePath,
          line: lineIndex + 1,
          match: match[0],
          remediation: rule.remediation,
          rule: rule.id,
          severity: rule.severity,
          title: rule.title,
        })
      }
    }
  }

  return findings
}

// ─── Stats computation ──────────────────────────────────

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

/**
 * Compute aggregate statistics from a list of findings.
 *
 * @example
 * const stats = computeSecurityStats(findings)
 * console.log(stats.critical) // number of critical findings
 */
export function computeSecurityStats(findings: SecurityFinding[]): SecurityStats {
  const stats: SecurityStats = {
    byCategory: {},
    byFile: {},
    critical: 0,
    high: 0,
    low: 0,
    medium: 0,
    total: findings.length,
  }

  for (const finding of findings) {
    const sev = finding.severity
    if (sev === 'critical') stats.critical++
    else if (sev === 'high') stats.high++
    else if (sev === 'medium') stats.medium++
    else stats.low++
    stats.byCategory[finding.category] = (stats.byCategory[finding.category] ?? 0) + 1
    stats.byFile[finding.file] = (stats.byFile[finding.file] ?? 0) + 1
  }

  return stats
}

// ─── Severity ordering ──────────────────────────────────

/**
 * Sort findings by severity (critical first).
 *
 * @example
 * const sorted = sortFindingsBySeverity(findings)
 */
export function sortFindingsBySeverity(findings: SecurityFinding[]): SecurityFinding[] {
  return [...findings].sort((a, b) => {
    const diff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
    if (diff !== 0) return diff
    return a.line - b.line
  })
}

// ─── Result building ────────────────────────────────────

/**
 * Orchestrate scanning of multiple files and build the final result.
 *
 * @example
 * const result = await buildSecurityResult(files, reader, { severity: 'high' })
 */
export async function buildSecurityResult(
  files: string[],
  contentReader: (filePath: string) => Promise<string>,
  options?: ScanOptions,
): Promise<SecurityResult> {
  const rules = getSecurityRules()
  const findings: SecurityFinding[] = []

  for (const file of files) {
    const content = await contentReader(file)
    const fileFindings = scanFile(content, file, rules)
    findings.push(...fileFindings)
  }

  let filtered = findings
  if (options?.severity) {
    const threshold = SEVERITY_ORDER[options.severity]
    filtered = findings.filter((f) => SEVERITY_ORDER[f.severity] <= threshold)
  }

  if (options?.ignorePatterns && options.ignorePatterns.length > 0) {
    filtered = filtered.filter((f) => {
      for (const pattern of options.ignorePatterns!) {
        if (f.file.includes(pattern) || f.title.includes(pattern) || f.rule.includes(pattern)) {
          return false
        }
      }
      return true
    })
  }

  const sorted = sortFindingsBySeverity(filtered)
  const stats = computeSecurityStats(sorted)

  return {
    files,
    findings: sorted,
    stats,
  }
}
