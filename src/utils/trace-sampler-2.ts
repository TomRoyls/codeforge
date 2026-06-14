export type SamplerDecision2 = 'record' | 'drop' | 'record_and_sample'

export interface SamplingRule2 {
  name: string
  decision: SamplerDecision2
  condition: (traceId: string, spanName: string) => boolean
  priority: number
}

export class TraceSampler2 {
  private rules: SamplingRule2[] = []
  private defaultDecision: SamplerDecision2 = 'record'
  private rateLimit: number = 1.0
  private sampleCount: number = 0
  private dropCount: number = 0
  private probabilisticCounter: number = 0
  private traceIdIndex: Map<string, SamplerDecision2> = new Map()

  addRule(name: string, decision: SamplerDecision2, condition: (traceId: string, spanName: string) => boolean, priority = 0): this {
    this.rules.push({ name, decision, condition, priority })
    this.rules.sort((a, b) => b.priority - a.priority)
    return this
  }

  setDefaultDecision(decision: SamplerDecision2): this { this.defaultDecision = decision; return this }
  setRateLimit(rate: number): this { this.rateLimit = rate; return this }

  shouldSample(traceId: string, spanName: string): boolean {
    const cached = this.traceIdIndex.get(traceId)
    if (cached !== undefined) {
      return cached !== 'drop'
    }

    for (const rule of this.rules) {
      if (rule.condition(traceId, spanName)) {
        this.traceIdIndex.set(traceId, rule.decision)
        if (rule.decision === 'drop') {
          this.dropCount++
          return false
        }
        this.sampleCount++
        return true
      }
    }

    if (this.rateLimit < 1.0) {
      this.probabilisticCounter += this.rateLimit
      if (this.probabilisticCounter < 1.0) {
        this.traceIdIndex.set(traceId, 'drop')
        this.dropCount++
        return false
      }
      this.probabilisticCounter -= 1.0
    }

    this.traceIdIndex.set(traceId, this.defaultDecision)
    if (this.defaultDecision === 'drop') {
      this.dropCount++
      return false
    }
    this.sampleCount++
    return true
  }

  getRule(name: string): SamplingRule2 | undefined {
    return this.rules.find(r => r.name === name)
  }

  removeRule(name: string): boolean {
    const idx = this.rules.findIndex(r => r.name === name)
    if (idx === -1) return false
    this.rules.splice(idx, 1)
    return true
  }

  getRules(): SamplingRule2[] { return [...this.rules] }

  getDecision(traceId: string): SamplerDecision2 | undefined {
    return this.traceIdIndex.get(traceId)
  }

  getStats(): { sampled: number; dropped: number; rules: number; total: number; sampleRate: number } {
    const total = this.sampleCount + this.dropCount
    return {
      sampled: this.sampleCount,
      dropped: this.dropCount,
      rules: this.rules.length,
      total,
      sampleRate: total === 0 ? 1 : this.sampleCount / total,
    }
  }

  count(): number { return this.rules.length }

  toArray(): SamplingRule2[] { return [...this.rules] }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): TraceSampler2 {
    const ts = new TraceSampler2()
    ts.rules = [...this.rules]
    ts.defaultDecision = this.defaultDecision
    ts.rateLimit = this.rateLimit
    ts.sampleCount = this.sampleCount
    ts.dropCount = this.dropCount
    return ts
  }
  equals(other: unknown): boolean {
    if (!(other instanceof TraceSampler2)) return false
    return this.rules.length === other.rules.length
  }
  clear(): void {
    this.rules = []
    this.traceIdIndex.clear()
    this.sampleCount = 0
    this.dropCount = 0
    this.probabilisticCounter = 0
  }
}
