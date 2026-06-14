export type DeploymentState2 = 'pending' | 'in-progress' | 'deployed' | 'failed' | 'rolled-back' | 'paused'
export type DeploymentStrategy2 = 'blue-green' | 'canary' | 'rolling' | 'recreate'

export interface Deployment2 {
  id: string
  version: string
  strategy: DeploymentStrategy2
  state: DeploymentState2
  startTime: number
  endTime: number | null
  duration: number | null
  replicas: { desired: number; ready: number; available: number }
  canary: { percentage: number; stepSize: number; currentStep: number; maxSteps: number }
  healthChecks: { passed: number; failed: number; skipped: number }
  rollbackVersion: string | null
  metadata: Record<string, unknown>
  events: Array<{ type: string; message: string; timestamp: number }>
}

export class DeploymentTracker2 {
  private deployments: Map<string, Deployment2> = new Map()
  private active: Set<string> = new Set()
  private listeners: Array<(event: string, deployment: Deployment2) => void> = []
  private idCounter = 0
  private healthCheckFn: ((deployment: Deployment2) => boolean) | null = null

  setHealthCheck(fn: (deployment: Deployment2) => boolean): this { this.healthCheckFn = fn; return this }

  start(version: string, strategy: DeploymentStrategy2 = 'rolling', options: Partial<{ desired: number; canaryPct: number; canaryStep: number; canaryMaxSteps: number; rollbackVersion: string }> = {}): string {
    const id = `dep_${++this.idCounter}`
    const deployment: Deployment2 = {
      id, version, strategy,
      state: 'in-progress',
      startTime: Date.now(),
      endTime: null,
      duration: null,
      replicas: { desired: options.desired ?? 3, ready: 0, available: 0 },
      canary: {
        percentage: options.canaryPct ?? 0,
        stepSize: options.canaryStep ?? 10,
        currentStep: 0,
        maxSteps: options.canaryMaxSteps ?? 10,
      },
      healthChecks: { passed: 0, failed: 0, skipped: 0 },
      rollbackVersion: options.rollbackVersion ?? null,
      metadata: {},
      events: [],
    }
    this.deployments.set(id, deployment)
    this.active.add(id)
    this.addEvent(id, 'started', `Deployment ${version} started with ${strategy} strategy`)
    this.notify('started', deployment)
    return id
  }

  setReplicas(id: string, ready: number, available: number): boolean {
    const dep = this.deployments.get(id)
    if (!dep) return false
    dep.replicas.ready = ready
    dep.replicas.available = available
    return true
  }

  canaryStep(id: string): boolean {
    const dep = this.deployments.get(id)
    if (!dep || dep.strategy !== 'canary' || dep.state !== 'in-progress') return false
    dep.canary.currentStep++
    dep.canary.percentage = Math.min(100, dep.canary.percentage + dep.canary.stepSize)
    this.addEvent(id, 'canary-step', `Canary at ${dep.canary.percentage}%`)
    if (dep.canary.percentage >= 100) this.complete(id)
    return true
  }

  healthCheck(id: string): boolean {
    const dep = this.deployments.get(id)
    if (!dep || dep.state !== 'in-progress') return false
    if (this.healthCheckFn) {
      const passed = this.healthCheckFn(dep)
      if (passed) dep.healthChecks.passed++
      else dep.healthChecks.failed++
      this.addEvent(id, 'health-check', passed ? 'Health check passed' : 'Health check failed')
      if (!passed) this.fail(id, 'Health check failed')
      return passed
    }
    dep.healthChecks.skipped++
    return true
  }

  complete(id: string): boolean {
    const dep = this.deployments.get(id)
    if (!dep || dep.state !== 'in-progress') return false
    dep.state = 'deployed'
    dep.endTime = Date.now()
    dep.duration = dep.endTime - dep.startTime
    dep.replicas.ready = dep.replicas.desired
    dep.replicas.available = dep.replicas.desired
    this.active.delete(id)
    this.addEvent(id, 'completed', `Deployment completed in ${dep.duration}ms`)
    this.notify('completed', dep)
    return true
  }

  fail(id: string, reason: string): boolean {
    const dep = this.deployments.get(id)
    if (!dep) return false
    dep.state = 'failed'
    dep.endTime = Date.now()
    dep.duration = dep.endTime - dep.startTime
    this.active.delete(id)
    this.addEvent(id, 'failed', reason)
    this.notify('failed', dep)
    return true
  }

  rollback(id: string): boolean {
    const dep = this.deployments.get(id)
    if (!dep) return false
    dep.state = 'rolled-back'
    dep.endTime = Date.now()
    dep.duration = dep.endTime - dep.startTime
    this.active.delete(id)
    this.addEvent(id, 'rolled-back', `Rolled back to ${dep.rollbackVersion || 'previous'}`)
    this.notify('rolled-back', dep)
    return true
  }

  pause(id: string): boolean {
    const dep = this.deployments.get(id)
    if (!dep || dep.state !== 'in-progress') return false
    dep.state = 'paused'
    this.addEvent(id, 'paused', 'Deployment paused')
    this.notify('paused', dep)
    return true
  }

  resume(id: string): boolean {
    const dep = this.deployments.get(id)
    if (!dep || dep.state !== 'paused') return false
    dep.state = 'in-progress'
    this.addEvent(id, 'resumed', 'Deployment resumed')
    this.notify('resumed', dep)
    return true
  }

  addMetadata(id: string, key: string, value: unknown): boolean {
    const dep = this.deployments.get(id)
    if (!dep) return false
    dep.metadata[key] = value
    return true
  }

  private addEvent(id: string, type: string, message: string): void {
    const dep = this.deployments.get(id)
    if (dep) dep.events.push({ type, message, timestamp: Date.now() })
  }

  get(id: string): Deployment2 | undefined { return this.deployments.get(id) }
  getActive(): Deployment2[] { return Array.from(this.active).map(id => this.deployments.get(id)!).filter(Boolean) }
  getByState(state: DeploymentState2): Deployment2[] { return Array.from(this.deployments.values()).filter(d => d.state === state) }
  getByStrategy(strategy: DeploymentStrategy2): Deployment2[] { return Array.from(this.deployments.values()).filter(d => d.strategy === strategy) }

  listen(fn: (event: string, deployment: Deployment2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, deployment: Deployment2): void {
    this.listeners.forEach(fn => fn(event, deployment))
  }

  getStats(): { total: number; active: number; deployed: number; failed: number; rolledBack: number } {
    return {
      total: this.deployments.size,
      active: this.active.size,
      deployed: this.getByState('deployed').length,
      failed: this.getByState('failed').length,
      rolledBack: this.getByState('rolled-back').length,
    }
  }

  count(): number { return this.deployments.size }

  toArray(): Deployment2[] { return Array.from(this.deployments.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): DeploymentTracker2 {
    const dt = new DeploymentTracker2()
    dt.idCounter = this.idCounter
    return dt
  }
  equals(other: unknown): boolean {
    if (!(other instanceof DeploymentTracker2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.deployments.clear()
    this.active.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
