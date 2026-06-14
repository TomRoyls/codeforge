export type ShapeAction2 = 'allow' | 'delay' | 'drop' | 'queue' | 'prioritize'
export type TrafficClass2 = 'best-effort' | 'guaranteed' | 'premium' | 'background'

export interface TrafficRule2 {
  id: string
  name: string
  trafficClass: TrafficClass2
  action: ShapeAction2
  rateLimit: number
  burstSize: number
  delayMs: number
  priority: number
  matchFn: ((req: unknown) => boolean) | null
  tokens: number
  lastRefill: number
}

export class TrafficShaper2 {
  private rules: Map<string, TrafficRule2> = new Map()
  private idCounter = 0
  private defaultAction: ShapeAction2 = 'allow'
  private listeners: Array<(event: string, rule: TrafficRule2) => void> = []
  private dropped: number = 0
  private delayed: number = 0
  private allowed: number = 0
  private queued: number = 0
  private prioritized: number = 0

  addRule(name: string, trafficClass: TrafficClass2, action: ShapeAction2, rateLimit = Infinity, burstSize = 0, delayMs = 0, priority = 0, matchFn: ((req: unknown) => boolean) | null = null): string {
    const id = `rule_${++this.idCounter}`
    const rule: TrafficRule2 = {
      id, name, trafficClass, action, rateLimit, burstSize, delayMs, priority,
      matchFn, tokens: burstSize,
      lastRefill: Date.now(),
    }
    this.rules.set(id, rule)
    this.notify('rule-added', rule)
    return id
  }

  removeRule(id: string): boolean {
    const rule = this.rules.get(id)
    if (!rule) return false
    this.rules.delete(id)
    this.notify('rule-removed', rule)
    return true
  }

  setDefaultAction(action: ShapeAction2): this { this.defaultAction = action; return this }

  process(request: unknown): { action: ShapeAction2; delay: number; ruleId: string | null } {
    let matchedRule: TrafficRule2 | null = null
    const sortedRules = Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority)
    for (const rule of sortedRules) {
      if (rule.matchFn && !rule.matchFn(request)) continue
      matchedRule = rule
      break
    }

    if (!matchedRule) {
      this.allowed++
      return { action: this.defaultAction, delay: 0, ruleId: null }
    }

    this.refillTokens(matchedRule)

    switch (matchedRule.action) {
      case 'allow':
        if (matchedRule.rateLimit === Infinity || matchedRule.tokens > 0) {
          if (matchedRule.rateLimit !== Infinity) matchedRule.tokens--
          this.allowed++
        } else {
          this.dropped++
          return { action: 'drop', delay: 0, ruleId: matchedRule.id }
        }
        return { action: 'allow', delay: 0, ruleId: matchedRule.id }

      case 'drop':
        this.dropped++
        return { action: 'drop', delay: 0, ruleId: matchedRule.id }

      case 'delay':
        this.delayed++
        return { action: 'delay', delay: matchedRule.delayMs, ruleId: matchedRule.id }

      case 'queue':
        this.queued++
        return { action: 'queue', delay: 0, ruleId: matchedRule.id }

      case 'prioritize':
        this.prioritized++
        return { action: 'prioritize', delay: 0, ruleId: matchedRule.id }
    }
  }

  private refillTokens(rule: TrafficRule2): void {
    const now = Date.now()
    const elapsed = now - rule.lastRefill
    if (rule.rateLimit !== Infinity && elapsed > 0) {
      const refilled = Math.floor((elapsed / 1000) * rule.rateLimit)
      rule.tokens = Math.min(rule.burstSize, rule.tokens + refilled)
      rule.lastRefill = now
    }
  }

  getRule(id: string): TrafficRule2 | undefined { return this.rules.get(id) }
  getRules(): TrafficRule2[] { return Array.from(this.rules.values()) }
  getRulesByClass(trafficClass: TrafficClass2): TrafficRule2[] {
    return Array.from(this.rules.values()).filter(r => r.trafficClass === trafficClass)
  }

  listen(fn: (event: string, rule: TrafficRule2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, rule: TrafficRule2): void {
    this.listeners.forEach(fn => fn(event, rule))
  }

  getStats(): { rules: number; allowed: number; dropped: number; delayed: number; queued: number; prioritized: number } {
    return {
      rules: this.rules.size,
      allowed: this.allowed,
      dropped: this.dropped,
      delayed: this.delayed,
      queued: this.queued,
      prioritized: this.prioritized,
    }
  }

  count(): number { return this.rules.size }

  toArray(): TrafficRule2[] { return Array.from(this.rules.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): TrafficShaper2 {
    const ts = new TrafficShaper2()
    this.rules.forEach((r, id) => ts.rules.set(id, { ...r }))
    ts.defaultAction = this.defaultAction
    ts.dropped = this.dropped
    ts.delayed = this.delayed
    ts.allowed = this.allowed
    ts.queued = this.queued
    ts.prioritized = this.prioritized
    return ts
  }
  equals(other: unknown): boolean {
    if (!(other instanceof TrafficShaper2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.rules.clear()
    this.listeners = []
    this.dropped = 0
    this.delayed = 0
    this.allowed = 0
    this.queued = 0
    this.prioritized = 0
    this.idCounter = 0
  }
}
