export type DiagnosticLevel2 = 'info' | 'warn' | 'error' | 'critical'
export type DiagnosticCategory2 = 'cpu' | 'memory' | 'disk' | 'network' | 'database' | 'cache' | 'queue' | 'custom'

export interface DiagnosticResult2 {
  id: string
  category: DiagnosticCategory2
  level: DiagnosticLevel2
  name: string
  message: string
  value: number
  unit: string
  threshold: number | null
  passed: boolean
  timestamp: number
  recommendation: string
}

export class DiagnosticRunner2 {
  private diagnostics: Map<string, DiagnosticResult2> = new Map()
  private checks: Map<string, { name: string; category: DiagnosticCategory2; check: () => { value: number; unit: string; message: string }; threshold: number | null; level: DiagnosticLevel2; recommendation: string }> = new Map()
  private idCounter = 0
  private history: DiagnosticResult2[] = []
  private maxHistory: number = 500

  registerCheck(name: string, category: DiagnosticCategory2, check: () => { value: number; unit: string; message: string }, threshold: number | null = null, level: DiagnosticLevel2 = 'warn', recommendation = ''): string {
    const id = `diag_${++this.idCounter}`
    this.checks.set(id, { name, category, check, threshold, level, recommendation })
    return id
  }

  removeCheck(id: string): boolean { return this.checks.delete(id) }

  runCheck(id: string): DiagnosticResult2 | null {
    const checkDef = this.checks.get(id)
    if (!checkDef) return null
    const { value, unit, message } = checkDef.check()
    const passed = checkDef.threshold === null || value <= checkDef.threshold
    const result: DiagnosticResult2 = {
      id,
      category: checkDef.category,
      level: passed ? 'info' : checkDef.level,
      name: checkDef.name,
      message,
      value,
      unit,
      threshold: checkDef.threshold,
      passed,
      timestamp: Date.now(),
      recommendation: passed ? '' : checkDef.recommendation,
    }
    this.diagnostics.set(id, result)
    this.history.push(result)
    if (this.history.length > this.maxHistory) this.history.shift()
    return result
  }

  runAll(): DiagnosticResult2[] {
    const results: DiagnosticResult2[] = []
    this.checks.forEach((_, id) => {
      const r = this.runCheck(id)
      if (r) results.push(r)
    })
    return results
  }

  runByCategory(category: DiagnosticCategory2): DiagnosticResult2[] {
    const results: DiagnosticResult2[] = []
    this.checks.forEach((check, id) => {
      if (check.category === category) {
        const r = this.runCheck(id)
        if (r) results.push(r)
      }
    })
    return results
  }

  get(id: string): DiagnosticResult2 | undefined { return this.diagnostics.get(id) }

  getByCategory(category: DiagnosticCategory2): DiagnosticResult2[] {
    return Array.from(this.diagnostics.values()).filter(d => d.category === category)
  }

  getByLevel(level: DiagnosticLevel2): DiagnosticResult2[] {
    return Array.from(this.diagnostics.values()).filter(d => d.level === level)
  }

  getPassing(): DiagnosticResult2[] { return Array.from(this.diagnostics.values()).filter(d => d.passed) }
  getFailing(): DiagnosticResult2[] { return Array.from(this.diagnostics.values()).filter(d => !d.passed) }
  getCritical(): DiagnosticResult2[] { return this.getByLevel('critical') }
  getErrors(): DiagnosticResult2[] { return this.getByLevel('error') }
  getWarnings(): DiagnosticResult2[] { return this.getByLevel('warn') }

  getHistory(limit = 100): DiagnosticResult2[] {
    return [...this.history].reverse().slice(0, limit)
  }

  getHistoryByName(name: string, limit = 50): DiagnosticResult2[] {
    return this.history.filter(d => d.name === name).reverse().slice(0, limit)
  }

  getSummary(): { total: number; passing: number; failing: number; critical: number; errors: number; warnings: number } {
    return {
      total: this.diagnostics.size,
      passing: this.getPassing().length,
      failing: this.getFailing().length,
      critical: this.getCritical().length,
      errors: this.getErrors().length,
      warnings: this.getWarnings().length,
    }
  }

  getOverallStatus(): DiagnosticLevel2 {
    if (this.getCritical().length > 0) return 'critical'
    if (this.getErrors().length > 0) return 'error'
    if (this.getWarnings().length > 0) return 'warn'
    return 'info'
  }

  generateReport(): {
    status: DiagnosticLevel2
    summary: ReturnType<DiagnosticRunner2['getSummary']>
    failingChecks: DiagnosticResult2[]
    recommendations: string[]
  } {
    const failing = this.getFailing()
    return {
      status: this.getOverallStatus(),
      summary: this.getSummary(),
      failingChecks: failing,
      recommendations: failing.map(f => f.recommendation).filter(r => r.length > 0),
    }
  }

  setMaxHistory(max: number): this { this.maxHistory = max; return this }

  count(): number { return this.diagnostics.size }

  toArray(): DiagnosticResult2[] { return Array.from(this.diagnostics.values()) }
  toString(): string { return JSON.stringify(this.getSummary()) }
  toJSON(): Record<string, unknown> { return this.getSummary() }
  clone(): DiagnosticRunner2 {
    const dr = new DiagnosticRunner2()
    this.diagnostics.forEach((d, id) => dr.diagnostics.set(id, { ...d }))
    this.checks.forEach((c, id) => dr.checks.set(id, { ...c }))
    dr.history = [...this.history]
    dr.idCounter = this.idCounter
    dr.maxHistory = this.maxHistory
    return dr
  }
  equals(other: unknown): boolean {
    if (!(other instanceof DiagnosticRunner2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.diagnostics.clear()
    this.checks.clear()
    this.history = []
    this.idCounter = 0
  }
}
