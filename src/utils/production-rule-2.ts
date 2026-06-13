export interface Rule2 {
  id: string
  condition: (facts: Record<string, unknown>) => boolean
  action: (facts: Record<string, unknown>) => void
  priority: number
}

export class ProductionRule2 {
  private rules: Map<string, Rule2> = new Map()
  private factBase: Record<string, unknown> = {}

  addRule(id: string, condition: Rule2['condition'], action: Rule2['action'], priority = 0): this {
    this.rules.set(id, { id, condition, action, priority })
    return this
  }

  removeRule(id: string): boolean {
    return this.rules.delete(id)
  }

  hasRule(id: string): boolean {
    return this.rules.has(id)
  }

  getRule(id: string): Rule2 | undefined {
    return this.rules.get(id)
  }

  setFact(key: string, value: unknown): this {
    this.factBase[key] = value
    return this
  }

  setFacts(facts: Record<string, unknown>): this {
    Object.assign(this.factBase, facts)
    return this
  }

  getFact(key: string): unknown {
    return this.factBase[key]
  }

  getFacts(): Record<string, unknown> {
    return { ...this.factBase }
  }

  clearFacts(): void {
    this.factBase = {}
  }

  fire(): string[] {
    const fired: string[] = []
    const sorted = Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority)
    for (const rule of sorted) {
      if (rule.condition(this.factBase)) {
        rule.action(this.factBase)
        fired.push(rule.id)
      }
    }
    return fired
  }

  fireAll(maxIterations = 100): string[][] {
    const allFired: string[][] = []
    for (let i = 0; i < maxIterations; i++) {
      const fired = this.fire()
      if (fired.length === 0) break
      allFired.push(fired)
    }
    return allFired
  }

  getMatchingRules(): string[] {
    const sorted = Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority)
    return sorted.filter(r => r.condition(this.factBase)).map(r => r.id)
  }

  getRuleIds(): string[] {
    return Array.from(this.rules.keys())
  }

  count(): number { return this.rules.size }

  toArray(): string[] { return this.getRuleIds() }
  toString(): string { return JSON.stringify({ rules: this.count(), facts: Object.keys(this.factBase).length }) }
  toJSON(): Record<string, unknown> { return { rules: this.count(), facts: Object.keys(this.factBase) } }
  clone(): ProductionRule2 {
    const pr = new ProductionRule2()
    this.rules.forEach((r, id) => pr.addRule(id, r.condition, r.action, r.priority))
    pr.setFacts(this.factBase)
    return pr
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ProductionRule2)) return false
    return this.count() === other.count()
  }
  clear(): void { this.rules.clear(); this.factBase = {} }
}
