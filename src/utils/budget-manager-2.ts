export type BudgetPeriod2 = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'one-time'

export interface BudgetAllocation2 {
  id: string
  category: string
  limit: number
  spent: number
  period: BudgetPeriod2
  rollover: boolean
  rolledOver: number
  lastReset: number
}

export interface BudgetTransaction2 {
  id: number
  category: string
  amount: number
  description: string
  timestamp: number
}

export class BudgetManager2 {
  private allocations: Map<string, BudgetAllocation2> = new Map()
  private transactions: BudgetTransaction2[] = []
  private idCounter = 0
  private periodMs: Record<BudgetPeriod2, number> = {
    'daily': 86400000,
    'weekly': 604800000,
    'monthly': 2592000000,
    'yearly': 31536000000,
    'one-time': Infinity,
  }

  allocate(id: string, category: string, limit: number, period: BudgetPeriod2 = 'monthly', rollover = false): this {
    this.allocations.set(id, {
      id, category, limit, spent: 0, period, rollover, rolledOver: 0,
      lastReset: Date.now(),
    })
    return this
  }

  spend(id: string, amount: number, description = ''): BudgetTransaction2 | null {
    const alloc = this.allocations.get(id)
    if (!alloc) return null
    this.maybeReset(alloc)
    if (alloc.spent + amount > this.getAvailable(id)) return null
    alloc.spent += amount
    const txn: BudgetTransaction2 = {
      id: ++this.idCounter,
      category: alloc.category,
      amount, description,
      timestamp: Date.now(),
    }
    this.transactions.push(txn)
    return txn
  }

  refund(id: string, amount: number): boolean {
    const alloc = this.allocations.get(id)
    if (!alloc) return false
    alloc.spent = Math.max(0, alloc.spent - amount)
    return true
  }

  getAvailable(id: string): number {
    const alloc = this.allocations.get(id)
    if (!alloc) return 0
    this.maybeReset(alloc)
    return alloc.limit + (alloc.rollover ? alloc.rolledOver : 0) - alloc.spent
  }

  getRemaining(id: string): number { return this.getAvailable(id) }
  getSpent(id: string): number { return this.allocations.get(id)?.spent ?? 0 }
  getLimit(id: string): number { return this.allocations.get(id)?.limit ?? 0 }
  getUsagePercent(id: string): number {
    const alloc = this.allocations.get(id)
    if (!alloc || alloc.limit === 0) return 0
    return (alloc.spent / alloc.limit) * 100
  }

  isOverBudget(id: string): boolean { return this.getSpent(id) > this.getLimit(id) }
  isNearLimit(id: string, threshold = 0.9): boolean {
    return this.getUsagePercent(id) >= threshold * 100
  }

  getByCategory(category: string): BudgetAllocation2[] {
    return Array.from(this.allocations.values()).filter(a => a.category === category)
  }

  getTransactionsByCategory(category: string): BudgetTransaction2[] {
    return this.transactions.filter(t => t.category === category)
  }

  getTotalSpent(): number {
    return Array.from(this.allocations.values()).reduce((sum, a) => sum + a.spent, 0)
  }

  getTotalLimit(): number {
    return Array.from(this.allocations.values()).reduce((sum, a) => sum + a.limit, 0)
  }

  getTransactions(): BudgetTransaction2[] { return [...this.transactions] }
  getRecentTransactions(n: number): BudgetTransaction2[] { return this.transactions.slice(-n) }

  setLimit(id: string, limit: number): boolean {
    const alloc = this.allocations.get(id)
    if (!alloc) return false
    alloc.limit = limit
    return true
  }

  remove(id: string): boolean { return this.allocations.delete(id) }

  private maybeReset(alloc: BudgetAllocation2): void {
    if (alloc.period === 'one-time') return
    const elapsed = Date.now() - alloc.lastReset
    if (elapsed >= this.periodMs[alloc.period]) {
      if (alloc.rollover) {
        alloc.rolledOver = Math.max(0, alloc.limit - alloc.spent)
      }
      alloc.spent = 0
      alloc.lastReset = Date.now()
    }
  }

  count(): number { return this.allocations.size }

  toArray(): BudgetAllocation2[] { return Array.from(this.allocations.values()) }
  toString(): string { return JSON.stringify({ allocations: this.count(), totalSpent: this.getTotalSpent() }) }
  toJSON(): Record<string, unknown> { return { allocations: this.count(), totalSpent: this.getTotalSpent(), totalLimit: this.getTotalLimit() } }
  clone(): BudgetManager2 {
    const bm = new BudgetManager2()
    this.allocations.forEach((a, id) => bm.allocations.set(id, { ...a }))
    bm.transactions = [...this.transactions]
    bm.idCounter = this.idCounter
    return bm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof BudgetManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.allocations.clear()
    this.transactions = []
    this.idCounter = 0
  }
}
