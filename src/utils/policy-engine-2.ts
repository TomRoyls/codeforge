export type RuleAction2 = 'allow' | 'deny' | 'log' | 'transform' | 'notify' | 'custom'
export type RuleSeverity2 = 'info' | 'warning' | 'critical'

export interface PolicyRule2 {
  id: string
  name: string
  description: string
  enabled: boolean
  priority: number
  severity: RuleSeverity2
  action: RuleAction2
  condition: (input: unknown) => boolean
  transform: ((input: unknown) => unknown) | null
  customAction: ((input: unknown) => void) | null
  matchCount: number
  createdAt: number
  updatedAt: number
  tags: string[]
}

export interface RuleEvaluation2 {
  ruleId: string
  matched: boolean
  action: RuleAction2
  result: unknown
  evaluatedAt: number
  duration: number
}

export class PolicyEngine2 {
  private rules: Map<string, PolicyRule2> = new Map()
  private ordered: string[] = []
  private history: RuleEvaluation2[] = []
  private maxHistory: number = 10000
  private listeners: Array<(event: string, data: unknown) => void> = []
  private stopOnFirstDeny: boolean = true
  private idCounter = 0
  private denyCount: number = 0
  private allowCount: number = 0

  setStopOnFirstDeny(stop: boolean): this { this.stopOnFirstDeny = stop; return this }

  add(name: string, condition: (input: unknown) => boolean, action: RuleAction2 = 'allow', priority = 0, severity: RuleSeverity2 = 'info', description = '', tags: string[] = []): string {
    const id = `rule_${++this.idCounter}`
    const rule: PolicyRule2 = {
      id, name, description, condition, action, priority, severity, tags,
      enabled: true,
      transform: null,
      customAction: null,
      matchCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    this.rules.set(id, rule)
    this.rebuildOrder()
    this.notify('added', rule)
    return id
  }

  remove(id: string): boolean {
    const rule = this.rules.get(id)
    if (!rule) return false
    this.rules.delete(id)
    this.rebuildOrder()
    this.notify('removed', rule)
    return true
  }

  enable(id: string): boolean {
    const rule = this.rules.get(id)
    if (!rule) return false
    rule.enabled = true
    return true
  }

  disable(id: string): boolean {
    const rule = this.rules.get(id)
    if (!rule) return false
    rule.enabled = false
    return true
  }

  setTransform(id: string, transform: (input: unknown) => unknown): boolean {
    const rule = this.rules.get(id)
    if (!rule) return false
    rule.transform = transform
    return true
  }

  setCustomAction(id: string, action: (input: unknown) => void): boolean {
    const rule = this.rules.get(id)
    if (!rule) return false
    rule.customAction = action
    return true
  }

  setPriority(id: string, priority: number): boolean {
    const rule = this.rules.get(id)
    if (!rule) return false
    rule.priority = priority
    this.rebuildOrder()
    return true
  }

  private rebuildOrder(): void {
    this.ordered = Array.from(this.rules.values())
      .sort((a, b) => b.priority - a.priority)
      .map(r => r.id)
  }

  evaluate(input: unknown): { allowed: boolean; evaluations: RuleEvaluation2[]; transformed: unknown } {
    const evaluations: RuleEvaluation2[] = []
    let current = input
    let allowed = true

    for (const ruleId of this.ordered) {
      const rule = this.rules.get(ruleId)
      if (!rule || !rule.enabled) continue

      const start = Date.now()
      const matched = rule.condition(current)
      const duration = Date.now() - start

      const evaluation: RuleEvaluation2 = {
        ruleId, matched, action: rule.action,
        result: current,
        evaluatedAt: Date.now(),
        duration,
      }

      if (matched) {
        rule.matchCount++
        switch (rule.action) {
          case 'deny':
            allowed = false
            this.denyCount++
            evaluation.result = 'denied'
            evaluations.push(evaluation)
            this.recordEvaluation(evaluation)
            this.notify('denied', { rule, input })
            if (this.stopOnFirstDeny) return { allowed: false, evaluations, transformed: current }
            break
          case 'allow':
            this.allowCount++
            evaluation.result = 'allowed'
            evaluations.push(evaluation)
            this.notify('allowed', { rule, input })
            break
          case 'transform':
            if (rule.transform) {
              current = rule.transform(current)
              evaluation.result = current
            }
            evaluations.push(evaluation)
            break
          case 'log':
            evaluations.push(evaluation)
            this.notify('logged', { rule, input })
            break
          case 'notify':
            evaluations.push(evaluation)
            this.notify('notified', { rule, input })
            break
          case 'custom':
            if (rule.customAction) rule.customAction(current)
            evaluations.push(evaluation)
            break
        }
      }
    }

    return { allowed, evaluations, transformed: current }
  }

  private recordEvaluation(evaluation: RuleEvaluation2): void {
    this.history.push(evaluation)
    if (this.history.length > this.maxHistory) this.history.shift()
  }

  get(id: string): PolicyRule2 | undefined { return this.rules.get(id) }
  getEnabled(): PolicyRule2[] { return Array.from(this.rules.values()).filter(r => r.enabled) }
  getDisabled(): PolicyRule2[] { return Array.from(this.rules.values()).filter(r => !r.enabled) }
  getByTag(tag: string): PolicyRule2[] { return Array.from(this.rules.values()).filter(r => r.tags.includes(tag)) }
  getByAction(action: RuleAction2): PolicyRule2[] { return Array.from(this.rules.values()).filter(r => r.action === action) }
  getBySeverity(severity: RuleSeverity2): PolicyRule2[] { return Array.from(this.rules.values()).filter(r => r.severity === severity) }
  getHistory(): RuleEvaluation2[] { return [...this.history] }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getStats(): { total: number; enabled: number; disabled: number; allows: number; denies: number; history: number } {
    return {
      total: this.rules.size,
      enabled: this.getEnabled().length,
      disabled: this.getDisabled().length,
      allows: this.allowCount,
      denies: this.denyCount,
      history: this.history.length,
    }
  }

  count(): number { return this.rules.size }

  toArray(): PolicyRule2[] { return Array.from(this.rules.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): PolicyEngine2 {
    const pe = new PolicyEngine2()
    this.rules.forEach((r, id) => pe.rules.set(id, { ...r, tags: [...r.tags] }))
    pe.ordered = [...this.ordered]
    pe.stopOnFirstDeny = this.stopOnFirstDeny
    pe.idCounter = this.idCounter
    pe.denyCount = this.denyCount
    pe.allowCount = this.allowCount
    return pe
  }
  equals(other: unknown): boolean {
    if (!(other instanceof PolicyEngine2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.rules.clear()
    this.ordered = []
    this.history = []
    this.listeners = []
    this.idCounter = 0
    this.denyCount = 0
    this.allowCount = 0
  }
}
