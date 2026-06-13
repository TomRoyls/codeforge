export type ToggleStrategy = 'boolean' | 'percentage' | 'user-list' | 'context'

export interface FeatureToggleConfig {
  name: string
  strategy: ToggleStrategy
  enabled: boolean
  percentage?: number
  allowedUsers?: Set<string>
  condition?: (ctx: Record<string, unknown>) => boolean
  description?: string
}

export class FeatureToggle2 {
  private toggles: Map<string, FeatureToggleConfig> = new Map()

  register(config: FeatureToggleConfig): this {
    this.toggles.set(config.name, { ...config, allowedUsers: config.allowedUsers ? new Set(config.allowedUsers) : undefined })
    return this
  }

  on(name: string): boolean {
    return this.set(name, true)
  }

  off(name: string): boolean {
    return this.set(name, false)
  }

  set(name: string, enabled: boolean): boolean {
    const toggle = this.toggles.get(name)
    if (!toggle) return false
    toggle.enabled = enabled
    return true
  }

  isActive(name: string, ctx?: Record<string, unknown>): boolean {
    const toggle = this.toggles.get(name)
    if (!toggle || !toggle.enabled) return false

    switch (toggle.strategy) {
      case 'boolean':
        return true
      case 'percentage':
        if (!ctx?.userId) return false
        return this.hashPercentage(ctx.userId as string) < (toggle.percentage ?? 0)
      case 'user-list':
        if (!ctx?.userId) return false
        return toggle.allowedUsers?.has(ctx.userId as string) ?? false
      case 'context':
        return toggle.condition ? toggle.condition(ctx ?? {}) : true
      default:
        return true
    }
  }

  isInactive(name: string, ctx?: Record<string, unknown>): boolean {
    return !this.isActive(name, ctx)
  }

  addUser(name: string, userId: string): boolean {
    const toggle = this.toggles.get(name)
    if (!toggle) return false
    if (!toggle.allowedUsers) toggle.allowedUsers = new Set()
    toggle.allowedUsers.add(userId)
    return true
  }

  removeUser(name: string, userId: string): boolean {
    const toggle = this.toggles.get(name)
    if (!toggle || !toggle.allowedUsers) return false
    return toggle.allowedUsers.delete(userId)
  }

  setPercentage(name: string, pct: number): boolean {
    const toggle = this.toggles.get(name)
    if (!toggle) return false
    toggle.percentage = Math.max(0, Math.min(100, pct))
    return true
  }

  has(name: string): boolean { return this.toggles.has(name) }
  get(name: string): FeatureToggleConfig | undefined { return this.toggles.get(name) }
  getAll(): FeatureToggleConfig[] { return Array.from(this.toggles.values()) }
  names(): string[] { return Array.from(this.toggles.keys()) }
  count(): number { return this.toggles.size }

  bulkEnable(names: string[]): number {
    let count = 0
    for (const name of names) { if (this.on(name)) count++ }
    return count
  }

  bulkDisable(names: string[]): number {
    let count = 0
    for (const name of names) { if (this.off(name)) count++ }
    return count
  }

  clear(): void { this.toggles.clear() }

  private hashPercentage(key: string): number {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash) % 100
  }

  toArray(): string[] { return this.names() }
  toString(): string { return JSON.stringify({ count: this.count() }) }
  toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    this.toggles.forEach((t, name) => { result[name] = t.enabled })
    return result
  }
  clone(): FeatureToggle2 {
    const ft = new FeatureToggle2()
    this.toggles.forEach((t) => ft.register({ ...t }))
    return ft
  }
  equals(other: unknown): boolean {
    if (!(other instanceof FeatureToggle2)) return false
    return this.count() === other.count()
  }
}
