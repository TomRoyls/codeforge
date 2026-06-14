export type KeepaliveState2 = 'alive' | 'dead' | 'suspect' | 'unknown'

export interface KeepaliveNode2 {
  id: string
  name: string
  state: KeepaliveState2
  lastSeen: number
  interval: number
  timeout: number
  consecutiveMisses: number
  totalChecks: number
  totalMisses: number
  registeredAt: number
}

export class KeepaliveManager2 {
  private nodes: Map<string, KeepaliveNode2> = new Map()
  private listeners: Array<(event: string, node: KeepaliveNode2) => void> = []
  private defaultInterval: number = 5000
  private defaultTimeout: number = 15000
  private maxMisses: number = 3
  private idCounter = 0

  setInterval(ms: number): this { this.defaultInterval = ms; return this }
  setTimeout(ms: number): this { this.defaultTimeout = ms; return this }
  setMaxMisses(n: number): this { this.maxMisses = n; return this }

  register(name: string, interval: number = this.defaultInterval, timeout: number = this.defaultTimeout): string {
    const id = `ka_${++this.idCounter}`
    const node: KeepaliveNode2 = {
      id, name,
      state: 'unknown',
      lastSeen: Date.now(),
      interval,
      timeout,
      consecutiveMisses: 0,
      totalChecks: 0,
      totalMisses: 0,
      registeredAt: Date.now(),
    }
    this.nodes.set(id, node)
    this.notify('registered', node)
    return id
  }

  unregister(id: string): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    this.nodes.delete(id)
    this.notify('unregistered', node)
    return true
  }

  ping(id: string): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    node.lastSeen = Date.now()
    node.consecutiveMisses = 0
    node.totalChecks++
    if (node.state !== 'alive') {
      node.state = 'alive'
      this.notify('alive', node)
    }
    return true
  }

  check(): { alive: number; dead: number; suspect: number; unknown: number } {
    const now = Date.now()
    const result = { alive: 0, dead: 0, suspect: 0, unknown: 0 }
    this.nodes.forEach(node => {
      const elapsed = now - node.lastSeen
      if (elapsed >= node.timeout) {
        if (node.state !== 'dead') {
          node.state = 'dead'
          this.notify('dead', node)
        }
        node.consecutiveMisses++
        node.totalMisses++
        result.dead++
      } else if (elapsed >= node.interval) {
        if (node.state !== 'suspect') {
          node.state = 'suspect'
          this.notify('suspect', node)
        }
        node.consecutiveMisses++
        node.totalMisses++
        result.suspect++
      } else {
        node.state = 'alive'
        result.alive++
      }
    })
    return result
  }

  checkOne(id: string): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    const now = Date.now()
    const elapsed = now - node.lastSeen
    node.totalChecks++
    if (elapsed >= node.timeout) {
      node.state = 'dead'
      node.consecutiveMisses++
      node.totalMisses++
      this.notify('dead', node)
      return false
    } else if (elapsed >= node.interval) {
      node.state = 'suspect'
      node.consecutiveMisses++
      node.totalMisses++
      this.notify('suspect', node)
      return false
    }
    node.state = 'alive'
    return true
  }

  get(id: string): KeepaliveNode2 | undefined { return this.nodes.get(id) }

  getByState(state: KeepaliveState2): KeepaliveNode2[] {
    return Array.from(this.nodes.values()).filter(n => n.state === state)
  }

  getAlive(): KeepaliveNode2[] { return this.getByState('alive') }
  getDead(): KeepaliveNode2[] { return this.getByState('dead') }
  getSuspect(): KeepaliveNode2[] { return this.getByState('suspect') }

  reset(id: string): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    node.state = 'unknown'
    node.consecutiveMisses = 0
    node.lastSeen = Date.now()
    this.notify('reset', node)
    return true
  }

  forceDead(id: string): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    node.state = 'dead'
    this.notify('dead', node)
    return true
  }

  listen(fn: (event: string, node: KeepaliveNode2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, node: KeepaliveNode2): void {
    this.listeners.forEach(fn => fn(event, node))
  }

  getStats(): { total: number; alive: number; dead: number; suspect: number; unknown: number; avgMisses: number } {
    const nodes = Array.from(this.nodes.values())
    const avgMisses = nodes.length === 0 ? 0 : nodes.reduce((s, n) => s + n.totalMisses, 0) / nodes.length
    return {
      total: nodes.length,
      alive: this.getAlive().length,
      dead: this.getDead().length,
      suspect: this.getSuspect().length,
      unknown: this.getByState('unknown').length,
      avgMisses,
    }
  }

  count(): number { return this.nodes.size }

  toArray(): KeepaliveNode2[] { return Array.from(this.nodes.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): KeepaliveManager2 {
    const km = new KeepaliveManager2()
    this.nodes.forEach((n, id) => km.nodes.set(id, { ...n }))
    km.defaultInterval = this.defaultInterval
    km.defaultTimeout = this.defaultTimeout
    km.maxMisses = this.maxMisses
    km.idCounter = this.idCounter
    return km
  }
  equals(other: unknown): boolean {
    if (!(other instanceof KeepaliveManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.nodes.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
