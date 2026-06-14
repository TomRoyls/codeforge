export type SagaStatus2 = 'pending' | 'running' | 'completed' | 'compensating' | 'failed' | 'aborted'
export type StepStatus2 = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'compensated'

export interface SagaStep2 {
  id: string
  name: string
  status: StepStatus2
  execute: () => boolean
  compensate: () => boolean
  timeout: number
  retries: number
  maxRetries: number
  startedAt: number | null
  completedAt: number | null
  error: string | null
}

export interface SagaExecution2 {
  id: string
  name: string
  status: SagaStatus2
  steps: SagaStep2[]
  currentStep: number
  startedAt: number
  completedAt: number | null
  result: string | null
}

export class SagaOrchestrator2 {
  private sagas: Map<string, SagaExecution2> = new Map()
  private globalTimeout: number = 60_000
  private idCounter = 0

  create(name: string, steps: Array<Omit<SagaStep2, 'id' | 'status' | 'retries' | 'startedAt' | 'completedAt' | 'error'>>): string {
    const id = `saga_${++this.idCounter}`
    const fullSteps: SagaStep2[] = steps.map((s, i) => ({
      ...s,
      id: `${id}_step_${i + 1}`,
      status: 'pending',
      retries: 0,
      startedAt: null,
      completedAt: null,
      error: null,
    }))
    this.sagas.set(id, {
      id, name, status: 'pending',
      steps: fullSteps, currentStep: 0,
      startedAt: Date.now(), completedAt: null, result: null,
    })
    return id
  }

  run(id: string): boolean {
    const saga = this.sagas.get(id)
    if (!saga || saga.status !== 'pending') return false
    saga.status = 'running'
    for (let i = saga.currentStep; i < saga.steps.length; i++) {
      const step = saga.steps[i]
      step.status = 'running'
      step.startedAt = Date.now()
      try {
        const ok = step.execute()
        if (!ok) {
          step.status = 'failed'
          step.error = 'execute returned false'
          step.completedAt = Date.now()
          return this.compensate(id)
        }
        step.status = 'completed'
        step.completedAt = Date.now()
        saga.currentStep = i + 1
      } catch (e) {
        step.status = 'failed'
        step.error = String(e)
        step.completedAt = Date.now()
        return this.compensate(id)
      }
    }
    saga.status = 'completed'
    saga.completedAt = Date.now()
    saga.result = 'success'
    return true
  }

  compensate(id: string): boolean {
    const saga = this.sagas.get(id)
    if (!saga) return false
    saga.status = 'compensating'
    let success = true
    for (let i = saga.currentStep - 1; i >= 0; i--) {
      const step = saga.steps[i]
      if (step.status !== 'completed') continue
      try {
        const ok = step.compensate()
        step.status = ok ? 'compensated' : 'failed'
        if (!ok) success = false
      } catch {
        step.status = 'failed'
        success = false
      }
    }
    saga.status = success ? 'aborted' : 'failed'
    saga.completedAt = Date.now()
    saga.result = success ? 'compensated' : 'compensation_failed'
    return success
  }

  abort(id: string): boolean {
    const saga = this.sagas.get(id)
    if (!saga) return false
    if (saga.status === 'completed' || saga.status === 'aborted') return false
    return this.compensate(id)
  }

  retryStep(id: string, stepIndex: number): boolean {
    const saga = this.sagas.get(id)
    if (!saga) return false
    const step = saga.steps[stepIndex]
    if (!step || step.status !== 'failed') return false
    if (step.retries >= step.maxRetries) return false
    step.retries++
    step.status = 'pending'
    step.error = null
    return true
  }

  get(id: string): SagaExecution2 | undefined { return this.sagas.get(id) }
  getStatus(id: string): SagaStatus2 | undefined { return this.sagas.get(id)?.status }

  getByStatus(status: SagaStatus2): SagaExecution2[] {
    return Array.from(this.sagas.values()).filter(s => s.status === status)
  }

  getRunning(): SagaExecution2[] { return this.getByStatus('running') }
  getCompleted(): SagaExecution2[] { return this.getByStatus('completed') }
  getFailed(): SagaExecution2[] { return this.getByStatus('failed') }
  getAborted(): SagaExecution2[] { return this.getByStatus('aborted') }

  getProgress(id: string): number {
    const saga = this.sagas.get(id)
    if (!saga) return 0
    if (saga.steps.length === 0) return 1
    return saga.currentStep / saga.steps.length
  }

  setGlobalTimeout(ms: number): this { this.globalTimeout = ms; return this }
  getGlobalTimeout(): number { return this.globalTimeout }

  remove(id: string): boolean { return this.sagas.delete(id) }
  count(): number { return this.sagas.size }

  getStats(): Record<SagaStatus2, number> {
    const stats: Record<string, number> = { pending: 0, running: 0, completed: 0, compensating: 0, failed: 0, aborted: 0 }
    this.sagas.forEach(s => { stats[s.status]++ })
    return stats as Record<SagaStatus2, number>
  }

  toArray(): SagaExecution2[] { return Array.from(this.sagas.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): SagaOrchestrator2 {
    const so = new SagaOrchestrator2()
    this.sagas.forEach((s, id) => so.sagas.set(id, { ...s, steps: s.steps.map(st => ({ ...st })) }))
    so.globalTimeout = this.globalTimeout
    so.idCounter = this.idCounter
    return so
  }
  equals(other: unknown): boolean {
    if (!(other instanceof SagaOrchestrator2)) return false
    return this.count() === other.count()
  }
  clear(): void { this.sagas.clear(); this.idCounter = 0 }
}
