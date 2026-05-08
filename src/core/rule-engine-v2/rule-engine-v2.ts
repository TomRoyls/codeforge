import type {
  RuleV2,
  RuleSet,
  RuleOverride,
  RuleViolation,
  EngineResult,
} from './types.js'
import { RuleRegistryV2 } from './rule-registry-v2.js'
import { RuleComposer } from './rule-composer.js'

interface BuiltinPattern {
  pattern: RegExp
  message: string
  fix?: string
}

export class RuleEngineV2 {
  private registry: RuleRegistryV2 = new RuleRegistryV2()
  private composer: RuleComposer = new RuleComposer()
  private activeRules: Map<string, RuleV2> = new Map()
  private totalRuns = 0
  private totalViolations = 0
  private totalDuration = 0

  private builtinPatterns: Map<string, BuiltinPattern> = new Map([
    [
      'no-console',
      {
        pattern: /console\.(log|warn|error|info|debug)\s*\(/g,
        message: 'Unexpected console statement',
        fix: '',
      },
    ],
    [
      'no-eval',
      {
        pattern: /\beval\s*\(/g,
        message: 'eval() is a security risk',
      },
    ],
    [
      'no-debugger',
      {
        pattern: /\bdebugger\b/g,
        message: 'Unexpected debugger statement',
        fix: '',
      },
    ],
    [
      'no-var',
      {
        pattern: /\bvar\s+/g,
        message: 'Use let or const instead of var',
        fix: 'let ',
      },
    ],
    [
      'no-with',
      {
        pattern: /\bwith\s*\(/g,
        message: 'Unexpected with statement',
      },
    ],
    [
      'no-implicit-globals',
      {
        pattern: /^(?!\s*(?:const|let|var|function|class|export|import|\/\/|\/\*|\*|\/\/))/m,
        message: 'Possible implicit global',
      },
    ],
  ])

  constructor() {
    this.registerBuiltinRules()
  }

  private registerBuiltinRules(): void {
    const builtins: RuleV2[] = [
      {
        id: 'no-console',
        name: 'No Console',
        description: 'Disallow console statements',
        category: 'style',
        severity: 'warn',
        enabled: true,
        tags: ['style', 'logging'],
        dependencies: [],
        conflicts: [],
        fixable: true,
        deprecated: false,
        options: { allow: [] },
      },
      {
        id: 'no-eval',
        name: 'No Eval',
        description: 'Disallow eval() usage',
        category: 'security',
        severity: 'error',
        enabled: true,
        tags: ['security'],
        dependencies: [],
        conflicts: [],
        fixable: false,
        deprecated: false,
        options: {},
      },
      {
        id: 'no-debugger',
        name: 'No Debugger',
        description: 'Disallow debugger statements',
        category: 'correctness',
        severity: 'warn',
        enabled: true,
        tags: ['debugging'],
        dependencies: [],
        conflicts: [],
        fixable: true,
        deprecated: false,
        options: {},
      },
      {
        id: 'no-var',
        name: 'No Var',
        description: 'Disallow var keyword',
        category: 'style',
        severity: 'error',
        enabled: true,
        tags: ['style', 'es6'],
        dependencies: [],
        conflicts: [],
        fixable: true,
        deprecated: false,
        options: {},
      },
      {
        id: 'no-with',
        name: 'No With',
        description: 'Disallow with statements',
        category: 'correctness',
        severity: 'error',
        enabled: true,
        tags: ['correctness'],
        dependencies: [],
        conflicts: [],
        fixable: false,
        deprecated: false,
        options: {},
      },
    ]
    for (const rule of builtins) {
      this.registry.register(rule)
    }
  }

  getRegistry(): RuleRegistryV2 {
    return this.registry
  }

  registerRule(rule: RuleV2): void {
    this.registry.register(rule)
  }

  configure(ruleSet: RuleSet, overrides: RuleOverride[] = []): void {
    let rules = this.composer.flattenRuleSet(ruleSet, this.registry)
    if (overrides.length > 0) {
      rules = this.composer.applyOverrides(rules, overrides)
    }
    this.activeRules = rules
  }

  analyze(source: string, filePath: string): EngineResult {
    const start = performance.now()
    const violations: RuleViolation[] = []
    const rulesApplied: string[] = []
    const rulesSkipped: string[] = []
    const lines = source.split('\n')

    for (const [ruleId, rule] of this.activeRules) {
      if (!rule.enabled || rule.severity === 'off') {
        rulesSkipped.push(ruleId)
        continue
      }
      if (!this.isRuleApplicable(rule, filePath)) {
        rulesSkipped.push(ruleId)
        continue
      }

      rulesApplied.push(ruleId)
      const builtin = this.builtinPatterns.get(ruleId)
      if (builtin) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]!
          builtin.pattern.lastIndex = 0
          if (builtin.pattern.test(line)) {
            violations.push({
              ruleId,
              severity: rule.severity,
              message: builtin.message,
              filePath,
              line: i + 1,
              column: this.findColumn(line, builtin.pattern),
              fix: builtin.fix,
            })
          }
        }
      } else {
        const customPattern = rule.options['pattern'] as string | undefined
        if (customPattern) {
          try {
            const regex = new RegExp(customPattern, 'g')
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i]!
              regex.lastIndex = 0
              if (regex.test(line)) {
                violations.push({
                  ruleId,
                  severity: rule.severity,
                  message: rule.description,
                  filePath,
                  line: i + 1,
                  column: 1,
                })
              }
            }
          } catch {
            rulesSkipped.push(ruleId)
            rulesApplied.pop()
          }
        }
      }
    }

    const duration = performance.now() - start
    const stats = {
      errors: violations.filter((v) => v.severity === 'error').length,
      warnings: violations.filter((v) => v.severity === 'warn').length,
      info: violations.filter((v) => v.severity === 'info').length,
    }

    this.totalRuns++
    this.totalViolations += violations.length
    this.totalDuration += duration

    return { violations, rulesApplied, rulesSkipped, duration, stats }
  }

  private findColumn(line: string, pattern: RegExp): number {
    pattern.lastIndex = 0
    const match = pattern.exec(line)
    return match ? match.index + 1 : 1
  }

  analyzeMany(files: Map<string, string>): EngineResult[] {
    const results: EngineResult[] = []
    for (const [filePath, source] of files) {
      results.push(this.analyze(source, filePath))
    }
    return results
  }

  isRuleApplicable(rule: RuleV2, filePath: string): boolean {
    if (!rule.enabled) return false
    if (rule.deprecated && rule.replacedBy) return false
    const excludePatterns = rule.options['exclude'] as string[] | undefined
    if (excludePatterns) {
      for (const pattern of excludePatterns) {
        if (filePath.includes(pattern)) {
          return false
        }
      }
    }
    const includePatterns = rule.options['include'] as string[] | undefined
    if (includePatterns && includePatterns.length > 0) {
      let matched = false
      for (const pattern of includePatterns) {
        if (filePath.includes(pattern)) {
          matched = true
          break
        }
      }
      return matched
    }
    return true
  }

  getAppliedRules(): string[] {
    return [...this.activeRules.keys()]
  }

  getStatistics(): { totalRuns: number; totalViolations: number; avgDuration: number } {
    return {
      totalRuns: this.totalRuns,
      totalViolations: this.totalViolations,
      avgDuration: this.totalRuns > 0 ? this.totalDuration / this.totalRuns : 0,
    }
  }

  reset(): void {
    this.activeRules.clear()
    this.totalRuns = 0
    this.totalViolations = 0
    this.totalDuration = 0
  }
}
