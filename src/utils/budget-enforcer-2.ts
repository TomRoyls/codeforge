export type BudgetState2 = 'active' | 'exhausted' | 'exceeded' | 'paused' | 'reset'

export interface BudgetEntry2 {
  id: string
  resource: string
  amount: number
  timestamp: number
  metadata: Record<string, unknown>
}

export interface Budget2 {
  id: string
  name: string
  limit: number
  spent: number
  reserved: number
  state: BudgetState2
  period: number
  cycleStart: number
  cycleEnd: number
  entries: BudgetEntry2[]
  alertThresholds: number[]
  lastAlertAt: number
}

export class BudgetEnforcer2 {
  private budgets: Map<string, Budget2> = new Map()
  private listeners: Array<(event: string, budget: Budget2, entry?: BudgetEntry2) => void> = []
  private idCounter = 0

  create(name: string, limit: number, period: number = 86400000, alertThresholds: number[] = [0.5, 0.8, 0.9, 1.0]): string {
    const id = `budget_${++this.idCounter}`
    const now = Date.now()
    const budget: Budget2 = {
      id, name, limit,
      spent: 0, reserved: 0,
      state: 'active',
      period,
      cycleStart: now,
      cycleEnd: now + period,
      entries: [],
      alertThresholds,
      lastAlertAt: 0,
    }
    this.budgets.set(id, budget)
    this.notify('created', budget)
    return id
  }

  delete(id: string): boolean {
    const existed = this.budgets.delete(id)
    if (existed) this.notify('deleted', { id } as Budget2)
    return existed
  }

  spend(id: string, resource: string, amount: number, metadata: Record<string, unknown> = {}): BudgetEntry2 | null {
    const budget = this.budgets.get(id)
    if (!budget || budget.state !== 'active') return null

    this.checkCycle(budget)
    const totalCommitted = budget.spent + budget.reserved + amount
    if (totalCommitted > budget.limit) {
      budget.state = 'exceeded'
      this.notify('exceeded', budget)
      return null
    }

    const entry: BudgetEntry2 = {
      id: `entry_${budget.entries.length + 1}`,
      resource, amount,
      timestamp: Date.now(),
      metadata,
    }
    budget.entries.push(entry)
    budget.spent += amount
    this.checkAlerts(budget)
    this.notify('spent', budget, entry)
    if (budget.spent >= budget.limit) {
      budget.state = 'exhausted'
      this.notify('exhausted', budget)
    }
    return entry
  }

  reserve(id: string, amount: number): boolean {
    const budget = this.budgets.get(id)
    if (!budget || budget.state !== 'active') return false
    this.checkCycle(budget)
    if (budget.spent + budget.reserved + amount > budget.limit) return false
    budget.reserved += amount
    this.notify('reserved', budget)
    return true
  }

  release(id: string, amount: number): boolean {
    const budget = this.budgets.get(id)
    if (!budget) return false
    budget.reserved = Math.max(0, budget.reserved - amount)
    this.notify('released', budget)
    return true
  }

  refund(id: string, entryId: string): boolean {
    const budget = this.budgets.get(id)
    if (!budget) return false
    const entry = budget.entries.find(e => e.id === entryId)
    if (!entry) return false
    budget.spent = Math.max(0, budget.spent - entry.amount)
    entry.amount = 0
    if (budget.state === 'exhausted' || budget.state === 'exceeded') {
      budget.state = 'active'
    }
    this.notify('refunded', budget)
    return true
  }

  reset(id: string): boolean {
    const budget = this.budgets.get(id)
    if (!budget) return false
    const now = Date.now()
    budget.spent = 0
    budget.reserved = 0
    budget.state = 'active'
    budget.cycleStart = now
    budget.cycleEnd = now + budget.period
    budget.entries = []
    budget.lastAlertAt = 0
    this.notify('reset', budget)
    return true
  }

  pause(id: string): boolean {
    const budget = this.budgets.get(id)
    if (!budget) return false
    budget.state = 'paused'
    this.notify('paused', budget)
    return true
  }

  resume(id: string): boolean {
    const budget = this.budgets.get(id)
    if (!budget || budget.state !== 'paused') return false
    budget.state = 'active'
    this.notify('resumed', budget)
    return true
  }

  private checkCycle(budget: Budget2): void {
    if (Date.now() >= budget.cycleEnd) {
      const now = Date.now()
      budget.spent = 0
      budget.reserved = 0
      budget.state = 'active'
      budget.cycleStart = now
      budget.cycleEnd = now + budget.period
      budget.entries = []
      budget.lastAlertAt = 0
      this.notify('cycled', budget)
    }
  }

  private checkAlerts(budget: Budget2): void {
    const ratio = budget.spent / budget.limit
    budget.alertThresholds.forEach(threshold => {
      if (ratio >= threshold && budget.lastAlertAt < threshold) {
        this.notify('alert', budget)
        budget.lastAlertAt = threshold
      }
    })
  }

  get(id: string): Budget2 | undefined { return this.budgets.get(id) }
  getByName(name: string): Budget2 | undefined {
    return Array.from(this.budgets.values()).find(b => b.name === name)
  }
  getActive(): Budget2[] { return Array.from(this.budgets.values()).filter(b => b.state === 'active') }
  getByState(state: BudgetState2): Budget2[] { return Array.from(this.budgets.values()).filter(b => b.state === state) }
  getRemaining(id: string): number { const b = this.budgets.get(id); return b ? b.limit - b.spent - b.reserved : 0 }
  getUtilization(id: string): number { const b = this.budgets.get(id); return b ? b.spent / b.limit : 0 }

  listen(fn: (event: string, budget: Budget2, entry?: BudgetEntry2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, budget: Budget2, entry?: BudgetEntry2): void {
    this.listeners.forEach(fn => fn(event, budget, entry))
  }

  getStats(): { total: number; active: number; exhausted: number; exceeded: number } {
    return {
      total: this.budgets.size,
      active: this.getByState('active').length,
      exhausted: this.getByState('exhausted').length,
      exceeded: this.getByState('exceeded').length,
    }
  }

  count(): number { return this.budgets.size }

  toArray(): Budget2[] { return Array.from(this.budgets.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): BudgetEnforcer2 {
    const be = new BudgetEnforcer2()
    be.idCounter = this.idCounter
    return be
  }
  equals(other: unknown): boolean {
    if (!(other instanceof BudgetEnforcer2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.budgets.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
