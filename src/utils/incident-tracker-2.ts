export type ResolutionState2 = 'open' | 'in-progress' | 'resolved' | 'wont-fix' | 'duplicate'

export interface Incident2 {
  id: string
  title: string
  description: string
  severity: number
  state: ResolutionState2
  assignee: string | null
  reporter: string
  labels: string[]
  createdAt: number
  updatedAt: number
  resolvedAt: number | null
  resolutionTime: number | null
  timeline: Array<{ action: string; actor: string; timestamp: number; detail?: string }>
  linkedIncidents: string[]
  metrics: Record<string, number>
}

export class IncidentTracker2 {
  private incidents: Map<string, Incident2> = new Map()
  private listeners: Array<(event: string, incident: Incident2) => void> = []
  private idCounter = 0
  private slaThresholds: Map<number, number> = new Map()

  setSla(severity: number, hours: number): this {
    this.slaThresholds.set(severity, hours * 3600000)
    return this
  }

  create(title: string, description: string, severity: number, reporter: string, labels: string[] = []): string {
    const id = `inc_${++this.idCounter}`
    const now = Date.now()
    const incident: Incident2 = {
      id, title, description, severity,
      state: 'open',
      assignee: null,
      reporter,
      labels,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
      resolutionTime: null,
      timeline: [{ action: 'created', actor: reporter, timestamp: now }],
      linkedIncidents: [],
      metrics: {},
    }
    this.incidents.set(id, incident)
    this.notify('created', incident)
    return id
  }

  assign(id: string, assignee: string): boolean {
    const inc = this.incidents.get(id)
    if (!inc) return false
    inc.assignee = assignee
    inc.updatedAt = Date.now()
    inc.timeline.push({ action: 'assigned', actor: assignee, timestamp: inc.updatedAt })
    this.notify('assigned', inc)
    return true
  }

  setState(id: string, state: ResolutionState2, actor: string = 'system'): boolean {
    const inc = this.incidents.get(id)
    if (!inc) return false
    inc.state = state
    inc.updatedAt = Date.now()
    inc.timeline.push({ action: 'state-changed', actor, timestamp: inc.updatedAt, detail: state })
    if (state === 'resolved') {
      inc.resolvedAt = inc.updatedAt
      inc.resolutionTime = inc.resolvedAt - inc.createdAt
    }
    this.notify('state-changed', inc)
    return true
  }

  addLabel(id: string, label: string): boolean {
    const inc = this.incidents.get(id)
    if (!inc) return false
    if (!inc.labels.includes(label)) inc.labels.push(label)
    inc.updatedAt = Date.now()
    return true
  }

  removeLabel(id: string, label: string): boolean {
    const inc = this.incidents.get(id)
    if (!inc) return false
    inc.labels = inc.labels.filter(l => l !== label)
    inc.updatedAt = Date.now()
    return true
  }

  addComment(id: string, actor: string, comment: string): boolean {
    const inc = this.incidents.get(id)
    if (!inc) return false
    inc.updatedAt = Date.now()
    inc.timeline.push({ action: 'comment', actor, timestamp: inc.updatedAt, detail: comment })
    return true
  }

  link(id: string, otherId: string): boolean {
    const inc = this.incidents.get(id)
    const other = this.incidents.get(otherId)
    if (!inc || !other) return false
    if (!inc.linkedIncidents.includes(otherId)) inc.linkedIncidents.push(otherId)
    if (!other.linkedIncidents.includes(id)) other.linkedIncidents.push(id)
    return true
  }

  setMetric(id: string, key: string, value: number): boolean {
    const inc = this.incidents.get(id)
    if (!inc) return false
    inc.metrics[key] = value
    return true
  }

  escalate(id: string, actor: string = 'system'): boolean {
    const inc = this.incidents.get(id)
    if (!inc) return false
    inc.severity = Math.max(1, inc.severity - 1)
    inc.updatedAt = Date.now()
    inc.timeline.push({ action: 'escalated', actor, timestamp: inc.updatedAt })
    this.notify('escalated', inc)
    return true
  }

  checkSla(): { breached: string[]; atRisk: string[] } {
    const breached: string[] = []
    const atRisk: string[] = []
    const now = Date.now()

    this.incidents.forEach(inc => {
      if (inc.state === 'resolved' || inc.state === 'wont-fix') return
      const threshold = this.slaThresholds.get(inc.severity)
      if (threshold === undefined) return
      const elapsed = now - inc.createdAt
      if (elapsed >= threshold) breached.push(inc.id)
      else if (elapsed >= threshold * 0.8) atRisk.push(inc.id)
    })

    return { breached, atRisk }
  }

  get(id: string): Incident2 | undefined { return this.incidents.get(id) }
  getBySeverity(severity: number): Incident2[] { return Array.from(this.incidents.values()).filter(i => i.severity === severity) }
  getByState(state: ResolutionState2): Incident2[] { return Array.from(this.incidents.values()).filter(i => i.state === state) }
  getByAssignee(assignee: string): Incident2[] { return Array.from(this.incidents.values()).filter(i => i.assignee === assignee) }
  getByLabel(label: string): Incident2[] { return Array.from(this.incidents.values()).filter(i => i.labels.includes(label)) }
  getOpen(): Incident2[] { return this.getByState('open') }
  getTimeline(id: string): Incident2['timeline'] { return this.incidents.get(id)?.timeline || [] }

  listen(fn: (event: string, incident: Incident2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, incident: Incident2): void {
    this.listeners.forEach(fn => fn(event, incident))
  }

  getStats(): { total: number; open: number; inProgress: number; resolved: number; avgResolutionTime: number } {
    const resolved = this.getByState('resolved')
    const avgRes = resolved.length > 0
      ? resolved.reduce((sum, i) => sum + (i.resolutionTime || 0), 0) / resolved.length
      : 0
    return {
      total: this.incidents.size,
      open: this.getByState('open').length,
      inProgress: this.getByState('in-progress').length,
      resolved: resolved.length,
      avgResolutionTime: avgRes,
    }
  }

  count(): number { return this.incidents.size }

  toArray(): Incident2[] { return Array.from(this.incidents.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): IncidentTracker2 {
    const it = new IncidentTracker2()
    it.idCounter = this.idCounter
    return it
  }
  equals(other: unknown): boolean {
    if (!(other instanceof IncidentTracker2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.incidents.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
