export type ProbeType2 = 'liveness' | 'readiness' | 'startup'
export type ProbeResult2 = 'pass' | 'fail' | 'warn' | 'unknown'
export type ProbeStatus2 = 'running' | 'idle' | 'disabled'

export interface Probe2 {
  id: string
  name: string
  type: ProbeType2
  result: ProbeResult2
  status: ProbeStatus2
  check: () => boolean
  lastRun: number | null
  lastResult: ProbeResult2
  consecutiveFailures: number
  consecutivePasses: number
  interval: number
  timeout: number
  failureThreshold: number
  successThreshold: number
  history: Array<{ result: ProbeResult2; timestamp: number; duration: number }>
}

export class ProbeManager2 {
  private probes: Map<string, Probe2> = new Map()
  private idCounter = 0
  private running: boolean = true
  private listeners: Array<(probeId: string, result: ProbeResult2) => void> = []

  register(name: string, type: ProbeType2, check: () => boolean, options: { interval?: number; timeout?: number; failureThreshold?: number; successThreshold?: number } = {}): string {
    const id = `probe_${++this.idCounter}`
    this.probes.set(id, {
      id, name, type,
      result: 'unknown', lastResult: 'unknown',
      status: 'idle',
      check,
      lastRun: null,
      consecutiveFailures: 0,
      consecutivePasses: 0,
      interval: options.interval ?? 5000,
      timeout: options.timeout ?? 2000,
      failureThreshold: options.failureThreshold ?? 3,
      successThreshold: options.successThreshold ?? 1,
      history: [],
    })
    return id
  }

  run(id: string): ProbeResult2 {
    const probe = this.probes.get(id)
    if (!probe || probe.status === 'disabled') return 'unknown'
    probe.status = 'running'
    const start = Date.now()
    let result: ProbeResult2
    try {
      const ok = probe.check()
      result = ok ? 'pass' : 'fail'
    } catch {
      result = 'fail'
    }
    const duration = Date.now() - start
    probe.lastRun = Date.now()
    probe.lastResult = result

    if (result === 'pass') {
      probe.consecutivePasses++
      probe.consecutiveFailures = 0
      if (probe.consecutivePasses >= probe.successThreshold) {
        probe.result = 'pass'
      }
    } else {
      probe.consecutiveFailures++
      probe.consecutivePasses = 0
      if (probe.consecutiveFailures >= probe.failureThreshold) {
        probe.result = 'fail'
      }
    }

    probe.history.push({ result, timestamp: Date.now(), duration })
    if (probe.history.length > 100) probe.history.shift()

    probe.status = 'idle'
    this.notify(id, result)
    return result
  }

  runAll(): Record<string, ProbeResult2> {
    const results: Record<string, ProbeResult2> = {}
    this.probes.forEach((_, id) => { results[id] = this.run(id) })
    return results
  }

  runByType(type: ProbeType2): Record<string, ProbeResult2> {
    const results: Record<string, ProbeResult2> = {}
    this.probes.forEach((probe, id) => {
      if (probe.type === type) results[id] = this.run(id)
    })
    return results
  }

  get(id: string): Probe2 | undefined { return this.probes.get(id) }
  getResult(id: string): ProbeResult2 | undefined { return this.probes.get(id)?.result }

  disable(id: string): boolean {
    const probe = this.probes.get(id)
    if (!probe) return false
    probe.status = 'disabled'
    return true
  }

  enable(id: string): boolean {
    const probe = this.probes.get(id)
    if (!probe) return false
    probe.status = 'idle'
    return true
  }

  remove(id: string): boolean { return this.probes.delete(id) }

  getLivenessProbes(): Probe2[] { return this.getByType('liveness') }
  getReadinessProbes(): Probe2[] { return this.getByType('readiness') }
  getStartupProbes(): Probe2[] { return this.getByType('startup') }

  getByType(type: ProbeType2): Probe2[] {
    return Array.from(this.probes.values()).filter(p => p.type === type)
  }

  getPassing(): Probe2[] { return Array.from(this.probes.values()).filter(p => p.result === 'pass') }
  getFailing(): Probe2[] { return Array.from(this.probes.values()).filter(p => p.result === 'fail') }

  isHealthy(): boolean {
    const liveness = this.getLivenessProbes()
    return liveness.length === 0 || liveness.every(p => p.result === 'pass')
  }

  isReady(): boolean {
    const readiness = this.getReadinessProbes()
    return readiness.length === 0 || readiness.every(p => p.result === 'pass')
  }

  getHistory(id: string, limit = 10): Array<{ result: ProbeResult2; timestamp: number; duration: number }> {
    const probe = this.probes.get(id)
    if (!probe) return []
    return [...probe.history].reverse().slice(0, limit)
  }

  getSuccessRate(id: string): number {
    const probe = this.probes.get(id)
    if (!probe || probe.history.length === 0) return 0
    const passes = probe.history.filter(h => h.result === 'pass').length
    return passes / probe.history.length
  }

  getAverageDuration(id: string): number {
    const probe = this.probes.get(id)
    if (!probe || probe.history.length === 0) return 0
    return probe.history.reduce((s, h) => s + h.duration, 0) / probe.history.length
  }

  listen(fn: (probeId: string, result: ProbeResult2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(probeId: string, result: ProbeResult2): void {
    this.listeners.forEach(fn => fn(probeId, result))
  }

  getStats(): { total: number; passing: number; failing: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {}
    this.probes.forEach(p => { byType[p.type] = (byType[p.type] ?? 0) + 1 })
    return {
      total: this.probes.size,
      passing: this.getPassing().length,
      failing: this.getFailing().length,
      byType,
    }
  }

  count(): number { return this.probes.size }

  toArray(): Probe2[] { return Array.from(this.probes.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): ProbeManager2 {
    const pm = new ProbeManager2()
    this.probes.forEach((p, id) => pm.probes.set(id, { ...p, history: [...p.history] }))
    pm.idCounter = this.idCounter
    return pm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ProbeManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.probes.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
