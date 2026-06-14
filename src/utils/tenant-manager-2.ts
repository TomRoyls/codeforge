export interface Tenant2 {
  id: string
  name: string
  plan: string
  active: boolean
  metadata: Record<string, unknown>
  createdAt: number
  settings: Map<string, unknown>
  limits: Map<string, number>
}

export class TenantManager2 {
  private tenants: Map<string, Tenant2> = new Map()
  private idCounter = 0
  private defaultLimits: Map<string, number> = new Map()

  create(name: string, plan = 'free'): Tenant2 {
    const id = `tenant_${++this.idCounter}`
    const now = Date.now()
    const tenant: Tenant2 = {
      id, name, plan,
      active: true,
      metadata: {},
      createdAt: now,
      settings: new Map(),
      limits: new Map(this.defaultLimits),
    }
    this.tenants.set(id, tenant)
    return tenant
  }

  get(id: string): Tenant2 | undefined { return this.tenants.get(id) }

  getByName(name: string): Tenant2 | undefined {
    return Array.from(this.tenants.values()).find(t => t.name === name)
  }

  remove(id: string): boolean { return this.tenants.delete(id) }

  deactivate(id: string): boolean {
    const t = this.tenants.get(id)
    if (!t) return false
    t.active = false
    return true
  }

  activate(id: string): boolean {
    const t = this.tenants.get(id)
    if (!t) return false
    t.active = true
    return true
  }

  setPlan(id: string, plan: string): boolean {
    const t = this.tenants.get(id)
    if (!t) return false
    t.plan = plan
    return true
  }

  setSetting(id: string, key: string, value: unknown): boolean {
    const t = this.tenants.get(id)
    if (!t) return false
    t.settings.set(key, value)
    return true
  }

  getSetting(id: string, key: string): unknown {
    return this.tenants.get(id)?.settings.get(key)
  }

  setLimit(id: string, key: string, value: number): boolean {
    const t = this.tenants.get(id)
    if (!t) return false
    t.limits.set(key, value)
    return true
  }

  getLimit(id: string, key: string): number {
    return this.tenants.get(id)?.limits.get(key) ?? 0
  }

  setMetadata(id: string, key: string, value: unknown): boolean {
    const t = this.tenants.get(id)
    if (!t) return false
    t.metadata[key] = value
    return true
  }

  getActive(): Tenant2[] { return Array.from(this.tenants.values()).filter(t => t.active) }
  getInactive(): Tenant2[] { return Array.from(this.tenants.values()).filter(t => !t.active) }
  getByPlan(plan: string): Tenant2[] { return Array.from(this.tenants.values()).filter(t => t.plan === plan) }
  getAll(): Tenant2[] { return Array.from(this.tenants.values()) }

  setDefaultLimit(key: string, value: number): this {
    this.defaultLimits.set(key, value)
    return this
  }

  count(): number { return this.tenants.size }
  getActiveCount(): number { return this.getActive().length }

  toArray(): string[] { return Array.from(this.tenants.keys()) }
  toString(): string { return JSON.stringify({ tenants: this.count(), active: this.getActiveCount() }) }
  toJSON(): Record<string, unknown> { return { tenants: this.count(), active: this.getActiveCount() } }
  clone(): TenantManager2 {
    const tm = new TenantManager2()
    this.tenants.forEach((t, id) => {
      tm.tenants.set(id, {
        ...t,
        metadata: { ...t.metadata },
        settings: new Map(t.settings),
        limits: new Map(t.limits),
      })
    })
    tm.idCounter = this.idCounter
    this.defaultLimits.forEach((v, k) => tm.defaultLimits.set(k, v))
    return tm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof TenantManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.tenants.clear()
    this.defaultLimits.clear()
    this.idCounter = 0
  }
}
