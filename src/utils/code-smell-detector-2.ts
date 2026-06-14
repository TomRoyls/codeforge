export type SmellSeverity2 = 'info' | 'minor' | 'major' | 'critical'
export type SmellCategory2 = 'duplication' | 'long-method' | 'large-class' | 'long-parameter-list' | 'deep-nesting' | 'magic-number' | 'dead-code' | 'complex-condition' | 'god-object' | 'feature-envy' | 'data-clump' | 'shotgun-surgery'

export interface CodeSmell2 {
  id: number
  category: SmellCategory2
  severity: SmellSeverity2
  file: string
  line: number
  description: string
  suggestion: string
  resolved: boolean
  detectedAt: number
}

export class CodeSmellDetector2 {
  private smells: Map<number, CodeSmell2> = new Map()
  private idCounter = 0
  private rules: Map<SmellCategory2, { enabled: boolean; severity: SmellSeverity2 }> = new Map()
  private suppressed: Set<number> = new Set()

  constructor() {
    const categories: SmellCategory2[] = ['duplication', 'long-method', 'large-class', 'long-parameter-list', 'deep-nesting', 'magic-number', 'dead-code', 'complex-condition', 'god-object', 'feature-envy', 'data-clump', 'shotgun-surgery']
    categories.forEach(c => {
      const severity: SmellSeverity2 = c === 'god-object' || c === 'shotgun-surgery' ? 'critical' : c === 'dead-code' ? 'info' : 'major'
      this.rules.set(c, { enabled: true, severity })
    })
  }

  detect(category: SmellCategory2, file: string, line: number, description: string, suggestion = ''): number {
    const rule = this.rules.get(category)
    if (!rule || !rule.enabled) return -1

    const id = ++this.idCounter
    const smell: CodeSmell2 = {
      id, category,
      severity: rule.severity,
      file, line, description, suggestion,
      resolved: false,
      detectedAt: Date.now(),
    }
    this.smells.set(id, smell)
    return id
  }

  resolve(id: number): boolean {
    const smell = this.smells.get(id)
    if (!smell) return false
    smell.resolved = true
    return true
  }

  suppress(id: number): boolean {
    if (!this.smells.has(id)) return false
    this.suppressed.add(id)
    return true
  }

  unsuppress(id: number): boolean {
    return this.suppressed.delete(id)
  }

  get(id: number): CodeSmell2 | undefined { return this.smells.get(id) }

  getByCategory(category: SmellCategory2): CodeSmell2[] {
    return Array.from(this.smells.values()).filter(s => s.category === category)
  }

  getBySeverity(severity: SmellSeverity2): CodeSmell2[] {
    return Array.from(this.smells.values()).filter(s => s.severity === severity)
  }

  getByFile(file: string): CodeSmell2[] {
    return Array.from(this.smells.values()).filter(s => s.file === file)
  }

  getUnresolved(): CodeSmell2[] {
    return Array.from(this.smells.values()).filter(s => !s.resolved && !this.suppressed.has(s.id))
  }

  getResolved(): CodeSmell2[] {
    return Array.from(this.smells.values()).filter(s => s.resolved)
  }

  getCritical(): CodeSmell2[] {
    return this.getUnresolved().filter(s => s.severity === 'critical')
  }

  getHotspots(): Map<string, number> {
    const counts = new Map<string, number>()
    this.getUnresolved().forEach(s => {
      counts.set(s.file, (counts.get(s.file) ?? 0) + 1)
    })
    return counts
  }

  enableRule(category: SmellCategory2): this {
    const rule = this.rules.get(category)
    if (rule) rule.enabled = true
    return this
  }

  disableRule(category: SmellCategory2): this {
    const rule = this.rules.get(category)
    if (rule) rule.enabled = false
    return this
  }

  setSeverity(category: SmellCategory2, severity: SmellSeverity2): this {
    const rule = this.rules.get(category)
    if (rule) rule.severity = severity
    return this
  }

  isRuleEnabled(category: SmellCategory2): boolean {
    return this.rules.get(category)?.enabled ?? false
  }

  getEnabledCategories(): SmellCategory2[] {
    return Array.from(this.rules.entries()).filter(([_, r]) => r.enabled).map(([c]) => c)
  }

  getStats(): Record<SmellSeverity2, number> {
    const stats: Record<SmellSeverity2, number> = { info: 0, minor: 0, major: 0, critical: 0 }
    this.getUnresolved().forEach(s => { stats[s.severity]++ })
    return stats
  }

  getSummary(): { total: number; unresolved: number; resolved: number; suppressed: number; critical: number } {
    return {
      total: this.smells.size,
      unresolved: this.getUnresolved().length,
      resolved: this.getResolved().length,
      suppressed: this.suppressed.size,
      critical: this.getCritical().length,
    }
  }

  remove(id: number): boolean { return this.smells.delete(id) }

  count(): number { return this.smells.size }

  toArray(): CodeSmell2[] { return Array.from(this.smells.values()) }
  toString(): string { return JSON.stringify(this.getSummary()) }
  toJSON(): Record<string, unknown> { return this.getSummary() }
  clone(): CodeSmellDetector2 {
    const d = new CodeSmellDetector2()
    this.smells.forEach((s, id) => d.smells.set(id, { ...s }))
    d.idCounter = this.idCounter
    this.rules.forEach((r, c) => d.rules.set(c, { ...r }))
    this.suppressed.forEach(id => d.suppressed.add(id))
    return d
  }
  equals(other: unknown): boolean {
    if (!(other instanceof CodeSmellDetector2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.smells.clear()
    this.suppressed.clear()
    this.idCounter = 0
  }
}
