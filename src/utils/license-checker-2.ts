export type LicenseType2 = 'MIT' | 'Apache-2.0' | 'BSD-2-Clause' | 'BSD-3-Clause' | 'GPL-2.0' | 'GPL-3.0' | 'LGPL-2.1' | 'LGPL-3.0' | 'MPL-2.0' | 'ISC' | 'Unlicense' | 'Proprietary' | 'Unknown'

export type PolicyStatus2 = 'allowed' | 'warning' | 'forbidden' | 'review'

export interface LicenseEntry2 {
  package: string
  version: string
  license: LicenseType2
  repository: string
  homepage: string
  author: string
}

export interface PolicyRule2 {
  license: LicenseType2
  status: PolicyStatus2
  note: string
}

export class LicenseChecker2 {
  private entries: Map<string, LicenseEntry2> = new Map()
  private policies: Map<LicenseType2, PolicyStatus2> = new Map()
  private warnings: string[] = []
  private violations: string[] = []

  constructor() {
    this.policies.set('MIT', 'allowed')
    this.policies.set('Apache-2.0', 'allowed')
    this.policies.set('BSD-2-Clause', 'allowed')
    this.policies.set('BSD-3-Clause', 'allowed')
    this.policies.set('ISC', 'allowed')
    this.policies.set('Unlicense', 'allowed')
    this.policies.set('MPL-2.0', 'warning')
    this.policies.set('LGPL-2.1', 'warning')
    this.policies.set('LGPL-3.0', 'warning')
    this.policies.set('GPL-2.0', 'forbidden')
    this.policies.set('GPL-3.0', 'forbidden')
    this.policies.set('Proprietary', 'review')
    this.policies.set('Unknown', 'review')
  }

  addPackage(packageName: string, version: string, license: LicenseType2, repository = '', homepage = '', author = ''): this {
    this.entries.set(packageName, { package: packageName, version, license, repository, homepage, author })
    return this
  }

  setPolicy(license: LicenseType2, status: PolicyStatus2, note = ''): this {
    this.policies.set(license, status)
    return this
  }

  getPolicy(license: LicenseType2): PolicyStatus2 {
    return this.policies.get(license) ?? 'review'
  }

  check(): { warnings: string[]; violations: string[] } {
    this.warnings = []
    this.violations = []
    this.entries.forEach(entry => {
      const status = this.getPolicy(entry.license)
      switch (status) {
        case 'forbidden':
          this.violations.push(`${entry.package}@${entry.version}: ${entry.license} is forbidden`)
          break
        case 'warning':
          this.warnings.push(`${entry.package}@${entry.version}: ${entry.license} requires review`)
          break
        case 'review':
          this.warnings.push(`${entry.package}@${entry.version}: ${entry.license} needs manual review`)
          break
      }
    })
    return { warnings: [...this.warnings], violations: [...this.violations] }
  }

  getEntry(packageName: string): LicenseEntry2 | undefined { return this.entries.get(packageName) }

  getByLicense(license: LicenseType2): LicenseEntry2[] {
    return Array.from(this.entries.values()).filter(e => e.license === license)
  }

  getByStatus(status: PolicyStatus2): LicenseEntry2[] {
    return Array.from(this.entries.values()).filter(e => this.getPolicy(e.license) === status)
  }

  getAllowed(): LicenseEntry2[] { return this.getByStatus('allowed') }
  getForbidden(): LicenseEntry2[] { return this.getByStatus('forbidden') }
  getWarnings(): string[] { return this.check().warnings }
  getViolations(): string[] { return this.check().violations }

  getLicenseSummary(): Map<LicenseType2, number> {
    const summary = new Map<LicenseType2, number>()
    this.entries.forEach(e => summary.set(e.license, (summary.get(e.license) ?? 0) + 1))
    return summary
  }

  isCompliant(): boolean { return this.check().violations.length === 0 }

  getComplianceReport(): {
    total: number
    allowed: number
    warnings: number
    violations: number
    review: number
    compliant: boolean
  } {
    this.check()
    const allowed = this.getAllowed().length
    const forbidden = this.getForbidden().length
    const warning = this.getByStatus('warning').length + this.getByStatus('review').length
    return {
      total: this.entries.size,
      allowed,
      warnings: warning,
      violations: forbidden,
      review: this.getByStatus('review').length,
      compliant: forbidden === 0,
    }
  }

  remove(packageName: string): boolean { return this.entries.delete(packageName) }
  count(): number { return this.entries.size }

  toArray(): LicenseEntry2[] { return Array.from(this.entries.values()) }
  toString(): string { return JSON.stringify(this.getComplianceReport()) }
  toJSON(): Record<string, unknown> { return this.getComplianceReport() }
  clone(): LicenseChecker2 {
    const lc = new LicenseChecker2()
    this.entries.forEach((e, name) => lc.entries.set(name, { ...e }))
    this.policies.forEach((status, license) => lc.policies.set(license, status))
    return lc
  }
  equals(other: unknown): boolean {
    if (!(other instanceof LicenseChecker2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.entries.clear()
    this.warnings = []
    this.violations = []
  }
}
