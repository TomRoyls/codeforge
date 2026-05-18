import type { SecurityRule, SecurityFinding } from './types.js'

const securityRegexCache = new Map<string, RegExp>()

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return Math.abs(hash)
}

export class PatternMatcher {
  private rules: Map<string, SecurityRule> = new Map()

  constructor(rules: SecurityRule[] = []) {
    for (const rule of rules) {
      this.rules.set(rule.id, rule)
    }
  }

  addRule(rule: SecurityRule): void {
    this.rules.set(rule.id, rule)
  }

  removeRule(id: string): boolean {
    return this.rules.delete(id)
  }

  match(content: string, file: string): SecurityFinding[] {
    const findings: SecurityFinding[] = []
    for (const rule of this.rules.values()) {
      findings.push(...this.matchWithRule(rule, content, file))
    }
    return findings
  }

  matchWithRule(rule: SecurityRule, content: string, file: string): SecurityFinding[] {
    const findings: SecurityFinding[] = []
    const lines = content.split('\n')
    const lineStarts = this.buildLineStarts(content)

    for (const pattern of rule.patterns) {
      let regex = securityRegexCache.get(pattern.regex)
      if (!regex) {
        regex = new RegExp(pattern.regex, 'g')
        securityRegexCache.set(pattern.regex, regex)
      }
      regex.lastIndex = 0
      let match: RegExpExecArray | null

      while ((match = regex.exec(content)) !== null) {
        const offset = match.index
        const line = this.getLineNumber(lineStarts, offset)
        const column = this.getColumnNumber(lineStarts, offset)
        const lineContent = lines[line - 1] ?? ''
        const fileHash = simpleHash(file)

        const finding: SecurityFinding = {
          id: `${rule.id}-${fileHash}-${line}-${column}`,
          ruleId: rule.id,
          severity: rule.severity,
          message: pattern.message,
          file,
          line,
          column,
          codeSnippet: lineContent.trim(),
        }

        if (pattern.fix) {
          finding.fix = pattern.fix
        }

        findings.push(finding)
      }
    }

    return findings
  }

  getRules(): SecurityRule[] {
    return [...this.rules.values()]
  }

  getRule(id: string): SecurityRule | undefined {
    return this.rules.get(id)
  }

