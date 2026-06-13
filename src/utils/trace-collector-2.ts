export interface TraceSpan2 {
  id: string
  traceId: string
  parentId: string | null
  name: string
  startTime: number
  endTime: number | null
  tags: Record<string, string>
  logs: { time: number; message: string }[]
  status: 'active' | 'completed' | 'error'
}

export class TraceCollector2 {
  private spans: Map<string, TraceSpan2> = new Map()
  private traces: Map<string, string[]> = new Map()
  private spanIdCounter = 0
  private traceIdCounter = 0

  startTrace(name: string, tags: Record<string, string> = {}): string {
    const traceId = `trace_${++this.traceIdCounter}`
    this.traces.set(traceId, [])
    this.startSpan(traceId, null, name, tags)
    return traceId
  }

  startSpan(traceId: string, parentId: string | null, name: string, tags: Record<string, string> = {}): string {
    const spanId = `span_${++this.spanIdCounter}`
    const span: TraceSpan2 = {
      id: spanId, traceId, parentId, name,
      startTime: Date.now(), endTime: null,
      tags: { ...tags }, logs: [], status: 'active',
    }
    this.spans.set(spanId, span)
    const spans = this.traces.get(traceId)
    if (spans) spans.push(spanId)
    else this.traces.set(traceId, [spanId])
    return spanId
  }

  finishSpan(spanId: string, status: 'completed' | 'error' = 'completed'): boolean {
    const span = this.spans.get(spanId)
    if (!span) return false
    span.endTime = Date.now()
    span.status = status
    return true
  }

  log(spanId: string, message: string): boolean {
    const span = this.spans.get(spanId)
    if (!span) return false
    span.logs.push({ time: Date.now(), message })
    return true
  }

  tag(spanId: string, key: string, value: string): boolean {
    const span = this.spans.get(spanId)
    if (!span) return false
    span.tags[key] = value
    return true
  }

  getSpan(spanId: string): TraceSpan2 | undefined { return this.spans.get(spanId) }

  getTrace(traceId: string): TraceSpan2[] {
    const spanIds = this.traces.get(traceId)
    if (!spanIds) return []
    return spanIds.map(id => this.spans.get(id)).filter(Boolean) as TraceSpan2[]
  }

  getSpanDuration(spanId: string): number {
    const span = this.spans.get(spanId)
    if (!span || !span.endTime) return 0
    return span.endTime - span.startTime
  }

  getTraceDuration(traceId: string): number {
    const spans = this.getTrace(traceId)
    if (spans.length === 0) return 0
    const start = Math.min(...spans.map(s => s.startTime))
    const end = Math.max(...spans.map(s => s.endTime ?? s.startTime))
    return end - start
  }

  getActiveSpans(): TraceSpan2[] {
    return Array.from(this.spans.values()).filter(s => s.status === 'active')
  }

  getErroredSpans(): TraceSpan2[] {
    return Array.from(this.spans.values()).filter(s => s.status === 'error')
  }

  getSpanCount(): number { return this.spans.size }
  getTraceCount(): number { return this.traces.size }

  count(): number { return this.spans.size }

  toArray(): TraceSpan2[] { return Array.from(this.spans.values()) }
  toString(): string { return JSON.stringify({ spans: this.getSpanCount(), traces: this.getTraceCount() }) }
  toJSON(): Record<string, unknown> { return { spans: this.getSpanCount(), traces: this.getTraceCount(), active: this.getActiveSpans().length } }
  clone(): TraceCollector2 {
    const tc = new TraceCollector2()
    this.spans.forEach((span, id) => tc.spans.set(id, { ...span, tags: { ...span.tags }, logs: [...span.logs] }))
    this.traces.forEach((ids, id) => tc.traces.set(id, [...ids]))
    tc.spanIdCounter = this.spanIdCounter
    tc.traceIdCounter = this.traceIdCounter
    return tc
  }
  equals(other: unknown): boolean {
    if (!(other instanceof TraceCollector2)) return false
    return this.getSpanCount() === other.getSpanCount()
  }
  clear(): void {
    this.spans.clear()
    this.traces.clear()
    this.spanIdCounter = 0
    this.traceIdCounter = 0
  }
}
