export type ReleaseStatus2 = 'draft' | 'testing' | 'staging' | 'production' | 'rolled-back'

export interface Release2 {
  id: string
  version: string
  status: ReleaseStatus2
  changes: string[]
  createdAt: number
  promotedAt: number | null
  rollbackOf: string | null
  metadata: Record<string, unknown>
}

export class ReleaseManager2 {
  private releases: Map<string, Release2> = new Map()
  private idCounter = 0
  private environmentOrder: ReleaseStatus2[] = ['draft', 'testing', 'staging', 'production']
  private currentProduction: string | null = null
  private releaseHistory: string[] = []

  create(version: string, changes: string[] = []): Release2 {
    const id = `rel_${++this.idCounter}`
    const release: Release2 = {
      id, version,
      status: 'draft',
      changes: [...changes],
      createdAt: Date.now(),
      promotedAt: null,
      rollbackOf: null,
      metadata: {},
    }
    this.releases.set(id, release)
    return release
  }

  promote(id: string): boolean {
    const release = this.releases.get(id)
    if (!release) return false
    const currentIdx = this.environmentOrder.indexOf(release.status)
    if (currentIdx === -1 || currentIdx >= this.environmentOrder.length - 1) return false
    if (release.status === 'staging') {
      this.currentProduction = id
    }
    release.status = this.environmentOrder[currentIdx + 1]
    release.promotedAt = Date.now()
    if (release.status === 'production') {
      this.releaseHistory.push(id)
    }
    return true
  }

  rollback(releaseId: string): Release2 | null {
    const release = this.releases.get(releaseId)
    if (!release || release.status !== 'production') return null
    release.status = 'rolled-back'
    const rb = this.create(release.version, [`Rollback of ${releaseId}`])
    rb.rollbackOf = releaseId
    rb.status = 'production'
    rb.promotedAt = Date.now()
    this.currentProduction = rb.id
    this.releaseHistory.push(rb.id)
    return rb
  }

  get(id: string): Release2 | undefined { return this.releases.get(id) }

  getByVersion(version: string): Release2[] {
    return Array.from(this.releases.values()).filter(r => r.version === version)
  }

  getByStatus(status: ReleaseStatus2): Release2[] {
    return Array.from(this.releases.values()).filter(r => r.status === status)
  }

  getCurrentProduction(): Release2 | null {
    return this.currentProduction ? this.releases.get(this.currentProduction) ?? null : null
  }

  getHistory(): Release2[] {
    return this.releaseHistory.map(id => this.releases.get(id)).filter(Boolean) as Release2[]
  }

  addChange(id: string, change: string): boolean {
    const release = this.releases.get(id)
    if (!release) return false
    release.changes.push(change)
    return true
  }

  setMetadata(id: string, key: string, value: unknown): boolean {
    const release = this.releases.get(id)
    if (!release) return false
    release.metadata[key] = value
    return true
  }

  getInTesting(): Release2[] { return this.getByStatus('testing') }
  getInStaging(): Release2[] { return this.getByStatus('staging') }
  getInProduction(): Release2[] { return this.getByStatus('production') }
  getRolledBack(): Release2[] { return this.getByStatus('rolled-back') }

  count(): number { return this.releases.size }

  toArray(): string[] { return Array.from(this.releases.keys()) }
  toString(): string { return JSON.stringify({ releases: this.count(), production: this.currentProduction }) }
  toJSON(): Record<string, unknown> { return { releases: this.count(), production: this.currentProduction, history: this.releaseHistory.length } }
  clone(): ReleaseManager2 {
    const rm = new ReleaseManager2()
    this.releases.forEach((r, id) => rm.releases.set(id, { ...r, changes: [...r.changes], metadata: { ...r.metadata } }))
    rm.idCounter = this.idCounter
    rm.currentProduction = this.currentProduction
    rm.releaseHistory = [...this.releaseHistory]
    rm.environmentOrder = [...this.environmentOrder]
    return rm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ReleaseManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.releases.clear()
    this.idCounter = 0
    this.currentProduction = null
    this.releaseHistory = []
  }
}
