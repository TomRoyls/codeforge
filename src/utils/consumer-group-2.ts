export type AssignmentState2 = 'assigned' | 'revoked' | 'rebalancing'

export interface PartitionAssignment2 {
  topic: string
  partition: number
  consumerId: string
  state: AssignmentState2
  assignedAt: number
  revokedAt: number | null
}

export interface ConsumerGroupMember2 {
  id: string
  groupId: string
  active: boolean
  joinedAt: number
  heartbeatAt: number
  assignments: Set<string>
}

export class ConsumerGroup2 {
  private members: Map<string, ConsumerGroupMember2> = new Map()
  private groups: Map<string, Set<string>> = new Map()
  private assignments: Map<string, PartitionAssignment2> = new Map()
  private listeners: Array<(event: string, data: unknown) => void> = []
  private idCounter = 0
  private rebalanceInProgress: boolean = false
  private heartbeatTimeout: number = 30000

  setHeartbeatTimeout(ms: number): this { this.heartbeatTimeout = ms; return this }

  join(groupId: string, consumerId?: string): string {
    const id = consumerId || `consumer_${++this.idCounter}`
    if (this.members.has(id)) return id

    const member: ConsumerGroupMember2 = {
      id, groupId,
      active: true,
      joinedAt: Date.now(),
      heartbeatAt: Date.now(),
      assignments: new Set(),
    }
    this.members.set(id, member)
    if (!this.groups.has(groupId)) this.groups.set(groupId, new Set())
    this.groups.get(groupId)!.add(id)
    this.notify('joined', member)
    this.rebalance(groupId)
    return id
  }

  leave(consumerId: string): boolean {
    const member = this.members.get(consumerId)
    if (!member) return false
    member.active = false
    this.revokeAssignments(consumerId)
    this.members.delete(consumerId)
    const groupMembers = this.groups.get(member.groupId)
    if (groupMembers) {
      groupMembers.delete(consumerId)
      if (groupMembers.size === 0) this.groups.delete(member.groupId)
    }
    this.notify('left', member)
    this.rebalance(member.groupId)
    return true
  }

  heartbeat(consumerId: string): boolean {
    const member = this.members.get(consumerId)
    if (!member) return false
    member.heartbeatAt = Date.now()
    return true
  }

  getStaleMembers(): string[] {
    const now = Date.now()
    return Array.from(this.members.values())
      .filter(m => m.active && now - m.heartbeatAt >= this.heartbeatTimeout)
      .map(m => m.id)
  }

  purgeStale(): number {
    const stale = this.getStaleMembers()
    stale.forEach(id => this.leave(id))
    return stale.length
  }

  private assign(topic: string, partition: number, consumerId: string): void {
    const key = `${topic}:${partition}`
    const existing = this.assignments.get(key)
    if (existing) {
      existing.state = 'revoked'
      existing.revokedAt = Date.now()
      const oldMember = this.members.get(existing.consumerId)
      oldMember?.assignments.delete(key)
    }
    const assignment: PartitionAssignment2 = {
      topic, partition, consumerId,
      state: 'assigned',
      assignedAt: Date.now(),
      revokedAt: null,
    }
    this.assignments.set(key, assignment)
    const member = this.members.get(consumerId)
    member?.assignments.add(key)
    this.notify('assigned', assignment)
  }

  private revokeAssignments(consumerId: string): void {
    this.assignments.forEach((assignment, key) => {
      if (assignment.consumerId === consumerId && assignment.state === 'assigned') {
        assignment.state = 'revoked'
        assignment.revokedAt = Date.now()
        this.notify('revoked', assignment)
      }
    })
  }

  rebalance(groupId: string): void {
    if (this.rebalanceInProgress) return
    this.rebalanceInProgress = true
    const members = this.getGroupMembers(groupId).filter(m => m.active)
    if (members.length === 0) {
      this.rebalanceInProgress = false
      return
    }

    const partitions = this.getGroupPartitions(groupId)
    members.forEach(m => {
      m.assignments.forEach(key => {
        const a = this.assignments.get(key)
        if (a && a.state === 'assigned') {
          a.state = 'revoked'
          a.revokedAt = Date.now()
        }
      })
      m.assignments.clear()
    })

    partitions.forEach((partition, idx) => {
      const consumer = members[idx % members.length]
      this.assign(partition.topic, partition.partition, consumer.id)
    })
    this.notify('rebalanced', { groupId, members: members.length })
    this.rebalanceInProgress = false
  }

  private getGroupMembers(groupId: string): ConsumerGroupMember2[] {
    const ids = this.groups.get(groupId)
    if (!ids) return []
    return Array.from(ids).map(id => this.members.get(id)!).filter(Boolean)
  }

  private getGroupPartitions(groupId: string): Array<{ topic: string; partition: number }> {
    const partitions: Array<{ topic: string; partition: number }> = []
    this.assignments.forEach(a => {
      if (a.state === 'assigned' || a.state === 'revoked') {
        partitions.push({ topic: a.topic, partition: a.partition })
      }
    })
    return partitions
  }

  addPartitions(groupId: string, topic: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const key = `${topic}:${i}`
      if (!this.assignments.has(key)) {
        this.assignments.set(key, {
          topic, partition: i, consumerId: '',
          state: 'assigned',
          assignedAt: Date.now(),
          revokedAt: null,
        })
      }
    }
    this.rebalance(groupId)
  }

  getAssignment(topic: string, partition: number): PartitionAssignment2 | undefined {
    return this.assignments.get(`${topic}:${partition}`)
  }

  getConsumerAssignments(consumerId: string): PartitionAssignment2[] {
    const member = this.members.get(consumerId)
    if (!member) return []
    return Array.from(member.assignments)
      .map(key => this.assignments.get(key))
      .filter(Boolean) as PartitionAssignment2[]
  }

  getMember(id: string): ConsumerGroupMember2 | undefined { return this.members.get(id) }
  getGroupMembers(groupId: string): ConsumerGroupMember2[] { return this.getGroupMembersInternal(groupId) }

  private getGroupMembersInternal(groupId: string): ConsumerGroupMember2[] {
    const ids = this.groups.get(groupId)
    if (!ids) return []
    return Array.from(ids).map(id => this.members.get(id)!).filter(Boolean)
  }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getStats(): { members: number; groups: number; assignments: number; stale: number } {
    return {
      members: this.members.size,
      groups: this.groups.size,
      assignments: Array.from(this.assignments.values()).filter(a => a.state === 'assigned').length,
      stale: this.getStaleMembers().length,
    }
  }

  count(): number { return this.members.size }

  toArray(): ConsumerGroupMember2[] { return Array.from(this.members.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): ConsumerGroup2 {
    const cg = new ConsumerGroup2()
    cg.heartbeatTimeout = this.heartbeatTimeout
    cg.idCounter = this.idCounter
    return cg
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ConsumerGroup2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.members.clear()
    this.groups.clear()
    this.assignments.clear()
    this.listeners = []
    this.idCounter = 0
    this.rebalanceInProgress = false
  }
}
