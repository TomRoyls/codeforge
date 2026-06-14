export type LimitStrategy2 = 'fixed' | 'sliding' | 'token-bucket' | 'leaky-bucket'

export interface LimitRule2 {
  id: string
  key: string
  strategy: LimitStrategy2
  limit: number
  windowMs: number
  current: number
  remaining: number
  resetAt: number
  blocked: number
  allowed: number
}

export class RateLimiter3 {
  private rules: Map<string, LimitRule2> = new Map()
  private requests: Map<string, number[]> = new Map()
  private tokens: Map<string, { count: number; lastRefill: number }> = new Map()
  private leakLevels: Map<string, { level: number; lastLeak: number }> = new Map()
  private idCounter = 0

  addRule(key: string, strategy: LimitStrategy2, limit: number, windowMs: number): string {
    const id = `rule_${++this.idCounter}`
    this.rules.set(id, {
      id, key, strategy, limit, windowMs,
      current: 0, remaining: limit, resetAt: Date.now() + windowMs,
      blocked: 0, allowed: 0,
    })
    if (strategy === 'token-bucket') {
      this.tokens.set(key, { count: limit, lastRefill: Date.now() })
    }
    if (strategy === 'leaky-bucket') {
      this.leakLevels.set(key, { level: 0, lastLeak: Date.now() })
    }
    return id
  }

  tryAcquire(key: string, amount = 1): boolean {
    const matchingRules = Array.from(this.rules.values()).filter(r => r.key === key)
    if (matchingRules.length === 0) return true

    let allAllowed = true
    for (const rule of matchingRules) {
      const now = Date.now()
      let allowed = false

      switch (rule.strategy) {
        case 'fixed': {
          if (now >= rule.resetAt) {
            rule.current = 0
            rule.resetAt = now + rule.windowMs
          }
          if (rule.current + amount <= rule.limit) {
            rule.current += amount
            rule.remaining = rule.limit - rule.current
            allowed = true
          }
          break
        }
        case 'sliding': {
          if (!this.requests.has(key)) this.requests.set(key, [])
          const timestamps = this.requests.get(key)!
          const cutoff = now - rule.windowMs
          while (timestamps.length > 0 && timestamps[0] < cutoff) timestamps.shift()
          if (timestamps.length + amount <= rule.limit) {
            for (let i = 0; i < amount; i++) timestamps.push(now)
            rule.current = timestamps.length
            rule.remaining = rule.limit - rule.current
            allowed = true
          }
          break
        }
        case 'token-bucket': {
          const bucket = this.tokens.get(key)!
          const elapsed = now - bucket.lastRefill
          const refillRate = rule.limit / rule.windowMs
          bucket.count = Math.min(rule.limit, bucket.count + elapsed * refillRate)
          bucket.lastRefill = now
          if (bucket.count >= amount) {
            bucket.count -= amount
            rule.current = Math.ceil(bucket.count)
            rule.remaining = Math.ceil(bucket.count)
            allowed = true
          }
          break
        }
        case 'leaky-bucket': {
          const bucket = this.leakLevels.get(key)!
          const elapsed = now - bucket.lastLeak
          const leakRate = rule.limit / rule.windowMs
          bucket.level = Math.max(0, bucket.level - elapsed * leakRate)
          bucket.lastLeak = now
          if (bucket.level + amount <= rule.limit) {
            bucket.level += amount
            rule.current = bucket.level
            rule.remaining = rule.limit - bucket.level
            allowed = true
          }
          break
        }
      }

      if (allowed) { rule.allowed++ } else { rule.blocked++; allAllowed = false }
    }
    return allAllowed
  }

  getRule(id: string): LimitRule2 | undefined { return this.rules.get(id) }

  getRulesByKey(key: string): LimitRule2[] {
    return Array.from(this.rules.values()).filter(r => r.key === key)
  }

  removeRule(id: string): boolean { return this.rules.delete(id) }

  reset(key: string): void {
    this.rules.forEach(rule => {
      if (rule.key === key) {
        rule.current = 0
        rule.remaining = rule.limit
        rule.resetAt = Date.now() + rule.windowMs
      }
    })
    this.requests.delete(key)
    const token = this.tokens.get(key)
    if (token) token.count = 1000
  }

  getRemaining(key: string): number {
    const rules = this.getRulesByKey(key)
    if (rules.length === 0) return Infinity
    return Math.min(...rules.map(r => r.remaining))
  }

  isLimited(key: string): boolean { return this.getRemaining(key) <= 0 }

  getByStrategy(strategy: LimitStrategy2): LimitRule2[] {
    return Array.from(this.rules.values()).filter(r => r.strategy === strategy)
  }

  getStats(): { rules: number; totalAllowed: number; totalBlocked: number; byStrategy: Record<string, number> } {
    let totalAllowed = 0
    let totalBlocked = 0
    const byStrategy: Record<string, number> = {}
    this.rules.forEach(r => {
      totalAllowed += r.allowed
      totalBlocked += r.blocked
      byStrategy[r.strategy] = (byStrategy[r.strategy] ?? 0) + 1
    })
    return { rules: this.rules.size, totalAllowed, totalBlocked, byStrategy }
  }

  count(): number { return this.rules.size }

  toArray(): LimitRule2[] { return Array.from(this.rules.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): RateLimiter3 {
    const rl = new RateLimiter3()
    this.rules.forEach((r, id) => rl.rules.set(id, { ...r }))
    rl.idCounter = this.idCounter
    return rl
  }
  equals(other: unknown): boolean {
    if (!(other instanceof RateLimiter3)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.rules.clear()
    this.requests.clear()
    this.tokens.clear()
    this.leakLevels.clear()
    this.idCounter = 0
  }
}
