export type LintSeverity2 = 'off' | 'warn' | 'error'

export interface LintRule2 {
  id: string
  name: string
  description: string
  severity: LintSeverity2
  category: string
  enabled: boolean
}

export interface LintViolation2 {
  id: number
  ruleId: string
  file: string
  line: number
  column: number
  message: string
  severity: LintSeverity2
  fixable: boolean
  fix?: string
}

export class LintEngine2 {
  private rules: Map<string, LintRule2> = new Map()
  private violations: Map<number, LintViolation2> = new Map()
  private idCounter = 0
  private fixableCount = 0
  private maxViolations: number

  constructor(maxViolations = 100000) {
    this.maxViolations = maxViolations
  }

  registerRule(rule: Omit<LintRule2, 'enabled'> & { enabled?: boolean }): this {
    this.rules.set(rule.id, { ...rule, enabled: rule.enabled ?? true })
    return this
  }

  report(ruleId: string, file: string, line: number, column: number, message: string, fixable = false, fix?: string): number {
    const rule = this.rules.get(ruleId)
    if (!rule || !rule.enabled || rule.severity === 'off') return -1

    const id = ++this.idCounter
    const violation: LintViolation2 = {
      id, ruleId, file, line, column, message,
      severity: rule.severity,
      fixable,
      fix,
    }
    this.violations.set(id, violation)
    if (fixable) this.fixableCount++
    this.enforceMax()
    return id
  }

  resolve(id: number): boolean {
    const v = this.violations.get(id)
    if (!v) return false
    if (v.fixable) this.fixableCount--
    return this.violations.delete(id)
  }

  fixViolation(id: number): string | null {
    const v = this.violations.get(id)
    if (!v || !v.fixable || !v.fix) return null
    this.resolve(id)
    return v.fix
  }

  fixAll(): number {
    let fixed = 0
    this.violations.forEach((v, id) => {
      if (v.fixable && v.fix) {
        this.resolve(id)
        fixed++
      }
    })
    return fixed
  }

  getRule(id: string): LintRule2 | undefined { return this.rules.get(id) }
  getEnabledRules(): LintRule2[] { return Array.from(this.rules.values()).filter(r => r.enabled && r.severity !== 'off') }
  getAllRules(): LintRule2[] { return Array.from(this.rules.values()) }

  enableRule(id: string): boolean {
    const rule = this.rules.get(id)
    if (!rule) return false
    rule.enabled = true
    return true
  }

  disableRule(id: string): boolean {
    const rule = this.rules.get(id)
    if (!rule) return false
    rule.enabled = false
    return true
  }

  setSeverity(ruleId: string, severity: LintSeverity2): boolean {
    const rule = this.rules.get(ruleId)
    if (!rule) return false
    rule.severity = severity
    return true
  }

  getViolation(id: number): LintViolation2 | undefined { return this.violations.get(id) }
  getViolations(): LintViolation2[] { return Array.from(this.violations.values()) }

  getByRule(ruleId: string): LintViolation2[] {
    return Array.from(this.violations.values()).filter(v => v.ruleId === ruleId)
  }

  getByFile(file: string): LintViolation2[] {
    return Array.from(this.violations.values()).filter(v => v.file === file)
  }

  getBySeverity(severity: LintSeverity2): LintViolation2[] {
    return Array.from(this.violations.values()).filter(v => v.severity === severity)
  }

  getErrors(): LintViolation2[] { return this.getBySeverity('error') }
  getWarnings(): LintViolation2[] { return this.getBySeverity('warn') }
  getFixable(): LintViolation2[] { return Array.from(this.violations.values()).filter(v => v.fixable) }

  getStats(): { errors: number; warnings: number; fixable: number; total: number; rules: number } {
    return {
      errors: this.getErrors().length,
      warnings: this.getWarnings().length,
      fixable: this.fixableCount,
      total: this.violations.size,
      rules: this.getEnabledRules().length,
    }
  }

  getByCategory(category: string): LintRule2[] {
    return Array.from(this.rules.values()).filter(r => r.category === category)
  }

  count(): number { return this.violations.size }
  getRuleCount(): number { return this.rules.size }

  toArray(): LintViolation2[] { return Array.from(this.violations.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): LintEngine2 {
    const le = new LintEngine2(this.maxViolations)
    this.rules.forEach((r, id) => le.rules.set(id, { ...r }))
    this.violations.forEach((v, id) => le.violations.set(id, { ...v }))
    le.idCounter = this.idCounter
    le.fixableCount = this.fixableCount
    return le
  }
  equals(other: unknown): boolean {
    if (!(other instanceof LintEngine2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.violations.clear()
    this.fixableCount = 0
    this.idCounter = 0
  }
  clearRules(): void { this.rules.clear() }

  private enforceMax(): void {
    while (this.violations.size > this.maxViolations) {
      const oldest = Array.from(this.violations.keys())[0]
      if (oldest !== undefined) this.resolve(oldest)
      else break
    }
  }
}
