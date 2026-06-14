export type RolloutStrategy2 = 'percentage' | 'list' | 'all' | 'none'

export interface FeatureGate2 {
  id: string
  name: string
  enabled: boolean
  strategy: RolloutStrategy2
  percentage: number
  allowList: Set<string>
  denyList: Set<string>
  description: string
  metadata: Record<string, unknown>
}

export class FeatureGateManager2 {
  private gates: Map<string, FeatureGate2> = new Map()
  private userOverrides: Map<string, Map<string, boolean>> = new Map()
  private evaluations: Map<string, { allowed: number; denied: number }> = new Map()

  create(id: string, name: string, description = ''): FeatureGate2 {
    const gate: FeatureGate2 = {
      id, name, description,
      enabled: false,
      strategy: 'none',
      percentage: 0,
      allowList: new Set(),
      denyList: new Set(),
      metadata: {},
    }
    this.gates.set(id, gate)
    this.evaluations.set(id, { allowed: 0, denied: 0 })
    return gate
  }

  setEnabled(id: string, enabled: boolean): boolean {
    const gate = this.gates.get(id)
    if (!gate) return false
    gate.enabled = enabled
    return true
  }

  setPercentage(id: string, pct: number): boolean {
    const gate = this.gates.get(id)
    if (!gate) return false
    gate.strategy = 'percentage'
    gate.percentage = Math.max(0, Math.min(100, pct))
    gate.enabled = true
    return true
  }

  setStrategy(id: string, strategy: RolloutStrategy2): boolean {
    const gate = this.gates.get(id)
    if (!gate) return false
    gate.strategy = strategy
    if (strategy === 'all') gate.enabled = true
    if (strategy === 'none') gate.enabled = false
    return true
  }

  addToAllowList(id: string, userId: string): boolean {
    const gate = this.gates.get(id)
    if (!gate) return false
    gate.allowList.add(userId)
    if (gate.strategy === 'none') gate.strategy = 'list'
    gate.enabled = true
    return true
  }

  removeFromAllowList(id: string, userId: string): boolean {
    const gate = this.gates.get(id)
    if (!gate) return false
    gate.allowList.delete(userId)
    return true
  }

  addToDenyList(id: string, userId: string): boolean {
    const gate = this.gates.get(id)
    if (!gate) return false
    gate.denyList.add(userId)
    return true
  }

  removeFromDenyList(id: string, userId: string): boolean {
    const gate = this.gates.get(id)
    if (!gate) return false
    gate.denyList.delete(userId)
    return true
  }

  isEnabled(id: string, userId?: string): boolean {
    const gate = this.gates.get(id)
    if (!gate) return false
    if (!gate.enabled) {
      this.recordEval(id, false)
      return false
    }
    if (userId && gate.denyList.has(userId)) {
      this.recordEval(id, false)
      return false
    }
    const overrides = this.userOverrides.get(userId ?? '')
    if (overrides && overrides.has(id)) {
      const result = overrides.get(id)!
      this.recordEval(id, result)
      return result
    }
    let result: boolean
    switch (gate.strategy) {
      case 'all': result = true; break
      case 'none': result = false; break
      case 'list': result = userId ? gate.allowList.has(userId) : false; break
      case 'percentage': result = this.hashUser(userId ?? 'anonymous') % 100 < gate.percentage; break
      default: result = false
    }
    this.recordEval(id, result)
    return result
  }

  setOverride(userId: string, gateId: string, value: boolean): this {
    if (!this.userOverrides.has(userId)) this.userOverrides.set(userId, new Map())
    this.userOverrides.get(userId)!.set(gateId, value)
    return this
  }

  removeOverride(userId: string, gateId: string): boolean {
    const overrides = this.userOverrides.get(userId)
    return overrides ? overrides.delete(gateId) : false
  }

  getGate(id: string): FeatureGate2 | undefined { return this.gates.get(id) }
  getAllGates(): FeatureGate2[] { return Array.from(this.gates.values()) }
  getEnabledGates(): FeatureGate2[] { return this.getAllGates().filter(g => g.enabled) }

  getStats(id: string): { allowed: number; denied: number } | undefined {
    return this.evaluations.get(id) ? { ...this.evaluations.get(id)! } : undefined
  }

  remove(id: string): boolean {
    this.evaluations.delete(id)
    return this.gates.delete(id)
  }

  count(): number { return this.gates.size }

  toArray(): string[] { return Array.from(this.gates.keys()) }
  toString(): string { return JSON.stringify({ gates: this.count(), enabled: this.getEnabledGates().length }) }
  toJSON(): Record<string, unknown> { return { gates: this.count(), enabled: this.getEnabledGates().length } }
  clone(): FeatureGateManager2 {
    const fm = new FeatureGateManager2()
    this.gates.forEach((g, id) => {
      fm.gates.set(id, {
        ...g,
        allowList: new Set(g.allowList),
        denyList: new Set(g.denyList),
        metadata: { ...g.metadata },
      })
    })
    this.userOverrides.forEach((overrides, userId) => {
      fm.userOverrides.set(userId, new Map(overrides))
    })
    this.evaluations.forEach((s, id) => fm.evaluations.set(id, { ...s }))
    return fm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof FeatureGateManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.gates.clear()
    this.userOverrides.clear()
    this.evaluations.clear()
  }

  private recordEval(id: string, allowed: boolean): void {
    const stats = this.evaluations.get(id)
    if (stats) {
      if (allowed) stats.allowed++
      else stats.denied++
    }
  }

  private hashUser(userId: string): number {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
  }
}
