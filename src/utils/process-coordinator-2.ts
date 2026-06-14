export type CoordinatorAction2 = 'start' | 'stop' | 'restart' | 'scale-up' | 'scale-down' | 'deploy' | 'rollback'
export type CoordinatorStatus2 = 'idle' | 'planning' | 'executing' | 'waiting' | 'completed' | 'failed'

export interface ProcessNode2 {
  id: string
  name: string
  host: string
  port: number
  status: 'online' | 'offline' | 'degraded' | 'starting' | 'stopping'
  healthy: boolean
  metadata: Record<string, unknown>
}

export interface ActionPlan2 {
  id: string
  action: CoordinatorAction2
  targets: string[]
  status: CoordinatorStatus2
  createdAt: number
  executedAt: number | null
  result: string | null
  steps: Array<{ node: string; operation: string; done: boolean }>
}

export class ProcessCoordinator2 {
  private nodes: Map<string, ProcessNode2> = new Map()
  private plans: Map<string, ActionPlan2> = new Map()
  private idCounter = 0
  private healthCheckFn: ((node: ProcessNode2) => boolean) | null = null
  private listeners: Array<(event: string, nodeId: string) => void> = []

  registerNode(id: string, name: string, host: string, port: number): this {
    this.nodes.set(id, { id, name, host, port, status: 'online', healthy: true, metadata: {} })
    return this
  }

  removeNode(id: string): boolean { return this.nodes.delete(id) }

  getNode(id: string): ProcessNode2 | undefined { return this.nodes.get(id) }

  setNodeStatus(id: string, status: ProcessNode2['status']): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    node.status = status
    node.healthy = status === 'online'
    this.notify('status_change', id)
    return true
  }

  setNodeMetadata(id: string, key: string, value: unknown): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    node.metadata[key] = value
    return true
  }

  getOnlineNodes(): ProcessNode2[] { return Array.from(this.nodes.values()).filter(n => n.status === 'online') }
  getOfflineNodes(): ProcessNode2[] { return Array.from(this.nodes.values()).filter(n => n.status === 'offline') }
  getDegradedNodes(): ProcessNode2[] { return Array.from(this.nodes.values()).filter(n => n.status === 'degraded') }
  getHealthyNodes(): ProcessNode2[] { return Array.from(this.nodes.values()).filter(n => n.healthy) }

  setHealthChecker(fn: (node: ProcessNode2) => boolean): this { this.healthCheckFn = fn; return this }

  checkHealth(): { healthy: number; unhealthy: number } {
    let healthy = 0
    let unhealthy = 0
    this.nodes.forEach(node => {
      if (this.healthCheckFn) {
        node.healthy = this.healthCheckFn(node)
      }
      node.healthy ? healthy++ : unhealthy++
    })
    return { healthy, unhealthy }
  }

  plan(action: CoordinatorAction2, targets: string[]): string {
    const id = `plan_${++this.idCounter}`
    this.plans.set(id, {
      id, action, targets,
      status: 'planning',
      createdAt: Date.now(),
      executedAt: null,
      result: null,
      steps: targets.map(t => ({ node: t, operation: action, done: false })),
    })
    return id
  }

  execute(planId: string): boolean {
    const plan = this.plans.get(planId)
    if (!plan) return false
    plan.status = 'executing'
    plan.executedAt = Date.now()
    for (const step of plan.steps) {
      const node = this.nodes.get(step.node)
      if (!node) { plan.status = 'failed'; plan.result = `Node ${step.node} not found`; return false }
      step.done = true
      this.notify(plan.action, step.node)
    }
    plan.status = 'completed'
    plan.result = 'success'
    return true
  }

  getPlan(id: string): ActionPlan2 | undefined { return this.plans.get(id) }

  getPlansByStatus(status: CoordinatorStatus2): ActionPlan2[] {
    return Array.from(this.plans.values()).filter(p => p.status === status)
  }

  getPendingPlans(): ActionPlan2[] { return this.getPlansByStatus('planning') }
  getCompletedPlans(): ActionPlan2[] { return this.getPlansByStatus('completed') }
  getFailedPlans(): ActionPlan2[] { return this.getPlansByStatus('failed') }

  listen(fn: (event: string, nodeId: string) => void): this { this.listeners.push(fn); return this }

  private notify(event: string, nodeId: string): void {
    this.listeners.forEach(fn => fn(event, nodeId))
  }

  getStats(): { nodes: number; online: number; degraded: number; offline: number; plans: number } {
    return {
      nodes: this.nodes.size,
      online: this.getOnlineNodes().length,
      degraded: this.getDegradedNodes().length,
      offline: this.getOfflineNodes().length,
      plans: this.plans.size,
    }
  }

  count(): number { return this.nodes.size }

  toArray(): ProcessNode2[] { return Array.from(this.nodes.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): ProcessCoordinator2 {
    const pc = new ProcessCoordinator2()
    this.nodes.forEach((n, id) => pc.nodes.set(id, { ...n, metadata: { ...n.metadata } }))
    this.plans.forEach((p, id) => pc.plans.set(id, { ...p, steps: [...p.steps] }))
    pc.idCounter = this.idCounter
    return pc
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ProcessCoordinator2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.nodes.clear()
    this.plans.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
