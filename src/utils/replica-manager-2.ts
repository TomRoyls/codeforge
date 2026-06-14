export type ConsistencyLevel2 = 'strong' | 'eventual' | 'weak' | 'session'

export interface ReplicaInfo2 {
  id: string
  url: string
  region: string
  healthy: boolean
  lag: number
  lastSeen: number
}

export class ReplicaManager2 {
  private replicas: Map<string, ReplicaInfo2> = new Map()
  private primaryId: string | null = null
  private consistency: ConsistencyLevel2
  private readPreference: 'primary' | 'nearest' | 'any'
  private failoverLog: { time: number; from: string; to: string }[] = []

  constructor(consistency: ConsistencyLevel2 = 'eventual', readPreference: 'primary' | 'nearest' | 'any' = 'primary') {
    this.consistency = consistency
    this.readPreference = readPreference
  }

  addReplica(id: string, url: string, region: string): this {
    this.replicas.set(id, {
      id, url, region,
      healthy: true, lag: 0, lastSeen: Date.now(),
    })
    if (this.primaryId === null) this.primaryId = id
    return this
  }

  removeReplica(id: string): boolean {
    if (id === this.primaryId) {
      const others = Array.from(this.replicas.keys()).filter(k => k !== id)
      if (others.length > 0) {
        this.setPrimary(others[0])
      } else {
        this.primaryId = null
      }
    }
    return this.replicas.delete(id)
  }

  getReplica(id: string): ReplicaInfo2 | undefined { return this.replicas.get(id) }

  getAllReplicas(): ReplicaInfo2[] { return Array.from(this.replicas.values()) }

  getHealthyReplicas(): ReplicaInfo2[] {
    return this.getAllReplicas().filter(r => r.healthy)
  }

  getReplicasByRegion(region: string): ReplicaInfo2[] {
    return this.getAllReplicas().filter(r => r.region === region)
  }

  setPrimary(id: string): boolean {
    if (!this.replicas.has(id)) return false
    const old = this.primaryId
    this.primaryId = id
    if (old && old !== id) {
      this.failoverLog.push({ time: Date.now(), from: old, to: id })
    }
    return true
  }

  getPrimary(): ReplicaInfo2 | null {
    return this.primaryId ? this.replicas.get(this.primaryId) ?? null : null
  }

  markUnhealthy(id: string): boolean {
    const r = this.replicas.get(id)
    if (!r) return false
    r.healthy = false
    if (id === this.primaryId) {
      const healthy = this.getHealthyReplicas()
      if (healthy.length > 0) this.setPrimary(healthy[0].id)
    }
    return true
  }

  markHealthy(id: string): boolean {
    const r = this.replicas.get(id)
    if (!r) return false
    r.healthy = true
    r.lastSeen = Date.now()
    return true
  }

  updateLag(id: string, lag: number): boolean {
    const r = this.replicas.get(id)
    if (!r) return false
    r.lag = lag
    r.lastSeen = Date.now()
    return true
  }

  getReadTarget(): ReplicaInfo2 | null {
    const healthy = this.getHealthyReplicas()
    if (healthy.length === 0) return null
    switch (this.readPreference) {
      case 'primary': return this.getPrimary()
      case 'nearest': return healthy.reduce((min, r) => r.lag < min.lag ? r : min)
      case 'any': return healthy[0]
    }
  }

  getWriteTarget(): ReplicaInfo2 | null { return this.getPrimary() }

  getConsistency(): ConsistencyLevel2 { return this.consistency }
  setConsistency(level: ConsistencyLevel2): this { this.consistency = level; return this }

  getReadPreference(): 'primary' | 'nearest' | 'any' { return this.readPreference }
  setReadPreference(pref: 'primary' | 'nearest' | 'any'): this { this.readPreference = pref; return this }

  getFailoverLog(): typeof this.failoverLog { return [...this.failoverLog] }
  getFailoverCount(): number { return this.failoverLog.length }

  count(): number { return this.replicas.size }
  getHealthyCount(): number { return this.getHealthyReplicas().length }

  toArray(): string[] { return Array.from(this.replicas.keys()) }
  toString(): string { return JSON.stringify({ replicas: this.count(), primary: this.primaryId }) }
  toJSON(): Record<string, unknown> { return { replicas: this.count(), healthy: this.getHealthyCount(), primary: this.primaryId, consistency: this.consistency } }
  clone(): ReplicaManager2 {
    const rm = new ReplicaManager2(this.consistency, this.readPreference)
    this.replicas.forEach((r, id) => rm.replicas.set(id, { ...r }))
    rm.primaryId = this.primaryId
    rm.failoverLog = [...this.failoverLog]
    return rm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ReplicaManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.replicas.clear()
    this.primaryId = null
    this.failoverLog = []
  }
}
