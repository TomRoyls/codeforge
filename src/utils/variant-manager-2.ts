export type VariantStrategy2 = 'fixed' | 'percentage' | 'sticky' | 'segmented'

export interface Variant2 {
  id: string
  name: string
  weight: number
  payload: Record<string, unknown>
}

export interface Experiment2 {
  id: string
  name: string
  description: string
  variants: Variant2[]
  strategy: VariantStrategy2
  active: boolean
  startTime: number
  endTime: number | null
  assignments: Map<string, string>
  metrics: Map<string, { count: number; sum: number; min: number; max: number }>
  segments: Array<{ rule: string; variantId: string }>
}

export class VariantManager2 {
  private experiments: Map<string, Experiment2> = new Map()
  private listeners: Array<(event: string, data: unknown) => void> = []
  private idCounter = 0
  private stickySalt: string = 'default-salt'

  setStickySalt(salt: string): this { this.stickySalt = salt; return this }

  create(name: string, description: string, strategy: VariantStrategy2 = 'percentage'): string {
    const id = `exp_${++this.idCounter}`
    const experiment: Experiment2 = {
      id, name, description,
      variants: [],
      strategy,
      active: false,
      startTime: 0,
      endTime: null,
      assignments: new Map(),
      metrics: new Map(),
      segments: [],
    }
    this.experiments.set(id, experiment)
    this.notify('experiment-created', { id })
    return id
  }

  addVariant(id: string, name: string, weight: number = 1, payload: Record<string, unknown> = {}): string {
    const exp = this.experiments.get(id)
    if (!exp) return ''
    const vId = `${id}_var_${exp.variants.length + 1}`
    exp.variants.push({ id: vId, name, weight, payload })
    this.notify('variant-added', { experimentId: id, variantId: vId })
    return vId
  }

  removeVariant(id: string, variantId: string): boolean {
    const exp = this.experiments.get(id)
    if (!exp) return false
    exp.variants = exp.variants.filter(v => v.id !== variantId)
    return true
  }

  addSegment(id: string, rule: string, variantId: string): boolean {
    const exp = this.experiments.get(id)
    if (!exp) return false
    exp.segments.push({ rule, variantId })
    return true
  }

  start(id: string): boolean {
    const exp = this.experiments.get(id)
    if (!exp || exp.active) return false
    exp.active = true
    exp.startTime = Date.now()
    this.notify('experiment-started', { id })
    return true
  }

  stop(id: string): boolean {
    const exp = this.experiments.get(id)
    if (!exp || !exp.active) return false
    exp.active = false
    exp.endTime = Date.now()
    this.notify('experiment-stopped', { id })
    return true
  }

  assign(experimentId: string, userId: string): Variant2 | null {
    const exp = this.experiments.get(experimentId)
    if (!exp || !exp.active || exp.variants.length === 0) return null

    if (exp.strategy === 'sticky' || exp.assignments.has(userId)) {
      const existing = exp.assignments.get(userId)
      if (existing) return exp.variants.find(v => v.id === existing) || null
    }

    let assigned: Variant2
    switch (exp.strategy) {
      case 'fixed':
        assigned = exp.variants[0]
        break
      case 'segmented':
        const segMatch = exp.segments.find(s => this.evaluateRule(s.rule, userId))
        assigned = segMatch ? exp.variants.find(v => v.id === segMatch.variantId)! : this.weightedSelect(exp.variants)
        break
      case 'sticky':
        assigned = this.weightedSelect(exp.variants)
        break
      case 'percentage':
      default:
        assigned = this.weightedSelect(exp.variants)
        break
    }

    if (exp.strategy === 'sticky' || exp.strategy === 'segmented') {
      exp.assignments.set(userId, assigned.id)
    }

    this.notify('user-assigned', { experimentId, userId, variantId: assigned.id })
    return assigned
  }

  private weightedSelect(variants: Variant2[]): Variant2 {
    const totalWeight = variants.reduce((s, v) => s + v.weight, 0)
    let r = Math.random() * totalWeight
    for (const v of variants) {
      r -= v.weight
      if (r <= 0) return v
    }
    return variants[variants.length - 1]
  }

  private evaluateRule(rule: string, userId: string): boolean {
    if (rule === 'always') return true
    if (rule === 'never') return false
    if (rule.startsWith('user:')) {
      const targetUser = rule.slice(5)
      return userId === targetUser
    }
    if (rule.startsWith('prefix:')) {
      const prefix = rule.slice(7)
      return userId.startsWith(prefix)
    }
    return false
  }

  getAssignment(experimentId: string, userId: string): Variant2 | null {
    const exp = this.experiments.get(experimentId)
    if (!exp) return null
    const variantId = exp.assignments.get(userId)
    if (!variantId) return null
    return exp.variants.find(v => v.id === variantId) || null
  }

  recordMetric(experimentId: string, variantId: string, metric: string, value: number): boolean {
    const exp = this.experiments.get(experimentId)
    if (!exp) return false
    const key = `${variantId}:${metric}`
    let m = exp.metrics.get(key)
    if (!m) { m = { count: 0, sum: 0, min: Infinity, max: -Infinity }; exp.metrics.set(key, m) }
    m.count++
    m.sum += value
    m.min = Math.min(m.min, value)
    m.max = Math.max(m.max, value)
    return true
  }

  getMetric(experimentId: string, variantId: string, metric: string): { count: number; avg: number; min: number; max: number } | null {
    const exp = this.experiments.get(experimentId)
    if (!exp) return null
    const m = exp.metrics.get(`${variantId}:${metric}`)
    if (!m) return null
    return { count: m.count, avg: m.sum / m.count, min: m.min, max: m.max }
  }

  getResults(experimentId: string): Record<string, Record<string, { count: number; avg: number; min: number; max: number }>> {
    const exp = this.experiments.get(experimentId)
    if (!exp) return {}
    const results: Record<string, Record<string, { count: number; avg: number; min: number; max: number }>> = {}
    exp.metrics.forEach((m, key) => {
      const [variantId, metric] = key.split(':')
      if (!results[variantId]) results[variantId] = {}
      results[variantId][metric] = { count: m.count, avg: m.sum / m.count, min: m.min, max: m.max }
    })
    return results
  }

  get(id: string): Experiment2 | undefined { return this.experiments.get(id) }
  getActive(): Experiment2[] { return Array.from(this.experiments.values()).filter(e => e.active) }
  getByName(name: string): Experiment2 | undefined { return Array.from(this.experiments.values()).find(e => e.name === name) }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getStats(): { total: number; active: number; variants: number; assignments: number } {
    return {
      total: this.experiments.size,
      active: this.getActive().length,
      variants: Array.from(this.experiments.values()).reduce((s, e) => s + e.variants.length, 0),
      assignments: Array.from(this.experiments.values()).reduce((s, e) => s + e.assignments.size, 0),
    }
  }

  count(): number { return this.experiments.size }

  toArray(): Experiment2[] { return Array.from(this.experiments.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): VariantManager2 {
    const vm = new VariantManager2()
    vm.idCounter = this.idCounter
    vm.stickySalt = this.stickySalt
    return vm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof VariantManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.experiments.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
