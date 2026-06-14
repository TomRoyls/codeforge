export type IncidentSeverity2 = 'low' | 'medium' | 'high' | 'critical'
export type IncidentStatus2 = 'open' | 'investigating' | 'identified' | 'monitoring' | 'resolved'

export interface Incident2 {
  id: string
  title: string
  description: string
  severity: IncidentSeverity2
  status: IncidentStatus2
  assignee: string | null
  reporter: string
  createdAt: number
  updatedAt: number
  resolvedAt: number | null
  tags: string[]
  timeline: { time: number; event: string; by: string }[]
}

export class IncidentManager2 {
  private incidents: Map<string, Incident2> = new Map()
  private idCounter = 0
  private oncall: Map<string, string> = new Map()
  private escalationRules: Map<IncidentSeverity2, string[]> = new Map()

  create(title: string, description: string, severity: IncidentSeverity2, reporter: string): Incident2 {
    const id = `inc_${++this.idCounter}`
    const now = Date.now()
    const incident: Incident2 = {
      id, title, description, severity,
      status: 'open',
      assignee: null,
      reporter,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
      tags: [],
      timeline: [{ time: now, event: 'Incident created', by: reporter }],
    }
    this.incidents.set(id, incident)
    return incident
  }

  assign(id: string, assignee: string): boolean {
    const inc = this.incidents.get(id)
    if (!inc) return false
    inc.assignee = assignee
    inc.updatedAt = Date.now()
    inc.timeline.push({ time: Date.now(), event: `Assigned to ${assignee}`, by: 'system' })
    return true
  }

  updateStatus(id: string, status: IncidentStatus2): boolean {
    const inc = this.incidents.get(id)
    if (!inc) return false
    inc.status = status
    inc.updatedAt = Date.now()
    inc.timeline.push({ time: Date.now(), event: `Status changed to ${status}`, by: inc.assignee ?? 'system' })
    if (status === 'resolved') inc.resolvedAt = Date.now()
    return true
  }

  setSeverity(id: string, severity: IncidentSeverity2): boolean {
    const inc = this.incidents.get(id)
    if (!inc) return false
    inc.severity = severity
    inc.updatedAt = Date.now()
    inc.timeline.push({ time: Date.now(), event: `Severity set to ${severity}`, by: 'system' })
    return true
  }

  addTag(id: string, tag: string): boolean {
    const inc = this.incidents.get(id)
    if (!inc) return false
    if (!inc.tags.includes(tag)) inc.tags.push(tag)
    return true
  }

  addTimelineEntry(id: string, event: string, by: string): boolean {
    const inc = this.incidents.get(id)
    if (!inc) return false
    inc.timeline.push({ time: Date.now(), event, by })
    inc.updatedAt = Date.now()
    return true
  }

  get(id: string): Incident2 | undefined { return this.incidents.get(id) }

  getBySeverity(severity: IncidentSeverity2): Incident2[] {
    return Array.from(this.incidents.values()).filter(i => i.severity === severity)
  }

  getByStatus(status: IncidentStatus2): Incident2[] {
    return Array.from(this.incidents.values()).filter(i => i.status === status)
  }

  getByAssignee(assignee: string): Incident2[] {
    return Array.from(this.incidents.values()).filter(i => i.assignee === assignee)
  }

  getByTag(tag: string): Incident2[] {
    return Array.from(this.incidents.values()).filter(i => i.tags.includes(tag))
  }

  getOpen(): Incident2[] { return this.getByStatus('open').concat(this.getByStatus('investigating'), this.getByStatus('identified'), this.getByStatus('monitoring')) }
  getResolved(): Incident2[] { return this.getByStatus('resolved') }
  getCritical(): Incident2[] { return this.getBySeverity('critical') }

  getMeanResolutionTime(): number {
    const resolved = this.getResolved().filter(i => i.resolvedAt !== null)
    if (resolved.length === 0) return 0
    const totalTime = resolved.reduce((sum, i) => sum + (i.resolvedAt! - i.createdAt), 0)
    return totalTime / resolved.length
  }

  setOncall(severity: IncidentSeverity2, assignee: string): this {
    this.oncall.set(severity, assignee)
    return this
  }

  getOncall(severity: IncidentSeverity2): string | undefined { return this.oncall.get(severity) }

  setEscalationRule(severity: IncidentSeverity2, contacts: string[]): this {
    this.escalationRules.set(severity, [...contacts])
    return this
  }

  getEscalationContacts(severity: IncidentSeverity2): string[] {
    return this.escalationRules.get(severity) ?? []
  }

  count(): number { return this.incidents.size }
  getOpenCount(): number { return this.getOpen().length }

  toArray(): Incident2[] { return Array.from(this.incidents.values()) }
  toString(): string { return JSON.stringify({ incidents: this.count(), open: this.getOpenCount() }) }
  toJSON(): Record<string, unknown> { return { incidents: this.count(), open: this.getOpenCount(), critical: this.getCritical().filter(i => i.status !== 'resolved').length } }
  clone(): IncidentManager2 {
    const im = new IncidentManager2()
    this.incidents.forEach((inc, id) => {
      im.incidents.set(id, { ...inc, tags: [...inc.tags], timeline: [...inc.timeline] })
    })
    im.idCounter = this.idCounter
    this.oncall.forEach((v, k) => im.oncall.set(k, v))
    this.escalationRules.forEach((v, k) => im.escalationRules.set(k, [...v]))
    return im
  }
  equals(other: unknown): boolean {
    if (!(other instanceof IncidentManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.incidents.clear()
    this.oncall.clear()
    this.escalationRules.clear()
    this.idCounter = 0
  }
}