  static getDefaultRules(): SecurityRule[] {
    return [
      {
        id: 'SEC001',
        name: 'eval-usage',
        description: 'Detects usage of eval() which can lead to code injection attacks',
        severity: 'critical',
        patterns: [
          {
            regex: '\\beval\\s*\\(',
            message: 'Use of eval() detected. Avoid eval() as it can execute arbitrary code.',
            fix: {
              description: 'Replace eval() with a safer alternative such as JSON.parse() or Function constructor',
              replacement: 'JSON.parse()',
            },
          },
        ],
      },
      {
        id: 'SEC002',
        name: 'inner-html',
        description: 'Detects innerHTML assignment which can lead to XSS attacks',
        severity: 'high',
        patterns: [
          {
            regex: '\\.innerHTML\\s*=',
            message: 'Direct innerHTML assignment detected. This can lead to XSS vulnerabilities.',
            fix: {
              description: 'Use textContent or DOM manipulation methods instead',
              replacement: 'element.textContent = ...',
            },
          },
        ],
      },
      {
        id: 'SEC003',
        name: 'document-write',
        description: 'Detects document.write() which can lead to XSS and performance issues',
        severity: 'high',
        patterns: [
          {
            regex: 'document\\.write\\s*\\(',
            message: 'Use of document.write() detected. This can lead to XSS and performance issues.',
            fix: {
              description: 'Use DOM manipulation methods like appendChild() instead',
              replacement: 'element.appendChild()',
            },
          },
        ],
      },
      {
        id: 'SEC004',
        name: 'sql-injection',
        description: 'Detects potential SQL injection via string concatenation',
        severity: 'critical',
        patterns: [
          {
            regex: '(?:SELECT|INSERT|UPDATE|DELETE|DROP)\\s+.*[\'"`]\\s*\\+|\\+\\s*[\'"`].*(?:FROM|WHERE|INSERT|UPDATE|DELETE|DROP)',
            message: 'Potential SQL injection detected. Avoid string concatenation in SQL queries.',
            fix: {
              description: 'Use parameterized queries or prepared statements',
              replacement: 'Use parameterized queries',
            },
          },
        ],
      },
      {
        id: 'SEC005',
        name: 'hardcoded-secrets',
        description: 'Detects hard-coded passwords and secrets in source code',
        severity: 'high',
        patterns: [
          {
            regex: '(?:password|passwd|pwd|secret|api[_-]?key|token|auth[_-]?key)\\s*[:=]\\s*[\'"`][^\'"`]{3,}[\'"`]',
            message: 'Hard-coded secret or password detected. Use environment variables instead.',
            fix: {
              description: 'Move secrets to environment variables or a secure vault',
              replacement: 'process.env.SECRET_NAME',
            },
          },
        ],
      },
      {
        id: 'SEC006',
        name: 'dangerous-react-html',
        description: 'Detects dangerouslySetInnerHTML which can lead to XSS',
        severity: 'high',
        patterns: [
          {
            regex: 'dangerouslySetInnerHTML',
            message: 'Use of dangerouslySetInnerHTML detected. Ensure content is properly sanitized.',
            fix: {
              description: 'Sanitize HTML content using a library like DOMPurify',
              replacement: 'Use DOMPurify.sanitize() before rendering',
            },
          },
        ],
      },
      {
        id: 'SEC007',
        name: 'url-redirect',
        description: 'Detects unvalidated URL redirects that could be exploited for phishing',
        severity: 'medium',
        patterns: [
          {
            regex: '(?:location\\.href|window\\.location|res\\.redirect|response\\.redirect)\\s*=\\s*[^;\\n]+',
            message: 'Unvalidated URL redirect detected. Validate and sanitize redirect targets.',
          },
        ],
      },
      {
        id: 'SEC008',
        name: 'prototype-pollution',
        description: 'Detects prototype pollution access patterns',
        severity: 'high',
        patterns: [
          {
            regex: '(?:__proto__|constructor\\s*\\[\\s*[\'"`]prototype[\'"`]\\s*\\])',
            message: 'Prototype pollution access detected. Avoid modifying Object.prototype.',
            fix: {
              description: 'Use Object.create(null) or Map instead of plain objects',
              replacement: 'Object.create(null)',
            },
          },
        ],
      },
      {
        id: 'SEC009',
        name: 'shell-injection',
        description: 'Detects use of exec/spawn with shell:true which can lead to command injection',
        severity: 'critical',
        patterns: [
          {
            regex: '(?:exec|execSync|spawn|spawnSync)\\s*\\([^)]*shell\\s*:\\s*true',
            message: 'Shell execution with shell:true detected. This can lead to command injection.',
            fix: {
              description: 'Use execFileSync or pass arguments as an array without shell:true',
              replacement: 'Use execFileSync with array arguments',
            },
          },
        ],
      },
      {
        id: 'SEC010',
        name: 'regex-dos',
        description: 'Detects regex patterns vulnerable to catastrophic backtracking (ReDoS)',
        severity: 'medium',
        patterns: [
          {
            regex: '(?:\\([^)]*[+*][^)]*\\))[{][\\d,]+[}]|(?:\\([\\w\\\\]+[+*]\\))+[+*]',
            message: 'Potentially unsafe regex pattern detected. This may be vulnerable to ReDoS attacks.',
          },
        ],
      },
    ]
  }

  private getLineNumber(_lineStarts: number[], offset: number): number {
    let lo = 0
    let hi = _lineStarts.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      if (_lineStarts[mid]! <= offset) lo = mid + 1
      else hi = mid - 1
    }
    return lo
  }

  private getColumnNumber(lineStarts: number[], offset: number): number {
    const line = this.getLineNumber(lineStarts, offset)
    const lineStart = lineStarts[line - 1] ?? 0
    return offset - lineStart + 1
  }

  private buildLineStarts(content: string): number[] {
    const starts = [0]
    for (let i = 0; i < content.length; i++) {
      if (content[i] === '\n') starts.push(i + 1)
    }
    return starts
  }
}
