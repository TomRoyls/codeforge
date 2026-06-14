export type MiddlewarePhase2 = 'pre' | 'process' | 'post' | 'error'

export interface Middleware2 {
  id: string
  name: string
  phase: MiddlewarePhase2
  priority: number
  handler: (ctx: Record<string, unknown>, next: () => void) => void
  enabled: boolean
  conditions: Array<(ctx: Record<string, unknown>) => boolean>
}

export class MiddlewareChain2 {
  private middlewares: Map<string, Middleware2> = new Map()
  private order: string[] = []
  private idCounter = 0
  private stats: { processed: number; errors: number; skipped: number } = { processed: 0, errors: 0, skipped: 0 }

  add(name: string, phase: MiddlewarePhase2, priority: number, handler: Middleware2['handler']): string {
    const id = `mw_${++this.idCounter}`
    this.middlewares.set(id, { id, name, phase, priority, handler, enabled: true, conditions: [] })
    this.rebuildOrder()
    return id
  }

  remove(id: string): boolean {
    const deleted = this.middlewares.delete(id)
    if (deleted) this.rebuildOrder()
    return deleted
  }

  get(id: string): Middleware2 | undefined { return this.middlewares.get(id) }

  enable(id: string): boolean {
    const mw = this.middlewares.get(id)
    if (!mw) return false
    mw.enabled = true
    return true
  }

  disable(id: string): boolean {
    const mw = this.middlewares.get(id)
    if (!mw) return false
    mw.enabled = false
    return true
  }

  setPriority(id: string, priority: number): boolean {
    const mw = this.middlewares.get(id)
    if (!mw) return false
    mw.priority = priority
    this.rebuildOrder()
    return true
  }

  addCondition(id: string, condition: (ctx: Record<string, unknown>) => boolean): boolean {
    const mw = this.middlewares.get(id)
    if (!mw) return false
    mw.conditions.push(condition)
    return true
  }

  private rebuildOrder(): void {
    this.order = Array.from(this.middlewares.values())
      .sort((a, b) => {
        const phaseOrder: Record<MiddlewarePhase2, number> = { pre: 0, process: 1, post: 2, error: 3 }
        if (phaseOrder[a.phase] !== phaseOrder[b.phase]) return phaseOrder[a.phase] - phaseOrder[b.phase]
        return b.priority - a.priority
      })
      .map(m => m.id)
  }

  execute(ctx: Record<string, unknown>): boolean {
    const active = this.order
      .map(id => this.middlewares.get(id)!)
      .filter(mw => mw && mw.enabled)
      .filter(mw => mw.conditions.length === 0 || mw.conditions.every(c => c(ctx)))

    if (active.length === 0) {
      this.stats.skipped++
      return false
    }

    let index = 0
    const next = () => {
      if (index >= active.length) return
      const mw = active[index++]
      try {
        mw.handler(ctx, next)
      } catch (e) {
        this.stats.errors++
      }
    }
    next()
    this.stats.processed++
    return true
  }

  getByPhase(phase: MiddlewarePhase2): Middleware2[] {
    return Array.from(this.middlewares.values()).filter(m => m.phase === phase)
  }

  getEnabled(): Middleware2[] { return Array.from(this.middlewares.values()).filter(m => m.enabled) }
  getDisabled(): Middleware2[] { return Array.from(this.middlewares.values()).filter(m => !m.enabled) }

  getOrder(): string[] { return [...this.order] }

  getStats(): { total: number; enabled: number; processed: number; errors: number; skipped: number } {
    return {
      total: this.middlewares.size,
      enabled: this.getEnabled().length,
      processed: this.stats.processed,
      errors: this.stats.errors,
      skipped: this.stats.skipped,
    }
  }

  resetStats(): void { this.stats = { processed: 0, errors: 0, skipped: 0 } }

  count(): number { return this.middlewares.size }

  toArray(): Middleware2[] { return Array.from(this.middlewares.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): MiddlewareChain2 {
    const mc = new MiddlewareChain2()
    this.middlewares.forEach((mw, id) => mc.middlewares.set(id, { ...mw, conditions: [...mw.conditions] }))
    mc.order = [...this.order]
    mc.idCounter = this.idCounter
    mc.stats = { ...this.stats }
    return mc
  }
  equals(other: unknown): boolean {
    if (!(other instanceof MiddlewareChain2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.middlewares.clear()
    this.order = []
    this.idCounter = 0
    this.resetStats()
  }
}
