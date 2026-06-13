export interface WorkflowStep2 {
  name: string
  action: (ctx: Record<string, unknown>) => void | Promise<void>
  rollback?: (ctx: Record<string, unknown>) => void | Promise<void>
  condition?: (ctx: Record<string, unknown>) => boolean
}

export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'rolled-back'

export interface WorkflowResult {
  status: WorkflowStatus
  completedSteps: string[]
  failedStep?: string
  error?: unknown
}

export class WorkflowEngine2 {
  private steps: WorkflowStep2[] = []
  private stepMap: Map<string, WorkflowStep2> = new Map()

  step(s: WorkflowStep2): this {
    this.steps.push(s)
    this.stepMap.set(s.name, s)
    return this
  }

  removeStep(name: string): boolean {
    const idx = this.steps.findIndex(s => s.name === name)
    if (idx === -1) return false
    this.steps.splice(idx, 1)
    this.stepMap.delete(name)
    return true
  }

  getStep(name: string): WorkflowStep2 | undefined {
    return this.stepMap.get(name)
  }

  hasStep(name: string): boolean {
    return this.stepMap.has(name)
  }

  stepNames(): string[] {
    return this.steps.map(s => s.name)
  }

  async execute(ctx?: Record<string, unknown>): Promise<WorkflowResult> {
    const context = ctx ?? {}
    const completed: string[] = []

    for (const step of this.steps) {
      if (step.condition && !step.condition(context)) continue
      try {
        await step.action(context)
        completed.push(step.name)
      } catch (err) {
        await this.rollback(completed, context)
        return { status: 'failed', completedSteps: completed, failedStep: step.name, error: err }
      }
    }
    return { status: 'completed', completedSteps: completed }
  }

  private async rollback(completed: string[], ctx: Record<string, unknown>): Promise<void> {
    for (let i = completed.length - 1; i >= 0; i--) {
      const step = this.stepMap.get(completed[i])
      if (step?.rollback) {
        try { await step.rollback(ctx) } catch {}
      }
    }
  }

  async executeStep(name: string, ctx?: Record<string, unknown>): Promise<boolean> {
    const step = this.stepMap.get(name)
    if (!step) return false
    try {
      await step.action(ctx ?? {})
      return true
    } catch {
      return false
    }
  }

  count(): number { return this.steps.length }

  clear(): void {
    this.steps = []
    this.stepMap.clear()
  }

  clone(): WorkflowEngine2 {
    const we = new WorkflowEngine2()
    this.steps.forEach(s => we.step({ ...s }))
    return we
  }

  toArray(): string[] { return this.stepNames() }
  toString(): string { return JSON.stringify({ steps: this.stepNames() }) }
  toJSON(): string[] { return this.stepNames() }
  equals(other: unknown): boolean {
    if (!(other instanceof WorkflowEngine2)) return false
    return this.count() === other.count()
  }
}
