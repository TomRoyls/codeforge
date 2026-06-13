export interface Flag2 {
  name: string
  enabled: boolean
  description?: string
  variants?: Record<string, unknown>
  rules?: ((ctx: Record<string, unknown>) => boolean)[]
}

export class FlagManager2 {
  private flags: Map<string, Flag2> = new Map()

  register(flag: Flag2): this {
    this.flags.set(flag.name, flag)
    return this
  }

  registerSimple(name: string, enabled: boolean, description?: string): this {
    this.flags.set(name, { name, enabled, description })
    return this
  }

  enable(name: string): boolean {
    const flag = this.flags.get(name)
    if (!flag) return false
    flag.enabled = true
    return true
  }

  disable(name: string): boolean {
    const flag = this.flags.get(name)
    if (!flag) return false
    flag.enabled = false
    return true
  }

  toggle(name: string): boolean {
    const flag = this.flags.get(name)
    if (!flag) return false
    flag.enabled = !flag.enabled
    return flag.enabled
  }

  isEnabled(name: string, ctx?: Record<string, unknown>): boolean {
    const flag = this.flags.get(name)
    if (!flag || !flag.enabled) return false
    if (flag.rules && flag.rules.length > 0 && ctx) {
      return flag.rules.every(rule => rule(ctx))
    }
    return true
  }

  isDisabled(name: string): boolean {
    return !this.isEnabled(name)
  }

  has(name: string): boolean {
    return this.flags.has(name)
  }

  remove(name: string): boolean {
    return this.flags.delete(name)
  }

  get(name: string): Flag2 | undefined {
    return this.flags.get(name)
  }

  getAll(): Flag2[] {
    return Array.from(this.flags.values())
  }

  getEnabled(): Flag2[] {
    return this.getAll().filter(f => f.enabled)
  }

  getDisabled(): Flag2[] {
    return this.getAll().filter(f => !f.enabled)
  }

  names(): string[] {
    return Array.from(this.flags.keys())
  }

  count(): number { return this.flags.size }
  enabledCount(): number { return this.getEnabled().length }
  disabledCount(): number { return this.getDisabled().length }

  addRule(name: string, rule: (ctx: Record<string, unknown>) => boolean): boolean {
    const flag = this.flags.get(name)
    if (!flag) return false
    if (!flag.rules) flag.rules = []
    flag.rules.push(rule)
    return true
  }

  setVariant(name: string, key: string, value: unknown): boolean {
    const flag = this.flags.get(name)
    if (!flag) return false
    if (!flag.variants) flag.variants = {}
    flag.variants[key] = value
    return true
  }

  getVariant(name: string, key: string): unknown {
    return this.flags.get(name)?.variants?.[key]
  }

  clear(): void {
    this.flags.clear()
  }

  toArray(): string[] { return this.names() }
  toString(): string { return JSON.stringify({ count: this.count(), enabled: this.enabledCount() }) }
  toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    this.flags.forEach((flag, name) => { result[name] = flag.enabled })
    return result
  }
  clone(): FlagManager2 {
    const fm = new FlagManager2()
    this.flags.forEach((flag) => fm.register({ ...flag, rules: flag.rules ? [...flag.rules] : undefined }))
    return fm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof FlagManager2)) return false
    return this.count() === other.count()
  }
}
