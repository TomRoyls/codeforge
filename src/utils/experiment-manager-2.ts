export type ExperimentStatus2 = 'draft' | 'running' | 'paused' | 'completed' | 'stopped'

export interface Variant2 {
  name: string
  weight: number
  data: Record<string, unknown>
  participants: number
  conversions: number
}

export interface Experiment2 {
  id: string
  name: string
  description: string
  status: ExperimentStatus2
  variants: Map<string, Variant2>
  startedAt: number | null
  endedAt: number | null
  audience: string[]
}

export class ExperimentManager2 {
  private experiments: Map<string, Experiment2> = new Map()
  private assignments: Map<string, string> = new Map()

  create(id: string, name: string, description = ''): Experiment2 {
    const exp: Experiment2 = {
      id, name, description,
      status: 'draft',
      variants: new Map(),
      startedAt: null, endedAt: null,
      audience: [],
    }
    this.experiments.set(id, exp)
    return exp
  }

  addVariant(expId: string, name: string, weight: number, data: Record<string, unknown> = {}): boolean {
    const exp = this.experiments.get(expId)
    if (!exp) return false
    exp.variants.set(name, { name, weight, data, participants: 0, conversions: 0 })
    return true
  }

  removeVariant(expId: string, name: string): boolean {
    const exp = this.experiments.get(expId)
    if (!exp) return false
    return exp.variants.delete(name)
  }

  start(expId: string): boolean {
    const exp = this.experiments.get(expId)
    if (!exp || exp.status !== 'draft') return false
    if (exp.variants.size === 0) return false
    exp.status = 'running'
    exp.startedAt = Date.now()
    return true
  }

  pause(expId: string): boolean {
    const exp = this.experiments.get(expId)
    if (!exp || exp.status !== 'running') return false
    exp.status = 'paused'
    return true
  }

  resume(expId: string): boolean {
    const exp = this.experiments.get(expId)
    if (!exp || exp.status !== 'paused') return false
    exp.status = 'running'
    return true
  }

  complete(expId: string): boolean {
    const exp = this.experiments.get(expId)
    if (!exp || exp.status === 'completed') return false
    exp.status = 'completed'
    exp.endedAt = Date.now()
    return true
  }

  stop(expId: string): boolean {
    const exp = this.experiments.get(expId)
    if (!exp) return false
    exp.status = 'stopped'
    exp.endedAt = Date.now()
    return true
  }

  assign(expId: string, userId: string): string | null {
    const exp = this.experiments.get(expId)
    if (!exp || exp.status !== 'running') return null
    const key = `${expId}:${userId}`
    if (this.assignments.has(key)) return this.assignments.get(key)!
    const variant = this.selectVariant(exp)
    if (!variant) return null
    variant.participants++
    this.assignments.set(key, variant.name)
    return variant.name
  }

  getAssignment(expId: string, userId: string): string | null {
    return this.assignments.get(`${expId}:${userId}`) ?? null
  }

  convert(expId: string, userId: string): boolean {
    const variantName = this.getAssignment(expId, userId)
    if (!variantName) return false
    const exp = this.experiments.get(expId)
    if (!exp) return false
    const variant = exp.variants.get(variantName)
    if (!variant) return false
    variant.conversions++
    return true
  }

  getConversionRate(expId: string, variantName: string): number {
    const exp = this.experiments.get(expId)
    if (!exp) return 0
    const v = exp.variants.get(variantName)
    if (!v || v.participants === 0) return 0
    return v.conversions / v.participants
  }

  getResults(expId: string): Array<{ variant: string; participants: number; conversions: number; rate: number }> {
    const exp = this.experiments.get(expId)
    if (!exp) return []
    return Array.from(exp.variants.values()).map(v => ({
      variant: v.name,
      participants: v.participants,
      conversions: v.conversions,
      rate: v.participants > 0 ? v.conversions / v.participants : 0,
    }))
  }

  setAudience(expId: string, audience: string[]): boolean {
    const exp = this.experiments.get(expId)
    if (!exp) return false
    exp.audience = [...audience]
    return true
  }

  getExperiment(id: string): Experiment2 | undefined { return this.experiments.get(id) }
  getAllExperiments(): Experiment2[] { return Array.from(this.experiments.values()) }
  getByStatus(status: ExperimentStatus2): Experiment2[] {
    return this.getAllExperiments().filter(e => e.status === status)
  }
  getRunning(): Experiment2[] { return this.getByStatus('running') }

  count(): number { return this.experiments.size }
  getAssignmentCount(): number { return this.assignments.size }

  private selectVariant(exp: Experiment2): Variant2 | null {
    const variants = Array.from(exp.variants.values())
    if (variants.length === 0) return null
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0)
    if (totalWeight === 0) return variants[0]
    let random = Math.random() * totalWeight
    for (const v of variants) {
      random -= v.weight
      if (random <= 0) return v
    }
    return variants[variants.length - 1]
  }

  toArray(): string[] { return Array.from(this.experiments.keys()) }
  toString(): string { return JSON.stringify({ experiments: this.count(), running: this.getRunning().length }) }
  toJSON(): Record<string, unknown> { return { experiments: this.count(), running: this.getRunning().length, assignments: this.getAssignmentCount() } }
  clone(): ExperimentManager2 {
    const em = new ExperimentManager2()
    this.experiments.forEach((exp, id) => {
      const cloned: Experiment2 = {
        ...exp,
        variants: new Map(exp.variants),
        audience: [...exp.audience],
      }
      em.experiments.set(id, cloned)
    })
    this.assignments.forEach((v, k) => em.assignments.set(k, v))
    return em
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ExperimentManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.experiments.clear()
    this.assignments.clear()
  }
}
