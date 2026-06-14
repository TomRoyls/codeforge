export type ComplexityLevel2 = 'low' | 'moderate' | 'high' | 'very-high' | 'extreme'

export interface ComplexityMetric2 {
  name: string
  value: number
  threshold: number
}

export interface FunctionComplexity2 {
  name: string
  cyclomatic: number
  cognitive: number
  lines: number
  nesting: number
  parameters: number
  level: ComplexityLevel2
}

export class ComplexityAnalyzer2 {
  private functions: Map<string, FunctionComplexity2> = new Map()
  private thresholds: Map<string, number> = new Map()
  private totalComplexity = 0

  constructor() {
    this.thresholds.set('cyclomatic', 10)
    this.thresholds.set('cognitive', 15)
    this.thresholds.set('nesting', 4)
    this.thresholds.set('parameters', 4)
    this.thresholds.set('lines', 50)
  }

  analyze(name: string, cyclomatic: number, cognitive: number, lines: number, nesting: number, parameters: number): FunctionComplexity2 {
    const level = this.calculateLevel(cyclomatic, cognitive, nesting)
    const fc: FunctionComplexity2 = { name, cyclomatic, cognitive, lines, nesting, parameters, level }
    this.functions.set(name, fc)
    this.totalComplexity += cyclomatic
    return fc
  }

  private calculateLevel(cyclomatic: number, cognitive: number, nesting: number): ComplexityLevel2 {
    const score = cyclomatic + cognitive * 0.5 + nesting * 3
    if (score >= 50) return 'extreme'
    if (score >= 30) return 'very-high'
    if (score >= 20) return 'high'
    if (score >= 10) return 'moderate'
    return 'low'
  }

  get(name: string): FunctionComplexity2 | undefined { return this.functions.get(name) }

  getByLevel(level: ComplexityLevel2): FunctionComplexity2[] {
    return Array.from(this.functions.values()).filter(f => f.level === level)
  }

  getProblematic(): FunctionComplexity2[] {
    return Array.from(this.functions.values()).filter(f =>
      f.level === 'high' || f.level === 'very-high' || f.level === 'extreme',
    )
  }

  getWorst(n = 10): FunctionComplexity2[] {
    return Array.from(this.functions.values())
      .sort((a, b) => (b.cyclomatic + b.cognitive) - (a.cyclomatic + a.cognitive))
      .slice(0, n)
  }

  getAverageCyclomatic(): number {
    if (this.functions.size === 0) return 0
    return this.totalComplexity / this.functions.size
  }

  getTotalCyclomatic(): number { return this.totalComplexity }

  getMetrics(): ComplexityMetric2[] {
    return [
      { name: 'cyclomatic', value: this.getAverageCyclomatic(), threshold: this.thresholds.get('cyclomatic')! },
      { name: 'functions', value: this.functions.size, threshold: 0 },
      { name: 'problematic', value: this.getProblematic().length, threshold: 0 },
    ]
  }

  setThreshold(metric: string, threshold: number): this {
    this.thresholds.set(metric, threshold)
    return this
  }

  getThreshold(metric: string): number { return this.thresholds.get(metric) ?? 0 }

  getViolations(): FunctionComplexity2[] {
    return Array.from(this.functions.values()).filter(f => {
      if (f.cyclomatic > this.thresholds.get('cyclomatic')!) return true
      if (f.cognitive > this.thresholds.get('cognitive')!) return true
      if (f.nesting > this.thresholds.get('nesting')!) return true
      if (f.parameters > this.thresholds.get('parameters')!) return true
      if (f.lines > this.thresholds.get('lines')!) return true
      return false
    })
  }

  getSummary(): {
    total: number
    averageCyclomatic: number
    averageCognitive: number
    problematic: number
    extreme: number
  } {
    const fns = Array.from(this.functions.values())
    const totalCognitive = fns.reduce((sum, f) => sum + f.cognitive, 0)
    return {
      total: fns.length,
      averageCyclomatic: this.getAverageCyclomatic(),
      averageCognitive: fns.length > 0 ? totalCognitive / fns.length : 0,
      problematic: this.getProblematic().length,
      extreme: this.getByLevel('extreme').length,
    }
  }

  remove(name: string): boolean {
    const fn = this.functions.get(name)
    if (!fn) return false
    this.totalComplexity -= fn.cyclomatic
    return this.functions.delete(name)
  }

  count(): number { return this.functions.size }

  toArray(): FunctionComplexity2[] { return Array.from(this.functions.values()) }
  toString(): string { return JSON.stringify(this.getSummary()) }
  toJSON(): Record<string, unknown> { return this.getSummary() }
  clone(): ComplexityAnalyzer2 {
    const ca = new ComplexityAnalyzer2()
    this.functions.forEach((f, name) => ca.functions.set(name, { ...f }))
    this.thresholds.forEach((v, k) => ca.thresholds.set(k, v))
    ca.totalComplexity = this.totalComplexity
    return ca
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ComplexityAnalyzer2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.functions.clear()
    this.totalComplexity = 0
  }
}
