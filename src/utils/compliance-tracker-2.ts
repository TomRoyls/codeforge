export type ComplianceStatus2 = 'compliant' | 'non-compliant' | 'warning' | 'unknown'
export type ControlFramework2 = 'soc2' | 'gdpr' | 'hipaa' | 'pci' | 'iso27001' | 'custom'

export interface ComplianceControl2 {
  id: string
  framework: ControlFramework2
  requirement: string
  description: string
  status: ComplianceStatus2
  evidence: string[]
  lastAssessed: number
  assessedBy: string | null
  remediation: string | null
  riskScore: number
}

export interface ComplianceFinding2 {
  id: string
  controlId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  detectedAt: number
  resolvedAt: number | null
  status: 'open' | 'resolved' | 'accepted'
}

export class ComplianceTracker2 {
  private controls: Map<string, ComplianceControl2> = new Map()
  private findings: Map<string, ComplianceFinding2> = new Map()
  private listeners: Array<(event: string, data: unknown) => void> = []
  private controlCounter = 0
  private findingCounter = 0
  private assessmentFn: ((control: ComplianceControl2) => ComplianceStatus2) | null = null

  setAssessment(fn: (control: ComplianceControl2) => ComplianceStatus2): this {
    this.assessmentFn = fn
    return this
  }

  register(framework: ControlFramework2, requirement: string, description: string, riskScore: number = 5): string {
    const id = `ctrl_${++this.controlCounter}`
    const control: ComplianceControl2 = {
      id, framework, requirement, description,
      status: 'unknown',
      evidence: [],
      lastAssessed: 0,
      assessedBy: null,
      remediation: null,
      riskScore,
    }
    this.controls.set(id, control)
    this.notify('control-registered', { id })
    return id
  }

  assess(controlId: string, status: ComplianceStatus2, assessedBy: string, evidence: string[] = []): boolean {
    const control = this.controls.get(controlId)
    if (!control) return false
    control.status = status
    control.lastAssessed = Date.now()
    control.assessedBy = assessedBy
    control.evidence.push(...evidence)
    this.notify('control-assessed', { controlId, status })
    if (status === 'non-compliant' && control.riskScore >= 7) {
      this.reportFinding(controlId, 'high', `High-risk control ${control.requirement} is non-compliant`)
    }
    return true
  }

  setRemediation(controlId: string, remediation: string): boolean {
    const control = this.controls.get(controlId)
    if (!control) return false
    control.remediation = remediation
    return true
  }

  addEvidence(controlId: string, evidence: string): boolean {
    const control = this.controls.get(controlId)
    if (!control) return false
    control.evidence.push(evidence)
    return true
  }

  reportFinding(controlId: string, severity: 'low' | 'medium' | 'high' | 'critical', description: string): string {
    const id = `find_${++this.findingCounter}`
    const finding: ComplianceFinding2 = {
      id, controlId, severity, description,
      detectedAt: Date.now(),
      resolvedAt: null,
      status: 'open',
    }
    this.findings.set(id, finding)
    this.notify('finding-reported', { id, controlId, severity })
    return id
  }

  resolveFinding(findingId: string): boolean {
    const finding = this.findings.get(findingId)
    if (!finding || finding.status === 'resolved') return false
    finding.status = 'resolved'
    finding.resolvedAt = Date.now()
    this.notify('finding-resolved', { id: findingId })
    return true
  }

  acceptFinding(findingId: string): boolean {
    const finding = this.findings.get(findingId)
    if (!finding) return false
    finding.status = 'accepted'
    this.notify('finding-accepted', { id: findingId })
    return true
  }

  runAssessment(): { compliant: number; nonCompliant: number; warnings: number; unknown: number } {
    if (!this.assessmentFn) {
      return { compliant: 0, nonCompliant: 0, warnings: 0, unknown: this.controls.size }
    }
    let compliant = 0, nonCompliant = 0, warnings = 0, unknown = 0
    this.controls.forEach(control => {
      const status = this.assessmentFn!(control)
      control.status = status
      control.lastAssessed = Date.now()
      switch (status) {
        case 'compliant': compliant++; break
        case 'non-compliant': nonCompliant++; break
        case 'warning': warnings++; break
        default: unknown++; break
      }
    })
    this.notify('assessment-completed', { compliant, nonCompliant, warnings, unknown })
    return { compliant, nonCompliant, warnings, unknown }
  }

  getControl(id: string): ComplianceControl2 | undefined { return this.controls.get(id) }
  getFinding(id: string): ComplianceFinding2 | undefined { return this.findings.get(id) }
  getByFramework(framework: ControlFramework2): ComplianceControl2[] { return Array.from(this.controls.values()).filter(c => c.framework === framework) }
  getByStatus(status: ComplianceStatus2): ComplianceControl2[] { return Array.from(this.controls.values()).filter(c => c.status === status) }
  getOpenFindings(): ComplianceFinding2[] { return Array.from(this.findings.values()).filter(f => f.status === 'open') }
  getCriticalFindings(): ComplianceFinding2[] { return Array.from(this.findings.values()).filter(f => f.severity === 'critical') }
  getFindingsByControl(controlId: string): ComplianceFinding2[] { return Array.from(this.findings.values()).filter(f => f.controlId === controlId) }

  getComplianceScore(): number {
    if (this.controls.size === 0) return 100
    const compliant = this.getByStatus('compliant').length
    const warning = this.getByStatus('warning').length
    return Math.round(((compliant + warning * 0.5) / this.controls.size) * 100)
  }

  getRiskScore(): number {
    return Array.from(this.controls.values())
      .filter(c => c.status !== 'compliant')
      .reduce((sum, c) => sum + c.riskScore, 0)
  }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getStats(): { controls: number; findings: number; openFindings: number; score: number; risk: number } {
    return {
      controls: this.controls.size,
      findings: this.findings.size,
      openFindings: this.getOpenFindings().length,
      score: this.getComplianceScore(),
      risk: this.getRiskScore(),
    }
  }

  count(): number { return this.controls.size }

  toArray(): ComplianceControl2[] { return Array.from(this.controls.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): ComplianceTracker2 {
    const ct = new ComplianceTracker2()
    ct.controlCounter = this.controlCounter
    ct.findingCounter = this.findingCounter
    return ct
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ComplianceTracker2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.controls.clear()
    this.findings.clear()
    this.listeners = []
    this.controlCounter = 0
    this.findingCounter = 0
  }
}
