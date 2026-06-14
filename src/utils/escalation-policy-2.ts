export type EscalationLevel2 = 'l1' | 'l2' | 'l3' | 'management'
export type OnCallState2 = 'active' | 'backup' | 'off'

export interface OnCallShift2 {
  id: string
  userId: string
  level: EscalationLevel2
  state: OnCallState2
  startTime: number
  endTime: number
  team: string
}

export interface EscalationPolicy2 {
  id: string
  name: string
  team: string
  levels: Array<{ level: EscalationLevel2; userIds: string[]; delayMs: number }>
  repeatCount: number
  createdAt: number
}

export class EscalationPolicy2Manager {
  private policies: Map<string, EscalationPolicy2> = new Map()
  private shifts: Map<string, OnCallShift2> = new Map()
  private activeEscalations: Map<string, { policyId: string; incidentId: string; level: number; startedAt: number }> = new Map()
  private listeners: Array<(event: string, data: unknown) => void> = []
  private idCounter = 0
  private shiftIdCounter = 0

  createPolicy(name: string, team: string, levels: Array<{ level: EscalationLevel2; userIds: string[]; delayMs: number }> = [], repeatCount = 3): string {
    const id = `pol_${++this.idCounter}`
    const policy: EscalationPolicy2 = {
      id, name, team, levels, repeatCount,
      createdAt: Date.now(),
    }
    this.policies.set(id, policy)
    this.notify('policy-created', policy)
    return id
  }

  deletePolicy(id: string): boolean {
    const policy = this.policies.get(id)
    if (!policy) return false
    this.policies.delete(id)
    this.notify('policy-deleted', policy)
    return true
  }

  addLevel(policyId: string, level: EscalationLevel2, userIds: string[], delayMs: number): boolean {
    const policy = this.policies.get(policyId)
    if (!policy) return false
    policy.levels.push({ level, userIds, delayMs })
    return true
  }

  assignShift(userId: string, level: EscalationLevel2, team: string, startTime: number, endTime: number): string {
    const id = `shift_${++this.shiftIdCounter}`
    const shift: OnCallShift2 = {
      id, userId, level, team,
      state: 'active',
      startTime, endTime,
    }
    this.shifts.set(id, shift)
    this.notify('shift-assigned', shift)
    return id
  }

  endShift(id: string): boolean {
    const shift = this.shifts.get(id)
    if (!shift) return false
    shift.state = 'off'
    this.notify('shift-ended', shift)
    return true
  }

  getActiveShifts(team?: string): OnCallShift2[] {
    const shifts = Array.from(this.shifts.values()).filter(s => s.state === 'active')
    return team ? shifts.filter(s => s.team === team) : shifts
  }

  getOnCallUser(level: EscalationLevel2, team: string): string | null {
    const shifts = this.getActiveShifts(team).filter(s => s.level === level)
    return shifts.length > 0 ? shifts[0].userId : null
  }

  startEscalation(policyId: string, incidentId: string): boolean {
    const policy = this.policies.get(policyId)
    if (!policy) return false
    this.activeEscalations.set(incidentId, {
      policyId, incidentId, level: 0,
      startedAt: Date.now(),
    })
    this.notify('escalation-started', { policyId, incidentId })
    return true
  }

  escalate(incidentId: string): { level: EscalationLevel2; userIds: string[] } | null {
    const escalation = this.activeEscalations.get(incidentId)
    if (!escalation) return null
    const policy = this.policies.get(escalation.policyId)
    if (!policy) return null

    escalation.level++
    if (escalation.level > policy.levels.length) {
      if (escalation.level <= policy.levels.length + policy.repeatCount) {
        escalation.level = 1
      } else {
        this.notify('escalation-exhausted', { incidentId })
        return null
      }
    }

    const levelData = policy.levels[escalation.level - 1]
    if (!levelData) return null

    this.notify('escalated', { incidentId, level: levelData.level, userIds: levelData.userIds })
    return { level: levelData.level, userIds: levelData.userIds }
  }

  resolveEscalation(incidentId: string): boolean {
    const escalation = this.activeEscalations.get(incidentId)
    if (!escalation) return false
    this.activeEscalations.delete(incidentId)
    this.notify('escalation-resolved', { incidentId })
    return true
  }

  getPolicy(id: string): EscalationPolicy2 | undefined { return this.policies.get(id) }
  getPoliciesByTeam(team: string): EscalationPolicy2[] { return Array.from(this.policies.values()).filter(p => p.team === team) }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getStats(): { policies: number; activeShifts: number; activeEscalations: number; teams: number } {
    const teams = new Set(Array.from(this.policies.values()).map(p => p.team))
    return {
      policies: this.policies.size,
      activeShifts: this.getActiveShifts().length,
      activeEscalations: this.activeEscalations.size,
      teams: teams.size,
    }
  }

  count(): number { return this.policies.size }

  toArray(): EscalationPolicy2[] { return Array.from(this.policies.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): EscalationPolicy2Manager {
    const ep = new EscalationPolicy2Manager()
    this.policies.forEach((p, id) => ep.policies.set(id, { ...p, levels: [...p.levels] }))
    return ep
  }
  equals(other: unknown): boolean {
    if (!(other instanceof EscalationPolicy2Manager)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.policies.clear()
    this.shifts.clear()
    this.activeEscalations.clear()
    this.listeners = []
    this.idCounter = 0
    this.shiftIdCounter = 0
  }
}
