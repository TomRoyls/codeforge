export type PartState2 = 'assigned' | 'transferring' | 'rebalancing' | 'orphaned'

export interface Partition2 {
  id: number
  topic: string
  leader: string | null
  replicas: string[]
  inSync: string[]
  state: PartState2
  offset: number
  size: number
  messageCount: number
}

export interface Broker2 {
  id: string
  host: string
  port: number
  rack: string | null
  partitions: Set<number>
  bytesIn: number
  bytesOut: number
  state: 'online' | 'offline' | 'draining'
}

export interface Reassignment2 {
  id: string
  partitionId: number
  topic: string
  from: string[]
  to: string[]
  state: 'pending' | 'in-progress' | 'completed' | 'failed'
  progress: number
}

export class PartitionAssignor2 {
  private partitions: Map<string, Partition2> = new Map()
  private brokers: Map<string, Broker2> = new Map()
  private reassignments: Map<string, Reassignment2> = new Map()
  private listeners: Array<(event: string, data: unknown) => void> = []
  private idCounter = 0
  private reassignCounter = 0
  private replicationFactor: number = 3
  private minIsr: number = 2

  setReplicationFactor(n: number): this { this.replicationFactor = n; return this }
  setMinIsr(n: number): this { this.minIsr = n; return this }

  addBroker(id: string, host: string, port: number, rack: string | null = null): boolean {
    if (this.brokers.has(id)) return false
    this.brokers.set(id, { id, host, port, rack, partitions: new Set(), bytesIn: 0, bytesOut: 0, state: 'online' })
    this.notify('broker-added', { id })
    return true
  }

  removeBroker(id: string): boolean {
    const broker = this.brokers.get(id)
    if (!broker) return false
    broker.state = 'draining'
    this.notify('broker-draining', { id })
    return true
  }

  setBrokerOffline(id: string): boolean {
    const broker = this.brokers.get(id)
    if (!broker) return false
    broker.state = 'offline'
    this.notify('broker-offline', { id })
    return true
  }

  setBrokerOnline(id: string): boolean {
    const broker = this.brokers.get(id)
    if (!broker) return false
    broker.state = 'online'
    this.notify('broker-online', { id })
    return true
  }

  createTopic(topic: string, numPartitions: number): number {
    const rf = Math.min(this.replicationFactor, this.getOnlineBrokers().length)
    if (rf === 0) return 0

    let created = 0
    for (let i = 0; i < numPartitions; i++) {
      const partId = ++this.idCounter
      const key = `${topic}-${partId}`
      const brokers = this.getOnlineBrokers()
      const replicas = this.selectReplicas(brokers, rf)
      const partition: Partition2 = {
        id: partId, topic,
        leader: replicas[0] || null,
        replicas,
        inSync: [...replicas],
        state: 'assigned',
        offset: 0, size: 0, messageCount: 0,
      }
      this.partitions.set(key, partition)
      replicas.forEach(bid => this.brokers.get(bid)?.partitions.add(partId))
      created++
    }
    this.notify('topic-created', { topic, partitions: created })
    return created
  }

  private selectReplicas(brokers: Broker2[], count: number): string[] {
    const sorted = [...brokers].sort((a, b) => a.partitions.size - b.partitions.size)
    return sorted.slice(0, count).map(b => b.id)
  }

  private getOnlineBrokers(): Broker2[] {
    return Array.from(this.brokers.values()).filter(b => b.state === 'online')
  }

  recordMessage(topic: string, partId: number, size: number): boolean {
    const key = `${topic}-${partId}`
    const part = this.partitions.get(key)
    if (!part) return false
    part.messageCount++
    part.offset++
    part.size += size
    const leader = this.brokers.get(part.leader || '')
    if (leader) {
      leader.bytesIn += size
      leader.bytesOut += size
    }
    return true
  }

  markOutOfSync(topic: string, partId: number, brokerId: string): boolean {
    const key = `${topic}-${partId}`
    const part = this.partitions.get(key)
    if (!part) return false
    part.inSync = part.inSync.filter(r => r !== brokerId)
    return true
  }

