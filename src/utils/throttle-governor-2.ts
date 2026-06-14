export type ThrottleState2 = 'open' | 'throttled' | 'closed'

export interface ThrottleRule2 {
  id: string
  resource: string
  maxRate: number
  burstSize: number
  windowMs: number
  state: ThrottleState2
  tokens: number
  lastRefill: number
  totalRequests: number
  totalThrottled: number
  totalAllowed: number
}

export interface ThrottleDecision2 {
  allowed: boolean
  retryAfterMs: number
  remainingTokens: number
}

export class ThrottleGovernor2 {
  private rules: Map<string, ThrottleRule2> = new Map()
  private listeners: Array<(event: string, data: unknown) => void> = []
  private idCounter = 0
  private globalState: ThrottleState2 = 'open'
  private globalThreshold: number = Infinity
  private globalRequestCount: number = 0

  setGlobalThreshold(n: number): this { this.globalThreshold = n; return this }

  create(resource: string, maxRate: number, burstSize: number = 1, windowMs: number = 1000): string {
    const id = `thr_${++this.idCounter}`
    const now = Date.now()
    const rule: ThrottleRule2 = {
      id, resource, maxRate, burstSize, windowMs,
      state: 'open',
      tokens: burstSize,
      lastRefill: now,
      totalRequests: 0,
      totalThrottled: 0,
      totalAllowed: 0,
    }
    this.rules.set(id, rule)
    this.notify('rule-created', { id })
    return id
  }

  delete(id: string): boolean {
    return this.rules.delete(id)
  }

  acquire(id: string, tokens: number = 1): ThrottleDecision2 {
    const rule = this.rules.get(id)
    if (!rule || rule.state === 'closed') {
      return { allowed: false, retryAfterMs: 0, remainingTokens: 0 }
    }

    this.refill(rule)
    rule.totalRequests++
    this.globalRequestCount++

    if (this.globalRequestCount >= this.globalThreshold) {
      this.globalState = 'throttled'
    }

    if (rule.tokens >= tokens) {
      rule.tokens -= tokens
      rule.totalAllowed++
      this.notify('request-allowed', { id, tokens })
      return { allowed: true, retryAfterMs: 0, remainingTokens: rule.tokens }
    }

    rule.totalThrottled++
    rule.state = 'throttled'
    const retryAfterMs = Math.ceil((tokens - rule.tokens) / (rule.maxRate / rule.windowMs) * rule.windowMs)
    this.notify('request-throttled', { id, tokens })
    return { allowed: false, retryAfterMs, remainingTokens: rule.tokens }
  }

  tryAcquire(id: string, tokens: number = 1): boolean {
    return this.acquire(id, tokens).allowed
  }

  private refill(rule: ThrottleRule2): void {
    const now = Date.now()
    const elapsed = now - rule.lastRefill
    const refillRate = rule.maxRate * (elapsed / rule.windowMs)
    rule.tokens = Math.min(rule.burstSize, rule.tokens + refillRate)
    rule.lastRefill = now
    if (rule.tokens > 0 && rule.state === 'throttled') {
      rule.state = 'open'
    }
  }

  close(id: string): boolean {
    const rule = this.rules.get(id)
    if (!rule) return false
    rule.state = 'closed'
    this.notify('rule-closed', { id })
    return true
  }

  reopen(id: string): boolean {
    const rule = this.rules.get(id)
    if (!rule) return false
    rule.state = 'open'
    rule.tokens = rule.burstSize
    rule.lastRefill = Date.now()
    this.notify('rule-reopened', { id })
    return true
  }

  reset(id: string): boolean {
    const rule = this.rules.get(id)
    if (!rule) return false
    rule.tokens = rule.burstSize
    rule.lastRefill = Date.now()
    rule.state = 'open'
    rule.totalRequests = 0
    rule.totalThrottled = 0
    rule.totalAllowed = 0
    return true
  }

  setRate(id: string, maxRate: number, burstSize?: number): boolean {
    const rule = this.rules.get(id)
    if (!rule) return false
    rule.maxRate = maxRate
    if (burstSize !== undefined) rule.burstSize = burstSize
    return true
  }

  getTokens(id: string): number {
    const rule = this.rules.get(id)
    if (!rule) return 0
    this.refill(rule)
    return Math.floor(rule.tokens)
  }

  getByResource(resource: string): ThrottleRule2[] {
    return Array.from(this.rules.values()).filter(r => r.resource === resource)
  }

  getByState(state: ThrottleState2): ThrottleRule2[] {
    return Array.from(this.rules.values()).filter(r => r.state === state)
  }

  getRule(id: string): ThrottleRule2 | undefined { return this.rules.get(id) }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getStats(): { rules: number; open: number; throttled: number; closed: number; totalRequests: number; totalThrottled: number } {
    return {
      rules: this.rules.size,
      open: this.getByState('open').length,
      throttled: this.getByState('throttled').length,
      closed: this.getByState('closed').length,
      totalRequests: Array.from(this.rules.values()).reduce((s, r) => s + r.totalRequests, 0),
      totalThrottled: Array.from(this.rules.values()).reduce((s, r) => s + r.totalThrottled, 0),
    }
  }

  count(): number { return this.rules.size }

  toArray(): ThrottleRule2[] { return Array.from(this.rules.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): ThrottleGovernor2 {
    const tg = new ThrottleGovernor2()
    tg.idCounter = this.idCounter
    tg.globalThreshold = this.globalThreshold
    tg.globalRequestCount = this.globalRequestCount
    return tg
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ThrottleGovernor2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.rules.clear()
    this.listeners = []
    this.idCounter = 0
    this.globalState = 'open'
    this.globalRequestCount = 0
  }
}
