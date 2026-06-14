export type FeatureStage2 = 'alpha' | 'beta' | 'ga' | 'deprecated'
export type EvaluationStrategy2 = 'static' | 'percentage' | 'targeted' | 'scheduled' | 'gradual'

export interface FeatureFlag2 {
  key: string
  name: string
  description: string
  enabled: boolean
  stage: FeatureStage2
  strategy: EvaluationStrategy2
  percentage: number
  targets: Set<string>
  excludeTargets: Set<string>
  startAt: number | null
  endAt: number | null
  createdAt: number
  updatedAt: number
  version: number
  metadata: Record<string, unknown>
}

export interface EvaluationContext2 {
  userId: string | null
  sessionId: string | null
  attributes: Record<string, unknown>
  timestamp: number
}

export class FeatureFlagManager2 {
  private flags: Map<string, FeatureFlag2> = new Map()
  private history: Array<{ key: string; oldValue: boolean; newValue: boolean; at: number }> = []
  private listeners: Array<(event: string, flag: FeatureFlag2) => void> = []
  private maxHistory: number = 10000

  create(key: string, name: string, description = '', enabled = false, stage: FeatureStage2 = 'alpha'): boolean {
    if (this.flags.has(key)) return false
    const flag: FeatureFlag2 = {
      key, name, description, enabled, stage,
      strategy: 'static',
      percentage: 0,
      targets: new Set(),
      excludeTargets: new Set(),
      startAt: null,
      endAt: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
      metadata: {},
    }
    this.flags.set(key, flag)
    this.notify('created', flag)
    return true
  }

  delete(key: string): boolean {
    const flag = this.flags.get(key)
    if (!flag) return false
    this.flags.delete(key)
    this.notify('deleted', flag)
    return true
  }

  enable(key: string): boolean {
    return this.set(key, true)
  }

  disable(key: string): boolean {
    return this.set(key, false)
  }

  set(key: string, enabled: boolean): boolean {
    const flag = this.flags.get(key)
    if (!flag) return false
    if (flag.enabled === enabled) return true
    this.history.push({ key, oldValue: flag.enabled, newValue: enabled, at: Date.now() })
    if (this.history.length > this.maxHistory) this.history.shift()
    flag.enabled = enabled
    flag.updatedAt = Date.now()
    flag.version++
    this.notify(enabled ? 'enabled' : 'disabled', flag)
    return true
  }

  setStage(key: string, stage: FeatureStage2): boolean {
    const flag = this.flags.get(key)
    if (!flag) return false
    flag.stage = stage
    flag.updatedAt = Date.now()
    flag.version++
    return true
  }

  setStrategy(key: string, strategy: EvaluationStrategy2, options: Partial<{ percentage: number; startAt: number; endAt: number }> = {}): boolean {
    const flag = this.flags.get(key)
    if (!flag) return false
    flag.strategy = strategy
    if (options.percentage !== undefined) flag.percentage = options.percentage
    if (options.startAt !== undefined) flag.startAt = options.startAt
    if (options.endAt !== undefined) flag.endAt = options.endAt
    flag.updatedAt = Date.now()
    flag.version++
    return true
  }

  addTarget(key: string, target: string): boolean {
    const flag = this.flags.get(key)
    if (!flag) return false
    flag.targets.add(target)
    flag.updatedAt = Date.now()
    return true
  }

  removeTarget(key: string, target: string): boolean {
    const flag = this.flags.get(key)
    if (!flag) return false
    return flag.targets.delete(target)
  }

  addExclude(key: string, target: string): boolean {
    const flag = this.flags.get(key)
    if (!flag) return false
    flag.excludeTargets.add(target)
    return true
  }

  evaluate(key: string, context: EvaluationContext2 = { userId: null, sessionId: null, attributes: {}, timestamp: Date.now() }): boolean {
    const flag = this.flags.get(key)
    if (!flag) return false
    if (!flag.enabled) return false

    const userId = context.userId || context.sessionId || 'anonymous'
    if (flag.excludeTargets.has(userId)) return false

    switch (flag.strategy) {
      case 'static':
        return true

      case 'percentage': {
        if (flag.percentage >= 100) return true
        if (flag.percentage <= 0) return false
        const hash = this.hashString(userId + key)
        return (hash % 100) < flag.percentage
      }

      case 'targeted':
        if (flag.targets.size === 0) return false
        return flag.targets.has(userId)

      case 'scheduled': {
        const now = context.timestamp
        if (flag.startAt !== null && now < flag.startAt) return false
        if (flag.endAt !== null && now >= flag.endAt) return false
        return true
      }

      case 'gradual': {
        const now = context.timestamp
        if (flag.startAt === null) return true
        const elapsed = now - flag.startAt
        if (elapsed <= 0) return false
        const rampUpMs = 86400000
        const ratio = Math.min(1, elapsed / rampUpMs)
        const effectivePct = flag.percentage * ratio
        const hash = this.hashString(userId + key)
        return (hash % 100) < effectivePct
      }
    }
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
  }

  get(key: string): FeatureFlag2 | undefined { return this.flags.get(key) }
  getAll(): FeatureFlag2[] { return Array.from(this.flags.values()) }
  getEnabled(): FeatureFlag2[] { return this.getAll().filter(f => f.enabled) }
  getByStage(stage: FeatureStage2): FeatureFlag2[] { return this.getAll().filter(f => f.stage === stage) }
  getByStrategy(strategy: EvaluationStrategy2): FeatureFlag2[] { return this.getAll().filter(f => f.strategy === strategy) }

  getHistory(key?: string): Array<{ key: string; oldValue: boolean; newValue: boolean; at: number }> {
    if (key) return this.history.filter(h => h.key === key)
    return [...this.history]
  }

  bulkEnable(keys: string[]): number {
    let count = 0
    keys.forEach(k => { if (this.enable(k)) count++ })
    return count
  }

  bulkDisable(keys: string[]): number {
    let count = 0
    keys.forEach(k => { if (this.disable(k)) count++ })
    return count
  }

  listen(fn: (event: string, flag: FeatureFlag2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, flag: FeatureFlag2): void {
    this.listeners.forEach(fn => fn(event, flag))
  }

  getStats(): { total: number; enabled: number; alpha: number; beta: number; ga: number; deprecated: number } {
    return {
      total: this.flags.size,
      enabled: this.getEnabled().length,
      alpha: this.getByStage('alpha').length,
      beta: this.getByStage('beta').length,
      ga: this.getByStage('ga').length,
      deprecated: this.getByStage('deprecated').length,
    }
  }

  count(): number { return this.flags.size }

  toArray(): FeatureFlag2[] { return Array.from(this.flags.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): FeatureFlagManager2 {
    const fm = new FeatureFlagManager2()
    this.flags.forEach((f, k) => fm.flags.set(k, { ...f, targets: new Set(f.targets), excludeTargets: new Set(f.excludeTargets), metadata: { ...f.metadata } }))
    fm.history = [...this.history]
    return fm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof FeatureFlagManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.flags.clear()
    this.history = []
    this.listeners = []
  }
}