  markInSync(topic: string, partId: number, brokerId: string): boolean {
    const key = `${topic}-${partId}`
    const part = this.partitions.get(key)
    if (!part || !part.replicas.includes(brokerId)) return false
    if (!part.inSync.includes(brokerId)) part.inSync.push(brokerId)
    return true
  }

  isUnderReplicated(topic: string, partId: number): boolean {
    const key = `${topic}-${partId}`
    const part = this.partitions.get(key)
    if (!part) return false
    return part.inSync.length < this.replicationFactor
  }

  reassign(topic: string, partId: number, newReplicas: string[]): string | null {
    const key = `${topic}-${partId}`
    const part = this.partitions.get(key)
    if (!part) return null
    const reassignId = `reassign_${++this.reassignCounter}`
    const reassignment: Reassignment2 = {
      id: reassignId,
      partitionId: partId, topic,
      from: [...part.replicas],
      to: newReplicas,
      state: 'pending',
      progress: 0,
    }
    this.reassignments.set(reassignId, reassignment)
    part.state = 'rebalancing'
    this.notify('reassignment-started', { reassignId })
    return reassignId
  }

  completeReassignment(reassignId: string): boolean {
    const r = this.reassignments.get(reassignId)
    if (!r) return false
    const key = `${r.topic}-${r.partitionId}`
    const part = this.partitions.get(key)
    if (!part) return false
    r.state = 'completed'
    r.progress = 100
    r.from.forEach(bid => this.brokers.get(bid)?.partitions.delete(r.partitionId))
    part.replicas = r.to
    part.inSync = [...r.to]
    part.leader = r.to[0] || null
    r.to.forEach(bid => this.brokers.get(bid)?.partitions.add(r.partitionId))
    part.state = 'assigned'
    this.notify('reassignment-completed', { reassignId })
    return true
  }

  electLeader(topic: string, partId: number): string | null {
    const key = `${topic}-${partId}`
    const part = this.partitions.get(key)
    if (!part || part.inSync.length === 0) return null
    part.leader = part.inSync[0]
    this.notify('leader-elected', { topic, partId, leader: part.leader })
    return part.leader
  }

  getPartition(topic: string, partId: number): Partition2 | undefined {
    return this.partitions.get(`${topic}-${partId}`)
  }

  getTopicPartitions(topic: string): Partition2[] {
    return Array.from(this.partitions.values()).filter(p => p.topic === topic)
  }

  getBroker(id: string): Broker2 | undefined { return this.brokers.get(id) }
  getBrokers(): Broker2[] { return Array.from(this.brokers.values()) }
  getUnderReplicated(): Partition2[] {
    return Array.from(this.partitions.values()).filter(p => p.inSync.length < this.replicationFactor)
  }

  getLeaderFor(topic: string, partId: number): string | null {
    return this.getPartition(topic, partId)?.leader ?? null
  }

  recordThroughput(brokerId: string, bytesIn: number, bytesOut: number): boolean {
    const broker = this.brokers.get(brokerId)
    if (!broker) return false
    broker.bytesIn += bytesIn
    broker.bytesOut += bytesOut
    return true
  }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getStats(): { brokers: number; partitions: number; underReplicated: number; topics: number; reassignments: number } {
    const topics = new Set(Array.from(this.partitions.values()).map(p => p.topic))
    return {
      brokers: this.brokers.size,
      partitions: this.partitions.size,
      underReplicated: this.getUnderReplicated().length,
      topics: topics.size,
      reassignments: this.reassignments.size,
    }
  }

  count(): number { return this.partitions.size }

  toArray(): Partition2[] { return Array.from(this.partitions.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): PartitionAssignor2 {
    const pa = new PartitionAssignor2()
    pa.replicationFactor = this.replicationFactor
    pa.minIsr = this.minIsr
    pa.idCounter = this.idCounter
    pa.reassignCounter = this.reassignCounter
    return pa
  }
  equals(other: unknown): boolean {
    if (!(other instanceof PartitionAssignor2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.partitions.clear()
    this.brokers.clear()
    this.reassignments.clear()
    this.listeners = []
    this.idCounter = 0
    this.reassignCounter = 0
  }
}
