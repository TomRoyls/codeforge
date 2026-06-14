export type NodeState2 = 'alive' | 'suspect' | 'dead' | 'left'
export type NodeRole2 = 'leader' | 'follower' | 'candidate' | 'observer'

export interface ClusterNode2 {
  id: string
  address: string
  port: number
  state: NodeState2
  role: NodeRole2
  joinTime: number
  lastHeartbeat: number
  heartbeatSeq: number
  metadata: Record<string, unknown>
  incarnation: number
}

export interface MembershipEvent2 {
  type: 'join' | 'leave' | 'update' | 'fail' | 'recover'
  nodeId: string
  timestamp: number
  data: Record<string, unknown>
}

export class TopologyManager2 {
  private nodes: Map<string, ClusterNode2> = new Map()
  private events: MembershipEvent2[] = []
  private listeners: Array<(event: MembershipEvent2) => void> = []
  private heartbeatTimeout: number = 5000
  private suspectTimeout: number = 10000
  private deadTimeout: number = 30000
  private localId: string = ''
  private maxEvents: number = 10000

  setHeartbeatTimeout(ms: number): this { this.heartbeatTimeout = ms; return this }
  setSuspectTimeout(ms: number): this { this.suspectTimeout = ms; return this }
  setDeadTimeout(ms: number): this { this.deadTimeout = ms; return this }
  setLocalId(id: string): this { this.localId = id; return this }

  join(id: string, address: string, port: number, role: NodeRole2 = 'follower', metadata: Record<string, unknown> = {}): ClusterNode2 {
    const node: ClusterNode2 = {
      id, address, port,
      state: 'alive',
      role,
      joinTime: Date.now(),
      lastHeartbeat: Date.now(),
      heartbeatSeq: 0,
      metadata,
      incarnation: 0,
    }
    this.nodes.set(id, node)
    this.recordEvent('join', id, { address, port, role })
    return node
  }

  leave(id: string): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    node.state = 'left'
    this.recordEvent('leave', id, {})
    return true
  }

  heartbeat(id: string, seq: number): boolean {
    const node = this.nodes.get(id)
    if (!node || node.state === 'left' || node.state === 'dead') return false
    node.lastHeartbeat = Date.now()
    node.heartbeatSeq = Math.max(node.heartbeatSeq, seq)
    if (node.state === 'suspect') {
      node.state = 'alive'
      node.incarnation++
      this.recordEvent('recover', id, {})
    }
    return true
  }

  suspectNode(id: string): boolean {
    const node = this.nodes.get(id)
    if (!node || node.state !== 'alive') return false
    node.state = 'suspect'
    this.recordEvent('update', id, { state: 'suspect' })
    return true
  }

  markDead(id: string): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    node.state = 'dead'
    this.recordEvent('fail', id, {})
    return true
  }

  updateRole(id: string, role: NodeRole2): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    node.role = role
    this.recordEvent('update', id, { role })
    return true
  }

  updateMetadata(id: string, key: string, value: unknown): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    node.metadata[key] = value
    this.recordEvent('update', id, { metadata: { [key]: value } })
    return true
  }

  checkHealth(): { suspect: number; dead: number; recovered: number } {
    const now = Date.now()
    let suspect = 0, dead = 0, recovered = 0

    this.nodes.forEach(node => {
      const elapsed = now - node.lastHeartbeat
        if (node.state === 'alive' && elapsed >= this.heartbeatTimeout) {
        node.state = 'suspect'
        this.recordEvent('update', node.id, { state: 'suspect' })
        suspect++
      } else if (node.state === 'suspect') {
        if (elapsed >= this.deadTimeout) {
          node.state = 'dead'
          this.recordEvent('fail', node.id, {})
          dead++
        }
      }
    })

    return { suspect, dead, recovered }
  }

  getLeader(): ClusterNode2 | null {
    return Array.from(this.nodes.values()).find(n => n.role === 'leader' && n.state === 'alive') || null
  }

  getAliveNodes(): ClusterNode2[] { return Array.from(this.nodes.values()).filter(n => n.state === 'alive') }
  getSuspectNodes(): ClusterNode2[] { return Array.from(this.nodes.values()).filter(n => n.state === 'suspect') }
  getDeadNodes(): ClusterNode2[] { return Array.from(this.nodes.values()).filter(n => n.state === 'dead') }
  getByRole(role: NodeRole2): ClusterNode2[] { return Array.from(this.nodes.values()).filter(n => n.role === role) }

  get(id: string): ClusterNode2 | undefined { return this.nodes.get(id) }
  size(): number { return this.nodes.size }
  getEvents(): MembershipEvent2[] { return [...this.events] }

  listen(fn: (event: MembershipEvent2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private recordEvent(type: MembershipEvent2['type'], nodeId: string, data: Record<string, unknown>): void {
    const event: MembershipEvent2 = { type, nodeId, timestamp: Date.now(), data }
    this.events.push(event)
    if (this.events.length > this.maxEvents) this.events.shift()
    this.listeners.forEach(fn => fn(event))
  }

  getStats(): { total: number; alive: number; suspect: number; dead: number; left: number } {
    return {
      total: this.nodes.size,
      alive: this.getAliveNodes().length,
      suspect: this.getSuspectNodes().length,
      dead: this.getDeadNodes().length,
      left: Array.from(this.nodes.values()).filter(n => n.state === 'left').length,
    }
  }

  count(): number { return this.nodes.size }

  toArray(): ClusterNode2[] { return Array.from(this.nodes.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): TopologyManager2 {
    const tm = new TopologyManager2()
    tm.localId = this.localId
    tm.heartbeatTimeout = this.heartbeatTimeout
    tm.suspectTimeout = this.suspectTimeout
    tm.deadTimeout = this.deadTimeout
    return tm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof TopologyManager2)) return false
    return this.size() === other.size()
  }
  clear(): void {
    this.nodes.clear()
    this.events = []
    this.listeners = []
  }
}
