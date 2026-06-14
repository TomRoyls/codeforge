export type ReleasePhase2 = 'dev' | 'alpha' | 'beta' | 'rc' | 'stable' | 'hotfix'
export type ReleaseState2 = 'draft' | 'scheduled' | 'in-progress' | 'released' | 'paused' | 'aborted'

export interface Release2 {
  id: string
  version: string
  phase: ReleasePhase2
  state: ReleaseState2
  releaseDate: number | null
  scheduledDate: number | null
  artifacts: string[]
  changelog: string[]
  features: Array<{ name: string; type: 'feature' | 'bugfix' | 'security' | 'improvement' | 'deprecation' }>
  gates: Array<{ name: string; passed: boolean; required: boolean }>
  approvers: Map<string, boolean>
  riskScore: number
  rollbackPlan: string | null
  metadata: Record<string, unknown>
}

export class ReleasePipeline2 {
  private releases: Map<string, Release2> = new Map()
  private listeners: Array<(event: string, data: unknown) => void> = []
  private idCounter = 0
  private autoGates: string[] = ['unit-tests', 'integration-tests', 'security-scan']

  setAutoGates(gates: string[]): this { this.autoGates = gates; return this }

  create(version: string, phase: ReleasePhase2 = 'dev'): string {
    const id = `rel_${++this.idCounter}`
    const release: Release2 = {
      id, version, phase,
      state: 'draft',
      releaseDate: null,
      scheduledDate: null,
      artifacts: [],
      changelog: [],
      features: [],
      gates: this.autoGates.map(name => ({ name, passed: false, required: true })),
      approvers: new Map(),
      riskScore: 0,
      rollbackPlan: null,
      metadata: {},
    }
    this.releases.set(id, release)
    this.notify('release-created', { id })
    return id
  }

  addFeature(id: string, name: string, type: 'feature' | 'bugfix' | 'security' | 'improvement' | 'deprecation'): boolean {
    const rel = this.releases.get(id)
    if (!rel) return false
    rel.features.push({ name, type })
    if (type === 'security') rel.riskScore += 3
    else if (type === 'deprecation') rel.riskScore += 2
    return true
  }

  addChangelog(id: string, entry: string): boolean {
    const rel = this.releases.get(id)
    if (!rel) return false
    rel.changelog.push(entry)
    return true
  }

  assignArtifact(id: string, artifactId: string): boolean {
    const rel = this.releases.get(id)
    if (!rel) return false
    if (!rel.artifacts.includes(artifactId)) rel.artifacts.push(artifactId)
    return true
  }

  setGate(id: string, gateName: string, passed: boolean): boolean {
    const rel = this.releases.get(id)
    if (!rel) return false
    let gate = rel.gates.find(g => g.name === gateName)
    if (!gate) { gate = { name: gateName, passed: false, required: false }; rel.gates.push(gate) }
    gate.passed = passed
    this.notify('gate-updated', { id, gateName, passed })
    return true
  }

  requestApproval(id: string, approver: string): boolean {
    const rel = this.releases.get(id)
    if (!rel) return false
    rel.approvers.set(approver, false)
    this.notify('approval-requested', { id, approver })
    return true
  }

  approve(id: string, approver: string, approved: boolean): boolean {
    const rel = this.releases.get(id)
    if (!rel || !rel.approvers.has(approver)) return false
    rel.approvers.set(approver, approved)
    this.notify('approval-given', { id, approver, approved })
    return true
  }

  schedule(id: string, date: number): boolean {
    const rel = this.releases.get(id)
    if (!rel || rel.state !== 'draft') return false
    rel.scheduledDate = date
    rel.state = 'scheduled'
    this.notify('release-scheduled', { id, date })
    return true
  }

  start(id: string): boolean {
    const rel = this.releases.get(id)
    if (!rel) return false
    if (!this.allGatesPassed(rel)) return false
    rel.state = 'in-progress'
    this.notify('release-started', { id })
    return true
  }

  promote(id: string, phase: ReleasePhase2): boolean {
    const rel = this.releases.get(id)
    if (!rel) return false
    const order: ReleasePhase2[] = ['dev', 'alpha', 'beta', 'rc', 'stable']
    const currentIdx = order.indexOf(rel.phase)
    const newIdx = order.indexOf(phase)
    if (newIdx <= currentIdx && phase !== 'hotfix') return false
    rel.phase = phase
    this.notify('release-promoted', { id, phase })
    return true
  }

  complete(id: string): boolean {
    const rel = this.releases.get(id)
    if (!rel || rel.state !== 'in-progress') return false
    rel.state = 'released'
    rel.releaseDate = Date.now()
    this.notify('release-completed', { id })
    return true
  }

  pause(id: string): boolean {
    const rel = this.releases.get(id)
    if (!rel || rel.state !== 'in-progress') return false
    rel.state = 'paused'
    this.notify('release-paused', { id })
    return true
  }

  resume(id: string): boolean {
    const rel = this.releases.get(id)
    if (!rel || rel.state !== 'paused') return false
    rel.state = 'in-progress'
    this.notify('release-resumed', { id })
    return true
  }

  abort(id: string): boolean {
    const rel = this.releases.get(id)
    if (!rel || rel.state === 'released') return false
    rel.state = 'aborted'
    this.notify('release-aborted', { id })
    return true
  }

  setRollbackPlan(id: string, plan: string): boolean {
    const rel = this.releases.get(id)
    if (!rel) return false
    rel.rollbackPlan = plan
    return true
  }

  setMetadata(id: string, key: string, value: unknown): boolean {
    const rel = this.releases.get(id)
    if (!rel) return false
    rel.metadata[key] = value
    return true
  }

  private allGatesPassed(rel: Release2): boolean {
    return rel.gates.filter(g => g.required).every(g => g.passed)
  }

  getRequiredApprovals(id: string): number {
    const rel = this.releases.get(id)
    if (!rel) return 0
    return Array.from(rel.approvers.values()).filter(Boolean).length
  }

  getRelease(id: string): Release2 | undefined { return this.releases.get(id) }
  getByPhase(phase: ReleasePhase2): Release2[] { return Array.from(this.releases.values()).filter(r => r.phase === phase) }
  getByState(state: ReleaseState2): Release2[] { return Array.from(this.releases.values()).filter(r => r.state === state) }
  getByVersion(version: string): Release2 | undefined { return Array.from(this.releases.values()).find(r => r.version === version) }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getStats(): { total: number; released: number; inProgress: number; scheduled: number; aborted: number } {
    return {
      total: this.releases.size,
      released: this.getByState('released').length,
      inProgress: this.getByState('in-progress').length,
      scheduled: this.getByState('scheduled').length,
      aborted: this.getByState('aborted').length,
    }
  }

  count(): number { return this.releases.size }

  toArray(): Release2[] { return Array.from(this.releases.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): ReleasePipeline2 {
    const rp = new ReleasePipeline2()
    rp.idCounter = this.idCounter
    rp.autoGates = [...this.autoGates]
    return rp
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ReleasePipeline2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.releases.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
