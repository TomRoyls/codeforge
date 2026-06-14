export type SpanStatus2 = 'started' | 'ended' | 'error'
export type SpanKind2 = 'internal' | 'server' | 'client' | 'producer' | 'consumer'

export interface Span2 {
  id: string
  traceId: string
  parentId: string | null
  name: string
  kind: SpanKind2
  status: SpanStatus2
  startTime: number
  endTime: number | null
  duration: number | null
  attributes: Record<string, unknown>
  events: Array<{ name: string; time: number; attributes: Record<string, unknown> }>
  links: Array<{ traceId: string; spanId: string }>
  error: string | null
}

export class SpanCollector2 {
  private spans: Map<string, Span2> = new Map()
  private traces: Map<string, string[]> = new Map()
  private idCounter = 0
  private listeners: Array<(event: string, span: Span2) => void> = []
  private samplers: Array<(span: Span2) => boolean> = []
  private maxSpans: number = 100000

  setMaxSpans(n: number): this { this.maxSpans = n; return this }

  addSampler(fn: (span: Span2) => boolean): this {
    this.samplers.push(fn)
    return this
  }

  startSpan(traceId: string, parentId: string | null, name: string, kind: SpanKind2 = 'internal', attributes: Record<string, unknown> = {}): string {
    const id = `span_${++this.idCounter}`
    const span: Span2 = {
      id, traceId, parentId, name, kind,
      status: 'started',
      startTime: Date.now(),
      endTime: null,
      duration: null,
      attributes,
      events: [],
      links: [],
      error: null,
    }
    for (const sampler of this.samplers) {
      if (!sampler(span)) {
        span.status = 'ended'
        span.endTime = span.startTime
        span.duration = 0
      }
    }
    this.spans.set(id, span)
    const traceSpans = this.traces.get(traceId) || []
    traceSpans.push(id)
    this.traces.set(traceId, traceSpans)
    this.notify('started', span)
    return id
  }

  endSpan(id: string): boolean {
    const span = this.spans.get(id)
    if (!span || span.status === 'ended') return false
    span.status = 'ended'
    span.endTime = Date.now()
    span.duration = span.endTime - span.startTime
    this.notify('ended', span)
    return true
  }

  setError(id: string, error: string): boolean {
    const span = this.spans.get(id)
    if (!span) return false
    span.status = 'error'
    span.error = error
    span.endTime = Date.now()
    span.duration = span.endTime - span.startTime
    this.notify('error', span)
    return true
  }

  addAttribute(id: string, key: string, value: unknown): boolean {
    const span = this.spans.get(id)
    if (!span) return false
    span.attributes[key] = value
    return true
  }

  addEvent(id: string, name: string, attributes: Record<string, unknown> = {}): boolean {
    const span = this.spans.get(id)
    if (!span) return false
    span.events.push({ name, time: Date.now(), attributes })
    return true
  }

  addLink(id: string, traceId: string, spanId: string): boolean {
    const span = this.spans.get(id)
    if (!span) return false
    span.links.push({ traceId, spanId })
    return true
  }

  get(id: string): Span2 | undefined { return this.spans.get(id) }

  getTrace(traceId: string): Span2[] {
    const spanIds = this.traces.get(traceId) || []
    return spanIds.map(id => this.spans.get(id)).filter(Boolean) as Span2[]
  }

  getByKind(kind: SpanKind2): Span2[] {
    return Array.from(this.spans.values()).filter(s => s.kind === kind)
  }

  getByStatus(status: SpanStatus2): Span2[] {
    return Array.from(this.spans.values()).filter(s => s.status === status)
  }

  getChildren(parentId: string): Span2[] {
    return Array.from(this.spans.values()).filter(s => s.parentId === parentId)
  }

  getErrors(): Span2[] { return this.getByStatus('error') }
  getActive(): Span2[] { return this.getByStatus('started') }

  getTraceDuration(traceId: string): number {
    const spans = this.getTrace(traceId)
    if (spans.length === 0) return 0
    let min = Infinity, max = -Infinity
    for (const s of spans) {
      min = Math.min(min, s.startTime)
      if (s.endTime) max = Math.max(max, s.endTime)
    }
    return max === -Infinity ? 0 : max - min
  }

  getSlowSpans(thresholdMs: number): Span2[] {
    return Array.from(this.spans.values()).filter(s => s.duration !== null && s.duration >= thresholdMs)
  }

  listen(fn: (event: string, span: Span2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, span: Span2): void {
    this.listeners.forEach(fn => fn(event, span))
  }

  getStats(): { total: number; traces: number; active: number; errors: number; avgDuration: number } {
    const ended = Array.from(this.spans.values()).filter(s => s.duration !== null)
    const avgDuration = ended.length === 0 ? 0 : ended.reduce((s, sp) => s + (sp.duration || 0), 0) / ended.length
    return {
      total: this.spans.size,
      traces: this.traces.size,
      active: this.getActive().length,
      errors: this.getErrors().length,
      avgDuration,
    }
  }

  count(): number { return this.spans.size }

  toArray(): Span2[] { return Array.from(this.spans.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): SpanCollector2 {
    const sc = new SpanCollector2()
    this.spans.forEach((s, id) => sc.spans.set(id, { ...s, attributes: { ...s.attributes }, events: [...s.events], links: [...s.links] }))
    this.traces.forEach((ids, tid) => sc.traces.set(tid, [...ids]))
    sc.idCounter = this.idCounter
    sc.maxSpans = this.maxSpans
    return sc
  }
  equals(other: unknown): boolean {
    if (!(other instanceof SpanCollector2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.spans.clear()
    this.traces.clear()
    this.listeners = []
    this.samplers = []
    this.idCounter = 0
  }
}
