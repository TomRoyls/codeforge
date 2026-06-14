export type DecisionOutcome2 = 'approved' | 'rejected' | 'manual' | 'escalated'
export type RiskLevel2 = 'low' | 'medium' | 'high' | 'critical'

export interface DecisionFactor2 {
  name: string
  weight: number
  value: number
  max: number
}

export interface Decision2 {
  id: string
  outcome: DecisionOutcome2
  risk: RiskLevel2
  score: number
  factors: DecisionFactor2[]
  reason: string
  createdAt: number
  metadata: Record<string, unknown>
}

export class DecisionEngine2 {
  private decisions: Map<string, Decision2> = new Map()
  private rules: Array<{
    name: string
    condition: (factors: DecisionFactor2[]) => boolean
    outcome: DecisionOutcome2
    reason: string
    priority: number
  }> = []
  private thresholds: Map<DecisionOutcome2, number> = new Map([
    ['approved', 70],
    ['rejected', 30],
  ])
  private weights: Map<string, number> = new Map()
  private listeners: Array<(event: string, decision: Decision2) => void> = []
  private idCounter = 0
  private outcomeCounts: Map<DecisionOutcome2, number> = new Map()

  setThreshold(outcome: DecisionOutcome2, score: number): this {
    this.thresholds.set(outcome, score)
    return this
  }

  setWeight(factor: string, weight: number): this {
    this.weights.set(factor, weight)
    return this
  }

  addRule(name: string, condition: (factors: DecisionFactor2[]) => boolean, outcome: DecisionOutcome2, reason: string, priority = 0): this {
    this.rules.push({ name, condition, outcome, reason, priority })
    this.rules.sort((a, b) => b.priority - a.priority)
    return this
  }

  decide(factors: DecisionFactor2[], metadata: Record<string, unknown> = {}): Decision2 {
    const score = this.calculateScore(factors)
    const risk = this.assessRisk(score)
    let outcome: DecisionOutcome2
    let reason: string

    const matchedRule = this.rules.find(r => r.condition(factors))
    if (matchedRule) {
      outcome = matchedRule.outcome
      reason = matchedRule.reason
    } else {
      const approvedThreshold = this.thresholds.get('approved') ?? 70
      const rejectedThreshold = this.thresholds.get('rejected') ?? 30
      if (score >= approvedThreshold) {
        outcome = 'approved'
        reason = 'Score above approval threshold'
      } else if (score < rejectedThreshold) {
        outcome = 'rejected'
        reason = 'Score below rejection threshold'
      } else {
        outcome = 'manual'
        reason = 'Score in manual review range'
      }
    }

    const decision: Decision2 = {
      id: `dec_${++this.idCounter}`,
      outcome, risk, score, factors, reason,
      createdAt: Date.now(),
      metadata,
    }

    this.decisions.set(decision.id, decision)
    this.outcomeCounts.set(outcome, (this.outcomeCounts.get(outcome) || 0) + 1)
    this.notify('decided', decision)
    return decision
  }

  private calculateScore(factors: DecisionFactor2[]): number {
    let totalWeight = 0
    let totalScore = 0
    for (const factor of factors) {
      const weight = this.weights.get(factor.name) ?? factor.weight
      const normalized = factor.max > 0 ? factor.value / factor.max : 0
      totalWeight += weight
      totalScore += normalized * weight * 100
    }
    return totalWeight > 0 ? totalScore / totalWeight : 0
  }

  private assessRisk(score: number): RiskLevel2 {
    if (score < 25) return 'critical'
    if (score < 50) return 'high'
    if (score < 75) return 'medium'
    return 'low'
  }

  get(id: string): Decision2 | undefined { return this.decisions.get(id) }
  getByOutcome(outcome: DecisionOutcome2): Decision2[] {
    return Array.from(this.decisions.values()).filter(d => d.outcome === outcome)
  }
  getByRisk(risk: RiskLevel2): Decision2[] {
    return Array.from(this.decisions.values()).filter(d => d.risk === risk)
  }
  getApproved(): Decision2[] { return this.getByOutcome('approved') }
  getRejected(): Decision2[] { return this.getByOutcome('rejected') }
  getManual(): Decision2[] { return this.getByOutcome('manual') }

  escalate(id: string, reason: string): boolean {
    const decision = this.decisions.get(id)
    if (!decision) return false
    decision.outcome = 'escalated'
    decision.reason = reason
    this.notify('escalated', decision)
    return true
  }

  override(id: string, outcome: DecisionOutcome2, reason: string): boolean {
    const decision = this.decisions.get(id)
    if (!decision) return false
    decision.outcome = outcome
    decision.reason = reason
    this.notify('overridden', decision)
    return true
  }

  listen(fn: (event: string, decision: Decision2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, decision: Decision2): void {
    this.listeners.forEach(fn => fn(event, decision))
  }

  getStats(): { total: number; approved: number; rejected: number; manual: number; escalated: number; avgScore: number } {
    const decisions = Array.from(this.decisions.values())
    const avgScore = decisions.length === 0 ? 0 : decisions.reduce((s, d) => s + d.score, 0) / decisions.length
    return {
      total: decisions.length,
      approved: this.getApproved().length,
      rejected: this.getRejected().length,
      manual: this.getManual().length,
      escalated: this.getByOutcome('escalated').length,
      avgScore,
    }
  }

  count(): number { return this.decisions.size }

  toArray(): Decision2[] { return Array.from(this.decisions.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): DecisionEngine2 {
    const de = new DecisionEngine2()
    this.thresholds.forEach((v, k) => de.thresholds.set(k, v))
    this.weights.forEach((v, k) => de.weights.set(k, v))
    de.rules = [...this.rules]
    return de
  }
  equals(other: unknown): boolean {
    if (!(other instanceof DecisionEngine2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.decisions.clear()
    this.rules = []
    this.listeners = []
    this.outcomeCounts.clear()
    this.idCounter = 0
  }
}
