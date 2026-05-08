import type {
  LintSeverity,
  LintRule,
  LintViolation,
  LintResult,
  LintConfig,
} from './types.js'

const DEFAULT_CONFIG: LintConfig = {
  rules: [],
  maxViolations: -1,
  ignorePatterns: [],
  failOnWarnings: false,
}

function createBuiltinRules(): LintRule[] {
  return [
    {
      id: 'no-trailing-spaces',
      description: 'Detect trailing whitespace',
      severity: 'warning',
      check: (line: string, lineNumber: number): LintViolation[] => {
        const trimmed = line.trimEnd()
        if (trimmed.length === line.length) return []
        return [
          {
            ruleId: 'no-trailing-spaces',
            message: 'Trailing whitespace detected',
            line: lineNumber,
            column: trimmed.length + 1,
            severity: 'warning',
            fix: trimmed,
          },
        ]
      },
    },
    {
      id: 'no-tabs',
      description: 'Detect tab characters',
      severity: 'warning',
      check: (line: string, lineNumber: number): LintViolation[] => {
        const violations: LintViolation[] = []
        let idx = line.indexOf('\t')
        while (idx !== -1) {
          violations.push({
            ruleId: 'no-tabs',
            message: 'Unexpected tab character',
            line: lineNumber,
            column: idx + 1,
            severity: 'warning',
          })
          idx = line.indexOf('\t', idx + 1)
        }
        return violations
      },
    },
    {
      id: 'max-line-length',
      description: 'Detect lines over 120 chars',
      severity: 'warning',
      check: (line: string, lineNumber: number): LintViolation[] => {
        if (line.length <= 120) return []
        return [
          {
            ruleId: 'max-line-length',
            message: `Line exceeds maximum length of 120 characters (${line.length})`,
            line: lineNumber,
            column: 121,
            severity: 'warning',
          },
        ]
      },
    },
    {
      id: 'no-console',
      description: 'Detect console.log/warn/error calls',
      severity: 'warning',
      check: (line: string, lineNumber: number): LintViolation[] => {
        const violations: LintViolation[] = []
        const methods = ['log', 'warn', 'error']
        for (const method of methods) {
          const pattern = new RegExp(`\\bconsole\\.${method}\\s*\\(`)
          const idx = line.search(pattern)
          if (idx !== -1) {
            violations.push({
              ruleId: 'no-console',
              message: `Unexpected console.${method} call`,
              line: lineNumber,
              column: idx + 1,
              severity: 'warning',
            })
          }
        }
        return violations
      },
    },
    {
      id: 'no-debugger',
      description: 'Detect debugger statements',
      severity: 'error',
      check: (line: string, lineNumber: number): LintViolation[] => {
        const idx = line.search(/\bdebugger\b/)
        if (idx === -1) return []
        return [
          {
            ruleId: 'no-debugger',
            message: 'Unexpected debugger statement',
            line: lineNumber,
            column: idx + 1,
            severity: 'error',
          },
        ]
      },
    },
    {
      id: 'no-unused-var',
      description: 'Detect var keyword usage',
      severity: 'warning',
      check: (line: string, lineNumber: number): LintViolation[] => {
        const idx = line.search(/\bvar\b/)
        if (idx === -1) return []
        return [
          {
            ruleId: 'no-unused-var',
            message: 'Unexpected var, use let or const instead',
            line: lineNumber,
            column: idx + 1,
            severity: 'warning',
          },
        ]
      },
    },
  ]
}

export class CodeLinter {
  private config: LintConfig
  private customRules: Map<string, LintRule>
  private builtinRules: LintRule[]

  constructor(config: Partial<LintConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.builtinRules = createBuiltinRules()
    this.customRules = new Map()
    for (const rule of this.config.rules) {
      if (!this.builtinRules.some((r) => r.id === rule.id)) {
        this.customRules.set(rule.id, rule)
      }
    }
  }

  lint(code: string): LintResult {
    const lines = code.split('\n')
    const allViolations: LintViolation[] = []
    const allRules = this.getRules()

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line === undefined) continue

      if (this.shouldIgnoreLine(line)) continue

      for (const rule of allRules) {
        const violations = rule.check(line, i + 1)
        allViolations.push(...violations)
      }
    }

    const violations =
      this.config.maxViolations < 0
        ? allViolations
        : allViolations.slice(0, this.config.maxViolations)

    return this.buildResult(violations, lines.length)
  }

  lintLine(line: string, lineNumber: number): LintViolation[] {
    if (this.shouldIgnoreLine(line)) return []

    const allRules = this.getRules()
    const violations: LintViolation[] = []

    for (const rule of allRules) {
      const ruleViolations = rule.check(line, lineNumber)
      violations.push(...ruleViolations)
    }

    return violations
  }

  addRule(rule: LintRule): boolean {
    if (
      this.customRules.has(rule.id) ||
      this.builtinRules.some((r) => r.id === rule.id)
    ) {
      return false
    }
    this.customRules.set(rule.id, rule)
    return true
  }

  removeRule(ruleId: string): boolean {
    return this.customRules.delete(ruleId)
  }

  getRules(): LintRule[] {
    return [...this.builtinRules, ...this.customRules.values()]
  }

  getRule(id: string): LintRule | undefined {
    const builtin = this.builtinRules.find((r) => r.id === id)
    if (builtin) return builtin
    return this.customRules.get(id)
  }

  hasViolations(result: LintResult): boolean {
    return result.violations.length > 0
  }

  hasErrors(result: LintResult): boolean {
    return result.violations.some((v) => v.severity === 'error')
  }

  getViolationsBySeverity(result: LintResult, severity: LintSeverity): LintViolation[] {
    return result.violations.filter((v) => v.severity === severity)
  }

  getViolationsByRule(result: LintResult, ruleId: string): LintViolation[] {
    return result.violations.filter((v) => v.ruleId === ruleId)
  }

  getConfig(): LintConfig {
    return { ...this.config, rules: [...this.config.rules] }
  }

  reset(): void {
    this.customRules.clear()
    this.config = { ...DEFAULT_CONFIG }
  }

  countByRule(violations: LintViolation[]): Map<string, number> {
    const counts = new Map<string, number>()
    for (const v of violations) {
      const current = counts.get(v.ruleId) ?? 0
      counts.set(v.ruleId, current + 1)
    }
    return counts
  }

  countBySeverity(violations: LintViolation[]): Record<LintSeverity, number> {
    return {
      error: violations.filter((v) => v.severity === 'error').length,
      warning: violations.filter((v) => v.severity === 'warning').length,
      info: violations.filter((v) => v.severity === 'info').length,
    }
  }

  private shouldIgnoreLine(line: string): boolean {
    for (const pattern of this.config.ignorePatterns) {
      if (line.includes(pattern)) return true
    }
    return false
  }

  private buildResult(violations: LintViolation[], totalLines: number): LintResult {
    return {
      violations,
      errorCount: violations.filter((v) => v.severity === 'error').length,
      warningCount: violations.filter((v) => v.severity === 'warning').length,
      infoCount: violations.filter((v) => v.severity === 'info').length,
      totalLines,
    }
  }
}
