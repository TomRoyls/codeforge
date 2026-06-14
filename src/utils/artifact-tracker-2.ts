export type ArtifactType2 = 'binary' | 'container' | 'library' | 'source' | 'documentation' | 'config'
export type ArtifactState2 = 'pending' | 'building' | 'ready' | 'published' | 'failed' | 'expired'

export interface BuildArtifact2 {
  id: string
  name: string
  type: ArtifactType2
  version: string
  state: ArtifactState2
  size: number
  checksum: string
  buildTime: number
  createdAt: number
  publishedAt: number | null
  tags: string[]
  dependencies: string[]
  metadata: Record<string, unknown>
}

export interface BuildStage2 {
  id: string
  name: string
  artifacts: string[]
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
  startTime: number
  endTime: number | null
  duration: number | null
}

export class ArtifactTracker2 {
  private artifacts: Map<string, BuildArtifact2> = new Map()
  private stages: Map<string, BuildStage2> = new Map()
  private listeners: Array<(event: string, data: unknown) => void> = []
  private idCounter = 0
  private stageCounter = 0
  private retentionDays: number = 90
  private maxArtifacts: number = 10000

  setRetention(days: number): this { this.retentionDays = days; return this }
  setMaxArtifacts(n: number): this { this.maxArtifacts = n; return this }

  create(name: string, type: ArtifactType2, version: string, tags: string[] = []): string {
    const id = `art_${++this.idCounter}`
    const artifact: BuildArtifact2 = {
      id, name, type, version,
      state: 'pending',
      size: 0,
      checksum: '',
      buildTime: 0,
      createdAt: Date.now(),
      publishedAt: null,
      tags,
      dependencies: [],
      metadata: {},
    }
    this.artifacts.set(id, artifact)
    this.notify('artifact-created', { id })
    return id
  }

  markBuilding(id: string): boolean {
    const art = this.artifacts.get(id)
    if (!art || art.state !== 'pending') return false
    art.state = 'building'
    this.notify('artifact-building', { id })
    return true
  }

  markReady(id: string, size: number, checksum: string, buildTime: number): boolean {
    const art = this.artifacts.get(id)
    if (!art || art.state !== 'building') return false
    art.state = 'ready'
    art.size = size
    art.checksum = checksum
    art.buildTime = buildTime
    this.notify('artifact-ready', { id })
    return true
  }

  markFailed(id: string): boolean {
    const art = this.artifacts.get(id)
    if (!art) return false
    art.state = 'failed'
    this.notify('artifact-failed', { id })
    return true
  }

  publish(id: string, registry: string = 'default'): boolean {
    const art = this.artifacts.get(id)
    if (!art || art.state !== 'ready') return false
    art.state = 'published'
    art.publishedAt = Date.now()
    art.metadata['registry'] = registry
    this.notify('artifact-published', { id, registry })
    return true
  }

  expire(id: string): boolean {
    const art = this.artifacts.get(id)
    if (!art) return false
    art.state = 'expired'
    this.notify('artifact-expired', { id })
    return true
  }

  addDependency(id: string, depId: string): boolean {
    const art = this.artifacts.get(id)
    if (!art) return false
    if (!art.dependencies.includes(depId)) art.dependencies.push(depId)
    return true
  }

  addTag(id: string, tag: string): boolean {
    const art = this.artifacts.get(id)
    if (!art) return false
    if (!art.tags.includes(tag)) art.tags.push(tag)
    return true
  }

  setMetadata(id: string, key: string, value: unknown): boolean {
    const art = this.artifacts.get(id)
    if (!art) return false
    art.metadata[key] = value
    return true
  }

  createStage(name: string): string {
    const id = `stage_${++this.stageCounter}`
    const stage: BuildStage2 = {
      id, name,
      artifacts: [],
      status: 'pending',
      startTime: 0,
      endTime: null,
      duration: null,
    }
    this.stages.set(id, stage)
    this.notify('stage-created', { id })
    return id
  }

  startStage(stageId: string): boolean {
    const stage = this.stages.get(stageId)
    if (!stage || stage.status !== 'pending') return false
    stage.status = 'running'
    stage.startTime = Date.now()
    this.notify('stage-started', { stageId })
    return true
  }

  completeStage(stageId: string, success: boolean): boolean {
    const stage = this.stages.get(stageId)
    if (!stage || stage.status !== 'running') return false
    stage.status = success ? 'success' : 'failed'
    stage.endTime = Date.now()
    stage.duration = stage.endTime - stage.startTime
    this.notify('stage-completed', { stageId, success })
    return true
  }

  skipStage(stageId: string): boolean {
    const stage = this.stages.get(stageId)
    if (!stage) return false
    stage.status = 'skipped'
    return true
  }

  assignArtifact(stageId: string, artifactId: string): boolean {
    const stage = this.stages.get(stageId)
    if (!stage) return false
    if (!stage.artifacts.includes(artifactId)) stage.artifacts.push(artifactId)
    return true
  }

  getArtifact(id: string): BuildArtifact2 | undefined { return this.artifacts.get(id) }
  getStage(id: string): BuildStage2 | undefined { return this.stages.get(id) }
  getByState(state: ArtifactState2): BuildArtifact2[] { return Array.from(this.artifacts.values()).filter(a => a.state === state) }
  getByType(type: ArtifactType2): BuildArtifact2[] { return Array.from(this.artifacts.values()).filter(a => a.type === type) }
  getByTag(tag: string): BuildArtifact2[] { return Array.from(this.artifacts.values()).filter(a => a.tags.includes(tag)) }
  getByName(name: string): BuildArtifact2[] { return Array.from(this.artifacts.values()).filter(a => a.name === name) }
  getStages(): BuildStage2[] { return Array.from(this.stages.values()) }
  getDependencies(id: string): BuildArtifact2[] {
    const art = this.artifacts.get(id)
    if (!art) return []
    return art.dependencies.map(d => this.artifacts.get(d)).filter(Boolean) as BuildArtifact2[]
  }

  cleanupExpired(): number {
    const now = Date.now()
    const maxAge = this.retentionDays * 86400000
    let count = 0
    this.artifacts.forEach(art => {
      if (art.state === 'published' && now - art.createdAt > maxAge) {
        art.state = 'expired'
        count++
      }
    })
    return count
  }

  verifyChecksum(id: string, expectedChecksum: string): boolean {
    const art = this.artifacts.get(id)
    if (!art) return false
    return art.checksum === expectedChecksum
  }

  getTotalSize(): number {
    return Array.from(this.artifacts.values()).reduce((s, a) => s + a.size, 0)
  }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getStats(): { artifacts: number; stages: number; published: number; building: number; failed: number; totalSize: number } {
    return {
      artifacts: this.artifacts.size,
      stages: this.stages.size,
      published: this.getByState('published').length,
      building: this.getByState('building').length,
      failed: this.getByState('failed').length,
      totalSize: this.getTotalSize(),
    }
  }

  count(): number { return this.artifacts.size }

  toArray(): BuildArtifact2[] { return Array.from(this.artifacts.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): ArtifactTracker2 {
    const at = new ArtifactTracker2()
    at.idCounter = this.idCounter
    at.stageCounter = this.stageCounter
    at.retentionDays = this.retentionDays
    at.maxArtifacts = this.maxArtifacts
    return at
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ArtifactTracker2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.artifacts.clear()
    this.stages.clear()
    this.listeners = []
    this.idCounter = 0
    this.stageCounter = 0
  }
}
